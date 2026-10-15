import axios from "axios";
import store from "./store";
import { setAccessToken, logout } from "@/features/auth/store/authSlice";
import refreshToken from "@/features/auth/api/refreshToken";
import { markServerUnavailable } from "./serverAvailability";
import { normalizeDisplayText } from "@/shared/utils/capitalizeFirstAlphabetic";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,    // include cookies in requests (for refresh token)
  timeout: 12000,
});

const expiresSoon = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now() + 30_000;
  } catch {
    // Mock and legacy tokens without an expiry retain the existing 401 retry.
    return false;
  }
};

// Request Interceptor (attach token to headers)
api.interceptors.request.use(
  async (config) => {
    let token = store.getState().auth.token;
    if (token && expiresSoon(token)) {
      try {
        const response = await refreshToken();
        if (store.getState().auth.token === token) {
          store.dispatch(setAccessToken({ token: response.accessToken }));
        }
        token = store.getState().auth.token;
      } catch (error) {
        if (store.getState().auth.token === token) {
          store.dispatch(logout());
          window.dispatchEvent(new Event('ink-rider:sign-in-required'));
        }
        return Promise.reject(error);
      }
    }
    if(token){
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },

  (error) => {
    return Promise.reject(error)
  }
);

// Response Interceptor (handle 401 / access token errors)
api.interceptors.response.use(
  (response) => {
    response.data = normalizeDisplayText(response.data);
    return response;
  },

  async (error) => {
    const status = error.response?.status;
    const isConnectionFailure = !error.response && error.code !== 'ERR_CANCELED';
    const isGatewayFailure = [502, 503, 504].includes(status);
    // Optional billing setup is a feature-level failure, not an API outage.
    const isBillingNotConfigured = status === 503
      && error.response?.data?.code === 'PROVIDER_NOT_CONFIGURED'
      && ['/api/v1/billing/checkout', '/api/v1/billing/portal'].includes(error.config?.url);
    if (isConnectionFailure || (isGatewayFailure && !isBillingNotConfigured)) markServerUnavailable();

    // Check if originalRequest exists to avoid issues with non-HTTP errors
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Only an established session can have an expired access token. Public auth
    // failures (including invalid login credentials) must preserve their original
    // response instead of being replaced by a missing-refresh-cookie error.
    const hasAccessToken = Boolean(store.getState().auth.token);
    if (error.response?.status === 401 
      && hasAccessToken
      && !originalRequest._retry 
      && !originalRequest.url?.includes('/api/auth/refresh-token')
    ) {
      
      originalRequest._retry = true;

      try {
        const response = await refreshToken();

        // Save new access token
        const newAccessToken = response.accessToken;
        store.dispatch(setAccessToken({ token: newAccessToken }));
        
        // Update and Retry original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } 
      catch (refreshError) {
        store.dispatch(logout());
        window.dispatchEvent(new Event('ink-rider:sign-in-required'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
)

export default api;

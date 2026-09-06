import axios from "axios";
import store from "./store";
import { setAccessToken, logout } from "@/features/auth/store/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,    // include cookies in requests (for refresh token)
});

let refreshPromise = null;

// Request Interceptor (attach token to headers)
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
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
    return response;
  },

  async (error) => {
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
        // Share one refresh request across simultaneous 401 responses.
        if (!refreshPromise) {
          refreshPromise = axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
            {},
            { withCredentials: true }
          ).finally(() => {
            refreshPromise = null;
          });
        }
        const response = await refreshPromise;

        // Save new access token
        const newAccessToken = response.data.accessToken;
        store.dispatch(setAccessToken({ token: newAccessToken }));
        
        // Update and Retry original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } 
      catch (refreshError) {
        store.dispatch(logout());
        window.location.href = '/login';  
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
)

export default api;

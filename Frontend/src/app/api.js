import axios from "axios";
import store from "./store";
import { setNewAccessToken, logout } from "@/features/auth/store/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,    // include cookies in requests (for refresh token)
});

// Request Interceptor (attach token to headers)
api.interceptors.request.use(
  (config) => {
    console.log('Request Interceptor Triggered')
    const token = store.getState().auth.token;
    if(token){
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },

  (error) => {
    console.log('Request Interceptor Error - ', error); 
    return Promise.reject(error)
  }
);

// Response Interceptor (handle 401 / access token errors)
api.interceptors.response.use(
  (response) => {
    console.log('Response Interceptor Triggered')
    return response;
  },

  async (error) => {
    console.log('Response Interceptor Error 3- ', error)

    // Check if originalRequest exists to avoid issues with non-HTTP errors
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Check if error is 401 or we haven't already tried refreshing or if it's not the refresh token endpoint
    if (error.response?.status === 401 
      && !originalRequest._retry 
      && !originalRequest.url.includes('/api/auth/refresh-token')
    ) {
      
      originalRequest._retry = true;

      try {
        // Attempt to refresh token (don't use api instance to avoid interceptor loop)
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`, 
          {}, 
          { withCredentials: true }
        );

        // Save new access token
        const newAccessToken = response.data.accessToken;
        store.dispatch(setNewAccessToken({ token: newAccessToken }));
        
        // Update and Retry original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } 
      catch (refreshError) {
        // If refresh fails, dispatch logout or handle as needed
        store.dispatch(logout());

        // Redirect to login page
        window.location.href = '/login';  
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
)

export default api;
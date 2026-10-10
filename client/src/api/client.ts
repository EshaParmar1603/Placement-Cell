import axios from 'axios';

const apiBase = ((import.meta as any).env?.VITE_API_URL as string) || '/api/v1';

export const apiClient = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('placewise_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401s and token rotation
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('placewise_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/refresh-token', { refreshToken });
          if (res.data?.success) {
            const { accessToken, refreshToken: newRefreshToken } = res.data.data;
            localStorage.setItem('placewise_access_token', accessToken);
            localStorage.setItem('placewise_refresh_token', newRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('placewise_access_token');
          localStorage.removeItem('placewise_refresh_token');
          localStorage.removeItem('placewise_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

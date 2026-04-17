import axios, { AxiosError } from 'axios';

const baseURL =
  (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status =
      error instanceof AxiosError ? error.response?.status : undefined;

    if (status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('qflow:unauthorized'));
    }

    return Promise.reject(error instanceof Error ? error : new Error('API request failed.'));
  }
);

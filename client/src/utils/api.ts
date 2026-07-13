import axios from 'axios';
import { ErrorResponse } from '../types/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError: ErrorResponse = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
    };
    console.error('API Error:', customError.message);
    return Promise.reject(customError);
  }
);

export default api;

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';

/**
 * API Error Response Structure
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  details?: Record<string, any>;
}

/**
 * Success Response Wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Get API Base URL from environment
 */
function getApiBaseUrl(): string {
  // For Expo, use __DEV__ to detect environment
  if (__DEV__) {
    // Development: local backend
    // IMPORTANT: If testing on a physical device, change localhost to your computer's IP address
    // Steps to find your IP:
    // - Mac/Linux: Run 'ifconfig | grep inet' in terminal
    // - Windows: Run 'ipconfig' in command prompt
    // - Look for something like 192.168.1.100 or 10.0.0.5
    // Then change the line below to: return 'http://YOUR_IP:3000/api';
    // Example: return 'http://192.168.1.100:3000/api';
    
    return 'http://192.168.2.169:3000/api'; // Your Mac's local IP address
  }
  // Production: deployed backend
  return 'https://api.sarvadhi.com/api';
}

/**
 * Create Axios instance with custom config
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Attaches JWT token to all requests
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Centralized error handling
 */
apiClient.interceptors.response.use(
  (response) => {
    // Success response
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    // Handle different error types
    if (!error.response) {
      // Network error or timeout
      const networkError = new Error('Network Error: Unable to connect to server');
      return Promise.reject({
        statusCode: 0,
        message: networkError.message,
        error: 'NETWORK_ERROR',
      } as ApiErrorResponse);
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized - token expired or invalid
    if (status === 401) {
      // Clear auth data
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);

      // Could trigger logout action here
      // Example: store.dispatch(logout())
    }

    // Extract error message from response
    const errorResponse: ApiErrorResponse = {
      statusCode: status,
      message: data?.message || getHttpErrorMessage(status),
      error: data?.error,
      details: data?.details,
    };

    return Promise.reject(errorResponse);
  }
);

/**
 * Map HTTP status codes to user-friendly messages
 */
function getHttpErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Bad Request: Invalid input';
    case 401:
      return 'Unauthorized: Please login again';
    case 403:
      return 'Forbidden: You do not have permission';
    case 404:
      return 'Not Found: Resource does not exist';
    case 409:
      return 'Conflict: Resource already exists';
    case 422:
      return 'Unprocessable Entity: Validation failed';
    case 429:
      return 'Too Many Requests: Please try again later';
    case 500:
      return 'Server Error: Please try again later';
    case 502:
      return 'Bad Gateway: Server temporarily unavailable';
    case 503:
      return 'Service Unavailable: Please try again later';
    default:
      return `Error: ${status}`;
  }
}

export default apiClient;

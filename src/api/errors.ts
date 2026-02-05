/**
 * HTTP Error Codes & Handling
 *
 * Quick reference for handling different error scenarios
 */

export enum HttpStatus {
  // Success
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,

  // Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // Server Errors
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

export enum ErrorType {
  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // Server
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  [ErrorType.NETWORK_ERROR]: 'Network connection failed. Please check your internet.',
  [ErrorType.TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorType.UNAUTHORIZED]: 'Unauthorized. Please login again.',
  [ErrorType.TOKEN_EXPIRED]: 'Session expired. Please login again.',
  [ErrorType.INVALID_CREDENTIALS]: 'Invalid email or password.',
  [ErrorType.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorType.DUPLICATE_ENTRY]: 'This item already exists.',
  [ErrorType.SERVER_ERROR]: 'Server error. Please try again later.',
  [ErrorType.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later.',
  [ErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred.',
};

/**
 * Handle API errors appropriately
 */
export function handleApiError(error: any): {
  type: ErrorType;
  message: string;
  details?: any;
} {
  if (!error) {
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR],
    };
  }

  // Network error (no response)
  if (error.statusCode === 0 || error.error === 'NETWORK_ERROR') {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: ERROR_MESSAGES[ErrorType.NETWORK_ERROR],
    };
  }

  const status = error.statusCode;

  switch (status) {
    case HttpStatus.UNAUTHORIZED:
      return {
        type: ErrorType.UNAUTHORIZED,
        message: ERROR_MESSAGES[ErrorType.UNAUTHORIZED],
      };

    case HttpStatus.FORBIDDEN:
      return {
        type: ErrorType.UNAUTHORIZED,
        message: 'You do not have permission to perform this action.',
      };

    case HttpStatus.NOT_FOUND:
      return {
        type: ErrorType.UNKNOWN_ERROR,
        message: 'Resource not found.',
      };

    case HttpStatus.CONFLICT:
      return {
        type: ErrorType.DUPLICATE_ENTRY,
        message: ERROR_MESSAGES[ErrorType.DUPLICATE_ENTRY],
      };

    case HttpStatus.UNPROCESSABLE_ENTITY:
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: ERROR_MESSAGES[ErrorType.VALIDATION_ERROR],
        details: error.details,
      };

    case HttpStatus.TOO_MANY_REQUESTS:
      return {
        type: ErrorType.UNKNOWN_ERROR,
        message: 'Too many requests. Please try again later.',
      };

    case HttpStatus.BAD_GATEWAY:
    case HttpStatus.SERVICE_UNAVAILABLE:
      return {
        type: ErrorType.SERVICE_UNAVAILABLE,
        message: ERROR_MESSAGES[ErrorType.SERVICE_UNAVAILABLE],
      };

    case HttpStatus.INTERNAL_SERVER_ERROR:
      return {
        type: ErrorType.SERVER_ERROR,
        message: ERROR_MESSAGES[ErrorType.SERVER_ERROR],
      };

    default:
      return {
        type: ErrorType.UNKNOWN_ERROR,
        message: error.message || ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR],
      };
  }
}

/**
 * Example usage in Zustand store:
 *
 * import { handleApiError } from '@/api/errors';
 *
 * export const useAuthStore = create((set) => ({
 *   error: null,
 *   login: async (email, password) => {
 *     try {
 *       const response = await authApi.login({ email, password });
 *       set({ error: null, user: response.data.data?.user });
 *     } catch (error) {
 *       const apiError = handleApiError(error);
 *       set({ error: apiError });
 *       // Show alert or notification
 *       Alert.alert('Error', apiError.message);
 *     }
 *   }
 * }));
 */

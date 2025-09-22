// Type guards for error handling

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface AxiosErrorResponse {
  response?: {
    status: number;
    data?: {
      detail?: string | Array<{ 
        msg: string;
        type?: string;
        loc?: (string | number)[];
      }>;
      message?: string;
    };
  };
  message: string;
  code?: string;
}

// Type guard to check if error is an AxiosError-like object
export function isAxiosError(error: unknown): error is AxiosErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as AxiosErrorResponse).message === 'string'
  );
}

// Type guard to check if error is a standard Error
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Type guard to check if error has a message property
export function hasMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: string }).message === 'string'
  );
}

// Extract user-friendly error message from unknown error
export function getErrorMessage(error: unknown): string {
  // Handle axios errors
  if (isAxiosError(error)) {
    const response = error.response;
    if (response?.data) {
      // Handle FastAPI validation errors
      if (Array.isArray(response.data.detail)) {
        return response.data.detail
          .map((err: { msg: string }) => err.msg)
          .join(', ');
      }
      // Handle simple detail message
      if (typeof response.data.detail === 'string') {
        return response.data.detail;
      }
      // Handle custom message field
      if (response.data.message) {
        return response.data.message;
      }
    }

    // Fallback to status-based messages
    if (response?.status) {
      switch (response.status) {
        case 400:
          return 'Invalid request. Please check your input.';
        case 401:
          return 'Authentication required. Please log in.';
        case 403:
          return 'Access denied. You do not have permission.';
        case 404:
          return 'Resource not found.';
        case 409:
          return 'Conflict. The resource already exists.';
        case 422:
          return 'Validation error. Please check your input.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return `Request failed with status ${response.status}`;
      }
    }

    return error.message || 'An unexpected error occurred';
  }

  // Handle standard Error objects
  if (isError(error)) {
    return error.message;
  }

  // Handle objects with message property
  if (hasMessage(error)) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred';
}

// Create a standardized API error
export function createApiError(
  error: unknown,
  defaultMessage = 'An unexpected error occurred'
): ApiError {
  const message = getErrorMessage(error);

  if (isAxiosError(error)) {
    return {
      message: message || defaultMessage,
      status: error.response?.status,
      code: error.code,
    };
  }

  return {
    message: message || defaultMessage,
  };
}
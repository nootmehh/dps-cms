/**
 * Global & shared TypeScript type definitions
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

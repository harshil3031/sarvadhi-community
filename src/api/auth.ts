import apiClient, { ApiResponse } from './client';

/**
 * Auth API Types
 */
export namespace Auth {
  export interface User {
    id: string;
    fullName: string;
    email: string;
    role: 'admin' | 'moderator' | 'employee';
    authProvider: 'local' | 'google';
    profilePhotoUrl?: string;
    department?: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface LoginRequest {
    email: string;
    password: string;
  }

  export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
  }

  export interface GoogleAuthRequest {
    idToken: string;
  }

  export interface UpdateProfileRequest {
    fullName?: string;
    avatar?: string;
  }

  export interface AuthResponse {
    token: string;
    user: User;
  }
}

/**
 * Authentication API Module
 */
export const authApi = {
  /**
   * POST /auth/register
   * Register new user with email and password
   */
  register: (data: Auth.RegisterRequest) =>
    apiClient.post<ApiResponse<Auth.AuthResponse>>('/auth/register', data),

  /**
   * POST /auth/login
   * Login with email and password
   */
  login: (data: Auth.LoginRequest) =>
    apiClient.post<ApiResponse<Auth.AuthResponse>>('/auth/login', data),

  /**
   * POST /auth/google
   * Login or register with Google OAuth
   */
  loginWithGoogle: (data: Auth.GoogleAuthRequest) =>
    apiClient.post<ApiResponse<Auth.AuthResponse>>('/auth/google', data),

  /**
   * GET /auth/me
   * Get current authenticated user
   */
  getCurrentUser: () =>
    apiClient.get<ApiResponse<Auth.User>>('/auth/me'),

  /**
   * PUT /auth/profile
   * Update current user profile
   */
  updateProfile: (data: Auth.UpdateProfileRequest) =>
    apiClient.put<ApiResponse<Auth.User>>('/auth/profile', data),

  /**
   * POST /auth/logout
   * Logout current user
   */
  logout: () =>
    apiClient.post<ApiResponse<void>>('/auth/logout', {}),
};


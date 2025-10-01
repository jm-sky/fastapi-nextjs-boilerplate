// Zod validation schemas for runtime type checking and form validation

import { z } from 'zod';

// Authentication schemas
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

// Password validation schema - reusable for all password fields
export const PasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
    'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (!@#$%^&*(),.?":{}|<>)');

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: PasswordSchema,
});

export const TokenRefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// User schema for responses
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

// Response schemas
export const LoginResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string().default('Bearer'),
  expiresIn: z.number(),
});

export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string().default('Bearer'),
  expiresIn: z.number(),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  detail: z.union([
    z.string(),
    z.array(z.object({
      msg: z.string(),
      type: z.string().optional(),
      loc: z.array(z.union([z.string(), z.number()])).optional(),
    }))
  ]).optional(),
  message: z.string().optional(),
});

// Type exports for use in components
export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type TokenRefreshData = z.infer<typeof TokenRefreshSchema>;
export type User = z.infer<typeof UserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

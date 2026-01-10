/**
 * Global Error Handler Middleware
 * 
 * CONCEPT: Express error-handling middleware has 4 parameters (err, req, res, next).
 * This middleware catches all errors and sends consistent error responses.
 * 
 * Error flow in Express:
 * 1. Controller throws error or calls next(error)
 * 2. Error bubbles up to this middleware
 * 3. We format and send a consistent error response
 */

import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/http.js';
import { env } from '../config/env.js';

// Error response shape
interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  errors?: Record<string, string[]>;  // For validation errors
  stack?: string;  // Only in development
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Log error for debugging
  console.error('❌ Error:', err);

  // Default error values
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong';
  let code = 'INTERNAL_ERROR';
  let errors: Record<string, string[]> | undefined;

  // Handle our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  }
  // Handle Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    // Format Zod errors into a friendlier structure
    errors = {};
    err.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (!errors![path]) {
        errors![path] = [];
      }
      errors![path].push(issue.message);
    });
  }
  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
  }
  // Handle Mongoose CastError (invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  }
  // Handle duplicate key error (MongoDB)
  else if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'Resource already exists';
    code = 'DUPLICATE_ERROR';
  }
  // Handle standard Error
  else if (err instanceof Error) {
    message = err.message;
  }

  // Build response
  const response: ErrorResponse = {
    success: false,
    message,
    code,
  };

  // Add validation errors if present
  if (errors) {
    response.errors = errors;
  }

  // Add stack trace in development
  if (env.isDevelopment && err instanceof Error) {
    response.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(response);
};

export default errorHandler;

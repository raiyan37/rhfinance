/**
 * Express Application Setup
 * 
 * CONCEPT: This file configures the Express application.
 * It sets up middleware, routes, and error handling.
 * 
 * Middleware runs in ORDER - top to bottom.
 * Think of it like a pipeline that requests flow through.
 */

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { mockUser } from './middleware/mockUser.js';

// Import routes (we'll create these next)
import routes from './routes/index.js';

// Create Express app
const app: Express = express();

// =============================================================================
// SECURITY MIDDLEWARE
// =============================================================================

/**
 * Helmet - Security headers
 * Adds various HTTP headers for security (XSS protection, etc.)
 */
app.use(helmet());

/**
 * CORS - Cross-Origin Resource Sharing
 * Allows our frontend (different port) to make requests to this API
 */
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,  // Allow cookies
}));

/**
 * Rate Limiter - Prevent abuse
 * Limits each IP to 100 requests per 15 minutes
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  limit: 100,                 // 100 requests per window
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// =============================================================================
// BODY PARSING MIDDLEWARE
// =============================================================================

/**
 * JSON Parser
 * Parses JSON request bodies and makes them available on req.body
 */
app.use(express.json());

/**
 * URL-encoded Parser
 * Parses form data (application/x-www-form-urlencoded)
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Cookie Parser
 * Parses cookies and makes them available on req.cookies
 */
app.use(cookieParser());

// =============================================================================
// DEVELOPMENT MIDDLEWARE
// =============================================================================

/**
 * Mock User
 * For development: assigns a mock user to all requests
 * TODO: Replace with real auth middleware in production
 */
if (env.isDevelopment) {
  app.use(mockUser);
}

// =============================================================================
// ROUTES
// =============================================================================

/**
 * API Routes
 * All routes are prefixed with /api
 */
app.use('/api', routes);

/**
 * Health Check Endpoint
 * Used to verify the server is running
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * 404 Handler
 * Catches requests to undefined routes
 */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'NOT_FOUND',
  });
});

/**
 * Global Error Handler
 * Catches all errors and sends consistent responses
 */
app.use(errorHandler);

export default app;

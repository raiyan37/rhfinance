/**
 * Environment Configuration
 * 
 * This file centralizes all environment variables.
 * It provides typed access to env vars and validation.
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get environment variable with fallback
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

// Export typed environment configuration
export const env = {
  // Server
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: parseInt(getEnv('PORT', '5000'), 10),
  
  // Database
  MONGO_URI: getEnv('MONGO_URI', 'mongodb://localhost:27017/personal-finance'),
  
  // JWT
  JWT_SECRET: getEnv('JWT_SECRET', 'dev-secret-change-in-production'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '7d'),
  
  // CORS
  CLIENT_URL: getEnv('CLIENT_URL', 'http://localhost:5173'),
  
  // Helper properties
  isDevelopment: getEnv('NODE_ENV', 'development') === 'development',
  isProduction: getEnv('NODE_ENV', 'development') === 'production',
};

export default env;

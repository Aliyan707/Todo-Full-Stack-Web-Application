/**
 * API Configuration Module
 * Simplified for Vercel + HuggingFace Space deployment
 */

const BACKEND_URL = "https://aliyanahmed-todofullstackwebapplication.hf.space";

/**
 * Get the full API URL for an endpoint
 * Uses direct backend URL in development, relative in production
 */
export function getApiUrl(endpoint: string): string {
  // Check if we're in development mode
  const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  if (isDevelopment) {
    // In development, use direct backend connection
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `http://localhost:8000${normalizedEndpoint}`;
  } else {
    // In production, use relative URLs (Vercel rewrites handle it)
    const baseUrl = typeof window !== 'undefined' ? '' : BACKEND_URL;
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${normalizedEndpoint}`;
  }
}

/**
 * API configuration object
 */
export const apiConfig = {
  baseUrl: BACKEND_URL,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  healthCheckEndpoint: '/health',
};

export default apiConfig;

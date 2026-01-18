/**
 * API Configuration Module
 * Simplified for Vercel + HuggingFace Space deployment
 */

const BACKEND_URL = "https://aliyanahmed-todofullstackwebapplication.hf.space";

/**
 * Get the full API URL for an endpoint
 */
export function getApiUrl(endpoint: string): string {
  // In browser, use relative URLs (Vercel rewrites handle it)
  // On server or if window not available, use full URL
  const baseUrl = typeof window !== 'undefined' ? '' : BACKEND_URL;
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${normalizedEndpoint}`;
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

/**
 * API Configuration Module
 * Centralized configuration for Hugging Face Space API connection.
 *
 * This module provides:
 * - Dynamic API URL resolution from environment variables
 * - Hugging Face Space URL format handling
 * - Configuration validation
 * - Health check utilities
 */

/**
 * Hugging Face Space configuration
 */
interface HuggingFaceSpaceConfig {
  owner: string;
  name: string;
  displayUrl: string;
  apiUrl: string;
}

/**
 * API configuration interface
 */
interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  healthCheckEndpoint: string;
  huggingFaceSpace: HuggingFaceSpaceConfig | null;
  isProduction: boolean;
  isDevelopment: boolean;
}

/**
 * Convert Hugging Face Space display URL to API URL
 * Display: https://huggingface.co/spaces/{owner}/{name}
 * API: https://{owner}-{name}.hf.space
 */
function convertHfSpaceToApiUrl(owner: string, name: string): string {
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `https://${owner}-${normalizedName}.hf.space`;
}

/**
 * Get Hugging Face Space configuration from environment
 */
function getHuggingFaceSpaceConfig(): HuggingFaceSpaceConfig | null {
  const owner = process.env.NEXT_PUBLIC_HF_SPACE_OWNER;
  const name = process.env.NEXT_PUBLIC_HF_SPACE_NAME;

  if (!owner || !name) {
    return null;
  }

  return {
    owner,
    name,
    displayUrl: `https://huggingface.co/spaces/${owner}/${name}`,
    apiUrl: convertHfSpaceToApiUrl(owner, name),
  };
}

/**
 * Resolve the API base URL with fallback chain:
 * 1. NEXT_PUBLIC_API_URL environment variable
 * 2. Derived from HF Space owner/name
 * 3. Localhost fallback for development
 */
function resolveApiBaseUrl(): string {
  // Priority 1: Explicit API URL
  const explicitUrl = process.env.NEXT_PUBLIC_API_URL;
  if (explicitUrl && explicitUrl !== 'http://localhost:8000') {
    return explicitUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  // Priority 2: Derive from HF Space config
  const hfConfig = getHuggingFaceSpaceConfig();
  if (hfConfig) {
    return hfConfig.apiUrl;
  }

  // Priority 3: Localhost fallback
  return 'http://localhost:8000';
}

/**
 * API Configuration singleton
 * Provides centralized access to all API-related configuration.
 */
export const apiConfig: ApiConfig = {
  baseUrl: resolveApiBaseUrl(),
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  healthCheckEndpoint: '/health',
  huggingFaceSpace: getHuggingFaceSpaceConfig(),
  isProduction: process.env.NEXT_PUBLIC_ENV === 'production',
  isDevelopment: process.env.NEXT_PUBLIC_ENV !== 'production',
};

/**
 * Get the full API URL for an endpoint
 */
export function getApiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${apiConfig.baseUrl}${normalizedEndpoint}`;
}

/**
 * API Status enum for health checks
 */
export enum ApiStatus {
  Unknown = 'unknown',
  Connecting = 'connecting',
  Online = 'online',
  Offline = 'offline',
  Error = 'error',
  Starting = 'starting',
}

/**
 * Health check response interface
 */
export interface HealthCheckResponse {
  status: ApiStatus;
  message: string;
  responseTime?: number;
  lastChecked: Date;
}

/**
 * Perform a health check on the API
 * Returns status and response time
 */
export async function checkApiHealth(): Promise<HealthCheckResponse> {
  const startTime = Date.now();
  const lastChecked = new Date();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(getApiUrl(apiConfig.healthCheckEndpoint), {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        status: ApiStatus.Online,
        message: 'API is online and healthy',
        responseTime,
        lastChecked,
      };
    }

    // Hugging Face Spaces may return 503 when starting up
    if (response.status === 503) {
      return {
        status: ApiStatus.Starting,
        message: 'API is starting up. Please wait...',
        responseTime,
        lastChecked,
      };
    }

    return {
      status: ApiStatus.Error,
      message: `API returned status ${response.status}`,
      responseTime,
      lastChecked,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          status: ApiStatus.Offline,
          message: 'API request timed out. The Space may be sleeping.',
          responseTime,
          lastChecked,
        };
      }

      // Network errors often indicate the Space is down or sleeping
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return {
          status: ApiStatus.Offline,
          message: 'Cannot reach API. The Space may be sleeping or offline.',
          responseTime,
          lastChecked,
        };
      }
    }

    return {
      status: ApiStatus.Error,
      message: 'Failed to check API health',
      responseTime,
      lastChecked,
    };
  }
}

/**
 * Wait for API to become available with retries
 * Useful for Hugging Face Spaces that may need to wake up
 */
export async function waitForApi(
  maxAttempts: number = 10,
  delayMs: number = 3000
): Promise<HealthCheckResponse> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const health = await checkApiHealth();

    if (health.status === ApiStatus.Online) {
      return health;
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return {
    status: ApiStatus.Offline,
    message: 'API did not become available after multiple attempts',
    lastChecked: new Date(),
  };
}

/**
 * Log API configuration (for debugging)
 */
export function logApiConfig(): void {
  console.log('[API Config]', {
    baseUrl: apiConfig.baseUrl,
    isProduction: apiConfig.isProduction,
    huggingFaceSpace: apiConfig.huggingFaceSpace
      ? {
          owner: apiConfig.huggingFaceSpace.owner,
          name: apiConfig.huggingFaceSpace.name,
        }
      : null,
  });
}

export default apiConfig;

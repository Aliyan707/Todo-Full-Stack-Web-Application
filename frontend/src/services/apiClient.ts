// apiClient.ts - API client for communicating with the backend

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request error for ${url}:`, error);
      throw error;
    }
  }

  // Method to send a chat message
  async sendMessage(userId: string, message: string, conversationId?: string) {
    const requestBody = {
      message,
      ...(conversationId && { conversation_id: conversationId }),
    };

    return this.request<ApiResponse>(`/api/${userId}/chat`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  // Method to get health status
  async healthCheck() {
    return this.request<{ status: string; service: string }>('/health');
  }
}

export const apiClient = new ApiClient();

export default ApiClient;
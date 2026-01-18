import { NextRequest } from 'next/server';
import { ChatRequest, ChatResponse } from '../../../../../backend/src/api/chat'; // This would be the actual API implementation

// This is a proxy route that forwards requests to the backend
export async function POST(request: NextRequest, { params }: { params: { user_id: string } }) {
  try {
    const userId = params.user_id;

    // Validate user ID format
    if (!userId || !isValidUUID(userId)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid user ID format",
          error_code: "INVALID_USER_ID"
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the request body
    const body = await request.json();

    // Validate required fields
    if (!body.message || typeof body.message !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Message is required and must be a string",
          error_code: "INVALID_MESSAGE"
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Forward the request to the backend service
    // In a real implementation, this would call the actual backend API
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';

    const backendResponse = await fetch(`${backendUrl}/api/${userId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // If authentication is needed to the backend, add it here
        // 'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    // Get the response from the backend
    const backendData = await backendResponse.json();

    // Return the backend response
    return new Response(JSON.stringify(backendData), {
      status: backendResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat API route:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        error_code: "INTERNAL_ERROR"
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Helper function to validate UUID format
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Health check endpoint
export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({ status: 'healthy', service: 'frontend-proxy' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
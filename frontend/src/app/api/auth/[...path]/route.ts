import { NextRequest } from 'next/server';

// Dynamic route to handle all auth requests and proxy them to the backend
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleAuthRequest(request, params.path.join('/'));
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleAuthRequest(request, params.path.join('/'));
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleAuthRequest(request, params.path.join('/'));
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleAuthRequest(request, params.path.join('/'));
}

async function handleAuthRequest(request: NextRequest, path: string) {
  try {
    // Get the backend URL from environment variables
    const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

    // Construct the full backend URL
    const backendUrl = `${backendBaseUrl}/api/auth/${path}`;

    // Get the request body if it exists
    const body = request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.json()
      : undefined;

    // Prepare headers, copying over important ones
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Make the request to the backend
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Get the response data
    const responseData = await backendResponse.json();

    // Return the response with the same status code
    return new Response(JSON.stringify(responseData), {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json',
        // Copy over any necessary headers from backend
        ...Object.fromEntries(backendResponse.headers.entries()),
      },
    });
  } catch (error) {
    console.error('Auth proxy error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Server error, please try again later'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
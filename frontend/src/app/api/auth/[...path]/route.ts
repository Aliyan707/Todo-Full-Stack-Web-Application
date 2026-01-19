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
    const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    console.log('Proxy debug - Backend URL:', backendBaseUrl); // Debug log
    console.log('Proxy debug - Full backend URL:', `${backendBaseUrl}/api/${path}`); // Debug log

    // Validate backend URL
    if (!backendBaseUrl) {
      console.error('NEXT_PUBLIC_API_BASE_URL is not set');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Server configuration error: backend URL not set'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Construct the full backend URL - the backend expects /api/auth/* routes
    const backendUrl = `${backendBaseUrl}/api/${path}`;
    console.log('Proxy debug - Final backend URL:', backendUrl); // Debug log

    // Get the request body if it exists
    const body = request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.json().catch(error => {
          console.error('Error parsing request JSON:', error);
          throw new Error('Invalid JSON in request body');
        })
      : undefined;

    // Prepare headers, copying over important ones
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Skip certain headers that should not be forwarded
      if (!['content-length', 'host', 'authorization'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    console.log('Proxy debug - Making request to backend...'); // Debug log

    // Make the request to the backend
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(error => {
      console.error(`Error making request to backend ${backendUrl}:`, error);
      throw new Error(`Connection failed to backend server: ${error.message}`);
    });

    console.log('Proxy debug - Backend response status:', backendResponse.status); // Debug log

    // Get the response data
    let responseData;
    try {
      responseData = await backendResponse.json();
      console.log('Proxy debug - Backend response parsed successfully'); // Debug log
    } catch (error) {
      console.error('Error parsing backend response JSON:', error);
      // If response is not JSON, return a generic error
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid response from backend server'
        }),
        {
          status: 502, // Bad Gateway
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Return the response with the same status code
    return new Response(JSON.stringify(responseData), {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json',
        // Copy over any necessary headers from backend
        ...Object.fromEntries(backendResponse.headers.entries()),
      },
    });
  } catch (error: any) {
    console.error('Auth proxy error details:', error);
    console.error('Full error message:', error.message);

    // Handle different types of errors appropriately
    if (error.message?.includes('Invalid JSON')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON in request'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (error.message?.includes('Connection failed') || error.message?.includes('fetch failed')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unable to connect to authentication server'
        }),
        {
          status: 502, // Bad Gateway
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

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
import { NextResponse } from 'next/server';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST(request: Request) {
  try {
    if (!HEYGEN_API_KEY) {
      return new Response("API key is missing from .env", { status: 500 });
    }

    const { session_id } = await request.json();
    
    if (!session_id) {
      return new Response("Missing session_id", { status: 400 });
    }

    const response = await fetch('https://api.heygen.com/v1/streaming.stop', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-api-key': HEYGEN_API_KEY
      },
      body: JSON.stringify({ session_id })
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return new Response('Error stopping session', { status: 500 });
  }
} 
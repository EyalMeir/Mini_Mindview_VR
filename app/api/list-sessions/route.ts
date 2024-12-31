import { NextResponse } from 'next/server';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function GET() {
  try {
    if (!HEYGEN_API_KEY) {
      return new Response("API key is missing from .env", { status: 500 });
    }

    const response = await fetch('https://api.heygen.com/v1/streaming.list', {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-api-key': HEYGEN_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return new Response('Error listing sessions', { status: 500 });
  }
} 
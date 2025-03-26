// app/api/query/route.ts
import { NextRequest, NextResponse } from 'next/server';

// 註解：使用 Docker 網絡中的後端服務名稱，假設後端服務名為 'backend'
const BACKEND_URL = process.env.BACKEND_URL || 'http://drizzle-proxy:8080/query'; 
const PROXY_KEY = 'key';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Request body to backend:', body);

    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'proxy-key': PROXY_KEY,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    console.log('Backend response:', text);

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} - ${text}`);
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown fetch error';
    return NextResponse.json(
      { error: `Fetch failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
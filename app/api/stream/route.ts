import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.app.tdmax.com/',
        'Origin': 'https://www.app.tdmax.com',
      },
    });

    if (!response.ok) return NextResponse.json({ error: 'Stream error' }, { status: response.status });

    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': contentType.includes('m3u8') ? 'no-cache, no-store' : 'public, max-age=10',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Proxy failed' }, { status: 502 });
  }
}
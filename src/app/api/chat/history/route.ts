export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 600;

export async function GET(req: Request): Promise<Response> {
  try {
    let apiBase =
      process.env.CHAT_API_URL ||
      process.env.NEXT_PUBLIC_CHAT_API_URL ||
      'http://localhost:9001';

    if (apiBase.includes('0.0.0.0')) {
      apiBase = apiBase.replace('0.0.0.0', 'localhost');
    }

    const apiKey = process.env.X_API_KEY;

    const url = new URL(req.url);
    const upstreamUrl = new URL('/api/chat/history', apiBase);
    // Forward all original query params
    url.searchParams.forEach((value, key) => {
      upstreamUrl.searchParams.set(key, value);
    });

    const upstreamResponse = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
      },
      cache: 'no-store',
    });

    const headers = new Headers();
    headers.set(
      'Content-Type',
      upstreamResponse.headers.get('content-type') || 'application/json'
    );
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    const body = await upstreamResponse.text();
    return new Response(body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  } catch (error) {
    console.error('Proxy /api/chat/history error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch chat history' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}



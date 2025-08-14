export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 600;

export async function POST(req: Request): Promise<Response> {
  try {
    let apiBase =
      process.env.CHAT_API_URL ||
      process.env.NEXT_PUBLIC_CHAT_API_URL ||
      'http://localhost:9001';

    if (apiBase.includes('0.0.0.0')) {
      apiBase = apiBase.replace('0.0.0.0', 'localhost');
    }

    const apiKey = process.env.X_API_KEY;

    const formData = await req.formData();

    const upstreamResponse = await fetch(`${apiBase}/api/chat`, {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream, text/plain, application/json',
        ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
      },
      body: formData,
      cache: 'no-store',
      // @ts-expect-error Node fetch streaming
      duplex: 'half',
    });

    const headers = new Headers();
    const contentType =
      upstreamResponse.headers.get('content-type') || 'text/event-stream';
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    const vary = upstreamResponse.headers.get('vary');
    if (vary) headers.set('Vary', vary);

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  } catch (error) {
    console.error('Proxy /api/chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to reach upstream chat service' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

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

    return new Response(await upstreamResponse.text(), {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  } catch (error) {
    console.error('Proxy /api/chat GET error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch chat history' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(req: Request): Promise<Response> {
  try {
    let apiBase =
      process.env.CHAT_API_URL ||
      process.env.NEXT_PUBLIC_CHAT_API_URL ||
      'http://localhost:9001';

    if (apiBase.includes('0.0.0.0')) {
      apiBase = apiBase.replace('0.0.0.0', 'localhost');
    }

    const apiKey = process.env.X_API_KEY;

    const payload = await req.json().catch(() => null);
    if (!payload) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const upstreamResponse = await fetch(`${apiBase}/api/chat/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
      },
      body: JSON.stringify(payload),
    });

    const headers = new Headers();
    headers.set(
      'Content-Type',
      upstreamResponse.headers.get('content-type') || 'application/json'
    );
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

    return new Response(await upstreamResponse.text(), {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  } catch (error) {
    console.error('Proxy /api/chat DELETE error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to clear chat session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
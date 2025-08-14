export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<Response> {
  try {
    const apiBase =
      process.env.CHAT_API_URL ||
      process.env.NEXT_PUBLIC_CHAT_API_URL ||
      'http://0.0.0.0:9001';

    const apiKey = process.env.X_API_KEY;

    const formData = await req.formData();

    const upstreamResponse = await fetch(`${apiBase}/api/chat`, {
      method: 'POST',
      headers: {
        ...(apiKey ? { 'X-API-KEY': apiKey } : {}),
      },
      body: formData,
    });

    const headers = new Headers();
    headers.set(
      'Content-Type',
      upstreamResponse.headers.get('content-type') || 'text/event-stream'
    );
    headers.set('Cache-Control', 'no-cache');

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



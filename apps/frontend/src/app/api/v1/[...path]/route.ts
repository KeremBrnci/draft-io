import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { resolveBackendUrl } from '@/lib/backend-url';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function buildUpstreamHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  const contentType = request.headers.get('content-type');
  if (contentType !== null) {
    headers.set('content-type', contentType);
  }

  const accept = request.headers.get('accept');
  if (accept !== null) {
    headers.set('accept', accept);
  }

  const authorization = request.headers.get('authorization');
  if (authorization !== null) {
    headers.set('authorization', authorization);
  }

  return headers;
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await context.params;
  const backendUrl = resolveBackendUrl();
  const targetUrl = `${backendUrl}/api/v1/${path.join('/')}${request.nextUrl.search}`;
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: buildUpstreamHeaders(request),
      body: hasBody ? await request.arrayBuffer() : null,
      redirect: 'manual',
      cache: 'no-store',
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('transfer-encoding');

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown proxy error';
    console.error(`API proxy failed for ${targetUrl}: ${message}`);

    return NextResponse.json(
      {
        statusCode: 502,
        error: 'Bad Gateway',
        message: `Backend request failed: ${message}`,
        backendUrl,
      },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { isRetryableResponseStatus, sleep } from '@/lib/api/resilience';
import { resolveBackendUrl } from '@/lib/backend-url';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UPSTREAM_TIMEOUT_MS = 25_000;
const UPSTREAM_MAX_RETRIES = 2;
const UPSTREAM_RETRY_DELAYS_MS = [300, 900] as const;

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

async function fetchUpstream(
  targetUrl: string,
  request: NextRequest,
  body: ArrayBuffer | null,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= UPSTREAM_MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, UPSTREAM_TIMEOUT_MS);

    try {
      const upstream = await fetch(targetUrl, {
        method: request.method,
        headers: buildUpstreamHeaders(request),
        body,
        redirect: 'manual',
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!isRetryableResponseStatus(upstream.status) || attempt === UPSTREAM_MAX_RETRIES) {
        return upstream;
      }
    } catch (error) {
      lastError = error;
      if (attempt === UPSTREAM_MAX_RETRIES) {
        throw error;
      }
    } finally {
      clearTimeout(timeoutId);
    }

    await sleep(UPSTREAM_RETRY_DELAYS_MS[attempt] ?? 900);
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error('Upstream request failed');
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await context.params;
  const backendUrl = resolveBackendUrl();
  const targetUrl = `${backendUrl}/api/v1/${path.join('/')}${request.nextUrl.search}`;
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody ? await request.arrayBuffer() : null;

  try {
    const upstream = await fetchUpstream(targetUrl, request, body);

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
        message: 'Sunucuya geçici olarak ulaşılamadı.',
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

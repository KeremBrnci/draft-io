import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { resolveBackendUrl } from '@/lib/backend-url';

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await context.params;
  const backendUrl = resolveBackendUrl();
  const targetUrl = `${backendUrl}/api/v1/${path.join('/')}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : null,
    redirect: 'manual',
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;

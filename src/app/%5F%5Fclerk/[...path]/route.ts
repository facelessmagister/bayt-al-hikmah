import { NextResponse } from 'next/server'

// Clerk Frontend API proxy route handler
// Forwards /__clerk/* requests to Clerk's Frontend API (frontend-api.clerk.services)
// This is needed because the *.vercel.app domain has a CNAME record for clerk.* subdomain
// but Vercel doesn't provide SSL for arbitrary subdomains.

const CLERK_FAPI_HOST = 'frontend-api.clerk.services'

async function proxyRequest(request: Request, path: string) {
  const url = new URL(request.url)
  const targetUrl = `https://${CLERK_FAPI_HOST}/${path}${url.search}`

  const headers = new Headers(request.headers)
  headers.set('Host', CLERK_FAPI_HOST)
  headers.set('Clerk-Proxy-Url', `${url.origin}/__clerk`)
  headers.delete('connection')

  const body = request.method !== 'GET' && request.method !== 'HEAD' 
    ? await request.arrayBuffer() 
    : undefined

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    redirect: 'manual',
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete('content-encoding')
  responseHeaders.set('Access-Control-Allow-Origin', url.origin)
  responseHeaders.set('Access-Control-Allow-Credentials', 'true')

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  return proxyRequest(request, path)
}

export async function POST(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  return proxyRequest(request, path)
}

export async function PUT(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  return proxyRequest(request, path)
}

export async function DELETE(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  return proxyRequest(request, path)
}

export async function PATCH(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  return proxyRequest(request, path)
}
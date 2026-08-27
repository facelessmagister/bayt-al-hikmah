import { NextResponse } from 'next/server'

// Clerk Frontend API proxy route handler
// Forwards /__clerk/* requests to Clerk's Frontend API
// Needed because *.vercel.app domains use a CNAME for clerk.* subdomain
// but Vercel doesn't provide SSL for arbitrary subdomains.

// The FAPI host from the CNAME target
const CLERK_FAPI_HOST = 'frontend-api.clerk.services'

async function proxyRequest(request: Request, path: string) {
  const url = new URL(request.url)
  const targetUrl = `https://${CLERK_FAPI_HOST}/${path}${url.search}`

  // Build clean headers for the upstream request
  const headers = new Headers()
  // Copy relevant headers from the original request
  const forwardHeaders = [
    'accept', 'accept-language', 'content-type', 'content-length',
    'authorization', 'cookie', 'user-agent', 'referer',
  ]
  for (const h of forwardHeaders) {
    const val = request.headers.get(h)
    if (val) headers.set(h, val)
  }
  // Required Clerk proxy headers
  headers.set('Host', CLERK_FAPI_HOST)
  headers.set('Clerk-Proxy-Url', `${url.origin}/__clerk`)
  headers.set('X-Forwarded-For', request.headers.get('x-forwarded-for') || '')
  headers.set('X-Forwarded-Host', url.host)
  headers.set('X-Forwarded-Proto', 'https')

  const body = request.method !== 'GET' && request.method !== 'HEAD'
    ? await request.arrayBuffer()
    : undefined

  try {
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
  } catch (error) {
    console.error('Clerk proxy error:', error)
    return NextResponse.json(
      { error: 'Proxy error' },
      { status: 502 }
    )
  }
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
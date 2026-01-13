import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader) {
    const [type, credentials] = authHeader.split(' ');
    
    if (type === 'Basic') {
      const [username, password] = Buffer.from(credentials, 'base64')
        .toString()
        .split(':');
      
      if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
      ) {
        return NextResponse.next();
      }
    }
  }
  
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
  });
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
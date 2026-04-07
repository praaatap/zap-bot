import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || 
                             req.nextUrl.pathname.startsWith('/meetings') || 
                             req.nextUrl.pathname.startsWith('/chat') || 
                             req.nextUrl.pathname.startsWith('/settings') || 
                             req.nextUrl.pathname.startsWith('/agent');

    if (isProtectedRoute) {
        // Appwrite stores session in a cookie typically, check for simple auth
        // const session = req.cookies.get('a_session_...');
        // For now pass-through or redirect if strongly required
        // if (!session) return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}

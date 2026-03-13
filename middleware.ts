import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "pt_session";

type SessionLite = {
  kind?: "admin" | "customer";
  email?: string;
  uid?: string;
};

function secretKey() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error("Missing env: AUTH_JWT_SECRET");
  return new TextEncoder().encode(secret);
}

async function readSession(req: NextRequest): Promise<SessionLite | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: "pami-threads" });
    return payload as unknown as SessionLite;
  } catch {
    return null;
  }
}

function isApi(pathname: string) {
  return pathname.startsWith("/api/") || pathname.includes("/api/");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/api/login")) return NextResponse.next();

  const session = await readSession(req);

  // Admin protection only
  if (pathname.startsWith("/admin")) {
    if (session?.kind !== "admin") {
      if (isApi(pathname)) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
      const url = new URL("/admin/login", req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
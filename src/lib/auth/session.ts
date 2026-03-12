import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./cookie";
import { verifySession, type Session, type AdminSession, type CustomerSession } from "./jwt";

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}

export async function requireCustomer(): Promise<CustomerSession> {
  const s = await getSession();
  if (!s || s.kind !== "customer") throw new Error("UNAUTHORIZED");
  return s;
}

export async function requireAdmin(): Promise<AdminSession> {
  const s = await getSession();
  if (!s || s.kind !== "admin") throw new Error("UNAUTHORIZED");
  return s;
}

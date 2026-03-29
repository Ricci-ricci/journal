import { SignJWT, jwtVerify } from "jose";

const getSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? "dev-fallback-secret-change-in-production",
  );

export const COOKIE_NAME = "tj_token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  userId: string;
  email: string;
  name: string | null;
}

export async function signToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: (payload.name as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

/** Extract and verify the session from a route-handler Request. */
export async function getSessionUser(
  request: Request,
): Promise<SessionUser | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`),
  );
  const token = match?.[1];
  if (!token) return null;
  return verifyToken(token);
}

/** Middleware-safe: reads from NextRequest.cookies which is already parsed. */
export async function verifyToken_middleware(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null;
  return verifyToken(token);
}

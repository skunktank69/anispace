import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize, parse } from "cookie";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.AUTH_SECRET ?? "dev-secret-change-me";
const COOKIE_NAME = "ani_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function issueToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${COOKIE_MAX_AGE}s` });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function createTokenCookie(token: string) {
  return serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearTokenCookie() {
  return serialize(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

// Helper: get user from request cookies (server-side route handlers)
export async function getUserFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const cookies = parse(cookieHeader || "");
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  const payload = verifyToken(token as string);
  if (!payload || typeof payload === "string") return null;
  // payload should include userId
  const { userId } = payload as { userId: number };
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      createdAt: true,
      readList: true,
      watchList: true,
    },
  });
  return user;
}

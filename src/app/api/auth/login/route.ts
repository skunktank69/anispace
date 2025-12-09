import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, issueToken, createTokenCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    type d = {
      email?: string;
      password?: string;
    };
    const { email, password }: d = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = issueToken({ userId: user.id });
    const resp = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
    resp.headers.set("Set-Cookie", createTokenCookie(token));
    return resp;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

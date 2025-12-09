import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, issueToken, createTokenCookie } from "@/lib/auth";

interface SignupBody {
  email: string;
  password: string;
  name?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SignupBody;

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    const hashed = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashed,
        name: body.name ?? null,
        avatar:
          "https://raw.githubusercontent.com/skunktank69/Skunktank69/refs/heads/main/default-avatar.png",
      },
    });

    const token = issueToken({ userId: user.id });
    const cookie = createTokenCookie(token);

    return new NextResponse(
      JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      }),
      {
        status: 201,
        headers: { "Set-Cookie": cookie, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Signup failed", details: `${err}` },
      { status: 500 },
    );
  }
}

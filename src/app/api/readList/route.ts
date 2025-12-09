import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.readItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ readList: items }, { status: 200 });
  } catch (err) {
    console.error("GET /api/readList error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { provider, providerId, title, poster, color, type } = body;

    if (!provider || !providerId || !title) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.readItem.findFirst({
      where: {
        provider,
        providerId,
        userId: user.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Already in read list", item: existing },
        { status: 200 },
      );
    }

    const created = await prisma.readItem.create({
      data: {
        provider,
        providerId,
        title,
        poster,
        type,
        color,
        user: { connect: { id: user.id } },
      },
    });

    return NextResponse.json({ item: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/readList error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
export async function DELETE(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { provider, providerId } = body;

    if (!provider || !providerId) {
      return NextResponse.json(
        { error: "Missing provider or providerId" },
        { status: 400 },
      );
    }

    const existing = await prisma.readItem.findFirst({
      where: {
        provider,
        providerId,
        userId: user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not in read list" }, { status: 404 });
    }

    await prisma.readItem.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ message: "Removed" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/readList error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

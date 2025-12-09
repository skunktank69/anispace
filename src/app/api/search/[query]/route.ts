import { anilist } from "@/lib/anime-conf";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ query: string }> },
) {
  try {
    const url = new URL(req.url);

    const query = (await context.params).query;
    if (!query) {
      return NextResponse.json(
        { error: "Missing query parameter" },
        { status: 400 },
      );
    }

    const type = url.searchParams.get("type") === "anime" ? "ANIME" : "MANGA";

    const page = Number(url.searchParams.get("page")) || undefined;
    const perPage = Number(url.searchParams.get("perPage")) || undefined;

    const format = url.searchParams.get("format");
    const sort = url.searchParams.getAll("sort");
    const genres = url.searchParams.getAll("genres");

    const id = url.searchParams.get("id")
      ? Number(url.searchParams.get("id"))
      : undefined;

    const year = url.searchParams.get("year")
      ? Number(url.searchParams.get("year"))
      : undefined;

    const status = url.searchParams.get("status") || undefined;
    const season = url.searchParams.get("season") || undefined;

    const source = await anilist.advancedSearch(
      query,
      type,
      page || undefined,
      perPage || undefined,
      format || undefined,
      sort.length ? sort : undefined,
      genres.length ? genres : undefined,
      id || undefined,
      year || undefined,
      status || undefined,
      season || undefined,
    );

    return NextResponse.json(source);
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

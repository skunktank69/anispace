"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CardGrid } from "@/components/card-grid";

type MediaType = "ANIME" | "MANGA";
type Sort =
  | "POPULARITY_DESC"
  | "SCORE_DESC"
  | "TRENDING_DESC"
  | "START_DATE_DESC"
  | "FAVOURITES_DESC";

const ALL_GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
];

const ANIME_FORMATS = [
  "TV",
  "TV_SHORT",
  "MOVIE",
  "SPECIAL",
  "OVA",
  "ONA",
  "MUSIC",
];
const MANGA_FORMATS = ["MANGA", "ONE_SHOT"];

const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"];
const STATUS = [
  "RELEASING",
  "FINISHED",
  "NOT_YET_RELEASED",
  "CANCELLED",
  "HIATUS",
];
const SORT_OPTIONS: Sort[] = [
  "POPULARITY_DESC",
  "SCORE_DESC",
  "TRENDING_DESC",
  "START_DATE_DESC",
  "FAVOURITES_DESC",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<MediaType>("ANIME");
  const [genres, setGenres] = useState<string[]>([]);
  const [format, setFormat] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [season, setSeason] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort | null>(null);
  const [page, setPage] = useState(1);
  /*eslint-disable */ const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoSearch, setAutoSearch] = useState(false);

  const formats = useMemo(
    () => (type === "ANIME" ? ANIME_FORMATS : MANGA_FORMATS),
    [type],
  );

  const toggleGenre = (g: string) => {
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  };

  const clearFilters = () => {
    setGenres([]);
    setFormat(null);
    setYear(null);
    setSeason(null);
    setStatus(null);
    setSort(null);
    setPage(1);
  };

  async function doSearch() {
    setLoading(true);

    const params = new URLSearchParams();
    params.set("type", type === "ANIME" ? "anime" : "manga");
    params.set("page", String(page));
    if (format) params.set("format", format);
    if (sort) params.set("sort", sort);
    if (year) params.set("year", String(year));
    if (season) params.set("season", season);
    if (status) params.set("status", status);
    genres.forEach((g) => params.append("genres", g));

    const url = `/api/search/${encodeURIComponent(query) || "null"}?${params.toString()}`;

    try {
      const res = await fetch(url);
      const json = await res.json();
      setResults((prev) => {
        if (!prev || page === 1) return json;

        const merged = [...prev.results, ...json.results];

        const unique = merged.filter(
          (item, i, arr) => arr.findIndex((x) => x.id === item.id) === i,
        );

        return {
          ...json,
          results: unique,
        };
      });
    } catch (e) {
      setResults({ error: "Search error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!autoSearch) return;
    if (!query.trim()) return;

    const t = setTimeout(doSearch, 350);
    return () => clearTimeout(t);
  }, [query, type, genres, format, year, season, status, sort, page]);

  useEffect(() => {
    setAutoSearch(true);
  }, []);

  useEffect(() => {
    if (!autoSearch) return;
    const t = setTimeout(doSearch, 350);
    return () => clearTimeout(t);
  }, [query, type, genres, format, year, season, status, sort, page]);

  return (
    <main className="p-4 max-w-3xl mx-auto space-y-4">
      <Input
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <ToggleGroup
        type="single"
        value={type}
        onValueChange={(v) => v && setType(v as MediaType)}
        className="flex "
      >
        <ToggleGroupItem value="ANIME">Anime</ToggleGroupItem>
        <ToggleGroupItem value="MANGA">Manga</ToggleGroupItem>
      </ToggleGroup>

      {/* Genres */}
      <div className="flex flex-wrap gap-2">
        {ALL_GENRES.map((g) => (
          <Badge
            key={g}
            onClick={() => toggleGenre(g)}
            className={cn(
              "cursor-pointer px-3 py-1",
              genres.includes(g)
                ? "bg-sidebar border border-foreground text-foreground"
                : "bg-muted text-foreground",
            )}
          >
            {g}
          </Badge>
        ))}
      </div>

      {/* Format */}
      <div className="flex flex-wrap gap-2">
        {formats.map((f) => (
          <Badge
            key={f}
            onClick={() => setFormat(format === f ? null : f)}
            className={cn(
              "cursor-pointer px-3 py-1 text-foreground",
              format === f ? "bg-blue-600 text-white" : "bg-muted",
            )}
          >
            {f}
          </Badge>
        ))}
      </div>

      {/* Season / status / sort */}
      <div className="flex gap-3 flex-wrap">
        <Select value={season ?? ""} onValueChange={(v) => setSeason(v)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent>
            {SEASONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status ?? ""} onValueChange={(v) => setStatus(v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort ?? ""} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year + pagination */}
      <div className="flex gap-3">
        <Input
          type="number"
          className="w-24"
          placeholder="Year"
          value={year ?? ""}
          onChange={(e) =>
            setYear(e.target.value ? Number(e.target.value) : null)
          }
        />
        <Input
          type="number"
          className="w-24"
          placeholder="Page"
          value={page}
          onChange={(e) => setPage(Number(e.target.value))}
        />
        <Button variant="outline" onClick={clearFilters}>
          Reset
        </Button>
        <Button onClick={doSearch}>Search</Button>
      </div>

      {/* Results */}
      {results?.results && (
        <CardGrid
          animeData={results.results}
          hasNextPage={results.hasNextPage}
          onLoadMore={() => setPage((p) => p + 1)}
        />
      )}

      {loading && <div>Loading…</div>}
    </main>
  );
}

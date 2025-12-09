"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Play } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

/*eslint-disable */
export default function Card({ anime }: any) {
  const [hover, setHover] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayTitle =
    anime?.title?.english || anime?.title?.romaji || "No Title";

  async function handleAddToList() {
    try {
      setLoading(true);

      const endpoint = anime.totalEpisodes ? "/api/watchList" : "/api/readList";

      const body = {
        provider: "anilist",
        providerId: String(anime.id),
        title: displayTitle,
        poster: anime.image,
        type: anime.type,
        color: anime.color,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error("Add failed", await res.text());
        return;
      }

      console.log("Added to list!");
    } catch (err) {
      console.error("List Add Error:", err);
    } finally {
      setLoading(false);
    }
  }
  const aT = ["TV", "TV_SHORT", "MOVIE", "SPECIAL", "OVA", "ONA", "MUSIC"];
  let ax = anime.type;
  ax = aT.includes(ax) ? "anime" : "manga";

  return (
    <Link
      href={`/${ax}/${anime.id}`}
      className="block text-white animate-in fade-in duration-300"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={cn(
          "w-full cursor-pointer transition-transform duration-200",
          hover ? "md:-translate-y-2 z-10" : "",
        )}
      >
        {/* Image Container */}
        <div className="relative w-full rounded-lg overflow-hidden shadow-lg bg-neutral-900">
          <div className="pt-[138%] relative">
            {anime.image ? (
              <Image
                src={anime.image}
                alt={displayTitle}
                fill
                unoptimized
                className={cn(
                  "object-cover transition-all duration-300",
                  hover ? "brightness-[0.55]" : "brightness-100",
                )}
              />
            ) : (
              <Skeleton className="w-full h-full" />
            )}

            {/* Play Icon */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                hover ? "opacity-100" : "opacity-0",
              )}
            >
              <Play size={38} className="text-white drop-shadow-lg" />
            </div>

            {/* 3 DOT MENU */}
            <div className="absolute top-2 right-2 z-20">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-black/40 hover:bg-black/70 border border-white/20"
                  >
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="bottom"
                  align="end"
                  className="bg-neutral-900 text-white border-neutral-700"
                >
                  <DropdownMenuItem
                    className="text-xs"
                    onClick={(e) => {
                      e.preventDefault(); // so Link doesn't trigger navigation
                      handleAddToList();
                    }}
                  >
                    {loading
                      ? "Adding..."
                      : anime.totalEpisodes
                        ? "Add to Watch List"
                        : "Add to Read List"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Q-tip Label */}
            {hover && (
              <div
                className="absolute bottom-1 left-1 backdrop-blur-md px-2 py-1 text-xs font-semibold rounded bg-black/50"
                style={{ color: anime.color }}
              >
                {anime.type}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div
          className={cn(
            "flex items-center gap-2 px-1 py-2 rounded-lg mt-2 text-xs font-black transition-colors duration-200",
            hover ? "bg-white/5" : "",
          )}
        >
          <div
            className="font-medium truncate"
            style={{ color: hover ? anime.color : "var(--title-color)" }}
          >
            {displayTitle.length > 35
              ? displayTitle.slice(0, 35) + "…"
              : displayTitle}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center px-1 gap-3 text-xs text-neutral-400 overflow-hidden whitespace-nowrap mt-0.5">
          {anime.releaseDate && <span>{anime.releaseDate}</span>}
          {anime.episodes && <span>{anime.episodes} eps</span>}
          {anime.rating && <span>{anime.rating / 10}★</span>}
        </div>
      </div>
    </Link>
  );
}

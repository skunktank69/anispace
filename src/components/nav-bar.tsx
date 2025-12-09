"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Shuffle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import AuthModal from "./auth-modal";
import { ModeToggle } from "./theme/mode-toggle";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  async function fetchMe() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user || null);
    } catch (_) {
      console.error(_);
      setUser(null);
    }
  }

  useEffect(() => {
    (async () => await fetchMe())();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/login", { method: "POST" });
    setUser(null);
    window.location.reload();
  }

  return (
    <header className="w-full border-b bg-background/60 backdrop-blur supports-backdrop-filter:bg-background/40">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          AniSpace
        </Link>

        {/* Right */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Link href={"/search"}>
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          {/* Pick Random */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/random/anime">Anime</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/random/manga">Manga</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />

          {/* Avatar / Auth */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer border-2 border-sidebar-primary/50 dark:border-sidebar-foreground/50">
                  <AvatarImage src={user.avatar || ""} />
                  <AvatarFallback>
                    {user.name?.[0] || user.email?.[0]}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => setAuthOpen(true)}>
              Login
            </Button>
          )}
        </div>
      </div>

      <AuthModal open={authOpen} onOpenChangeAction={setAuthOpen} />
    </header>
  );
}

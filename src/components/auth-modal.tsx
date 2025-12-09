"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthModalProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
};

type AuthMode = "login" | "signup";

export default function AuthModal({
  open,
  onOpenChangeAction,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState<boolean>(false);

  // Strict typed form values
  const [form, setForm] = useState<{
    email: string;
    password: string;
    name: string;
    username: string;
  }>({
    email: "",
    password: "",
    name: "",
    username: "",
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleAuth() {
    try {
      setLoading(true);

      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const res = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "Authentication failed");
        return;
      }

      onOpenChangeAction(false);
      setForm({
        email: "",
        password: "",
        name: "",
        username: "",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === "login" ? "Welcome Back" : "Create an Account"}
          </DialogTitle>
        </DialogHeader>

        {/* FORM BODY */}
        <div className="space-y-4">
          {/* Username + Name (Signup Only) */}
          {mode === "signup" && (
            <>
              <div className="space-y-1">
                <label className="text-sm">Name</label>
                <Input
                  type="text"
                  placeholder="Ayanokoji Kiyotaka"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm">Username</label>
                <Input
                  type="text"
                  placeholder="white_room_01"
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                />
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
          </div>

          {/* Button */}
          <Button onClick={handleAuth} disabled={loading} className="w-full">
            {loading ? "Processing..." : mode === "login" ? "Login" : "Sign Up"}
          </Button>

          {/* Toggle */}
          <p className="text-center text-sm">
            {mode === "login" ? (
              <>
                Don’t have an account?{" "}
                <button className="underline" onClick={() => setMode("signup")}>
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button className="underline" onClick={() => setMode("login")}>
                  Login
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

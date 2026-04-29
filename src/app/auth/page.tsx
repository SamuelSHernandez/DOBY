"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setStatus("sending");
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/home" },
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto mt-24 max-w-md p-6">
        <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Cloud sync</p>
        <h1 className="mt-1 text-xl font-bold text-text-primary">Supabase not configured</h1>
        <p className="mt-3 text-xs text-text-tertiary leading-relaxed">
          Set <code className="text-text-secondary">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-text-secondary">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in
          <code className="text-text-secondary"> .env.local</code> to enable cross-device sync. The app continues
          to work in local-only mode.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-24 max-w-md p-6">
      <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Sign in</p>
      <h1 className="mt-1 text-xl font-bold text-text-primary">Magic link</h1>
      <p className="mt-2 text-xs text-text-tertiary leading-relaxed">
        Enter your email. You&apos;ll get a one-tap sign-in link — no password.
      </p>

      {status === "sent" ? (
        <div className="mt-6 border border-azure bg-azure-dim p-4">
          <p className="text-sm text-text-primary">Check your email.</p>
          <p className="mt-1 text-[11px] text-text-tertiary">
            Open the link on this device and you&apos;ll be signed in automatically.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Email</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 border-border bg-surface text-text-primary"
              autoFocus
            />
          </div>
          <Button type="submit" disabled={status === "sending"} className="w-full">
            {status === "sending" ? "Sending…" : "Send link"}
          </Button>
          {status === "error" && (
            <p className="text-[11px] text-oxblood">{errorMsg}</p>
          )}
        </form>
      )}
    </div>
  );
}

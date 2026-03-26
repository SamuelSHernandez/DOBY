"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    login,
    { error: null }
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-carbon">
      <div className="w-full max-w-sm px-6">
        <h1 className="mb-1 text-lg font-bold uppercase tracking-wider text-text-primary">
          DOBY
        </h1>
        <p className="mb-8 text-xs text-text-tertiary">Sign in to your home</p>

        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="rounded border border-oxblood/30 bg-oxblood/10 px-3 py-2 text-xs text-oxblood">
              {state.error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-text-tertiary">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-azure"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-text-tertiary">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-azure"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-azure py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
          >
            {pending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-tertiary">
          No account?{" "}
          <Link href="/auth/signup" className="text-azure hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

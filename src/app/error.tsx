"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-lg font-bold text-text-primary">Something went wrong</h1>
      <p className="max-w-md text-center text-sm text-text-tertiary">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="border border-azure px-4 py-2 text-sm text-azure hover:bg-azure-dim"
      >
        Try again
      </button>
    </div>
  );
}

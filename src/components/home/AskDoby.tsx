"use client";

import { MessageCircle, ChevronRight } from "lucide-react";

export default function AskDoby() {
  return (
    <div className="mt-8 flex items-center gap-3 border border-border bg-surface px-4 py-3">
      <MessageCircle size={16} className="shrink-0 text-text-tertiary" />
      <span className="flex-1 text-sm text-text-tertiary">
        Ask DOBY &mdash; &ldquo;When was the roof last inspected?&rdquo;
      </span>
      <ChevronRight size={16} className="shrink-0 text-text-tertiary" />
    </div>
  );
}

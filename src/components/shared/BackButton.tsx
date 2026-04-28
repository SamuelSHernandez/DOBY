"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Props {
  href: string;
  label: string;
}

export default function BackButton({ href, label }: Props) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="mb-4 flex min-h-[44px] items-center gap-1.5 text-xs text-azure hover:underline"
    >
      <ArrowLeft size={14} />
      <span>{label}</span>
    </button>
  );
}

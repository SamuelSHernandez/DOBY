export function fd(form: FormData) {
  return {
    str: (name: string) => (form.get(name) as string) || "",
    num: (name: string) => Number(form.get(name)) || 0,
    url: (name: string) => {
      const raw = (form.get(name) as string) || "";
      if (!raw) return "";
      try { const u = new URL(raw); return u.protocol === "http:" || u.protocol === "https:" ? u.href : ""; }
      catch { return ""; }
    },
  };
}

export function formatDueText(days: number): string {
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Today";
  if (days < 7) return `In ${days} days`;
  if (days < 30) return `In ${Math.round(days / 7)} weeks`;
  return `In ${Math.round(days / 30)} months`;
}

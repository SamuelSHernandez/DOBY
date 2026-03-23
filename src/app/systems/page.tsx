"use client";

import { useDobyStore } from "@/store";
import { systemCategories } from "@/store/defaults";
import PageHeader from "@/components/layout/PageHeader";
import SystemCategoryCard from "@/components/systems/SystemCategoryCard";
import type { SystemCategory } from "@/store/types";

export default function SystemsPage() {
  const systems = useDobyStore((s) => s.systems);

  // Group systems by category
  const grouped = systemCategories.map((cat) => ({
    category: cat,
    systems: systems.filter((s) => s.category === cat.key),
  }));

  // Also include any systems with categories not in the predefined list
  const knownKeys = new Set(systemCategories.map((c) => c.key));
  const uncategorized = systems.filter((s) => !knownKeys.has(s.category));

  return (
    <div>
      <PageHeader title="Systems" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {grouped.map(({ category, systems: catSystems }) => (
          <SystemCategoryCard
            key={category.key}
            category={category}
            systems={catSystems}
          />
        ))}
        {uncategorized.length > 0 && (
          <SystemCategoryCard
            category={{ key: "hvac" as SystemCategory, label: "Other" }}
            systems={uncategorized}
          />
        )}
      </div>
    </div>
  );
}

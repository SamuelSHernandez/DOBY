"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import { systemCategories } from "@/store/defaults";
import PageHeader from "@/components/layout/PageHeader";
import SystemCategoryCard from "@/components/systems/SystemCategoryCard";
import SystemFormDialog from "@/components/systems/SystemFormDialog";
import type { HomeSystem, SystemCategory } from "@/store/types";

export default function SystemsPage() {
  const systems = useDobyStore((s) => s.systems);
  const deleteSystem = useDobyStore((s) => s.deleteSystem);
  const [editingSystem, setEditingSystem] = useState<HomeSystem | null>(null);

  const grouped = systemCategories.map((cat) => ({
    category: cat,
    systems: systems.filter((s) => s.category === cat.key),
  }));

  const knownKeys = new Set(systemCategories.map((c) => c.key));
  const uncategorized = systems.filter((s) => !knownKeys.has(s.category));

  return (
    <div>
      <PageHeader
        title="Systems"
        action={<SystemFormDialog />}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {grouped.map(({ category, systems: catSystems }) => (
          <SystemCategoryCard
            key={category.key}
            category={category}
            systems={catSystems}
            onEdit={setEditingSystem}
            onDelete={deleteSystem}
          />
        ))}
        {uncategorized.length > 0 && (
          <SystemCategoryCard
            category={{ key: "hvac" as SystemCategory, label: "Other" }}
            systems={uncategorized}
            onEdit={setEditingSystem}
            onDelete={deleteSystem}
          />
        )}
      </div>

      {editingSystem && (
        <SystemFormDialog
          system={editingSystem}
          onClose={() => setEditingSystem(null)}
        />
      )}
    </div>
  );
}

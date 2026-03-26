"use client";

import { useFeature } from "@/lib/useFeature";
import PageHeader from "@/components/layout/PageHeader";
import MaintenanceTaskList from "@/components/upkeep/MaintenanceTaskList";
import SeasonalChecklist from "@/components/upkeep/SeasonalChecklist";
import ProjectTracker from "@/components/upkeep/ProjectTracker";

export default function UpkeepPage() {
  const showSeasonal = useFeature("seasonalChecklist");
  const showProjects = useFeature("projectTracker");

  return (
    <div>
      <PageHeader title="Upkeep" />
      <MaintenanceTaskList />

      {showSeasonal && (
        <div className="mt-8">
          <SeasonalChecklist />
        </div>
      )}

      {showProjects && (
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">Projects</h2>
          <ProjectTracker />
        </div>
      )}
    </div>
  );
}

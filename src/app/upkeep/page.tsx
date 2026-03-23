"use client";

import PageHeader from "@/components/layout/PageHeader";
import MaintenanceTaskList from "@/components/upkeep/MaintenanceTaskList";

export default function UpkeepPage() {
  return (
    <div>
      <PageHeader title="Upkeep" />
      <MaintenanceTaskList />
    </div>
  );
}

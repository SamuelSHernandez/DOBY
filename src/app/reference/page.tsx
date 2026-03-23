"use client";

import PageHeader from "@/components/layout/PageHeader";
import AllItems from "@/components/reference/AllItems";
import PropertyDetails from "@/components/reference/PropertyDetails";

export default function ReferencePage() {
  return (
    <div>
      <PageHeader title="Reference" />
      <AllItems />
      <PropertyDetails />
    </div>
  );
}

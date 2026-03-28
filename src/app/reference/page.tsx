"use client";

import { useFeature } from "@/lib/useFeature";
import PageHeader from "@/components/layout/PageHeader";
import AllItems from "@/components/reference/AllItems";
import PropertyDetails from "@/components/reference/PropertyDetails";
import EmergencyPanel from "@/components/reference/EmergencyPanel";
import ContractorDirectory from "@/components/reference/ContractorDirectory";
import DocumentIndex from "@/components/reference/DocumentIndex";
import MaterialsPanel from "@/components/reference/MaterialsPanel";

export default function ReferencePage() {
  const showEmergency = useFeature("emergencyPanel");
  const showContractors = useFeature("contractorDirectory");
  const showDocuments = useFeature("documentIndex");

  return (
    <div>
      <PageHeader title="Reference" />

      {showEmergency && <EmergencyPanel />}

      <div className="mt-8">
        <AllItems />
      </div>

      {showContractors && (
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">Contractors</h2>
          <ContractorDirectory />
        </div>
      )}

      {showDocuments && (
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">Documents</h2>
          <DocumentIndex />
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">Materials &amp; Finishes</h2>
        <MaterialsPanel />
      </div>

      <PropertyDetails />
    </div>
  );
}

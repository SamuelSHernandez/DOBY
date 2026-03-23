"use client";

import { useState } from "react";
import { useDobyStore } from "@/store";
import { documentCategories } from "@/store/defaults";
import { generateId } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmptyState from "@/components/shared/EmptyState";
import { Plus, Trash2 } from "lucide-react";

export default function DocumentIndex() {
  const documents = useDobyStore((s) => s.documents);
  const addDocument = useDobyStore((s) => s.addDocument);
  const deleteDocument = useDobyStore((s) => s.deleteDocument);
  const [open, setOpen] = useState(false);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addDocument({
      id: generateId(),
      name: fd.get("name") as string,
      category: fd.get("category") as string,
      date: (fd.get("date") as string) || "",
      location: (fd.get("location") as string) || "",
    });
    setOpen(false);
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus size={14} />
          <span>Add Document</span>
        </Button>
      </div>

      {documents.length === 0 ? (
        <EmptyState message="No documents tracked — add deeds, warranties, permits, receipts" />
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between border border-border bg-surface p-3">
              <div>
                <p className="text-sm text-text-primary">{doc.name}</p>
                <div className="mt-1 flex gap-3 text-[11px] text-text-tertiary">
                  <span>{doc.category}</span>
                  {doc.date && <span>{formatDate(doc.date)}</span>}
                  {doc.location && <span>{doc.location}</span>}
                </div>
              </div>
              <button onClick={() => deleteDocument(doc.id)} className="touch-target p-2 text-text-tertiary hover:text-oxblood">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-panel text-text-primary sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold uppercase tracking-wider">Add Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Name</Label>
              <Input name="name" required className="mt-1 border-border bg-surface text-text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Category</Label>
                <Select name="category" defaultValue="Other">
                  <SelectTrigger className="mt-1 border-border bg-surface text-text-primary"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-border bg-panel text-text-primary">
                    {documentCategories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Date</Label>
                <Input name="date" type="date" className="mt-1 border-border bg-surface text-text-primary" />
              </div>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Location</Label>
              <Input name="location" className="mt-1 border-border bg-surface text-text-primary" placeholder="Filing cabinet, Google Drive, etc." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="border-border text-text-secondary">Cancel</Button>
              <Button type="submit" size="sm">Add</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

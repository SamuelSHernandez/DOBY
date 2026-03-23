"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useDobyStore } from "@/store";
import { roomPresets, floorOptions, defaultMaterials } from "@/store/defaults";
import { generateId } from "@/lib/constants";
import type { Room } from "@/store/types";
import { Plus } from "lucide-react";

interface RoomFormData {
  name: string;
  floor: string;
  widthFt: number;
  widthIn: number;
  heightFt: number;
  heightIn: number;
}

interface RoomFormDialogProps {
  room?: Room;
  trigger?: React.ReactNode;
}

export default function RoomFormDialog({ room, trigger }: RoomFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const addRoom = useDobyStore((s) => s.addRoom);
  const updateRoom = useDobyStore((s) => s.updateRoom);

  const isEditing = !!room;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RoomFormData>({
    defaultValues: room
      ? {
          name: room.name,
          floor: room.floor,
          widthFt: room.widthFt,
          widthIn: room.widthIn,
          heightFt: room.heightFt,
          heightIn: room.heightIn,
        }
      : {
          name: "",
          floor: "Main",
          widthFt: 12,
          widthIn: 0,
          heightFt: 10,
          heightIn: 0,
        },
  });

  function onSubmit(data: RoomFormData) {
    if (isEditing && room) {
      updateRoom(room.id, data);
    } else {
      const preset = selectedPreset !== null ? roomPresets[selectedPreset] : null;
      addRoom({
        id: generateId(),
        name: data.name,
        icon: preset?.icon ?? "home",
        color: preset?.color ?? "#3083DC",
        floor: data.floor,
        widthFt: data.widthFt,
        widthIn: data.widthIn,
        heightFt: data.heightFt,
        heightIn: data.heightIn,
        planX: 0,
        planY: 0,
        inventory: [],
        wishlist: [],
        materials: { ...defaultMaterials },
        systemIds: [],
      });
    }
    setOpen(false);
    reset();
    setSelectedPreset(null);
  }

  function selectPreset(idx: number) {
    setSelectedPreset(idx);
    setValue("name", roomPresets[idx].name);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus size={14} />
            <span>Add Room</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-border bg-panel text-text-primary sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold uppercase tracking-wider">
            {isEditing ? "Edit Room" : "Add Room"}
          </DialogTitle>
        </DialogHeader>

        {!isEditing && (
          <div className="mb-4">
            <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">
              Quick Select
            </Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {roomPresets.map((preset, idx) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => selectPreset(idx)}
                  className={`border px-3 py-2 text-[11px] transition-colors ${
                    selectedPreset === idx
                      ? "border-azure bg-azure-dim text-azure"
                      : "border-border text-text-secondary hover:border-border-bright"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-[10px] uppercase tracking-wider text-text-tertiary">
              Name
            </Label>
            <Input
              id="name"
              {...register("name")}
              className="mt-1 border-border bg-surface text-text-primary"
            />
            {errors.name && (
              <p className="mt-1 text-[11px] text-oxblood">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">
              Floor
            </Label>
            <Select
              defaultValue={room?.floor ?? "Main"}
              onValueChange={(v) => setValue("floor", v)}
            >
              <SelectTrigger className="mt-1 border-border bg-surface text-text-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-panel text-text-primary">
                {floorOptions.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">
                Width
              </Label>
              <div className="mt-1 flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    {...register("widthFt")}
                    className="border-border bg-surface text-text-primary"
                    placeholder="ft"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    {...register("widthIn")}
                    className="border-border bg-surface text-text-primary"
                    placeholder="in"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">
                Length
              </Label>
              <div className="mt-1 flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    {...register("heightFt")}
                    className="border-border bg-surface text-text-primary"
                    placeholder="ft"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    {...register("heightIn")}
                    className="border-border bg-surface text-text-primary"
                    placeholder="in"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="border-border text-text-secondary"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {isEditing ? "Save" : "Add Room"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

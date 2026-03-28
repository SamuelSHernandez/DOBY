"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useDobyStore } from "@/store";
import type { FloorPlan, FPPoint, FPWall, FPOpeningType } from "@/store/types";
import type { FloorPlanCanvasHandle } from "./FloorPlanCanvas";

const FloorPlanCanvas = dynamic(() => import("./FloorPlanCanvas"), { ssr: false });

// ─── Constants ───
const GRID = 20;
const INCH = GRID / 12;
const WALL_THICKNESS = 6;
const SNAP_DIST = 10;

const uid = () => crypto.randomUUID().slice(0, 8);
const dist2 = (a: FPPoint, b: FPPoint) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a: FPPoint, b: FPPoint, t: number): FPPoint => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
const snapInch = (p: FPPoint): FPPoint => ({
  x: Math.round(p.x / INCH) * INCH,
  y: Math.round(p.y / INCH) * INCH,
});

function pointToSegDist(p: FPPoint, a: FPPoint, b: FPPoint) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist2(p, a);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: a.x + t * dx, y: a.y + t * dy });
}

function projectOnWall(p: FPPoint, wall: FPWall) {
  const dx = wall.end.x - wall.start.x, dy = wall.end.y - wall.start.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return 0;
  return Math.max(0, Math.min(1, ((p.x - wall.start.x) * dx + (p.y - wall.start.y) * dy) / lenSq));
}

function snapSmart(p: FPPoint, walls: FPWall[]): FPPoint {
  let best = snapInch(p);
  let bestDist = SNAP_DIST;
  for (const w of walls) {
    for (const ep of [w.start, w.end]) {
      const d = dist2(p, ep);
      if (d < bestDist) { bestDist = d; best = { ...ep }; }
    }
  }
  return best;
}

const OPENING_TYPES: { id: FPOpeningType; label: string; icon: string; defaultWidth: number }[] = [
  { id: "door", label: "Door", icon: "\u25D7", defaultWidth: GRID * 2.5 },
  { id: "closet-door", label: "Closet", icon: "\u25A7", defaultWidth: GRID * 4 },
  { id: "sliding-door", label: "Slider", icon: "\u21C6", defaultWidth: GRID * 5 },
  { id: "window", label: "Window", icon: "\u25AD", defaultWidth: GRID * 2.5 },
];

const TOOLS = [
  { id: "pan", label: "Pan", icon: "\u2725" },
  { id: "select", label: "Select", icon: "\u2196" },
  { id: "wall", label: "Wall", icon: "\u2503" },
  ...OPENING_TYPES.map((o) => ({ id: o.id, label: o.label, icon: o.icon })),
  { id: "label", label: "Label", icon: "A" },
  { id: "eraser", label: "Erase", icon: "\u2715" },
];

const isOpeningTool = (t: string): t is FPOpeningType => OPENING_TYPES.some((o) => o.id === t);

type Selection = { type: "wall" | "opening" | "label"; id: string } | null;

interface Props {
  planId: string;
}

export default function FloorPlanEditor({ planId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<FloorPlanCanvasHandle>(null);
  const saveFloorPlan = useDobyStore((s) => s.saveFloorPlan);
  const activeStored = useDobyStore((s) => s.floorPlans[planId]);

  const [plan, setPlan] = useState<FloorPlan>(() =>
    activeStored ?? { id: planId, walls: [], openings: [], labels: [], gridSize: GRID }
  );
  const [tool, setTool] = useState("wall");
  const [drawing, setDrawing] = useState<{ start: FPPoint } | null>(null);
  const [mouse, setMouse] = useState<FPPoint>({ x: 0, y: 0 });
  const [selected, setSelected] = useState<Selection>(null);
  const [labelInput, setLabelInput] = useState<{ position: FPPoint; screenX: number; screenY: number } | null>(null);
  const [showDims, setShowDims] = useState(true);
  const [stageSize, setStageSize] = useState({ width: 800, height: 500 });
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);

  const [undoStack, setUndoStack] = useState<FloorPlan[]>([]);
  const [redoStack, setRedoStack] = useState<FloorPlan[]>([]);

  const pushUndo = useCallback((prev: FloorPlan) => {
    setUndoStack((s) => [...s.slice(-49), JSON.parse(JSON.stringify(prev))]);
    setRedoStack([]);
  }, []);

  const mutatePlan = useCallback(
    (fn: (p: FloorPlan) => FloorPlan) => {
      setPlan((prev) => { pushUndo(prev); return fn(prev); });
    },
    [pushUndo]
  );

  // Resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStageSize({ width: el.offsetWidth, height: el.offsetHeight }));
    ro.observe(el);
    setStageSize({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // Auto-save
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveFloorPlan({ ...plan, id: planId }), 800);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [plan, saveFloorPlan, planId]);

  const toWorld = useCallback((px: number, py: number): FPPoint => {
    return { x: (px - stagePos.x) / stageScale, y: (py - stagePos.y) / stageScale };
  }, [stagePos, stageScale]);

  const zoomToFit = useCallback(() => {
    if (plan.walls.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const w of plan.walls) {
      minX = Math.min(minX, w.start.x, w.end.x); minY = Math.min(minY, w.start.y, w.end.y);
      maxX = Math.max(maxX, w.start.x, w.end.x); maxY = Math.max(maxY, w.start.y, w.end.y);
    }
    if (minX === Infinity) return;
    const pad = 60;
    const cW = maxX - minX + pad * 2, cH = maxY - minY + pad * 2;
    const scale = Math.min(stageSize.width / cW, stageSize.height / cH, 2);
    setStageScale(scale);
    setStagePos({
      x: (stageSize.width - cW * scale) / 2 - (minX - pad) * scale,
      y: (stageSize.height - cH * scale) / 2 - (minY - pad) * scale,
    });
  }, [plan.walls, stageSize]);

  // Stage events
  const handleStageMouseDown = useCallback((e: any) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;
    const wp = toWorld(pos.x, pos.y);
    const snapped = snapSmart(wp, plan.walls);

    if (tool === "wall") {
      if (!drawing) {
        setDrawing({ start: snapped });
      } else {
        if (dist2(drawing.start, snapped) > GRID / 2) {
          mutatePlan((p) => ({
            ...p, walls: [...p.walls, { id: uid(), start: drawing.start, end: snapped, thickness: WALL_THICKNESS }],
          }));
        }
        setDrawing({ start: snapped });
      }
    } else if (isOpeningTool(tool)) {
      let closest: FPWall | null = null;
      let closestDist = 20;
      plan.walls.forEach((w) => { const d = pointToSegDist(wp, w.start, w.end); if (d < closestDist) { closestDist = d; closest = w; } });
      if (closest) {
        const t = projectOnWall(wp, closest);
        const def = OPENING_TYPES.find((o) => o.id === tool)!;
        mutatePlan((p) => ({
          ...p, openings: [...p.openings, { id: uid(), wallId: (closest as FPWall).id, type: tool as FPOpeningType, position: t, width: def.defaultWidth }],
        }));
      }
    } else if (tool === "label") {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) setLabelInput({ position: snapped, screenX: pos.x + rect.left, screenY: pos.y + rect.top });
    } else if (tool === "eraser") {
      let hit = false;
      for (const o of plan.openings) {
        const wall = plan.walls.find((w) => w.id === o.wallId);
        if (!wall) continue;
        const p = lerp(wall.start, wall.end, o.position);
        if (dist2(wp, p) < 15) { mutatePlan((pl) => ({ ...pl, openings: pl.openings.filter((x) => x.id !== o.id) })); hit = true; break; }
      }
      if (!hit) for (const l of plan.labels) {
        if (dist2(wp, l.position) < 20) { mutatePlan((pl) => ({ ...pl, labels: pl.labels.filter((x) => x.id !== l.id) })); hit = true; break; }
      }
      if (!hit) for (const w of plan.walls) {
        if (pointToSegDist(wp, w.start, w.end) < 10) {
          mutatePlan((pl) => ({ ...pl, walls: pl.walls.filter((x) => x.id !== w.id), openings: pl.openings.filter((o) => o.wallId !== w.id) })); break;
        }
      }
    } else if (tool === "select") {
      let hit: Selection = null;
      for (const o of plan.openings) {
        const wall = plan.walls.find((w) => w.id === o.wallId);
        if (!wall) continue;
        const p = lerp(wall.start, wall.end, o.position);
        if (dist2(wp, p) < 15) { hit = { type: "opening", id: o.id }; break; }
      }
      if (!hit) for (const l of plan.labels) {
        if (dist2(wp, l.position) < 20) { hit = { type: "label", id: l.id }; break; }
      }
      if (!hit) for (const w of plan.walls) {
        if (pointToSegDist(wp, w.start, w.end) < 10) { hit = { type: "wall", id: w.id }; break; }
      }
      setSelected(hit);
    }
  }, [tool, drawing, plan, toWorld, mutatePlan]);

  const handleStageMouseMove = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const pos = c.getPointerPosition();
    if (!pos) return;
    setMouse(toWorld(pos.x, pos.y));
  }, [toWorld]);

  const handleDragEnd = useCallback((pos: { x: number; y: number }) => {
    setStagePos(pos);
    // Also update scale from the stage (wheel zoom changes it directly)
    const stage = canvasRef.current?.getStage();
    if (stage) setStageScale(stage.scaleX());
  }, []);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (labelInput) return;
      if (e.key === "Escape") { setDrawing(null); setSelected(null); setLabelInput(null); }
      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        e.preventDefault();
        if (selected.type === "wall") mutatePlan((p) => ({ ...p, walls: p.walls.filter((w) => w.id !== selected.id), openings: p.openings.filter((o) => o.wallId !== selected.id) }));
        else if (selected.type === "opening") mutatePlan((p) => ({ ...p, openings: p.openings.filter((o) => o.id !== selected.id) }));
        else if (selected.type === "label") mutatePlan((p) => ({ ...p, labels: p.labels.filter((l) => l.id !== selected.id) }));
        setSelected(null);
      }
      if (e.key === "z" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        setUndoStack((stack) => { if (!stack.length) return stack; const prev = stack.at(-1)!; setRedoStack((r) => [...r, JSON.parse(JSON.stringify(plan))]); setPlan(prev); return stack.slice(0, -1); });
      }
      if ((e.key === "z" && (e.metaKey || e.ctrlKey) && e.shiftKey) || (e.key === "y" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setRedoStack((stack) => { if (!stack.length) return stack; const next = stack.at(-1)!; setUndoStack((u) => [...u, JSON.parse(JSON.stringify(plan))]); setPlan(next); return stack.slice(0, -1); });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, labelInput, plan, mutatePlan]);

  const exportPNG = () => {
    const c = canvasRef.current;
    if (!c) return;
    const uri = c.toDataURL({ pixelRatio: 2 });
    const a = document.createElement("a"); a.href = uri; a.download = "floorplan.png"; a.click();
  };

  const addLabel = (text: string) => {
    if (text && labelInput) mutatePlan((p) => ({ ...p, labels: [...p.labels, { id: uid(), position: labelInput.position, text }] }));
    setLabelInput(null);
  };

  const cursorStyle = tool === "pan" ? "grab" : tool === "select" ? "default" : "crosshair";

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 120px)", minHeight: 500 }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#333230] bg-[#222120] px-3 py-1.5">
        <div className="flex gap-0.5 mr-3">
          {TOOLS.map((t) => (
            <button key={t.id} onClick={() => { setTool(t.id); setDrawing(null); }}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-xs transition-colors"
              style={{ background: tool === t.id ? "#3b3a37" : "transparent", color: tool === t.id ? "#e8e6e0" : "#9c9a92", border: tool === t.id ? "1px solid #555350" : "1px solid transparent" }}>
              <span className="text-sm w-4 text-center">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-[#333230] mx-1.5" />
        <label className="flex items-center gap-1 font-mono text-[11px] text-[#9c9a92] cursor-pointer">
          <input type="checkbox" checked={showDims} onChange={(e) => setShowDims(e.target.checked)} className="accent-azure" /> Dims
        </label>
        <div className="w-px h-6 bg-[#333230] mx-1.5" />
        <button onClick={() => setStageScale((s) => Math.min(5, s * 1.25))}
          className="rounded-md border border-[#444240] bg-[#2a2928] px-2.5 py-1.5 font-mono text-[13px] text-[#b8b6ae] leading-none">+</button>
        <span className="font-mono text-[11px] text-[#7c7a72] min-w-[36px] text-center">{(stageScale * 100).toFixed(0)}%</span>
        <button onClick={() => setStageScale((s) => Math.max(0.2, s * 0.8))}
          className="rounded-md border border-[#444240] bg-[#2a2928] px-2.5 py-1.5 font-mono text-[13px] text-[#b8b6ae] leading-none">-</button>
        <button onClick={() => setStageScale(1)} className="rounded-md border border-[#444240] bg-[#2a2928] px-2 py-1 font-mono text-[11px] text-[#b8b6ae]">1:1</button>
        <button onClick={zoomToFit} className="rounded-md border border-[#444240] bg-[#2a2928] px-2 py-1 font-mono text-[11px] text-[#b8b6ae]">Fit</button>
        <div className="w-px h-6 bg-[#333230] mx-1.5" />
        <button onClick={exportPNG} className="rounded-md border border-[#444240] bg-[#2a2928] px-2 py-1 font-mono text-[11px] text-[#b8b6ae]">PNG</button>
        <div className="w-px h-6 bg-[#333230] mx-1.5" />
        <button onClick={() => { pushUndo(plan); setPlan({ id: planId, walls: [], openings: [], labels: [], gridSize: GRID }); setSelected(null); setDrawing(null); }}
          className="rounded-md border border-[#444240] bg-[#2a2928] px-2 py-1 font-mono text-[11px] text-[#e24b4a]">Clear</button>
        <span className="ml-auto font-mono text-[10px] text-[#555350]">auto-saved</span>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 overflow-hidden" style={{ cursor: cursorStyle, background: "#f8f7f4" }}>
        {stageSize.width > 0 && (
          <FloorPlanCanvas
            ref={canvasRef}
            width={stageSize.width}
            height={stageSize.height}
            walls={plan.walls}
            openings={plan.openings}
            labels={plan.labels}
            selected={selected}
            drawing={drawing}
            mouse={mouse}
            tool={tool}
            showDims={showDims}
            stagePos={stagePos}
            stageScale={stageScale}
            isPanTool={tool === "pan"}
            onStageMouseDown={handleStageMouseDown}
            onStageMouseMove={handleStageMouseMove}
            onDragEnd={handleDragEnd}
          />
        )}
      </div>

      {/* Label input */}
      {labelInput && (
        <div className="fixed z-50" style={{ left: labelInput.screenX, top: labelInput.screenY - 36 }}>
          <input className="rounded border border-[#555350] bg-[#2a2928] px-2 py-1 font-mono text-[13px] text-[#e8e6e0] outline-none w-36"
            autoFocus placeholder="Room name..."
            onKeyDown={(e) => { if (e.key === "Enter") addLabel((e.target as HTMLInputElement).value); if (e.key === "Escape") setLabelInput(null); }}
            onBlur={(e) => addLabel(e.target.value)} />
        </div>
      )}

      {/* Status bar */}
      <div className="flex gap-4 border-t border-[#333230] bg-[#222120] px-3 py-1 font-mono text-[11px] text-[#7c7a72]">
        <span>Tool: {tool}</span>
        <span>{plan.walls.length} walls / {plan.openings.length} openings / {plan.labels.length} labels</span>
        <span className="ml-auto">Scroll zoom / Pan tool or Alt+drag / Esc cancel / Del delete / Ctrl+Z undo</span>
      </div>
    </div>
  );
}

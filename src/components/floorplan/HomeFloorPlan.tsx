"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDobyStore } from "@/store";
import type { FloorPlan, FPPoint, FPWall, FPOpening, FPRoomPlacement } from "@/store/types";
import type { Room } from "@/store/types";

const GRID = 20;
const WALL_THICKNESS = 7;
const DEFAULT_ROOM_SIZE = GRID * 8;
const BG_COLOR = "#ffffff";

const lerp = (a: FPPoint, b: FPPoint, t: number): FPPoint => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
const wallAngle = (w: FPWall) => Math.atan2(w.end.y - w.start.y, w.end.x - w.start.x);
const wallLength = (w: FPWall) => Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y);

const snapToGrid = (p: FPPoint): FPPoint => ({
  x: Math.round(p.x / GRID) * GRID,
  y: Math.round(p.y / GRID) * GRID,
});

// Room color based on name keywords
function roomFill(room: Room): string {
  const n = room.name.toLowerCase();
  if (n.includes("bath") || n.includes("shower") || n.includes("w.i.c") || n.includes("closet")) return "#dbeafe"; // blue
  if (n.includes("bed") || n.includes("master") || n.includes("primary")) return "#fde8d0"; // warm tan
  if (n.includes("kitchen")) return "#fef3c7"; // pale yellow
  if (n.includes("util") || n.includes("laundry") || n.includes("garage")) return "#e5e7eb"; // gray
  if (n.includes("hall") || n.includes("entry") || n.includes("foyer")) return "#f3f4f6"; // light gray
  if (n.includes("office") || n.includes("study") || n.includes("den")) return "#ede9fe"; // light purple
  if (n.includes("dining")) return "#fce7f3"; // light pink
  return "#f9fafb"; // white-ish default
}

function roomBounds(roomPlan: FloorPlan | undefined): { w: number; h: number } {
  if (!roomPlan || roomPlan.walls.length === 0) return { w: DEFAULT_ROOM_SIZE, h: DEFAULT_ROOM_SIZE };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const w of roomPlan.walls) {
    minX = Math.min(minX, w.start.x, w.end.x);
    minY = Math.min(minY, w.start.y, w.end.y);
    maxX = Math.max(maxX, w.start.x, w.end.x);
    maxY = Math.max(maxY, w.start.y, w.end.y);
  }
  return { w: maxX - minX + 20, h: maxY - minY + 20 };
}

function roomOffset(roomPlan: FloorPlan | undefined): FPPoint {
  if (!roomPlan || roomPlan.walls.length === 0) return { x: 0, y: 0 };
  let minX = Infinity, minY = Infinity;
  for (const w of roomPlan.walls) {
    minX = Math.min(minX, w.start.x, w.end.x);
    minY = Math.min(minY, w.start.y, w.end.y);
  }
  return { x: minX - 10, y: minY - 10 };
}

function formatFtIn(px: number): string {
  const totalInches = (px / GRID) * 12;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  if (inches === 0 || inches === 12) return `${inches === 12 ? ft + 1 : ft}'`;
  return `${ft}'${inches}"`;
}

function drawOpening(ctx: CanvasRenderingContext2D, o: FPOpening, wall: FPWall, bgColor: string) {
  const pos = lerp(wall.start, wall.end, o.position);
  const angle = wallAngle(wall);
  const hw = o.width / 2;

  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(angle);

  // Clear wall behind opening with room's background color
  ctx.strokeStyle = bgColor;
  ctx.lineWidth = WALL_THICKNESS + 3;
  ctx.beginPath(); ctx.moveTo(-hw, 0); ctx.lineTo(hw, 0); ctx.stroke();

  const color = "#555555";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  if (o.type === "door") {
    ctx.beginPath(); ctx.moveTo(-hw, 0); ctx.lineTo(-hw, -hw); ctx.stroke();
    ctx.beginPath(); ctx.arc(-hw, 0, hw, -Math.PI / 2, 0, false); ctx.stroke();
    ctx.fillStyle = "#333"; ctx.fillRect(-hw - 1.5, -2, 3, 4); ctx.fillRect(hw - 1.5, -2, 3, 4);
  } else if (o.type === "closet-door") {
    const q = hw / 2;
    ctx.beginPath(); ctx.moveTo(-hw, 0); ctx.lineTo(-q, -5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-q, -5); ctx.lineTo(0, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw, 0); ctx.lineTo(q, -5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(q, -5); ctx.lineTo(0, 0); ctx.stroke();
    ctx.fillStyle = "#333"; ctx.fillRect(-hw - 1.5, -2, 3, 4); ctx.fillRect(hw - 1.5, -2, 3, 4);
  } else if (o.type === "sliding-door") {
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-hw, -1.5); ctx.lineTo(hw * 0.1, -1.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-hw * 0.1, 1.5); ctx.lineTo(hw, 1.5); ctx.stroke();
    ctx.fillStyle = "#333"; ctx.fillRect(-hw - 1.5, -2, 3, 4); ctx.fillRect(hw - 1.5, -2, 3, 4);
  } else {
    // Window — double line
    ctx.beginPath(); ctx.moveTo(-hw, -2.5); ctx.lineTo(hw, -2.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-hw, 2.5); ctx.lineTo(hw, 2.5); ctx.stroke();
    ctx.fillStyle = "#333"; ctx.fillRect(-hw - 1.5, -2.5, 3, 5); ctx.fillRect(hw - 1.5, -2.5, 3, 5);
  }
  ctx.restore();
}

export default function HomeFloorPlan() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const saveFloorPlan = useDobyStore((s) => s.saveFloorPlan);
  const rooms = useDobyStore((s) => s.rooms);
  const allPlans = useDobyStore((s) => s.floorPlans);
  const stored = allPlans["home"];

  const [plan, setPlan] = useState<FloorPlan>(() => {
    const base = stored ?? { id: "home", walls: [], openings: [], labels: [], roomPlacements: [], gridSize: GRID };
    const placed = new Set((base.roomPlacements || []).map((p) => p.roomId));
    const newPlacements = [...(base.roomPlacements || [])];
    let col = 0, row = 0, maxRowH = 0;
    const gap = GRID * 2;

    rooms.forEach((r) => {
      if (!placed.has(r.id)) {
        const rp = allPlans[r.id];
        const { w, h } = roomBounds(rp);
        if (col > 0 && col + w > GRID * 50) { col = 0; row += maxRowH + gap; maxRowH = 0; }
        newPlacements.push({ roomId: r.id, position: { x: col, y: row } });
        col += w + gap;
        maxRowH = Math.max(maxRowH, h);
      }
    });
    return { ...base, roomPlacements: newPlacements };
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ roomId: string; offset: FPPoint } | null>(null);
  const [camera, setCamera] = useState({ x: 60, y: 60, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<FPPoint | null>(null);

  const visibleRoomIds = new Set((plan.roomPlacements || []).map((p) => p.roomId));
  const hiddenRooms = rooms.filter((r) => !visibleRoomIds.has(r.id));

  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(null);
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveFloorPlan(plan), 800);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [plan, saveFloorPlan]);

  const toWorld = useCallback((sx: number, sy: number): FPPoint => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const rect = c.getBoundingClientRect();
    return { x: (sx - rect.left - camera.x) / camera.zoom, y: (sy - rect.top - camera.y) / camera.zoom };
  }, [camera]);

  const zoomToFit = useCallback(() => {
    const c = canvasRef.current;
    if (!c || !plan.roomPlacements?.length) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const pl of plan.roomPlacements) {
      const rp = allPlans[pl.roomId];
      const { w, h } = roomBounds(rp);
      minX = Math.min(minX, pl.position.x);
      minY = Math.min(minY, pl.position.y);
      maxX = Math.max(maxX, pl.position.x + w);
      maxY = Math.max(maxY, pl.position.y + h);
    }
    if (minX === Infinity) return;
    const pad = 80;
    const cW = maxX - minX + pad * 2, cH = maxY - minY + pad * 2;
    const zoom = Math.min(c.offsetWidth / cW, c.offsetHeight / cH, 2);
    setCamera({
      zoom,
      x: (c.offsetWidth - cW * zoom) / 2 - (minX - pad) * zoom,
      y: (c.offsetHeight - cH * zoom) / 2 - (minY - pad) * zoom,
    });
  }, [plan.roomPlacements, allPlans]);

  const fitted = useRef(false);
  useEffect(() => {
    if (!fitted.current && canvasRef.current && plan.roomPlacements?.length) {
      fitted.current = true;
      setTimeout(zoomToFit, 50);
    }
  }, [zoomToFit, plan.roomPlacements]);

  // Calculate total sq ft
  const totalSqFt = (plan.roomPlacements || []).reduce((sum, pl) => {
    const rp = allPlans[pl.roomId];
    const { w, h } = roomBounds(rp);
    const sqFt = (w / GRID) * (h / GRID);
    return sum + sqFt;
  }, 0);

  // ─── Render ───
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * dpr;
    c.height = c.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    const vx = -camera.x / camera.zoom, vy = -camera.y / camera.zoom;
    const vw = c.offsetWidth / camera.zoom, vh = c.offsetHeight / camera.zoom;

    // White background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(vx, vy, vw, vh);

    // ─── Pass 1: Room fills (colored backgrounds) ───
    for (const pl of plan.roomPlacements || []) {
      const room = rooms.find((r) => r.id === pl.roomId);
      if (!room) continue;
      const rp = allPlans[pl.roomId];
      const { w, h } = roomBounds(rp);
      const px = pl.position.x, py = pl.position.y;
      const fill = selected === pl.roomId ? "#e0e7ff" : roomFill(room);

      ctx.fillStyle = fill;
      ctx.fillRect(px, py, w, h);
    }

    // ─── Pass 2: Walls (drawn on top of fills) ───
    for (const pl of plan.roomPlacements || []) {
      const room = rooms.find((r) => r.id === pl.roomId);
      if (!room) continue;
      const rp = allPlans[pl.roomId];
      const { w, h } = roomBounds(rp);
      const px = pl.position.x, py = pl.position.y;
      const off = roomOffset(rp);

      if (rp && rp.walls.length > 0) {
        ctx.save();
        ctx.translate(px - off.x, py - off.y);

        for (const wall of rp.walls) {
          ctx.strokeStyle = "#1a1a1a";
          ctx.lineWidth = WALL_THICKNESS;
          ctx.lineCap = "square";
          ctx.beginPath();
          ctx.moveTo(wall.start.x, wall.start.y);
          ctx.lineTo(wall.end.x, wall.end.y);
          ctx.stroke();
        }

        ctx.restore();
      } else {
        // Empty room — thin border
        ctx.strokeStyle = "#999";
        ctx.lineWidth = WALL_THICKNESS;
        ctx.lineCap = "square";
        ctx.strokeRect(px, py, w, h);
      }
    }

    // ─── Pass 3: Openings (drawn on top of walls) ───
    for (const pl of plan.roomPlacements || []) {
      const room = rooms.find((r) => r.id === pl.roomId);
      if (!room) continue;
      const rp = allPlans[pl.roomId];
      if (!rp || rp.openings.length === 0) continue;
      const px = pl.position.x, py = pl.position.y;
      const off = roomOffset(rp);
      const fill = selected === pl.roomId ? "#e0e7ff" : roomFill(room);

      ctx.save();
      ctx.translate(px - off.x, py - off.y);
      for (const o of rp.openings) {
        const wall = rp.walls.find((ww) => ww.id === o.wallId);
        if (!wall) continue;
        drawOpening(ctx, o, wall, fill);
      }
      ctx.restore();
    }

    // ─── Pass 4: Room labels (name + dimensions) ───
    for (const pl of plan.roomPlacements || []) {
      const room = rooms.find((r) => r.id === pl.roomId);
      if (!room) continue;
      const rp = allPlans[pl.roomId];
      const { w, h } = roomBounds(rp);
      const px = pl.position.x, py = pl.position.y;
      const cx = px + w / 2, cy = py + h / 2;

      // Room name
      ctx.fillStyle = "#333333";
      ctx.font = "600 12px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(room.name, cx, cy - 7);

      // Dimensions
      ctx.fillStyle = "#777777";
      ctx.font = "11px system-ui, -apple-system, sans-serif";
      ctx.fillText(`${formatFtIn(w)} x ${formatFtIn(h)}`, cx, cy + 8);
    }

    // ─── Pass 5: Selection indicator ───
    if (selected) {
      const pl = (plan.roomPlacements || []).find((p) => p.roomId === selected);
      if (pl) {
        const rp = allPlans[pl.roomId];
        const { w, h } = roomBounds(rp);
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(pl.position.x - 5, pl.position.y - 5, w + 10, h + 10);
        ctx.setLineDash([]);
      }
    }

    // ─── Pass 6: Total sq ft ───
    if ((plan.roomPlacements || []).length > 0) {
      // Find bottom of all rooms
      let maxY = -Infinity;
      let centerX = 0;
      let count = 0;
      for (const pl of plan.roomPlacements || []) {
        const rp = allPlans[pl.roomId];
        const { w, h } = roomBounds(rp);
        maxY = Math.max(maxY, pl.position.y + h);
        centerX += pl.position.x + w / 2;
        count++;
      }
      if (count > 0) {
        centerX /= count;
        ctx.fillStyle = "#333";
        ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(`TOTAL: ${Math.round(totalSqFt)} sq. ft`, centerX, maxY + 20);
      }
    }

    ctx.restore();
  }, [plan, camera, selected, rooms, allPlans, totalSqFt]);

  // ─── Mouse ───
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - camera.x, y: e.clientY - camera.y });
      return;
    }
    const wp = toWorld(e.clientX, e.clientY);
    const placements = [...(plan.roomPlacements || [])].reverse();
    for (const pl of placements) {
      const room = rooms.find((r) => r.id === pl.roomId);
      if (!room) continue;
      const rp = allPlans[pl.roomId];
      const { w, h } = roomBounds(rp);
      if (wp.x >= pl.position.x && wp.x <= pl.position.x + w && wp.y >= pl.position.y && wp.y <= pl.position.y + h) {
        setSelected(pl.roomId);
        setDragging({ roomId: pl.roomId, offset: { x: wp.x - pl.position.x, y: wp.y - pl.position.y } });
        return;
      }
    }
    setSelected(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && panStart) {
      setCamera((c) => ({ ...c, x: e.clientX - panStart.x, y: e.clientY - panStart.y }));
      return;
    }
    if (dragging) {
      const wp = toWorld(e.clientX, e.clientY);
      const snapped = snapToGrid({ x: wp.x - dragging.offset.x, y: wp.y - dragging.offset.y });
      setPlan((p) => ({
        ...p,
        roomPlacements: (p.roomPlacements || []).map((pl) =>
          pl.roomId === dragging.roomId ? { ...pl, position: snapped } : pl
        ),
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setPanStart(null);
    setDragging(null);
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const rect = c.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      setCamera((cam) => {
        const nz = Math.max(0.3, Math.min(4, cam.zoom * factor));
        return { zoom: nz, x: mx - (mx - cam.x) * (nz / cam.zoom), y: my - (my - cam.y) * (nz / cam.zoom) };
      });
    };
    c.addEventListener("wheel", handler, { passive: false });
    return () => c.removeEventListener("wheel", handler);
  }, []);

  const hideRoom = (roomId: string) => {
    setPlan((p) => ({ ...p, roomPlacements: (p.roomPlacements || []).filter((pl) => pl.roomId !== roomId) }));
    if (selected === roomId) setSelected(null);
  };

  const showRoom = (roomId: string) => {
    const rp = allPlans[roomId];
    const { w, h } = roomBounds(rp);
    const cx = (-camera.x + (canvasRef.current?.offsetWidth || 600) / 2) / camera.zoom;
    const cy = (-camera.y + (canvasRef.current?.offsetHeight || 400) / 2) / camera.zoom;
    const pos = snapToGrid({ x: cx - w / 2, y: cy - h / 2 });
    setPlan((p) => ({ ...p, roomPlacements: [...(p.roomPlacements || []), { roomId, position: pos }] }));
  };

  const cursorStyle = dragging ? "grabbing" : "grab";

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 120px)", minHeight: 500 }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#333230] bg-[#222120] px-3 py-1.5">
        <button onClick={() => setCamera((c) => ({ ...c, zoom: Math.min(4, c.zoom * 1.25) }))}
          className="rounded-md border border-[#444240] bg-[#2a2928] px-2.5 py-1.5 font-mono text-[13px] text-[#b8b6ae] leading-none">+</button>
        <span className="font-mono text-[11px] text-[#7c7a72] min-w-[36px] text-center">{(camera.zoom * 100).toFixed(0)}%</span>
        <button onClick={() => setCamera((c) => ({ ...c, zoom: Math.max(0.3, c.zoom * 0.8) }))}
          className="rounded-md border border-[#444240] bg-[#2a2928] px-2.5 py-1.5 font-mono text-[13px] text-[#b8b6ae] leading-none">-</button>
        <div className="w-px h-6 bg-[#333230]" />
        <button onClick={zoomToFit}
          className="rounded-md border border-[#444240] bg-[#2a2928] px-2.5 py-1.5 font-mono text-[11px] text-[#b8b6ae]">Fit All</button>
        <button onClick={() => setCamera((c) => ({ ...c, zoom: 1 }))}
          className="rounded-md border border-[#444240] bg-[#2a2928] px-2.5 py-1.5 font-mono text-[11px] text-[#b8b6ae]">1:1</button>

        <div className="w-px h-6 bg-[#333230]" />

        {hiddenRooms.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-[#7c7a72]">Add:</span>
            {hiddenRooms.map((r) => (
              <button key={r.id} onClick={() => showRoom(r.id)}
                className="rounded-md border border-[#444240] bg-[#2a2928] px-2 py-1 font-mono text-[11px] text-[#9c9a92] hover:text-[#e8e6e0]">+ {r.name}</button>
            ))}
          </div>
        )}

        {selected && (
          <>
            <div className="w-px h-6 bg-[#333230]" />
            <button onClick={() => hideRoom(selected)}
              className="rounded-md border border-[#444240] bg-[#2a2928] px-2 py-1 font-mono text-[11px] text-[#e24b4a]">
              Hide {rooms.find((r) => r.id === selected)?.name || "Room"}
            </button>
          </>
        )}

        <span className="ml-auto font-mono text-[10px] text-[#555350]">
          {(plan.roomPlacements || []).length} rooms / {Math.round(totalSqFt)} sq ft / auto-saved
        </span>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="flex-1 block" style={{ cursor: cursorStyle }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()} />

      {/* Status */}
      <div className="flex gap-4 border-t border-[#333230] bg-[#222120] px-3 py-1 font-mono text-[11px] text-[#7c7a72]">
        <span>Drag rooms to arrange</span>
        <span>Alt+drag to pan</span>
        <span>Scroll to zoom</span>
        {selected && <span className="text-[#2563eb]">Selected: {rooms.find((r) => r.id === selected)?.name}</span>}
      </div>
    </div>
  );
}

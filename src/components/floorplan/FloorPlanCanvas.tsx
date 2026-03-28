"use client";

import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Stage, Layer, Line, Rect, Circle, Text, Arc, Group } from "react-konva";
import type { FPPoint, FPWall, FPOpening, FPLabel } from "@/store/types";

const GRID = 20;
const INCH = GRID / 12;
const WALL_THICKNESS = 6;

const dist2 = (a: FPPoint, b: FPPoint) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a: FPPoint, b: FPPoint, t: number): FPPoint => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
const snapInch = (p: FPPoint): FPPoint => ({
  x: Math.round(p.x / INCH) * INCH,
  y: Math.round(p.y / INCH) * INCH,
});
const wallAngle = (w: FPWall) => Math.atan2(w.end.y - w.start.y, w.end.x - w.start.x);
const wallLength = (w: FPWall) => dist2(w.start, w.end);

function formatDimFtIn(px: number): string {
  const totalInches = (px / GRID) * 12;
  const ft = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  if (inches === 0 || inches === 12) return `${inches === 12 ? ft + 1 : ft}'`;
  return `${ft}'${inches}"`;
}

type Selection = { type: "wall" | "opening" | "label"; id: string } | null;

export interface FloorPlanCanvasProps {
  width: number;
  height: number;
  walls: FPWall[];
  openings: FPOpening[];
  labels: FPLabel[];
  selected: Selection;
  drawing: { start: FPPoint } | null;
  mouse: FPPoint;
  tool: string;
  showDims: boolean;
  stagePos: { x: number; y: number };
  stageScale: number;
  isPanTool: boolean;
  onStageMouseDown: (e: any) => void;
  onStageMouseMove: () => void;
  onDragEnd: (pos: { x: number; y: number }) => void;
}

export interface FloorPlanCanvasHandle {
  getStage: () => any;
  getPointerPosition: () => FPPoint | null;
  toDataURL: (opts?: any) => string;
}

const FloorPlanCanvas = forwardRef<FloorPlanCanvasHandle, FloorPlanCanvasProps>((props, ref) => {
  const stageRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getStage: () => stageRef.current,
    getPointerPosition: () => {
      const s = stageRef.current;
      if (!s) return null;
      return s.getPointerPosition();
    },
    toDataURL: (opts?: any) => stageRef.current?.toDataURL(opts) || "",
  }));

  // Wheel zoom
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const container = stage.container();
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const oldScale = stage.scaleX();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.2, Math.min(5, oldScale * factor));
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };
      stage.scale({ x: newScale, y: newScale });
      stage.position({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
      stage.batchDraw();
      props.onDragEnd({ x: stage.x(), y: stage.y() });
    };
    container.addEventListener("wheel", handler, { passive: false });
    return () => container.removeEventListener("wheel", handler);
  }, []);

  // Grid lines
  const vx = -props.stagePos.x / props.stageScale;
  const vy = -props.stagePos.y / props.stageScale;
  const vw = props.width / props.stageScale;
  const vh = props.height / props.stageScale;
  const gx0 = Math.floor(vx / GRID) * GRID;
  const gy0 = Math.floor(vy / GRID) * GRID;

  const gridLines: React.ReactNode[] = [];
  for (let x = gx0; x <= vx + vw + GRID; x += GRID) {
    const major = x % (GRID * 5) === 0;
    gridLines.push(
      <Line key={`gx${x}`} points={[x, gy0, x, vy + vh + GRID]} stroke={major ? "#ccc8be" : "#e0ddd6"} strokeWidth={major ? 0.8 : 0.5} listening={false} />
    );
  }
  for (let y = gy0; y <= vy + vh + GRID; y += GRID) {
    const major = y % (GRID * 5) === 0;
    gridLines.push(
      <Line key={`gy${y}`} points={[gx0, y, vx + vw + GRID, y]} stroke={major ? "#ccc8be" : "#e0ddd6"} strokeWidth={major ? 0.8 : 0.5} listening={false} />
    );
  }

  // Preview
  const previewSnapped = props.drawing ? (() => {
    let best = snapInch(props.mouse);
    let bestDist = 10;
    for (const w of props.walls) {
      for (const ep of [w.start, w.end]) {
        const d = dist2(props.mouse, ep);
        if (d < bestDist) { bestDist = d; best = { ...ep }; }
      }
    }
    return best;
  })() : null;

  const isPlacementTool = props.tool === "wall" || ["door", "closet-door", "sliding-door", "window"].includes(props.tool) || props.tool === "label";

  return (
    <Stage
      ref={stageRef}
      width={props.width}
      height={props.height}
      x={props.stagePos.x}
      y={props.stagePos.y}
      scaleX={props.stageScale}
      scaleY={props.stageScale}
      draggable={props.isPanTool}
      onDragEnd={(e: any) => {
        props.onDragEnd({ x: e.target.x(), y: e.target.y() });
      }}
      onMouseDown={props.onStageMouseDown}
      onMouseMove={props.onStageMouseMove}
      onTouchStart={props.onStageMouseDown}
      onTouchMove={props.onStageMouseMove}
    >
      <Layer>
        {/* Grid */}
        {gridLines}

        {/* Walls */}
        {props.walls.map((w) => {
          const isSel = props.selected?.type === "wall" && props.selected.id === w.id;
          return (
            <Line key={w.id} points={[w.start.x, w.start.y, w.end.x, w.end.y]}
              stroke={isSel ? "#2563eb" : "#2c2c2a"} strokeWidth={WALL_THICKNESS} lineCap="round" listening={false} />
          );
        })}

        {/* Openings */}
        {props.openings.map((o) => {
          const wall = props.walls.find((w) => w.id === o.wallId);
          if (!wall) return null;
          const isSel = props.selected?.type === "opening" && props.selected.id === o.id;
          const pos = lerp(wall.start, wall.end, o.position);
          const angle = wallAngle(wall) * (180 / Math.PI);
          const hw = o.width / 2;
          const color = isSel ? "#2563eb" : "#6b6860";

          return (
            <Group key={o.id} x={pos.x} y={pos.y} rotation={angle} listening={false}>
              <Line points={[-hw, 0, hw, 0]} stroke="#f8f7f4" strokeWidth={WALL_THICKNESS + 2} />
              <Rect x={-hw - 2} y={-3} width={4} height={6} fill={isSel ? "#2563eb" : "#2c2c2a"} />
              <Rect x={hw - 2} y={-3} width={4} height={6} fill={isSel ? "#2563eb" : "#2c2c2a"} />
              {o.type === "door" && (
                <>
                  <Line points={[-hw, 0, -hw, -hw]} stroke={color} strokeWidth={1.5} />
                  <Arc x={-hw} y={0} innerRadius={0} outerRadius={hw} angle={90} rotation={-90} stroke={color} strokeWidth={1.5} />
                </>
              )}
              {o.type === "closet-door" && (
                <>
                  <Line points={[-hw, 0, -hw / 2, -6, 0, 0]} stroke={color} strokeWidth={1.5} />
                  <Line points={[hw, 0, hw / 2, -6, 0, 0]} stroke={color} strokeWidth={1.5} />
                </>
              )}
              {o.type === "sliding-door" && (
                <>
                  <Line points={[-hw, -2, hw * 0.1, -2]} stroke={color} strokeWidth={2} />
                  <Line points={[-hw * 0.1, 2, hw, 2]} stroke={color} strokeWidth={2} />
                </>
              )}
              {o.type === "window" && (
                <>
                  <Line points={[-hw, -3, hw, -3]} stroke={color} strokeWidth={1.5} />
                  <Line points={[-hw, 3, hw, 3]} stroke={color} strokeWidth={1.5} />
                </>
              )}
            </Group>
          );
        })}

        {/* Dimensions */}
        {props.showDims && props.walls.map((w) => {
          const len = wallLength(w);
          if (len < 30) return null;
          const mid = lerp(w.start, w.end, 0.5);
          let angle = wallAngle(w) * (180 / Math.PI);
          if (angle > 90) angle -= 180;
          if (angle < -90) angle += 180;
          const text = formatDimFtIn(len);
          return (
            <Text key={`dim-${w.id}`} x={mid.x} y={mid.y - 10} text={text}
              fontSize={11} fontFamily="monospace" fill="#6b6860"
              rotation={angle} offsetX={text.length * 3.3} listening={false} />
          );
        })}

        {/* Labels */}
        {props.labels.map((l) => {
          const isSel = props.selected?.type === "label" && props.selected.id === l.id;
          return (
            <Text key={l.id} x={l.position.x} y={l.position.y} text={l.text}
              fontSize={13} fontStyle="500" fontFamily="system-ui, sans-serif"
              fill={isSel ? "#2563eb" : "#44403c"} align="center"
              offsetX={l.text.length * 3.5} offsetY={7} listening={false} />
          );
        })}

        {/* Drawing preview */}
        {props.drawing && previewSnapped && (
          <>
            <Line points={[props.drawing.start.x, props.drawing.start.y, previewSnapped.x, previewSnapped.y]}
              stroke="#2563eb" strokeWidth={WALL_THICKNESS} lineCap="round" dash={[8, 6]} listening={false} />
            {dist2(props.drawing.start, previewSnapped) > 10 && (() => {
              const mid = lerp(props.drawing.start, previewSnapped, 0.5);
              const text = formatDimFtIn(dist2(props.drawing.start, previewSnapped));
              return (
                <Text x={mid.x} y={mid.y - 14} text={text}
                  fontSize={12} fontStyle="bold" fontFamily="monospace" fill="#2563eb"
                  offsetX={text.length * 3.5} listening={false} />
              );
            })()}
          </>
        )}

        {/* Crosshair */}
        {isPlacementTool && (
          <>
            <Line points={[snapInch(props.mouse).x, vy, snapInch(props.mouse).x, vy + vh]} stroke="rgba(37,99,235,0.15)" strokeWidth={0.5} dash={[4, 4]} listening={false} />
            <Line points={[vx, snapInch(props.mouse).y, vx + vw, snapInch(props.mouse).y]} stroke="rgba(37,99,235,0.15)" strokeWidth={0.5} dash={[4, 4]} listening={false} />
            <Circle x={snapInch(props.mouse).x} y={snapInch(props.mouse).y} radius={3} fill="#2563eb" listening={false} />
          </>
        )}
      </Layer>
    </Stage>
  );
});

FloorPlanCanvas.displayName = "FloorPlanCanvas";
export default FloorPlanCanvas;

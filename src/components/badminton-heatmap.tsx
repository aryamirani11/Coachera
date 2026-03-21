"use client";

import { useState } from "react";
import type { HeatmapPoint } from "@/lib/mock-data";

interface BadmintonHeatmapProps {
  points: HeatmapPoint[];
}

type FilterType = "all" | "smash" | "clear" | "drop" | "net";

const filterOptions: { label: string; value: FilterType }[] = [
  { label: "All Shots", value: "all" },
  { label: "Smashes", value: "smash" },
  { label: "Clears", value: "clear" },
  { label: "Drops", value: "drop" },
  { label: "Net", value: "net" },
];

function intensityToColor(intensity: number): string {
  if (intensity > 75) return "rgba(239, 68, 68, 0.7)";
  if (intensity > 50) return "rgba(249, 115, 22, 0.55)";
  if (intensity > 25) return "rgba(250, 204, 21, 0.45)";
  return "rgba(59, 130, 246, 0.35)";
}

export function BadmintonHeatmap({ points }: BadmintonHeatmapProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered =
    filter === "all" ? points : points.filter((p) => p.type === filter);

  return (
    <div className="space-y-3">
      {/* Filter Toggles */}
      <div className="flex flex-wrap gap-1.5">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              filter === opt.value
                ? "bg-electric text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Court SVG */}
      <div className="relative mx-auto w-full max-w-[340px]">
        <svg
          viewBox="0 0 340 440"
          className="w-full"
          style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.08))" }}
        >
          {/* Court background */}
          <rect
            x="10"
            y="10"
            width="320"
            height="420"
            rx="4"
            fill="#1a5e2a"
            stroke="#fff"
            strokeWidth="2"
          />

          {/* Outer boundary */}
          <rect
            x="30"
            y="20"
            width="280"
            height="400"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
          />

          {/* Singles sidelines */}
          <line x1="60" y1="20" x2="60" y2="420" stroke="#fff" strokeWidth="0.8" opacity="0.5" />
          <line x1="280" y1="20" x2="280" y2="420" stroke="#fff" strokeWidth="0.8" opacity="0.5" />

          {/* Center line (net) */}
          <line x1="30" y1="220" x2="310" y2="220" stroke="#fff" strokeWidth="2" />

          {/* Short service lines */}
          <line x1="30" y1="102" x2="310" y2="102" stroke="#fff" strokeWidth="1" />
          <line x1="30" y1="338" x2="310" y2="338" stroke="#fff" strokeWidth="1" />

          {/* Long service line (doubles) */}
          <line x1="30" y1="50" x2="310" y2="50" stroke="#fff" strokeWidth="0.8" opacity="0.5" />
          <line x1="30" y1="390" x2="310" y2="390" stroke="#fff" strokeWidth="0.8" opacity="0.5" />

          {/* Center lines */}
          <line x1="170" y1="102" x2="170" y2="220" stroke="#fff" strokeWidth="1" />
          <line x1="170" y1="220" x2="170" y2="338" stroke="#fff" strokeWidth="1" />

          {/* Net posts */}
          <rect x="20" y="216" width="10" height="8" rx="1" fill="#ddd" />
          <rect x="310" y="216" width="10" height="8" rx="1" fill="#ddd" />

          {/* Heatmap points — only bottom half (athlete's side) */}
          {filtered.map((point, i) => {
            const cx = 30 + (point.x / 100) * 280;
            const cy = 220 + (point.y / 100) * 200;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={8 + (point.intensity / 100) * 10}
                fill={intensityToColor(point.intensity)}
                opacity={0.7}
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          High
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-orange-500/55" />
          Medium
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/45" />
          Low
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500/35" />
          Minimal
        </div>
      </div>
    </div>
  );
}

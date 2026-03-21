"use client";

import { use } from "react";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BadmintonHeatmap } from "@/components/badminton-heatmap";
import {
  ArrowLeft,
  Play,
  Target,
  Timer,
  Swords,
  Shield,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { athletes, matchesByAthlete } from "@/lib/mock-data";

const PIE_COLORS = ["#ef4444", "#f59e0b", "#8b5cf6", "#6b7280"];
const BAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export default function MatchAnalysisPage({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  const { id, matchId } = use(params);
  const athlete = athletes.find((a) => a.id === id);
  const matches = matchesByAthlete[id] || [];
  const match = matches.find((m) => m.id === matchId);

  if (!athlete || !match) {
    return (
      <Shell>
        <p>Match not found.</p>
      </Shell>
    );
  }

  const rallyData = [
    {
      range: "0–5 shots",
      count: match.stats.rallies_under_6,
      pct: Math.round(
        (match.stats.rallies_under_6 /
          (match.stats.rallies_under_6 +
            match.stats.rallies_6_12 +
            match.stats.rallies_over_12)) *
          100
      ),
    },
    {
      range: "6–10 shots",
      count: Math.round(match.stats.rallies_6_12 * 0.6),
      pct: Math.round(
        ((match.stats.rallies_6_12 * 0.6) /
          (match.stats.rallies_under_6 +
            match.stats.rallies_6_12 +
            match.stats.rallies_over_12)) *
          100
      ),
    },
    {
      range: "11–20 shots",
      count: Math.round(match.stats.rallies_6_12 * 0.4) + Math.round(match.stats.rallies_over_12 * 0.5),
      pct: Math.round(
        ((match.stats.rallies_6_12 * 0.4 + match.stats.rallies_over_12 * 0.5) /
          (match.stats.rallies_under_6 +
            match.stats.rallies_6_12 +
            match.stats.rallies_over_12)) *
          100
      ),
    },
    {
      range: "20+ shots",
      count: Math.round(match.stats.rallies_over_12 * 0.5),
      pct: Math.round(
        ((match.stats.rallies_over_12 * 0.5) /
          (match.stats.rallies_under_6 +
            match.stats.rallies_6_12 +
            match.stats.rallies_over_12)) *
          100
      ),
    },
  ];

  const errorData = [
    { name: "Net Errors", value: match.errors.net_errors },
    { name: "Out of Bounds", value: match.errors.out_of_bounds },
    { name: "Defensive Misread", value: match.errors.defensive_misread },
    { name: "Forced Errors", value: match.errors.forced_errors },
  ];

  const pointData = [
    {
      method: "Smash Finish",
      pct: match.point_construction.smash_finish,
    },
    {
      method: "Drop Deception",
      pct: match.point_construction.drop_deception,
    },
    {
      method: "Opponent Error",
      pct: match.point_construction.opponent_error,
    },
    {
      method: "Rally Endurance",
      pct: match.point_construction.long_rally_endurance,
    },
  ];

  const kpis = [
    { label: "Error Rate", value: `${match.stats.error_rate}%`, icon: Target, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Avg Rally", value: `${match.stats.avg_rally_length} shots`, icon: Timer, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Off. Win", value: `${match.stats.offensive_win_rate}%`, icon: Swords, color: "text-electric", bg: "bg-electric/10" },
    { label: "Def. Win", value: `${match.stats.defensive_win_rate}%`, icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  const winPctUnder6 = 55 + Math.floor(match.stats.offensive_win_rate * 0.15);
  const winPctExtended = 28 + Math.floor(match.stats.defensive_win_rate * 0.2);

  return (
    <Shell>
      {/* Back nav */}
      <div className="mb-6">
        <Link
          href={`/athletes/${athlete.id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {athlete.name}
        </Link>
      </div>

      {/* Top: Video + Summary */}
      <div className="mb-6 grid gap-5 lg:grid-cols-5">
        {/* Video Player Placeholder */}
        <Card className="shadow-sm lg:col-span-3">
          <CardContent className="p-0">
            <div className="relative flex aspect-video items-center justify-center rounded-t-lg bg-gradient-to-br from-navy to-navy-light">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                  <Play className="h-8 w-8 text-white" fill="white" />
                </div>
                <p className="text-sm font-medium text-white/80">
                  Match Footage
                </p>
                <p className="mt-0.5 text-xs text-white/50">
                  {athlete.name} vs {match.opponent}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <div className="h-full w-1/3 bg-electric" />
              </div>
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-semibold">
                  {athlete.name} vs {match.opponent}
                </p>
                <p className="text-xs text-muted-foreground">
                  {match.upload_date} · {match.duration}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`text-xs ${
                    match.result === "W"
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {match.result === "W" ? "Win" : "Loss"}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {match.score}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Summary */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Match Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.bg}`}
                  >
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {kpi.label}
                  </span>
                </div>
                <span className="text-lg font-bold">{kpi.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <span className="text-sm text-muted-foreground">Total Points</span>
              <span className="text-lg font-bold">{match.stats.total_points}</span>
            </div>
            <Link
              href={`/athletes/${athlete.id}/matches/${match.id}/report`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-electric py-2.5 text-sm font-medium text-white transition-colors hover:bg-electric/90"
            >
              <FileText className="h-4 w-4" />
              View AI Report
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Grid (4 panels) */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Panel 1: Shot Placement Heatmap */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Shot Placement Heatmap
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Density visualization of shot placement on court
            </p>
          </CardHeader>
          <CardContent>
            <BadmintonHeatmap points={match.heatmap} />
          </CardContent>
        </Card>

        {/* Panel 2: Rally Length Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Rally Length Distribution
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Percentage of rallies in each shot range
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rallyData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                    formatter={(value: number | undefined) => [`${value ?? 0}%`, "Percentage"]}
                  />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 rounded-lg bg-blue-50 px-4 py-3">
              <p className="text-xs leading-relaxed text-blue-800">
                This athlete wins <strong>{winPctUnder6}%</strong> of rallies
                under 6 shots but only <strong>{winPctExtended}%</strong> in
                extended rallies beyond 20 shots.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Panel 3: Unforced Error Breakdown */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Unforced Error Breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Classification of errors by type
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={errorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {errorData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 px-4 py-2.5 text-center">
                <p className="text-xl font-bold">{match.stats.unforced_error_count}</p>
                <p className="text-[11px] text-muted-foreground">
                  Total Unforced Errors
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-2.5 text-center">
                <p className="text-xl font-bold">{match.stats.error_rate}%</p>
                <p className="text-[11px] text-muted-foreground">Error Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel 4: Point Construction */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Point Construction
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              How points are won by method
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pointData} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    dataKey="method"
                    type="category"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                    formatter={(value: number | undefined) => [`${value ?? 0}%`, "Win %"]}
                  />
                  <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                    {pointData.map((_, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={BAR_COLORS[index % BAR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1.5">
              {pointData.map((p, i) => (
                <div
                  key={p.method}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: BAR_COLORS[i] }}
                    />
                    <span className="text-muted-foreground">{p.method}</span>
                  </div>
                  <span className="font-medium">{p.pct}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

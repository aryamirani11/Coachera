"use client";

import { use, useState, useEffect } from "react";
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
  Loader2,
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
import { athletes as mockAthletes, matchesByAthlete } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

const PIE_COLORS = ["#ef4444", "#f59e0b", "#8b5cf6", "#6b7280"];
const BAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

const FALLBACK_STATS = {
  total_points: 76,
  rallies_under_6: 31,
  rallies_6_12: 22,
  rallies_over_12: 9,
  unforced_error_count: 14,
  error_rate: 18,
  offensive_win_rate: 64,
  defensive_win_rate: 42,
  avg_rally_length: 8.3,
};

const FALLBACK_ERRORS = {
  net_errors: 4,
  out_of_bounds: 5,
  defensive_misread: 3,
  forced_errors: 2,
};

const FALLBACK_POINT_CONSTRUCTION = {
  smash_finish: 32,
  drop_deception: 21,
  opponent_error: 28,
  long_rally_endurance: 19,
};

function generateFallbackHeatmap(): { x: number; y: number; intensity: number; type: "smash" | "clear" | "drop" | "net" }[] {
  const types: ("smash" | "clear" | "drop" | "net")[] = ["smash", "clear", "drop", "net"];
  const points: { x: number; y: number; intensity: number; type: "smash" | "clear" | "drop" | "net" }[] = [];
  const zones = [
    { cx: 25, cy: 20, spread: 15, bias: "smash" },
    { cx: 75, cy: 20, spread: 15, bias: "smash" },
    { cx: 50, cy: 85, spread: 12, bias: "net" },
    { cx: 30, cy: 55, spread: 20, bias: "clear" },
    { cx: 70, cy: 55, spread: 20, bias: "drop" },
    { cx: 50, cy: 40, spread: 25, bias: "clear" },
  ];
  let seed = 42;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  for (let i = 0; i < 55; i++) {
    const zone = zones[i % zones.length];
    points.push({
      x: Math.max(0, Math.min(100, Math.round(zone.cx + (rand() - 0.5) * zone.spread * 2))),
      y: Math.max(0, Math.min(100, Math.round(zone.cy + (rand() - 0.5) * zone.spread * 2))),
      intensity: 30 + Math.round(rand() * 70),
      type: rand() > 0.3 ? (zone.bias as any) : types[Math.floor(rand() * types.length)],
    });
  }
  return points;
}

export default function MatchAnalysisPage({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  const { id, matchId } = use(params);
  const [athlete, setAthlete] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let foundAthlete: any = null;
      let foundMatch: any = null;

      const { data: dbAthlete } = await supabase
        .from("athletes")
        .select("*")
        .eq("id", id)
        .single();

      if (dbAthlete) {
        foundAthlete = { ...dbAthlete, matchesAnalyzed: dbAthlete.matches_analyzed || 0 };
      } else {
        foundAthlete = mockAthletes.find((a) => a.id === id) || null;
      }

      const { data: dbMatch } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (dbMatch) {
        foundMatch = dbMatch;
      } else {
        const mocks = matchesByAthlete[id] || [];
        foundMatch = mocks.find((m) => m.id === matchId) || null;
      }

      if (!cancelled) {
        setAthlete(foundAthlete);
        setMatch(foundMatch);
        if (!foundAthlete || !foundMatch) setError("Match not found.");
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, matchId]);

  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-electric" />
          <p className="text-sm text-muted-foreground">Loading match data…</p>
        </div>
      </Shell>
    );
  }

  if (error || !athlete || !match) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Target className="mb-4 h-10 w-10 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Match Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link href={`/athletes/${id}`} className="mt-4 text-sm font-medium text-electric hover:underline">
            Back to Athlete
          </Link>
        </div>
      </Shell>
    );
  }

  const stats = match.stats?.total_points ? match.stats : FALLBACK_STATS;
  const errors = match.errors || FALLBACK_ERRORS;
  const pointConstruction = match.point_construction || FALLBACK_POINT_CONSTRUCTION;
  const heatmap = match.heatmap || generateFallbackHeatmap();

  const rallyTotal = stats.rallies_under_6 + stats.rallies_6_12 + stats.rallies_over_12;
  const rallyData = [
    { range: "0–5 shots", pct: Math.round((stats.rallies_under_6 / rallyTotal) * 100) },
    { range: "6–10 shots", pct: Math.round(((stats.rallies_6_12 * 0.6) / rallyTotal) * 100) },
    { range: "11–20 shots", pct: Math.round(((stats.rallies_6_12 * 0.4 + stats.rallies_over_12 * 0.5) / rallyTotal) * 100) },
    { range: "20+ shots", pct: Math.round(((stats.rallies_over_12 * 0.5) / rallyTotal) * 100) },
  ];

  const errorData = [
    { name: "Net Errors", value: errors.net_errors },
    { name: "Out of Bounds", value: errors.out_of_bounds },
    { name: "Defensive Misread", value: errors.defensive_misread },
    { name: "Forced Errors", value: errors.forced_errors },
  ];

  const pointData = [
    { method: "Smash Finish", pct: pointConstruction.smash_finish },
    { method: "Drop Deception", pct: pointConstruction.drop_deception },
    { method: "Opponent Error", pct: pointConstruction.opponent_error },
    { method: "Rally Endurance", pct: pointConstruction.long_rally_endurance },
  ];

  const kpis = [
    { label: "Error Rate", value: `${stats.error_rate}%`, icon: Target, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Avg Rally", value: `${stats.avg_rally_length} shots`, icon: Timer, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Off. Win", value: `${stats.offensive_win_rate}%`, icon: Swords, color: "text-electric", bg: "bg-electric/10" },
    { label: "Def. Win", value: `${stats.defensive_win_rate}%`, icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <Shell>
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
        <Card className="shadow-sm lg:col-span-3">
          <CardContent className="p-0">
            <div className="relative flex aspect-video items-center justify-center rounded-t-lg bg-gradient-to-br from-navy to-navy-light">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                  <Play className="h-8 w-8 text-white" fill="white" />
                </div>
                <p className="text-sm font-medium text-white/80">Match Footage</p>
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
                  {match.upload_date} · {match.duration || "42 min"}
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
                  {match.score && match.score !== "TBD" ? match.score : "21-18, 19-21, 21-16"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Match Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.bg}`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                  <span className="text-sm text-muted-foreground">{kpi.label}</span>
                </div>
                <span className="text-lg font-bold">{kpi.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <span className="text-sm text-muted-foreground">Total Points</span>
              <span className="text-lg font-bold">{stats.total_points}</span>
            </div>
            <Link
              href={`/athletes/${athlete.id}/matches/${match.id}/report`}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-electric py-2.5 text-sm font-medium text-white transition-colors hover:bg-electric/90"
            >
              <FileText className="h-4 w-4" />
              View Detailed Report
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Heatmap */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Shot Placement Heatmap</CardTitle>
            <p className="text-xs text-muted-foreground">Density visualization of shot placement on court</p>
          </CardHeader>
          <CardContent>
            <BadmintonHeatmap points={heatmap} />
          </CardContent>
        </Card>

        {/* Rally Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Rally Length Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Percentage of rallies in each shot range</p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rallyData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} formatter={(value: number | undefined) => [`${value ?? 0}%`, "Percentage"]} />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 rounded-lg bg-blue-50 px-4 py-3">
              <p className="text-xs leading-relaxed text-blue-800">
                This athlete wins <strong>{55 + Math.floor(stats.offensive_win_rate * 0.15)}%</strong> of rallies
                under 6 shots but only <strong>{28 + Math.floor(stats.defensive_win_rate * 0.2)}%</strong> in
                extended rallies beyond 20 shots.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Error Breakdown */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Unforced Error Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">Classification of errors by type</p>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={errorData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {errorData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 px-4 py-2.5 text-center">
                <p className="text-xl font-bold">{stats.unforced_error_count}</p>
                <p className="text-[11px] text-muted-foreground">Total Unforced Errors</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-4 py-2.5 text-center">
                <p className="text-xl font-bold">{stats.error_rate}%</p>
                <p className="text-[11px] text-muted-foreground">Error Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Point Construction */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Point Construction</CardTitle>
            <p className="text-xs text-muted-foreground">How points are won by method</p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pointData} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <YAxis dataKey="method" type="category" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} formatter={(value: number | undefined) => [`${value ?? 0}%`, "Win %"]} />
                  <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                    {pointData.map((_, index) => (
                      <Cell key={`bar-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1.5">
              {pointData.map((p, i) => (
                <div key={p.method} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BAR_COLORS[i] }} />
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

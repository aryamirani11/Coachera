"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Target,
  Timer,
  Swords,
  Shield,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { athletes as mockAthletes, matchesByAthlete, getTrends } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

export default function AthleteProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [athlete, setAthlete] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAthlete() {
      const { data, error } = await supabase.from("athletes").select("*").eq("id", id).single();
      if (!error && data) {
        setAthlete({
          ...data,
          matchesAnalyzed: data.matches_analyzed || 0,
        });
      } else {
        const mockA = mockAthletes.find((a) => a.id === id);
        if (mockA) setAthlete(mockA);
      }
      setLoading(false);
    }
    fetchAthlete();
  }, [id]);

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center p-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </Shell>
    );
  }

  if (!athlete) {
    return (
      <Shell>
        <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
          <Target className="h-10 w-10 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Athlete Not Found</h2>
          <p className="text-muted-foreground">This athlete does not exist or was deleted.</p>
          <Link href="/athletes" className="text-electric hover:underline text-sm">Return to Roster</Link>
        </div>
      </Shell>
    );
  }

  // Handle matches tracking: 
  const matches = matchesByAthlete[athlete.id] || [];
  const trends = getTrends(athlete.id);

  const latestStats = matches[0]?.stats;
  const avgErrorRate = matches.length
    ? Math.round(
        matches.reduce((s: number, m: any) => s + m.stats.error_rate, 0) / matches.length
      )
    : 0;
  const avgRally = matches.length
    ? (
        matches.reduce((s: number, m: any) => s + m.stats.avg_rally_length, 0) /
        matches.length
      ).toFixed(1)
    : "0";
  const avgOffWin = matches.length
    ? Math.round(
        matches.reduce((s: number, m: any) => s + m.stats.offensive_win_rate, 0) /
          matches.length
      )
    : 0;
  const avgDefWin = matches.length
    ? Math.round(
        matches.reduce((s: number, m: any) => s + m.stats.defensive_win_rate, 0) /
          matches.length
      )
    : 0;

  const kpis = [
    {
      label: "Unforced Error Rate",
      value: `${avgErrorRate}%`,
      icon: Target,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Avg Rally Length",
      value: `${avgRally} shots`,
      icon: Timer,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Offensive Win Rate",
      value: `${avgOffWin}%`,
      icon: Swords,
      color: "text-electric",
      bg: "bg-electric/10",
    },
    {
      label: "Defensive Win Rate",
      value: `${avgDefWin}%`,
      icon: Shield,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <Shell>
      {/* Back + Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
              {athlete.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {athlete.name}
              </h1>
              {athlete.ranking && (
                <Badge variant="secondary" className="text-xs">
                  Rank #{athlete.ranking}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Age {athlete.age} · {athlete.matchesAnalyzed} matches analyzed ·
              Last active {athlete.lastActive}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ──────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {kpi.label}
                    </span>
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.bg}`}
                    >
                      <kpi.icon className={`h-4.5 w-4.5 ${kpi.color}`} />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold tracking-tight">
                    {kpi.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trend Chart */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <TrendingUp className="h-4 w-4 text-electric" />
                Performance Trends
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Last {trends.length} matches
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="match"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
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
                    <Line
                      type="monotone"
                      dataKey="error_rate"
                      name="Error Rate (%)"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avg_rally_length"
                      name="Rally Length"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="offensive_win_rate"
                      name="Off. Win %"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Matches Tab ──────────────────────────────── */}
        <TabsContent value="matches">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Opponent</TableHead>
                    <TableHead className="text-xs">Result</TableHead>
                    <TableHead className="text-xs">Score</TableHead>
                    <TableHead className="text-xs">Duration</TableHead>
                    <TableHead className="text-xs text-right">Error Rate</TableHead>
                    <TableHead className="text-xs text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">{m.upload_date}</TableCell>
                      <TableCell className="text-sm">{m.opponent}</TableCell>
                      <TableCell>
                        <Badge
                          className={`text-[10px] ${
                            m.result === "W"
                              ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                              : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                          }`}
                        >
                          {m.result === "W" ? "Win" : "Loss"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.score}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.duration}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {m.stats.error_rate}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/athletes/${athlete.id}/matches/${m.id}`}
                          className="text-xs font-medium text-electric hover:underline"
                        >
                          Analysis →
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Progress Tab ─────────────────────────────── */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Error Rate Over Time
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="match"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#6b7280" }}
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
                      />
                      <Line
                        type="monotone"
                        dataKey="error_rate"
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Rally Length Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="match"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="avg_rally_length"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}

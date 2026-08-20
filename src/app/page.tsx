"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Video,
  Timer,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
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
} from "recharts";
import {
  athletes as mockAthletes,
  academyStats as mockAcademyStats,
  recentMatches as mockRecentMatches,
} from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

interface DashboardData {
  athletes: any[];
  totalAthletes: number;
  matchesLast30Days: number;
  avgRallyLength: number;
  avgErrorRate: number;
  errorTrend: { month: string; rate: number }[];
  recentMatches: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let athletesList: any[] = [];
      let recent: any[] = [];
      let totalAthletes = mockAcademyStats.totalAthletes;
      let matchesLast30 = mockAcademyStats.matchesLast30Days;
      let avgRally = mockAcademyStats.avgRallyLength;
      let avgError = mockAcademyStats.avgErrorRate;
      let errorTrend = mockAcademyStats.errorTrend;

      const { data: dbAthletes } = await supabase
        .from("athletes")
        .select("*")
        .order("name");

      if (dbAthletes && dbAthletes.length > 0) {
        athletesList = dbAthletes.map((a) => ({
          ...a,
          matchesAnalyzed: a.matches_analyzed || 0,
        }));
        totalAthletes = 51;
      } else {
        athletesList = mockAthletes;
      }

      const { data: dbMatches } = await supabase
        .from("matches")
        .select("*, athletes(name)")
        .order("upload_date", { ascending: false })
        .limit(20);

      if (dbMatches && dbMatches.length > 0) {
        recent = dbMatches.map((m: any) => ({
          athleteName: m.athletes?.name || "Unknown",
          athleteId: m.athlete_id,
          matchId: m.id,
          opponent: m.opponent,
          result: m.result,
          date: m.upload_date,
          errorRate: m.stats?.error_rate ?? "N/A",
        }));

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count } = await supabase
          .from("matches")
          .select("*", { count: "exact", head: true })
          .gte("upload_date", thirtyDaysAgo.toISOString().split("T")[0]);
        matchesLast30 = count ?? mockAcademyStats.matchesLast30Days;
      } else {
        recent = mockRecentMatches;
      }

      setData({
        athletes: athletesList,
        totalAthletes,
        matchesLast30Days: matchesLast30,
        avgRallyLength: avgRally,
        avgErrorRate: avgError,
        errorTrend,
        recentMatches: recent,
      });
      setLoading(false);
    }

    load();
  }, []);

  if (loading || !data) {
    return (
      <Shell>
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Shell>
    );
  }

  const kpis = [
    {
      label: "Total Athletes",
      value: data.totalAthletes,
      icon: Users,
      change: "+3",
      trend: "up" as const,
      desc: "vs last month",
    },
    {
      label: "Matches Uploaded",
      value: data.matchesLast30Days,
      icon: Video,
      change: "+12",
      trend: "up" as const,
      desc: "last 30 days",
    },
    {
      label: "Avg Rally Length",
      value: `${data.avgRallyLength} shots`,
      icon: Timer,
      change: "+0.6",
      trend: "up" as const,
      desc: "vs last month",
    },
    {
      label: "Avg Error Rate",
      value: `${data.avgErrorRate}%`,
      icon: TrendingDown,
      change: "-1.4%",
      trend: "down" as const,
      desc: "vs last month",
    },
  ];

  return (
    <Shell>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Academy Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of Elite Academy performance and athlete activity.
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center justify-center rounded-md bg-electric px-4 py-2 text-sm font-medium text-white shadow hover:bg-electric/90 transition-colors"
        >
          Upload New Match
        </Link>
      </div>

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{kpi.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-electric/10">
                  <kpi.icon className="h-4.5 w-4.5 text-electric" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight">{kpi.value}</p>
              <div className="mt-1 flex items-center gap-1 text-xs">
                {kpi.trend === "up" ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-emerald-500" />
                )}
                <span className="font-medium text-emerald-600">{kpi.change}</span>
                <span className="text-muted-foreground">{kpi.desc}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-8 grid gap-5 lg:grid-cols-5">
        <Card className="shadow-sm lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Error Rate Trend</CardTitle>
            <p className="text-xs text-muted-foreground">Academy-wide average over last 5 months</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.errorTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[14, 21]} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                    formatter={(value: number | undefined) => [`${value ?? 0}%`, "Error Rate"]}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Athletes</CardTitle>
            <p className="text-xs text-muted-foreground">By matches analyzed</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {data.athletes
                .sort((a, b) => (b.matchesAnalyzed ?? b.matches_analyzed ?? 0) - (a.matchesAnalyzed ?? a.matches_analyzed ?? 0))
                .slice(0, 6)
                .map((ath, i) => (
                  <Link
                    key={ath.id}
                    href={`/athletes/${ath.id}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
                  >
                    <span className="w-5 text-xs font-medium text-muted-foreground">{i + 1}</span>
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                        {ath.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-none">{ath.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Rank #{ath.ranking ?? "—"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {ath.matchesAnalyzed ?? ath.matches_analyzed ?? 0} matches
                    </Badge>
                  </Link>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent Matches</CardTitle>
          <p className="text-xs text-muted-foreground">
            Latest analyzed match footage across all athletes
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Athlete</TableHead>
                <TableHead className="text-xs">Opponent</TableHead>
                <TableHead className="text-xs">Result</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs text-right">Error Rate</TableHead>
                <TableHead className="text-xs text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentMatches.map((m) => (
                <TableRow key={m.matchId}>
                  <TableCell>
                    <Link
                      href={`/athletes/${m.athleteId}`}
                      className="font-medium text-foreground hover:text-electric transition-colors"
                    >
                      {m.athleteName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.opponent}</TableCell>
                  <TableCell>
                    <Badge
                      variant={m.result === "W" ? "default" : "secondary"}
                      className={`text-[10px] ${
                        m.result === "W"
                          ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                          : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                      }`}
                    >
                      {m.result === "W" ? "Win" : "Loss"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.date}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {typeof m.errorRate === "number" ? `${m.errorRate}%` : m.errorRate}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/athletes/${m.athleteId}/matches/${m.matchId}`}
                      className="text-xs font-medium text-electric hover:underline"
                    >
                      View Analysis →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Shell>
  );
}

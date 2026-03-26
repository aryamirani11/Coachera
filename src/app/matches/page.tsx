"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Video } from "lucide-react";

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      // First try to load from Supabase with joins for athlete name
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          athletes(name)
        `)
        .order("upload_date", { ascending: false });

      if (!error && data && data.length > 0) {
        setMatches(data);
      } else {
        // Fallback to mock data
        const mockData = await import("@/lib/mock-data");
        setMatches(mockData.recentMatches);
      }
      setLoading(false);
    }
    loadMatches();
  }, []);

  return (
    <Shell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Matches</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All uploaded and analyzed match footage.
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center justify-center rounded-md bg-electric px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-electric/90"
        >
          Upload New Match
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[200px] h-11">Athlete</TableHead>
                <TableHead className="h-11">Opponent</TableHead>
                <TableHead className="h-11">Result</TableHead>
                <TableHead className="h-11">Date</TableHead>
                <TableHead className="text-right h-11">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Loading matches...
                  </TableCell>
                </TableRow>
              ) : matches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-[300px] text-center">
                    <div className="flex flex-col items-center justify-center p-6 pb-12">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Video className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mb-1 text-lg font-semibold">No matches analyzed yet</h3>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Upload your first match footage to unlock AI insights, performance metrics, and automated coaching reports.
                      </p>
                      <Link
                        href="/upload"
                        className="mt-6 inline-flex items-center justify-center rounded-md bg-electric px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-electric/90"
                      >
                        Upload Match
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                matches.map((m) => {
                  const athleteId = m.athlete_id || m.athleteId; // Handles both supabase and mock formats
                  const athleteName = m.athletes?.name || m.athleteName;
                  const matchId = m.id || m.matchId;
                  const date = m.upload_date || m.date;

                  return (
                    <TableRow key={matchId}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/athletes/${athleteId}`}
                          className="hover:text-electric transition-colors"
                        >
                          {athleteName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{m.opponent}</TableCell>
                      <TableCell>
                        <Badge
                          variant={m.result === "W" ? "default" : "secondary"}
                          className={
                            m.result === "W"
                              ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                              : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                          }
                        >
                          {m.result === "W" ? "Win" : "Loss"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{date}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/athletes/${athleteId}/matches/${matchId}`}
                          className="text-sm font-medium text-electric hover:underline"
                        >
                          View Report
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Shell>
  );
}

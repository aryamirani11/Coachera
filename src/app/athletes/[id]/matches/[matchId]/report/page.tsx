"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  FileText,
  Sparkles,
  Swords,
  Shield,
  Crosshair,
  Dumbbell,
  Brain,
  TrendingUp,
  Zap,
  Loader2,
} from "lucide-react";
import { athletes as mockAthletes, matchesByAthlete } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

function ShuttlecockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 9 6 9 10C9 11.5 9.5 12.8 10.3 13.7L2 22L3.4 23.4L12 14.8C12 14.8 12 14.8 12 14.8L20.6 23.4L22 22L13.7 13.7C14.5 12.8 15 11.5 15 10C15 6 12 2 12 2ZM12 4.5C12.8 5.8 13.5 7.8 13.5 10C13.5 11.4 12.9 12.5 12 13.2C11.1 12.5 10.5 11.4 10.5 10C10.5 7.8 11.2 5.8 12 4.5Z" />
    </svg>
  );
}

const sectionConfig: Record<string, { icon: any; accent: string; bg: string }> = {
  "Executive Summary": { icon: Sparkles, accent: "text-electric", bg: "bg-electric/10" },
  "Offensive Insights": { icon: Swords, accent: "text-red-500", bg: "bg-red-500/10" },
  "Defensive Observations": { icon: Shield, accent: "text-emerald-500", bg: "bg-emerald-500/10" },
  "Tactical Adjustments": { icon: Brain, accent: "text-violet-500", bg: "bg-violet-500/10" },
  "Training Recommendations": { icon: Dumbbell, accent: "text-amber-500", bg: "bg-amber-500/10" },
};

const fallbackIcons = [Sparkles, Swords, Shield, Crosshair, Brain, Dumbbell, TrendingUp, Zap];

interface Report {
  title: string;
  sections: { heading: string; content: any }[];
}

function safeContent(content: any): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.join("\n");
  return String(content ?? "");
}

export default function MatchReportPage({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  const { id, matchId } = use(params);
  const [athlete, setAthlete] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

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

      if (controller.signal.aborted) return;

      setAthlete(foundAthlete);
      setMatch(foundMatch);

      if (!foundAthlete || !foundMatch) {
        setError("Match or athlete not found.");
        setLoading(false);
        return;
      }

      if (foundMatch.ai_report?.sections) {
        setReport(foundMatch.ai_report);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/generate-report/${matchId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to generate report");
        const data = await res.json();
        if (!controller.signal.aborted) {
          setReport(data);
        }
      } catch (err: any) {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [id, matchId]);

  if (loading) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl">
          <Card className="shadow-sm">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 animate-ping rounded-full border-2 border-electric opacity-20" />
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-electric/10">
                    <Loader2 className="h-8 w-8 animate-spin text-electric" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold">Generating Report</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Coachera is analyzing match techniques, patterns, and tactical opportunities...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  if (error || !athlete || !match || !report) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl">
          <Card className="shadow-sm">
            <CardContent className="p-8">
              <div className="py-20 text-center">
                <p className="text-red-500">Error: {error || "Failed to load report"}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 text-sm font-medium text-electric hover:underline"
                >
                  Try Again
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-6">
        <Link
          href={`/athletes/${id}/matches/${matchId}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Match Analysis
        </Link>
      </div>

      <div className="mx-auto max-w-3xl">
        <Card className="shadow-sm overflow-hidden">
          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-electric via-violet-500 to-emerald-500" />

          <CardContent className="p-8 sm:p-10">
            {/* Header */}
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/10">
                  <FileText className="h-5 w-5 text-electric" />
                </div>
                <div>
                  <Badge variant="secondary" className="bg-electric/10 text-electric text-xs font-medium">
                    Coachera Analysis Report
                  </Badge>
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{report.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{athlete.name}</span>
                <span className="text-muted-foreground/30">·</span>
                <span>vs {match.opponent}</span>
                <span className="text-muted-foreground/30">·</span>
                <Badge
                  className={`text-[10px] ${
                    match.result === "W"
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {match.result === "W" ? "Win" : "Loss"}
                </Badge>
                {match.score && match.score !== "TBD" && (
                  <Badge variant="secondary" className="text-[10px]">
                    {match.score}
                  </Badge>
                )}
                <span className="text-muted-foreground/30">·</span>
                <span>{match.upload_date}</span>
              </div>
            </div>

            <Separator className="mb-8" />

            {/* Sections */}
            <div className="space-y-10">
              {report.sections.map((section, i) => {
                const config = sectionConfig[section.heading];
                const Icon = config?.icon || fallbackIcons[i % fallbackIcons.length];
                const accent = config?.accent || "text-muted-foreground";
                const bg = config?.bg || "bg-muted";
                const text = safeContent(section.content);
                const isExecSummary = section.heading === "Executive Summary";

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12, duration: 0.45, ease: "easeOut" }}
                    className="group"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} transition-transform group-hover:scale-105`}>
                        <Icon className={`h-4.5 w-4.5 ${accent}`} />
                      </div>
                      <h2 className="text-lg font-bold tracking-tight">{section.heading}</h2>
                    </div>
                    <div className="ml-12">
                      {isExecSummary ? (
                        <p className="text-[14px] leading-[1.85] text-muted-foreground">
                          {text.replace(/^[•\-\*]\s*/gm, "").replace(/\n/g, " ").trim()}
                        </p>
                      ) : text.includes("\n") ? (
                        <ul className="space-y-3">
                          {text.split("\n").filter(Boolean).map((line, j) => {
                            const cleaned = line.replace(/^[•\-\*]\s*/, "").trim();
                            if (!cleaned) return null;
                            return (
                              <motion.li
                                key={j}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.12 + j * 0.06, duration: 0.35 }}
                                className="flex items-start gap-3 text-[14px] leading-[1.7] text-muted-foreground"
                              >
                                <ShuttlecockIcon className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${accent}`} />
                                <span>{cleaned}</span>
                              </motion.li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-[14px] leading-[1.7] text-muted-foreground">{text}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Separator className="my-10" />

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Generated by Coachera Video Analysis
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                  Proprietary performance analysis engine
                </p>
              </div>
              <button className="flex items-center gap-2 rounded-xl bg-electric px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-electric/90 hover:shadow-md">
                <Download className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

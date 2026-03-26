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
  Loader2,
} from "lucide-react";
import { athletes, matchesByAthlete } from "@/lib/mock-data";

const sectionIcons = [Sparkles, Swords, Shield, Crosshair, Dumbbell];

interface Report {
  title: string;
  sections: { heading: string; content: string }[];
}

export default function MatchReportPage({
  params,
}: {
  params: Promise<{ id: string; matchId: string }>;
}) {
  const { id, matchId } = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const athlete = athletes.find((a) => a.id === id);
  const matches = matchesByAthlete[id] || [];
  const match = matches.find((m) => m.id === matchId);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/generate-report/${matchId}`);
        if (!res.ok) throw new Error("Failed to generate AI report");
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (matchId) {
      fetchReport();
    }
  }, [matchId]);

  if (!athlete || !match) {
    return (
      <Shell>
        <p>Report not found.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* Back nav */}
      <div className="mb-6">
        <Link
          href={`/athletes/${athlete.id}/matches/${match.id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Match Analysis
        </Link>
      </div>

      {/* Report Container */}
      <div className="mx-auto max-w-3xl">
        <Card className="shadow-sm">
          <CardContent className="p-8 sm:p-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-electric" />
                <h2 className="text-xl font-semibold">Generating AI Report...</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Our AI is analyzing {athlete.name}&apos;s performance techniques.
                </p>
              </div>
            ) : error || !report ? (
              <div className="py-20 text-center">
                <p className="text-red-500">Error: {error || "Failed to load report"}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 text-sm font-medium text-electric hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Report Header */}
                <div className="mb-8">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric/10">
                      <FileText className="h-4 w-4 text-electric" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-electric/10 text-electric text-xs"
                    >
                      AI-Generated Report
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {report.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{athlete.name}</span>
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
                    <Badge variant="secondary" className="text-[10px]">
                      {match.score}
                    </Badge>
                  </div>
                </div>

                <Separator className="mb-8" />

                {/* Report Sections */}
                <div className="space-y-8">
                  {report.sections.map((section, i) => {
                    const Icon = sectionIcons[i % sectionIcons.length];
                    return (
                      <div key={section.heading}>
                        <div className="mb-3 flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <h2 className="text-lg font-semibold tracking-tight">
                            {section.heading}
                          </h2>
                        </div>
                        <div className="pl-9.5">
                          {section.content.includes("\n") ? (
                            <div className="space-y-2">
                              {section.content.split("\n").map((line, j) => (
                                <p
                                  key={j}
                                  className="text-sm leading-relaxed text-muted-foreground"
                                >
                                  {line}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {section.content}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-8" />

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Generated by Coachera AI Analytics Engine using Gemini 2.0
                  </p>
                  <button className="flex items-center gap-2 rounded-lg bg-electric px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-electric/90">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

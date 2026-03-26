"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, ChevronRight, Loader2, UploadCloud, Video } from "lucide-react";
import { generateAIAnalysis, getGeminiKey } from "../api/analyze/action";

const loadingSteps = [
  "Uploading Match Footage...",
  "Running AI Video Processing...",
  "Extracting Gameplay Metrics...",
  "Generating Coaching Report...",
  "Finalizing Analysis...",
];

export default function UploadMatchPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    athleteId: "",
    opponent: "",
    result: "W",
    matchDate: new Date().toISOString().split("T")[0],
    visualContext: "",
  });

  const [uploading, setUploading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [wizardStep, setWizardStep] = useState(1);

  useEffect(() => {
    async function fetchAthletes() {
      const { data, error } = await supabase.from("athletes").select("*").order("name");
      if (!error && data && data.length > 0) {
        setAthletes(data);
      } else {
        const mockData = await import("@/lib/mock-data");
        setAthletes(mockData.athletes);
      }
    }
    fetchAthletes();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.athleteId || !formData.opponent) return;
    
    setUploading(true);
    setStepIndex(0);

    try {
      const athlete = athletes.find(a => a.id === formData.athleteId);
      
      // Step 1: Upload Video direct to Gemini using REST API
      const API_KEY = await getGeminiKey();
      
      const uploadRes = await fetch(
        `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "X-Goog-Upload-Protocol": "raw",
            "X-Goog-Upload-File-Name": file.name.replace(/[^a-zA-Z0-9.-]/g, "_"), // safe name
            "Content-Type": file.type || "video/mp4",
          },
          body: file,
        }
      );

      if (!uploadRes.ok) {
        throw new Error("Failed to upload video to Gemini.");
      }
      const fileData = await uploadRes.json();
      const fileUri = fileData.file.uri;
      const fileName = fileData.file.name;
      const fileMimeType = file.type || "video/mp4";

      // Progress Simulation up to step 3 while we wait for backend API
      let tempStep = 1;
      const interval = setInterval(() => {
        setStepIndex((prev) => Math.min(prev + 1, 3));
      }, 3000);

      // Wait for Gemini to mark the video file as ACTIVE (Max wait: 3 minutes)
      let pollCount = 0;
      const MAX_POLLS = 36; // 36 * 5s = 180 seconds maximum polling

      while (pollCount < MAX_POLLS) {
        await new Promise((r) => setTimeout(r, 5000));
        pollCount++;
        
        try {
          const statusRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${API_KEY}`
          );
          
          if (!statusRes.ok) {
             console.error("Gemini polling status code error:", statusRes.status);
             // If we hit 404 or something, log it but don't strictly throw yet in case of eventual consistency,
             // but if it's 400+ consistently we might be stuck.
          }
          
          const statusData = await statusRes.json();
          if (statusData.state === "ACTIVE") break;
          if (statusData.state === "FAILED") throw new Error("Gemini failed to process video.");
          if (statusData.error) throw new Error(statusData.error.message || "Unknown Gemini API Error");
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
          if (pollCount >= MAX_POLLS) throw new Error("Timeout waiting for video processing.");
        }
      }

      if (pollCount >= MAX_POLLS) {
        throw new Error("Video processing timed out after 3 minutes. Please try a shorter or compressed clip.");
      }

      // Step 2: Call Server Action to trigger Gemini AI analysis
      const analysisResult = await generateAIAnalysis(
        athlete,
        formData,
        fileUri,
        fileMimeType
      );

      clearInterval(interval);
      setStepIndex(4); // Finalizing

      // Step 3: Delete actual raw video if you want, but for demo leave it.
      
      // Step 4: Save to Supabase
      const { data: insertedMatch, error } = await supabase.from("matches").insert({
        athlete_id: formData.athleteId,
        opponent: formData.opponent,
        result: formData.result,
        upload_date: formData.matchDate,
        ai_report: analysisResult,
        score: "TBD", // Normally extracted from video!
        duration: "TBD"
      }).select().single();

      if (error) {
        console.error("Supabase insert error", error);
      } else {
        // Redirect to match report
        router.push(`/athletes/${formData.athleteId}/matches/${insertedMatch.id}`);
      }
      
    } catch (err) {
      console.error(err);
      alert("Error processing video. Check console.");
      setUploading(false);
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Upload Match</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Provide match details and upload the footage for AI analysis.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            {!uploading ? (
              <form onSubmit={handleUpload} className="space-y-6">
                
                {wizardStep === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <h2 className="text-xl font-medium mb-4">Step 1: The Context</h2>
                    <div>
                      <Label>Select Athlete</Label>
                      <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.athleteId}
                        onChange={(e) => setFormData({ ...formData, athleteId: e.target.value })}
                        required
                      >
                        <option value="">-- Choose Athlete --</option>
                        {athletes.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Opponent Name</Label>
                      <Input
                        required
                        placeholder="e.g. Victor Axelsen"
                        value={formData.opponent}
                        onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                      />
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                      <Button 
                        type="button" 
                        onClick={() => setWizardStep(2)} 
                        disabled={!formData.athleteId || !formData.opponent}
                      >
                        Next Step <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <h2 className="text-xl font-medium mb-4">Step 2: Match Details</h2>
                    <div>
                      <Label>Match Date</Label>
                      <Input
                        required
                        type="date"
                        value={formData.matchDate}
                        onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Result</Label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          type="button"
                          variant={formData.result === "W" ? "default" : "outline"}
                          className={formData.result === "W" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                          onClick={() => setFormData({ ...formData, result: "W" })}
                        >
                          Win
                        </Button>
                        <Button
                          type="button"
                          variant={formData.result === "L" ? "default" : "outline"}
                          className={formData.result === "L" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                          onClick={() => setFormData({ ...formData, result: "L" })}
                        >
                          Loss
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Visual Description</Label>
                      <p className="text-xs text-muted-foreground mb-1">
                        Help the AI identify your player (e.g. "My player is in the green shirt on the near side").
                      </p>
                      <Textarea
                        required
                        placeholder="My player is wearing..."
                        value={formData.visualContext}
                        onChange={(e) => setFormData({ ...formData, visualContext: e.target.value })}
                      />
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button variant="outline" type="button" onClick={() => setWizardStep(1)}>
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setWizardStep(3)}
                        disabled={!formData.matchDate || !formData.visualContext}
                      >
                        Next Step <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <h2 className="text-xl font-medium mb-4">Step 3: Upload Footage</h2>
                    <div>
                      <Label>Video File</Label>
                      <div 
                        className={`mt-1 border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-electric bg-electric/5' : 'border-muted-foreground/25 hover:border-electric/50 hover:bg-muted/50'}`}
                        onClick={() => document.getElementById("vid-upload")?.click()}
                      >
                        {file ? (
                          <>
                            <Video className="h-8 w-8 text-electric mb-2" />
                            <p className="text-sm font-medium text-electric">{file.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">Click to upload match footage</p>
                            <p className="text-xs text-muted-foreground mt-1">MP4, MOV up to 2GB</p>
                          </>
                        )}
                        <input
                          id="vid-upload"
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button variant="outline" type="button" onClick={() => setWizardStep(2)}>
                        Back
                      </Button>
                      <Button type="submit" className="bg-electric hover:bg-electric/90" disabled={!file || !formData.athleteId}>
                        Upload & Analyze
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            ) : (
              <div className="py-12 flex flex-col items-center">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-electric/10 mb-8">
                  <div className="absolute inset-0 animate-ping rounded-full border-2 border-electric opacity-20"></div>
                  <Loader2 className="h-10 w-10 text-electric animate-spin" />
                </div>
                
                <h2 className="text-lg font-semibold mb-6">Processing AI Analysis</h2>
                
                <div className="w-full max-w-sm space-y-4">
                  {loadingSteps.map((step, idx) => {
                    const isActive = idx === stepIndex;
                    const isCompleted = idx < stepIndex;
                    
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : isActive ? (
                          <Loader2 className="h-5 w-5 text-electric animate-spin" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted flex-shrink-0" />
                        )}
                        <span className={`text-sm ${isActive ? 'font-medium text-foreground' : isCompleted ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}

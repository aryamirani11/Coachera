"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function AddAthleteDialog({ onAdd }: { onAdd: (athlete: any) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [ranking, setRanking] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);

    const newAthlete = {
      name,
      ranking: ranking ? parseInt(ranking) : null,
      matches_analyzed: 0,
      avatar: name.substring(0, 2).toUpperCase()
    };

    const { data, error } = await supabase.from("athletes").insert([newAthlete]).select("*").single();
    
    setLoading(false);
    if (!error && data) {
      onAdd({
        ...data,
        matchesAnalyzed: data.matches_analyzed
      });
      setOpen(false);
      setName("");
      setRanking("");
    } else {
      // Fallback if Supabase is strictly unconfigured, just append optimistically
      const fallbackAthlete = {
        id: Math.random().toString(),
        name,
        ranking: ranking ? parseInt(ranking) : null,
        matchesAnalyzed: 0,
        avatar: name.substring(0, 2).toUpperCase()
      };
      onAdd(fallbackAthlete);
      setOpen(false);
      setName("");
      setRanking("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-electric hover:bg-electric-light transition-colors text-white shadow-sm border border-transparent">
          <Plus className="mr-2 h-4 w-4" /> Add Athlete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Athlete</DialogTitle>
            <DialogDescription>
              Add a new athlete to your academy roster to start analyzing their matches.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-sm">
                Name
              </Label>
              <Input
                id="name"
                required
                autoFocus
                placeholder="e.g. Lin Dan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3 transition-colors"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ranking" className="text-right text-sm">
                Ranking
              </Label>
              <Input
                id="ranking"
                type="number"
                placeholder="World Ranking (Optional)"
                value={ranking}
                onChange={(e) => setRanking(e.target.value)}
                className="col-span-3 transition-colors"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !name} className="bg-electric hover:bg-electric-light w-full sm:w-auto text-white">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Athlete"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

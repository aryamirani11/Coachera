"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddAthleteDialog } from "@/components/add-athlete-dialog";
import { motion } from "framer-motion";

export default function AthletesPage() {
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadAthletes() {
      // First try to load from Supabase
      const { data, error } = await supabase.from("athletes").select("*").order("name");
      if (!error && data && data.length > 0) {
        setAthletes(data);
      } else {
        // Fallback to mock data if table doesn't exist or is empty (for demo purposes if setup failed)
        const mockData = await import("@/lib/mock-data");
        setAthletes(mockData.athletes);
      }
      setLoading(false);
    }
    loadAthletes();
  }, []);

  const handleAddAthlete = (newAthlete: any) => {
    setAthletes((prev) => [...prev, newAthlete].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const filteredAthletes = athletes.filter((ath) =>
    ath.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Shell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Athletes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and review all athletes in your academy.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search athletes..."
              className="w-full bg-background pl-9 ring-offset-background transition-shadow focus:ring-2 focus:ring-electric/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <AddAthleteDialog onAdd={handleAddAthlete} />
        </div>
      </div>

      {!loading && filteredAthletes.length === 0 ? (
        <Card className="flex h-[300px] flex-col items-center justify-center text-center shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">No athletes found</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              {searchQuery
                ? `No athlete matches the search "${searchQuery}".`
                : "Your academy roster is currently empty."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse shadow-sm h-[140px]"></Card>
            ))
          ) : (
            filteredAthletes.map((ath, i) => (
              <Link key={ath.id} href={`/athletes/${ath.id}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className="h-full"
                >
                  <Card className="shadow-sm hover:border-electric hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                    <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                        {ath.avatar || ath.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm">{ath.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ath.ranking ? `Rank #${ath.ranking}` : "Unranked"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="mt-auto text-[10px]">
                      {ath.matchesAnalyzed || 0} Matches Analyzed
                    </Badge>
                  </CardContent>
                </Card>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      )}
    </Shell>
  );
}

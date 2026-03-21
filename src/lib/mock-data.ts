// ============================================================
// Coachera – Mock Data Layer
// ============================================================

export interface Athlete {
  id: string;
  name: string;
  age: number;
  ranking: number | null;
  academy_id: string;
  avatar: string;
  matchesAnalyzed: number;
  lastActive: string;
}

export interface MatchStats {
  total_points: number;
  rallies_under_6: number;
  rallies_6_12: number;
  rallies_over_12: number;
  unforced_error_count: number;
  error_rate: number;
  offensive_win_rate: number;
  defensive_win_rate: number;
  avg_rally_length: number;
}

export interface ErrorBreakdown {
  net_errors: number;
  out_of_bounds: number;
  defensive_misread: number;
  forced_errors: number;
}

export interface PointConstruction {
  smash_finish: number;
  drop_deception: number;
  opponent_error: number;
  long_rally_endurance: number;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  type: "smash" | "clear" | "drop" | "net";
}

export interface Match {
  id: string;
  athlete_id: string;
  upload_date: string;
  opponent: string;
  result: "W" | "L";
  score: string;
  duration: string;
  stats: MatchStats;
  errors: ErrorBreakdown;
  point_construction: PointConstruction;
  heatmap: HeatmapPoint[];
}

export interface TrendPoint {
  match: string;
  date: string;
  error_rate: number;
  avg_rally_length: number;
  offensive_win_rate: number;
}

// ── Athletes ────────────────────────────────────────────────
export const athletes: Athlete[] = [
  { id: "ath-001", name: "Aarav Sharma", age: 19, ranking: 12, academy_id: "ac-001", avatar: "AS", matchesAnalyzed: 24, lastActive: "2 hours ago" },
  { id: "ath-002", name: "Priya Nair", age: 17, ranking: 8, academy_id: "ac-001", avatar: "PN", matchesAnalyzed: 31, lastActive: "1 hour ago" },
  { id: "ath-003", name: "Rohan Patel", age: 21, ranking: 15, academy_id: "ac-001", avatar: "RP", matchesAnalyzed: 18, lastActive: "3 hours ago" },
  { id: "ath-004", name: "Meera Joshi", age: 16, ranking: 5, academy_id: "ac-001", avatar: "MJ", matchesAnalyzed: 42, lastActive: "30 min ago" },
  { id: "ath-005", name: "Karthik Rao", age: 20, ranking: 22, academy_id: "ac-001", avatar: "KR", matchesAnalyzed: 15, lastActive: "5 hours ago" },
  { id: "ath-006", name: "Ananya Gupta", age: 18, ranking: 11, academy_id: "ac-001", avatar: "AG", matchesAnalyzed: 28, lastActive: "1 day ago" },
  { id: "ath-007", name: "Vikram Singh", age: 22, ranking: 3, academy_id: "ac-001", avatar: "VS", matchesAnalyzed: 36, lastActive: "4 hours ago" },
  { id: "ath-008", name: "Diya Menon", age: 17, ranking: 9, academy_id: "ac-001", avatar: "DM", matchesAnalyzed: 22, lastActive: "2 days ago" },
  { id: "ath-009", name: "Arjun Reddy", age: 19, ranking: 18, academy_id: "ac-001", avatar: "AR", matchesAnalyzed: 20, lastActive: "6 hours ago" },
  { id: "ath-010", name: "Sanya Kulkarni", age: 16, ranking: 7, academy_id: "ac-001", avatar: "SK", matchesAnalyzed: 33, lastActive: "1 hour ago" },
  { id: "ath-011", name: "Nikhil Bose", age: 21, ranking: 25, academy_id: "ac-001", avatar: "NB", matchesAnalyzed: 12, lastActive: "3 days ago" },
  { id: "ath-012", name: "Tara Iyer", age: 18, ranking: 14, academy_id: "ac-001", avatar: "TI", matchesAnalyzed: 27, lastActive: "8 hours ago" },
  { id: "ath-013", name: "Rahul Kapoor", age: 20, ranking: null, academy_id: "ac-001", avatar: "RK", matchesAnalyzed: 9, lastActive: "1 week ago" },
  { id: "ath-014", name: "Ishita Das", age: 17, ranking: 20, academy_id: "ac-001", avatar: "ID", matchesAnalyzed: 19, lastActive: "12 hours ago" },
  { id: "ath-015", name: "Aditya Verma", age: 19, ranking: 6, academy_id: "ac-001", avatar: "AV", matchesAnalyzed: 38, lastActive: "45 min ago" },
  { id: "ath-016", name: "Kavya Pillai", age: 16, ranking: 10, academy_id: "ac-001", avatar: "KP", matchesAnalyzed: 25, lastActive: "2 hours ago" },
  { id: "ath-017", name: "Siddharth Nair", age: 22, ranking: 30, academy_id: "ac-001", avatar: "SN", matchesAnalyzed: 8, lastActive: "4 days ago" },
  { id: "ath-018", name: "Riya Deshmukh", age: 18, ranking: 16, academy_id: "ac-001", avatar: "RD", matchesAnalyzed: 21, lastActive: "10 hours ago" },
  { id: "ath-019", name: "Om Trivedi", age: 20, ranking: null, academy_id: "ac-001", avatar: "OT", matchesAnalyzed: 14, lastActive: "2 days ago" },
  { id: "ath-020", name: "Pooja Saxena", age: 17, ranking: 13, academy_id: "ac-001", avatar: "PS", matchesAnalyzed: 30, lastActive: "3 hours ago" },
  { id: "ath-021", name: "Dev Chatterjee", age: 21, ranking: 4, academy_id: "ac-001", avatar: "DC", matchesAnalyzed: 40, lastActive: "1 hour ago" },
  { id: "ath-022", name: "Shreya Banerjee", age: 16, ranking: 17, academy_id: "ac-001", avatar: "SB", matchesAnalyzed: 16, lastActive: "6 hours ago" },
  { id: "ath-023", name: "Arun Hegde", age: 19, ranking: 21, academy_id: "ac-001", avatar: "AH", matchesAnalyzed: 11, lastActive: "1 day ago" },
  { id: "ath-024", name: "Neha Pandey", age: 18, ranking: 19, academy_id: "ac-001", avatar: "NP", matchesAnalyzed: 23, lastActive: "5 hours ago" },
  { id: "ath-025", name: "Jayesh Malhotra", age: 22, ranking: null, academy_id: "ac-001", avatar: "JM", matchesAnalyzed: 7, lastActive: "5 days ago" },
  { id: "ath-026", name: "Simran Kaur", age: 17, ranking: 2, academy_id: "ac-001", avatar: "SimK", matchesAnalyzed: 45, lastActive: "20 min ago" },
  { id: "ath-027", name: "Pranav Gokhale", age: 20, ranking: 23, academy_id: "ac-001", avatar: "PG", matchesAnalyzed: 13, lastActive: "2 days ago" },
  { id: "ath-028", name: "Ankita Shah", age: 16, ranking: 15, academy_id: "ac-001", avatar: "ASh", matchesAnalyzed: 26, lastActive: "7 hours ago" },
  { id: "ath-029", name: "Manish Kumar", age: 21, ranking: 28, academy_id: "ac-001", avatar: "MK", matchesAnalyzed: 10, lastActive: "3 days ago" },
  { id: "ath-030", name: "Zara Fernandez", age: 18, ranking: 1, academy_id: "ac-001", avatar: "ZF", matchesAnalyzed: 48, lastActive: "15 min ago" },
  { id: "ath-031", name: "Tanmay Bhatt", age: 19, ranking: 24, academy_id: "ac-001", avatar: "TB", matchesAnalyzed: 17, lastActive: "1 day ago" },
  { id: "ath-032", name: "Lavanya Rao", age: 17, ranking: 11, academy_id: "ac-001", avatar: "LR", matchesAnalyzed: 29, lastActive: "4 hours ago" },
  { id: "ath-033", name: "Harsh Agarwal", age: 20, ranking: 26, academy_id: "ac-001", avatar: "HA", matchesAnalyzed: 6, lastActive: "1 week ago" },
  { id: "ath-034", name: "Nandini Choudhury", age: 16, ranking: 8, academy_id: "ac-001", avatar: "NC", matchesAnalyzed: 34, lastActive: "2 hours ago" },
  { id: "ath-035", name: "Samar Khanna", age: 22, ranking: null, academy_id: "ac-001", avatar: "SKh", matchesAnalyzed: 5, lastActive: "6 days ago" },
  { id: "ath-036", name: "Aisha Mirza", age: 18, ranking: 14, academy_id: "ac-001", avatar: "AM", matchesAnalyzed: 22, lastActive: "9 hours ago" },
  { id: "ath-037", name: "Yash Mehta", age: 19, ranking: 19, academy_id: "ac-001", avatar: "YM", matchesAnalyzed: 18, lastActive: "11 hours ago" },
  { id: "ath-038", name: "Ritika Srinivasan", age: 17, ranking: 6, academy_id: "ac-001", avatar: "RS", matchesAnalyzed: 37, lastActive: "30 min ago" },
  { id: "ath-039", name: "Kabir Dhawan", age: 21, ranking: 27, academy_id: "ac-001", avatar: "KD", matchesAnalyzed: 11, lastActive: "2 days ago" },
  { id: "ath-040", name: "Trisha Venkatesh", age: 16, ranking: 3, academy_id: "ac-001", avatar: "TV", matchesAnalyzed: 41, lastActive: "1 hour ago" },
];

// ── Generate heatmap points ────────────────────────────────
function generateHeatmap(seed: number): HeatmapPoint[] {
  const types: HeatmapPoint["type"][] = ["smash", "clear", "drop", "net"];
  const points: HeatmapPoint[] = [];
  let s = seed;
  const pseudoRandom = () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < 60; i++) {
    points.push({
      x: Math.round(pseudoRandom() * 100),
      y: Math.round(pseudoRandom() * 100),
      intensity: Math.round(pseudoRandom() * 100),
      type: types[Math.floor(pseudoRandom() * types.length)],
    });
  }
  return points;
}

// ── Seeded PRNG for deterministic data ─────────────────────
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Matches per athlete ────────────────────────────────────
function generateMatchesForAthlete(athleteId: string, count: number): Match[] {
  const opponents = [
    "Lee Wei Long", "Chen Yu Fei", "Tan Kian Meng", "Sindhu P.V.",
    "Park Ji Hyun", "Watanabe Y.", "Axelsen V.", "Momota K.",
    "Loh Kean Yew", "An Se Young"
  ];

  const baseSeed = parseInt(athleteId.replace(/\D/g, "")) * 7919 + 31337;
  const rand = createSeededRandom(baseSeed);

  const matches: Match[] = [];
  for (let i = 0; i < count; i++) {
    const errorRate = 12 + Math.round(rand() * 14);
    const ufErrors = 8 + Math.floor(rand() * 12);
    matches.push({
      id: `match-${athleteId}-${i + 1}`,
      athlete_id: athleteId,
      upload_date: new Date(2026, 0, 15 + i * 3).toISOString().split("T")[0],
      opponent: opponents[i % opponents.length],
      result: rand() > 0.4 ? "W" : "L",
      score: `${21}-${12 + Math.floor(rand() * 8)}, ${rand() > 0.5 ? "21" : "18"}-${14 + Math.floor(rand() * 6)}`,
      duration: `${32 + Math.floor(rand() * 25)} min`,
      stats: {
        total_points: 60 + Math.floor(rand() * 30),
        rallies_under_6: 25 + Math.floor(rand() * 15),
        rallies_6_12: 15 + Math.floor(rand() * 10),
        rallies_over_12: 5 + Math.floor(rand() * 8),
        unforced_error_count: ufErrors,
        error_rate: errorRate,
        offensive_win_rate: 55 + Math.floor(rand() * 20),
        defensive_win_rate: 35 + Math.floor(rand() * 20),
        avg_rally_length: 6 + Math.round(rand() * 6 * 10) / 10,
      },
      errors: {
        net_errors: Math.floor(ufErrors * 0.3),
        out_of_bounds: Math.floor(ufErrors * 0.35),
        defensive_misread: Math.floor(ufErrors * 0.2),
        forced_errors: Math.floor(ufErrors * 0.15),
      },
      point_construction: {
        smash_finish: 25 + Math.floor(rand() * 15),
        drop_deception: 15 + Math.floor(rand() * 10),
        opponent_error: 20 + Math.floor(rand() * 10),
        long_rally_endurance: 10 + Math.floor(rand() * 10),
      },
      heatmap: generateHeatmap(parseInt(athleteId.replace(/\D/g, "")) * 100 + i),
    });
  }
  return matches;
}

// Pre-generate matches for the first few athletes for detail views
export const matchesByAthlete: Record<string, Match[]> = {};
athletes.forEach((a) => {
  matchesByAthlete[a.id] = generateMatchesForAthlete(a.id, Math.min(a.matchesAnalyzed, 5));
});

// ── Trend data (last 5 matches per athlete) ────────────────
export function getTrends(athleteId: string): TrendPoint[] {
  const matches = matchesByAthlete[athleteId] || [];
  return matches.slice(0, 5).map((m, i) => ({
    match: `Match ${i + 1}`,
    date: m.upload_date,
    error_rate: m.stats.error_rate,
    avg_rally_length: m.stats.avg_rally_length,
    offensive_win_rate: m.stats.offensive_win_rate,
  }));
}

// ── Recent matches (academy-wide) ──────────────────────────
export interface RecentMatch {
  athleteName: string;
  athleteId: string;
  matchId: string;
  opponent: string;
  result: "W" | "L";
  date: string;
  errorRate: number;
}

export const recentMatches: RecentMatch[] = athletes.slice(0, 12).flatMap((a) => {
  const m = matchesByAthlete[a.id]?.[0];
  if (!m) return [];
  return [{
    athleteName: a.name,
    athleteId: a.id,
    matchId: m.id,
    opponent: m.opponent,
    result: m.result,
    date: m.upload_date,
    errorRate: m.stats.error_rate,
  }];
});

// ── Academy-level KPIs ─────────────────────────────────────
export const academyStats = {
  totalAthletes: athletes.length,
  matchesLast30Days: 87,
  avgRallyLength: 8.4,
  avgErrorRate: 16.2,
  errorTrend: [
    { month: "Sep", rate: 19.1 },
    { month: "Oct", rate: 18.4 },
    { month: "Nov", rate: 17.2 },
    { month: "Dec", rate: 16.8 },
    { month: "Jan", rate: 16.2 },
  ],
};

// ── AI Report Template ─────────────────────────────────────
export function generateReport(athlete: Athlete, match: Match) {
  return {
    title: `Match Performance Summary – ${new Date(match.upload_date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
    athlete: athlete.name,
    opponent: match.opponent,
    result: match.result,
    score: match.score,
    sections: [
      {
        heading: "Executive Summary",
        content: `${athlete.name} ${match.result === "W" ? "secured a win" : "faced a tough loss"} against ${match.opponent} with a final score of ${match.score}. The match lasted ${match.duration} with a total of ${match.stats.total_points} points played. The overall error rate stood at ${match.stats.error_rate}%, with ${match.stats.unforced_error_count} unforced errors recorded across all rallies.`,
      },
      {
        heading: "Offensive Insights",
        content: `Offensive win rate reached ${match.stats.offensive_win_rate}%, driven primarily by smash finishes (${match.point_construction.smash_finish}% of points won) and drop shot deception (${match.point_construction.drop_deception}%). ${athlete.name} demonstrates strong early rally dominance with ${match.stats.rallies_under_6} rallies resolved in under 6 shots. The athlete's aggressive court positioning generated consistent pressure on ${match.opponent}'s rear court defense.`,
      },
      {
        heading: "Defensive Observations",
        content: `Defensive win rate was ${match.stats.defensive_win_rate}%, indicating ${match.stats.defensive_win_rate > 50 ? "solid" : "areas for improvement in"} defensive resilience. ${match.errors.defensive_misread} points were lost due to defensive misreads, particularly on cross-court drop shots. Recovery speed to the base position after defensive lifts showed occasional lag, contributing to follow-up errors. ${athlete.name} struggles in extended exchanges beyond 12 shots, winning only ${Math.round(match.stats.defensive_win_rate * 0.7)}% of those rallies.`,
      },
      {
        heading: "Tactical Adjustments",
        content: `The data suggests shifting to a more aggressive net approach in rallies exceeding 8 shots to prevent extended defensive sequences. Targeting ${match.opponent}'s backhand corner showed higher success rates (68%) compared to forehand attacks (52%). Consider incorporating more deceptive clears to pull the opponent out of their base position before executing finishing shots.`,
      },
      {
        heading: "Training Recommendations",
        content: `1. Multi-shuttle defensive recovery drills focusing on rear court-to-net transitions.\n2. Extended rally simulation sets (15+ shots) to build endurance in prolonged exchanges.\n3. Net kill accuracy training to capitalize on weak defensive returns.\n4. Footwork recovery patterns indicate slower transition to rear court under defensive pressure — focus on split-step timing.\n5. Shadow footwork circuits targeting the identified weak zones in the heatmap analysis.`,
      },
    ],
  };
}

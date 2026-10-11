import "server-only";
import { db } from "@/lib/db";

export type Row = { name: string; mode: string; score: number; time_ms: number; finished_at: string };

export async function leaderboard() {
  const sql = await db();
  return (await sql`
    SELECT name, mode, score, time_ms, finished_at FROM sessions
    WHERE finished_at IS NOT NULL
    ORDER BY score DESC, time_ms ASC LIMIT 50`) as Row[];
}

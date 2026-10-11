import { leaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await leaderboard());
}

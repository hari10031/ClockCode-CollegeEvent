import { UUID, bad, db } from "@/lib/db";
import { byId } from "@/lib/questions";

const GRACE_MS = 2000; // network delay allowance on top of the visible timer

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return bad("Session not found", 404);
  const { choice } = await req.json().catch(() => ({}));

  const sql = await db();
  const [s] = await sql`
    SELECT current, question_ids, limits, answered, EXTRACT(EPOCH FROM now() - shown_at) * 1000 AS elapsed
    FROM sessions WHERE id = ${id}`;
  if (!s) return bad("Session not found", 404);
  if (s.answered) return bad("This question is already answered", 409);

  const cur: number = s.current;
  const q = byId(s.question_ids[cur]);
  const limitMs = s.limits ? s.limits[cur] * 1000 : Infinity;
  const elapsed = Number(s.elapsed);
  const late = elapsed > limitMs + GRACE_MS;
  const correct = !late && choice === q.answer;

  // Conditional update so a double submit can never score twice.
  const [u] = await sql`
    UPDATE sessions SET answered = true, score = score + ${correct ? 1 : 0},
      time_ms = time_ms + ${Math.round(Math.min(elapsed, limitMs))},
      finished_at = CASE WHEN current = 3 THEN now() END
    WHERE id = ${id} AND current = ${cur} AND NOT answered
    RETURNING score`;
  if (!u) return bad("This question is already answered", 409);

  return Response.json({ correct, late: late || choice == null, answer: q.answer, explanation: q.explanation, score: u.score, last: cur === 3 });
}

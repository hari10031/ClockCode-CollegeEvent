import { UUID, bad, checkCode, db } from "@/lib/db";
import { publicQuestion } from "@/lib/questions";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { code } = await req.json().catch(() => ({}));
  if (!checkCode(code)) return bad("Wrong code", 401);
  if (!UUID.test(id)) return bad("Session not found", 404);

  const sql = await db();
  const [s] = await sql`
    UPDATE sessions SET current = current + 1, answered = false, shown_at = now()
    WHERE id = ${id} AND answered AND current < 3
    RETURNING current, question_ids, limits`;
  if (!s) return bad("Answer the current question first", 409);
  return Response.json({ question: publicQuestion(s.question_ids[s.current], s.current, s.limits?.[s.current] ?? null) });
}

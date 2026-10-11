import { bad, checkCode, db, getSettings } from "@/lib/db";
import { pick, publicQuestion } from "@/lib/questions";

export async function POST(req: Request) {
  const { code, name, mode } = await req.json().catch(() => ({}));
  if (!checkCode(code)) return bad("Wrong code", 401);
  const who = typeof name === "string" ? name.trim() : "";
  if (!who || who.length > 40) return bad("Enter a name of up to 40 characters");
  const picked = pick(String(mode ?? ""));
  if (!picked) return bad("Choose a set from the list");

  // Snapshot the timer so changing settings mid-quiz doesn't affect a running participant.
  const { timerOn, limits } = await getSettings();
  const snap = timerOn ? limits : null;
  const sql = await db();
  const [row] = await sql`
    INSERT INTO sessions (name, mode, question_ids, limits) VALUES (${who}, ${picked.label}, ${picked.ids}, ${snap})
    RETURNING id`;
  return Response.json({ id: row.id, mode: picked.label, question: publicQuestion(picked.ids[0], 0, snap?.[0] ?? null) });
}

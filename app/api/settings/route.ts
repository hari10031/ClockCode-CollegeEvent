import { bad, checkCode, db, getSettings } from "@/lib/db";

export async function POST(req: Request) {
  const { code, timerOn, limits } = await req.json().catch(() => ({}));
  if (!checkCode(code)) return bad("Wrong code", 401);
  if (timerOn === undefined) return Response.json(await getSettings()); // read only
  if (typeof timerOn !== "boolean") return bad("Timer on/off missing");
  if (!Array.isArray(limits) || limits.length !== 4 || !limits.every(n => Number.isInteger(n) && n >= 5 && n <= 600))
    return bad("Each time must be a whole number from 5 to 600 seconds");

  const sql = await db();
  await sql`UPDATE settings SET timer_on = ${timerOn}, limits = ${limits} WHERE id = 1`;
  return Response.json({ timerOn, limits });
}

import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { createHash, timingSafeEqual } from "node:crypto";
import { LIMITS } from "@/lib/questions";

let client: NeonQueryFunction<false, false> | undefined;
let ready: Promise<unknown> | undefined;

async function migrate(sql: NeonQueryFunction<false, false>) {
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      mode text NOT NULL,
      question_ids int[] NOT NULL,
      limits int[],
      current int NOT NULL DEFAULT 0,
      score int NOT NULL DEFAULT 0,
      answered boolean NOT NULL DEFAULT false,
      time_ms int NOT NULL DEFAULT 0,
      shown_at timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now(),
      finished_at timestamptz
    )`;
  // Tables created by earlier versions lack newer columns.
  await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS limits int[]`;
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id int PRIMARY KEY CHECK (id = 1),
      timer_on boolean NOT NULL,
      limits int[] NOT NULL
    )`;
  await sql`INSERT INTO settings VALUES (1, true, ${LIMITS}) ON CONFLICT DO NOTHING`;
}

// Lazy so `next build` works without DATABASE_URL.
export async function db() {
  client ??= neon(process.env.DATABASE_URL!);
  ready ??= migrate(client).catch(e => { ready = undefined; throw e; });
  await ready;
  return client;
}

export type Settings = { timerOn: boolean; limits: number[] };

export async function getSettings(): Promise<Settings> {
  const sql = await db();
  const [s] = await sql`SELECT timer_on, limits FROM settings WHERE id = 1`;
  return { timerOn: s.timer_on, limits: s.limits };
}

const hash = (s: string) => createHash("sha256").update(s).digest();

// ponytail: no rate limit on the 4-digit code; add one if the URL is shared beyond the event room.
export function checkCode(code: unknown) {
  return !!process.env.ACCESS_CODE && typeof code === "string" && timingSafeEqual(hash(code), hash(process.env.ACCESS_CODE));
}

export const bad = (error: string, status = 400) => Response.json({ error }, { status });
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

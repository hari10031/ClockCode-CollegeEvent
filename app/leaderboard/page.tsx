import Link from "next/link";
import { leaderboard } from "@/lib/leaderboard";
import Clock from "../Clock";

export const dynamic = "force-dynamic";

export default async function Leaderboard() {
  const rows = await leaderboard();
  return (
    <main className="shell"><div className="backdrop" aria-hidden="true"><Clock /></div><section className="glass panel">
      <h1>Leaderboard</h1>
      <p className="lede">Highest score first. Ties go to whoever answered faster.</p>
      {rows.length === 0 ? (
        <div>
          <p className="lede">Nobody has finished yet. Scores show up here as soon as a participant answers all four questions.</p>
          <Link href="/" className="btn">Start a participant</Link>
        </div>
      ) : (
        <table className="board">
          <thead>
            <tr><th>Rank</th><th>Name</th><th className="set">Questions</th><th className="num">Score</th><th className="num">Time</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="rank">{i + 1}</td>
                <td>{r.name}</td>
                <td className="set">{r.mode}</td>
                <td className="num"><b>{r.score}</b> / 4</td>
                <td className="num">{(r.time_ms / 1000).toFixed(1)} s</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section></main>
  );
}

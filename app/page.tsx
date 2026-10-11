"use client";

import { useEffect, useRef, useState } from "react";
import Clock, { type Mark } from "./Clock";

type Q = { index: number; title: string; prompt: string; code: string; options: string[]; limit: number | null };
type Result = { correct: boolean; late: boolean; answer: number; explanation: string; score: number; last: boolean };
type Screen = "gate" | "setup" | "question" | "locked" | "done";

const LETTERS = "ABCD";
const HOURS = [3, 6, 9, 12];

async function post(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    .catch(() => { throw new Error("Can't reach the server. Check the internet connection and try again."); });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `The server hit an error (${res.status}). Try again; if it repeats, check the server log.`);
  return data;
}

function CodeForm({ onCode, action }: { onCode: (code: string) => Promise<void>; action: string }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form onSubmit={async e => {
      e.preventDefault();
      setBusy(true); setErr("");
      try { await onCode(code); } catch (x) { setErr((x as Error).message); setCode(""); }
      setBusy(false);
    }}>
      <div className="field">
        <label htmlFor="code">Organizer code</label>
        <input id="code" className="code" type="password" inputMode="numeric" autoComplete="off" autoFocus
          value={code} onChange={e => setCode(e.target.value)} />
      </div>
      <button className="btn" disabled={busy || !code}>{action}</button>
      <div className="err" role="alert">{err}</div>
    </form>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("gate");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState("random-set");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<{ id: string; mode: string } | null>(null);
  const [q, setQ] = useState<Q | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [now, setNow] = useState(0);
  const deadline = useRef(0);
  const submitted = useRef(false);

  function show(question: Q) {
    setQ(question); setPicked(null); setResult(null); setErr("");
    submitted.current = false;
    deadline.current = question.limit ? Date.now() + question.limit * 1000 : 0;
    setNow(Date.now());
    setScreen("question");
  }

  async function submit(choice: number | null) {
    if (!session || submitted.current) return;
    submitted.current = true;
    try {
      const r: Result = await post(`/api/session/${session.id}/answer`, { choice });
      setResult(r); setScore(r.score);
      setHistory(h => [...h, r.correct]);
    } catch (x) {
      submitted.current = false;
      setErr((x as Error).message);
    }
  }

  // Countdown. At zero the question locks and is sent unanswered, which scores 0.
  useEffect(() => {
    if (screen !== "question" || result || !deadline.current) return;
    const t = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= deadline.current) { clearInterval(t); submit(null); }
    }, 100);
    return () => clearInterval(t);
  }, [screen, q, result]); // eslint-disable-line react-hooks/exhaustive-deps

  function reset() {
    setSession(null); setName(""); setCode(""); setHistory([]); setScore(0); setQ(null);
    setScreen("gate");
  }

  const marks: Mark[] = HOURS.map((_, i) =>
    i < history.length ? (history[i] ? "right" : "wrong") : screen === "question" && q?.index === i ? "current" : "pending");
  const timed = screen === "question" && !result && q?.limit;
  const msLeft = timed ? Math.max(0, deadline.current - now) : 0;
  const secLeft = Math.ceil(msLeft / 1000);
  const low = !!timed && secLeft <= Math.min(10, (q?.limit ?? 0) / 3);

  const used = timed && q?.limit ? 1 - msLeft / (q.limit * 1000) : undefined;

  return (
    <>
      <div className="backdrop" aria-hidden="true"><Clock marks={marks} used={used} /></div>
      <main className="shell">
      <section className="glass panel">
        {session && screen !== "done" && (
          <div className="qbar">
            <ol className="steps" aria-label="Progress">
              {marks.map((m, i) => (
                <li key={i} className={`step step-${m}`}>
                  <span className="sr">{`${HOURS[i]} o'clock: ${m}`}</span><span aria-hidden="true">{HOURS[i]}</span>
                </li>
              ))}
            </ol>
            {timed ? (
              <div className={`chip timer${low ? " low" : ""}`} aria-live={low ? "polite" : "off"}>
                {secLeft}<small>s left</small>
              </div>
            ) : screen === "question" && !result ? (
              <div className="chip"><small>No time limit</small></div>
            ) : (
              <div className="chip">{score}<small>{score === 1 ? "point" : "points"}</small></div>
            )}
          </div>
        )}
        {screen === "gate" && <>
          <h1>Python Coding Clock</h1>
          <p className="lede">Four Python questions at 3, 6, 9 and 12 o&apos;clock. The organizer unlocks each one with the code.</p>
          <CodeForm action="Start" onCode={async c => {
            await post("/api/settings", { code: c }); // checks the code without changing anything
            setCode(c); setScreen("setup");
          }} />
        </>}

        {screen === "setup" && (
          <form onSubmit={async e => {
            e.preventDefault();
            setBusy(true); setErr("");
            try {
              const r = await post("/api/session", { code, name, mode });
              setSession({ id: r.id, mode: r.mode }); setScore(0); setHistory([]);
              show(r.question);
            } catch (x) {
              const msg = (x as Error).message;
              if (msg === "Wrong code") { setCode(""); setScreen("gate"); }
              setErr(msg);
            }
            setBusy(false);
          }}>
            <h2>Who&apos;s playing?</h2>
            <div className="field">
              <label htmlFor="name">Participant or team name</label>
              <input id="name" maxLength={40} value={name} onChange={e => setName(e.target.value)} autoFocus required autoComplete="off" />
            </div>
            <fieldset className="modes">
              <legend>Questions</legend>
              <label className="wide">
                <input type="radio" name="mode" value="random-set" checked={mode === "random-set"} onChange={e => setMode(e.target.value)} />
                <span>Random set<small>One of the 10 sets, picked for you</small></span>
              </label>
              <label className="wide">
                <input type="radio" name="mode" value="random-mix" checked={mode === "random-mix"} onChange={e => setMode(e.target.value)} />
                <span>Random mix<small>Each question from a different set</small></span>
              </label>
              {Array.from({ length: 10 }, (_, i) => (
                <label key={i}>
                  <input type="radio" name="mode" value={i} checked={mode === String(i)} onChange={e => setMode(e.target.value)}
                    aria-label={`Set ${i + 1}`} />
                  <span>{i + 1}</span>
                </label>
              ))}
            </fieldset>
            <div className="actions">
              <button className="btn" disabled={busy || !name.trim()}>Show the first question</button>
              <button type="button" className="btn ghost" onClick={reset}>Cancel</button>
            </div>
            <div className="err" role="alert">{err}</div>
          </form>
        )}

        {screen === "question" && q && session && <>
          <p className="meta">{name}, question {q.index + 1} of 4 ({session.mode})</p>
          <h2>{q.title.replace(/^\d+ O'CLOCK — /, `${HOURS[q.index]} o'clock: `)}</h2>
          {q.prompt && <p className="prompt">{q.prompt}</p>}
          {q.code && <pre><code>{q.code}</code></pre>}
          <ul className="options">
            {q.options.map((o, i) => {
              const state = result ? (i === result.answer ? " right" : i === picked ? " wrong" : "") : "";
              return (
                <li key={i}>
                  <button type="button" className={`opt${state}`} disabled={!!result}
                    aria-pressed={picked === i} onClick={() => setPicked(i)}>
                    <span className="key">{LETTERS[i]}</span>
                    <span>{o}</span>
                    {result && i === result.answer && <span className="tag">Correct answer</span>}
                    {result && i === picked && i !== result.answer && <span className="tag">Their pick</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          {!result ? (
            <button className="btn" disabled={picked === null} onClick={() => submit(picked)}>Lock in answer</button>
          ) : <>
            <div className={`verdict${result.correct ? " good" : ""}`} role="status">
              <strong>{result.correct ? "Correct, 1 point" : result.late ? "Time's up, no point" : "Not quite, no point"}</strong>
              <p>{result.explanation}</p>
            </div>
            <button className="btn" onClick={() => setScreen(result.last ? "done" : "locked")}>
              {result.last ? "See final score" : "Hide and lock"}
            </button>
          </>}
          <div className="err" role="alert">{err}</div>
        </>}

        {screen === "locked" && q && session && <>
          <h2>Question {q.index + 2} is locked</h2>
          <p className="lede">Hand the screen back to the organizer to unlock the {HOURS[q.index + 1]} o&apos;clock question.</p>
          <CodeForm action="Unlock question" onCode={async c => show((await post(`/api/session/${session.id}/next`, { code: c })).question)} />
        </>}

        {screen === "done" && session && <>
          <p className="meta">{name} finished {session.mode}</p>
          <div className="score-big">{score}<small> / 4</small></div>
          <p className="lede">The score is on the leaderboard.</p>
          <div className="actions">
            <button className="btn" onClick={reset}>Next participant</button>
            <a className="btn ghost" href="/leaderboard">Open leaderboard</a>
          </div>
        </>}
      </section>
      </main>
    </>
  );
}

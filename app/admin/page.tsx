"use client";

import { useState } from "react";
import Clock from "../Clock";

const HOURS = [3, 6, 9, 12];

export default function Admin() {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [timerOn, setTimerOn] = useState(true);
  const [limits, setLimits] = useState<string[]>(["", "", "", ""]);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  async function open(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/settings", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }),
    }).catch(() => null);
    const s = await res?.json().catch(() => ({}));
    if (!res?.ok) { setCode(""); return setErr(s?.error ?? "Couldn't load the settings. Check the connection and try again."); }
    setTimerOn(s.timerOn); setLimits(s.limits.map(String)); setUnlocked(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(""); setSaved("");
    const res = await fetch("/api/settings", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, timerOn, limits: limits.map(Number) }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    setBusy(false);
    if (!res?.ok) {
      if (res?.status === 401) { setUnlocked(false); setCode(""); }
      return setErr(data?.error ?? "Couldn't save. Check the connection and try again.");
    }
    setSaved("Saved. New participants get these times; anyone mid-quiz keeps theirs.");
  }

  if (!unlocked) return (
    <main className="shell"><div className="backdrop" aria-hidden="true"><Clock /></div><section className="glass panel">
      <h1>Timer settings</h1>
      <p className="lede">Set how long participants get for each question.</p>
      <form onSubmit={open}>
        <div className="field">
          <label htmlFor="code">Organizer code</label>
          <input id="code" className="code" type="password" inputMode="numeric" autoComplete="off" autoFocus
            value={code} onChange={e => setCode(e.target.value)} />
        </div>
        <button className="btn" disabled={!code}>Open settings</button>
        <div className="err" role="alert">{err}</div>
      </form>
    </section></main>
  );

  return (
    <main className="shell"><div className="backdrop" aria-hidden="true"><Clock /></div><section className="glass panel">
      <h1>Timer settings</h1>
      <p className="lede">Set how long participants get for each question.</p>
      <form onSubmit={save}>
        <label className="toggle">
          <input type="checkbox" checked={timerOn} onChange={e => setTimerOn(e.target.checked)} />
          Use a countdown timer
        </label>
        <fieldset className="limits" disabled={!timerOn}>
          <legend>Seconds per question</legend>
          {HOURS.map((h, i) => (
            <div key={h}>
              <label htmlFor={`l${i}`}>{h} o&apos;clock</label>
              <input id={`l${i}`} type="number" min={5} max={600} step={1} required inputMode="numeric"
                value={limits[i]} onChange={e => setLimits(l => l.map((v, j) => (j === i ? e.target.value : v)))} />
            </div>
          ))}
        </fieldset>
        <p className="hint">Each time can be 5 to 600 seconds. The PDF suggests 30, 30, 45 and 60.</p>
        <div className="actions" style={{ marginTop: 28 }}>
          <button className="btn" disabled={busy}>Save settings</button>
          <button type="button" className="btn ghost" onClick={() => setLimits(["30", "30", "45", "60"])}>Use suggested times</button>
        </div>
        <div className="err" role="alert">{err}</div>
        <div className="saved" role="status">{saved}</div>
      </form>
    </section></main>
  );
}

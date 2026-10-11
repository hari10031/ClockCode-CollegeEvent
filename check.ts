// Self-check of question data and mode picking. Run: npm run check
import assert from "node:assert";
import { SETS, LIMITS, pick, byId } from "./lib/questions.ts";

assert.equal(SETS.length, 10);
for (const set of SETS) {
  assert.equal(set.length, 4);
  for (const q of set) assert.ok(q.options.length === 4 && q.answer >= 0 && q.answer < 4, q.title);
}
assert.equal(LIMITS.length, 4);
// Answer key from the PDF, set by set.
assert.equal(SETS.map(s => s.map(q => "ABCD"[q.answer]).join("")).join(" "), "ABCB CCBC BAAB BCBB BCBB CABC BBAB CABA CCBA CCBB");

assert.deepEqual(pick("2")!.ids, [8, 9, 10, 11]);
assert.equal(pick("10"), null);
assert.equal(pick(""), null);
assert.equal(pick("x"), null);
for (let i = 0; i < 50; i++) {
  for (const m of ["random-set", "random-mix"]) {
    const ids = pick(m)!.ids;
    ids.forEach((id, slot) => { assert.equal(id % 4, slot); assert.ok(byId(id)); });
  }
}
console.log("check ok");

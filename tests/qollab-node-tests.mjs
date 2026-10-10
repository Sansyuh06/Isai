// Deterministic Node tests for the Qollab JS frontend logic.
// Run from the repo root: node --test tests/qollab-node-tests.mjs
// (Named without a .test infix so vitest's default glob ignores it.)
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CONTEXTS,
  decodeCountKey,
  decodeAlice,
  decodeBob,
  checkRound,
  scoreCounts,
  wilson,
  noiseOverlay,
} from '../qollab_js/logic.js';

test('decodeCountKey accepts grouped and flat keys with the same convention', () => {
  assert.deepEqual(decodeCountKey('10 01'), { a0: 1, a1: 0, b0: 0, b1: 1 });
  assert.deepEqual(decodeCountKey('1001'), { a0: 1, a1: 0, b0: 0, b1: 1 });
  assert.deepEqual(decodeCountKey('01 10'), { a0: 0, a1: 1, b0: 1, b1: 0 });
  assert.throws(() => decodeCountKey('10'));
  assert.throws(() => decodeCountKey('10 010'));
});

// For each (row, col), the two Bell pairs make exactly 8 of the 16 raw
// measurement outcomes possible (all with probability 1/8), and every one of
// them is a win. The strings are 'a0a1b0b1'. Derived from the same Python
// circuit via qiskit-aer (20k shots per context, qiskit 2.5.2, aer 0.17.2).
const ALLOWED_OUTCOMES = {
  '0,0': ['0000', '0001', '0100', '0101', '1010', '1011', '1110', '1111'],
  '0,1': ['0000', '0010', '0101', '0111', '1000', '1010', '1101', '1111'],
  '0,2': ['0000', '0001', '0110', '0111', '1010', '1011', '1100', '1101'],
  '1,0': ['0000', '0010', '0101', '0111', '1000', '1010', '1101', '1111'],
  '1,1': ['0000', '0001', '0100', '0101', '1010', '1011', '1110', '1111'],
  '1,2': ['0001', '0010', '0100', '0111', '1000', '1011', '1101', '1110'],
  '2,0': ['0001', '0010', '0100', '0111', '1000', '1011', '1101', '1110'],
  '2,1': ['0001', '0010', '0101', '0110', '1000', '1011', '1100', '1111'],
  '2,2': ['0000', '0010', '0101', '0111', '1000', '1010', '1101', '1111'],
};

test('every physically possible outcome wins, and only those do', () => {
  for (const [row, col] of CONTEXTS) {
    const allowed = new Set(ALLOWED_OUTCOMES[`${row},${col}`]);
    assert.equal(allowed.size, 8);
    for (let a = 0; a < 4; a++) {
      for (let b = 0; b < 4; b++) {
        const key = `${a & 1}${(a >> 1) & 1}${b & 1}${(b >> 1) & 1}`;
        const won = checkRound(
          row, col,
          decodeAlice(row, a & 1, (a >> 1) & 1),
          decodeBob(col, b & 1, (b >> 1) & 1),
        );
        assert.equal(won, allowed.has(key), `row=${row} col=${col} key=${key}`);
      }
    }
  }
});

test('scoreCounts tallies wins from Qiskit count tables', () => {
  // key '0000': a0=0,a1=0 -> alice [1,1,0]; b0=0,b1=0 -> bob [1,0,0]; win at (0,0)
  assert.deepEqual(scoreCounts(0, 0, { '0000': 7 }), { wins: 7, total: 7 });
  const mixed = scoreCounts(0, 0, { '0000': 5, '1111': 3 });
  assert.equal(mixed.total, 8);
  assert.equal(mixed.wins, 5 + 3); // ideal strategy: every outcome wins
});

test('noiseOverlay is exact at p=0 and conserves shots otherwise', () => {
  const counts = { '0000': 600, '0110': 400 };
  assert.deepEqual(noiseOverlay(counts, 0), counts);
  const noisy = noiseOverlay(counts, 0.05);
  const total = Object.values(noisy).reduce((s, n) => s + n, 0);
  assert.equal(total, 1000);
  // p=0.5 spreads one key uniformly over all 16 outcomes
  const flat = noiseOverlay({ '1010': 1600 }, 0.5);
  assert.equal(Object.keys(flat).length, 16);
  assert.equal(Object.values(flat).reduce((s, n) => s + n, 0), 1600);
  for (const n of Object.values(flat)) assert.equal(n, 100);
});

test('wilson interval matches the Python implementation shape', () => {
  assert.deepEqual(wilson(0, 0), [0, 0]);
  const [lo, hi] = wilson(1000, 1000);
  assert.equal(hi, 1);
  assert.ok(lo > 0.99 && lo < 1);
  const [lo2, hi2] = wilson(8, 9);
  assert.ok(lo2 < 8 / 9 && 8 / 9 < hi2);
});

test('qollab_js/main.js is the current generated bundle with one run path', async () => {
  const { buildBundle } = await import('../tools/build_qollab_main.mjs');
  const actual = readFileSync(new URL('../qollab_js/main.js', import.meta.url), 'utf8');
  assert.equal(actual, buildBundle(), 'qollab_js/main.js is stale; run: node tools/build_qollab_main.mjs');
  const codeOnly = actual
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');
  // Primary positional call + its documented kwargs fallback, both inside submit().
  const calls = codeOnly.match(/backend\.run\(/g) || [];
  assert.equal(calls.length, 2, 'expected exactly the primary call and its fallback');
  assert.match(codeOnly, /backend\.run\(circuits, shots\)/);
  assert.match(codeOnly, /backend\.run\(callKwargs\(circuits, \{ shots \}\)\)/);
  // The run path uses submit() exactly once, so one job is sent per Run.
  assert.equal((codeOnly.match(/const job = await Promise\.resolve\(submit\(circuits, shots\)\);/g) || []).length, 1);
  // Self-contained: no relative imports may survive into the paste bundle.
  assert.doesNotMatch(actual, /import[^;\n]*from\s*['"]\.\//);
  assert.doesNotMatch(actual, /Aer|qiskit_aer/);
});

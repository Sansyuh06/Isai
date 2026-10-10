// Isai on Qollab — the Mermin-Peres magic square, playable in 3 files.
// GENERATED FILE: built by tools/build_qollab_main.mjs from
// qollab_js/logic.js + qollab_js/ui.js. Edit the sources and rebuild;
// this file is checked against the build output by the Node test suite.
// NOTE: 'backend' is pre-created as a global variable by Qollab.

import { QuantumCircuit } from 'qiskit';

// ---------------- begin bundled pure logic (mirrors logic.js) --------------
// Isai — pure game logic for the Qollab JS frontend.
// No Qiskit imports, no DOM access: this module runs in the Qollab iframe
// and in Node (for deterministic local tests).

// Circuit instruction tables. Qubit layout: Alice 0,1 — Bob 2,3.
// Each op is [methodName, ...args] applied to a Qiskit QuantumCircuit.
const BELL_OPS = [
  ['h', 0], ['cx', 0, 2],
  ['h', 1], ['cx', 1, 3],
];

// Alice's local basis rotations per row (diagonalize her commuting observables).
const ALICE_BASIS_OPS = [
  [['h', 0], ['h', 1]],                                   // row 0: X, X, XX
  [['sdg', 0], ['h', 0], ['sdg', 1], ['h', 1]],           // row 1: Y, Y, YY
  [['s', 0], ['cx', 0, 1], ['h', 0]],                    // row 2: YX, XY, ZZ
];

// Bob's local basis rotations per column.
const BOB_BASIS_OPS = [
  [['h', 2], ['s', 3], ['h', 3]],                        // col 0
  [['h', 3], ['s', 2], ['h', 2]],                        // col 1
  [['cx', 2, 3], ['h', 2]],                              // col 2
];

const CONTEXTS = [
  [0, 0], [0, 1], [0, 2],
  [1, 0], [1, 1], [1, 2],
  [2, 0], [2, 1], [2, 2],
];

// Decode a Qiskit count key into {a0, a1, b0, b1}.
// Two register groups ("bb aa") or one flat 4-bit register ("bbaa"):
// leftmost two chars are Bob's bits [b1][b0], rightmost two Alice's [a1][a0].
function decodeCountKey(key) {
  const k = String(key).replace(/\s+/g, '');
  if (!/^[01]{4}$/.test(k)) {
    throw new Error(`Expected a 4-bit count key (optionally two 2-bit groups), got '${key}'`);
  }
  return { a0: +k[3], a1: +k[2], b0: +k[1], b1: +k[0] };
}

// Eigenvalue +1 -> bit 0, eigenvalue -1 -> bit 1. Alice parity even.
function decodeAlice(row, q0, q1) {
  if (row === 0) {
    const b0 = q0 ^ 1;
    const b1 = q1 ^ 1;
    return [b0, b1, b0 ^ b1];
  }
  if (row === 1) {
    const b0 = q1;
    const b1 = q0;
    return [b0, b1, b0 ^ b1];
  }
  if (row === 2) {
    const b2 = q1;
    const b1 = q0 ^ 1;
    return [b1 ^ b2, b1, b2];
  }
  throw new Error(`Invalid row ${row}`);
}

// Bob parity odd.
function decodeBob(col, q0, q1) {
  if (col === 0) {
    const b0 = q0 ^ 1;
    const b1 = q1;
    return [b0, b1, b0 ^ b1 ^ 1];
  }
  if (col === 1) {
    const b0 = q1 ^ 1;
    const b1 = q0;
    return [b0, b1, b0 ^ b1 ^ 1];
  }
  if (col === 2) {
    const b0 = q0;
    const b2 = q1;
    return [b0, b0 ^ b2 ^ 1, b2];
  }
  throw new Error(`Invalid col ${col}`);
}

function checkRound(row, col, aliceBits, bobBits) {
  const aliceParityEven = (aliceBits[0] ^ aliceBits[1] ^ aliceBits[2]) === 0;
  const bobParityOdd = (bobBits[0] ^ bobBits[1] ^ bobBits[2]) === 1;
  const sharedMatch = aliceBits[col] === bobBits[row];
  return aliceParityEven && bobParityOdd && sharedMatch;
}

// Count wins over a Qiskit counts object for one (row, col) context.
function scoreCounts(row, col, counts) {
  let wins = 0;
  let total = 0;
  for (const [key, n] of Object.entries(counts)) {
    const { a0, a1, b0, b1 } = decodeCountKey(key);
    if (checkRound(row, col, decodeAlice(row, a0, a1), decodeBob(col, b0, b1))) {
      wins += n;
    }
    total += n;
  }
  return { wins, total };
}

// Wilson score interval (95%), mirrors python/mermin_peres scoring.
function wilson(wins, total) {
  if (total <= 0) return [0, 0];
  const z = 1.959963984540054;
  const p = wins / total;
  const z2 = z * z;
  const den = 1 + z2 / total;
  const centre = (p + z2 / (2 * total)) / den;
  const half = (z * Math.sqrt((p * (1 - p) + z2 / (4 * total)) / total)) / den;
  return [
    Math.max(0, Math.round((centre - half) * 10000) / 10000),
    Math.min(1, Math.round((centre + half) * 10000) / 10000),
  ];
}

function xorKey(key, mask) {
  // String index i holds clbit (3 - i); mask bit j flips clbit j.
  let out = '';
  for (let i = 0; i < 4; i++) {
    const bit = (+key[i]) ^ ((mask >> (3 - i)) & 1);
    out += bit;
  }
  return out;
}

// Classical browser-side noise overlay: independently flip each measured bit
// with probability p, redistributing counts deterministically (largest
// remainder, so totals are preserved exactly). This is post-processing of
// simulator counts — it is NOT hardware noise and is labelled as such in UI.
function noiseOverlay(counts, p) {
  if (p === 0) return { ...counts };
  const exact = new Map();
  let grandTotal = 0;
  for (const [key, n] of Object.entries(counts)) {
    grandTotal += n;
    for (let mask = 0; mask < 16; mask++) {
      let w = 1;
      for (let i = 0; i < 4; i++) w *= ((mask >> i) & 1) ? p : 1 - p;
      if (w === 0) continue;
      const nk = xorKey(key, mask);
      exact.set(nk, (exact.get(nk) || 0) + n * w);
    }
  }
  const out = {};
  let assigned = 0;
  const remainders = [];
  for (const [key, v] of [...exact.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const f = Math.floor(v);
    out[key] = f;
    assigned += f;
    remainders.push([key, v - f]);
  }
  remainders.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  for (let i = 0; i < grandTotal - assigned; i++) out[remainders[i][0]] += 1;
  for (const key of Object.keys(out)) if (out[key] === 0) delete out[key];
  return out;
}

// ---------------- end bundled pure logic ----------------

// Isai on Qollab — UI + run path (source for the single paste file).
// The pure game logic lives in logic.js; tools/build_qollab_main.mjs inlines
// it into qollab_js/main.js because Qollab's JS project has only 3 panes.
// NOTE: 'backend' is pre-created as a global variable by Qollab.

const $ = (id) => document.getElementById(id);

function applyOps(qc, ops) {
  for (const [name, ...args] of ops) qc[name](...args);
}

// Flat 4-qubit / 4-bit circuit: clbits 0,1 = Alice, 2,3 = Bob.
// Count keys therefore read [b1][b0][a1][a0]; decodeCountKey also accepts
// the two-group 'bb aa' format used by the Python runner's named registers.
function buildCircuit(row, col) {
  const qc = QuantumCircuit(4, 4);
  applyOps(qc, BELL_OPS);
  applyOps(qc, ALICE_BASIS_OPS[row]);
  applyOps(qc, BOB_BASIS_OPS[col]);
  for (let i = 0; i < 4; i++) qc.measure(i, i);
  return qc;
}

function submit(circuits, shots) {
  if (Array.isArray(circuits) && circuits.length > 0) {
    try {
      if (typeof pyodide !== 'undefined' && typeof pyodide.toPy === 'function') {
        circuits = pyodide.toPy(circuits);
      } else if (circuits[0]?.qubits && typeof circuits[0].qubits.copy === 'function') {
        const pyList = circuits[0].qubits.copy();
        pyList.clear();
        for (const c of circuits) pyList.append(c);
        circuits = pyList;
      }
    } catch (_) {}
  }
  const num = typeof shots === 'number' ? shots : (shots && shots.shots) || 1000;
  try {
    shots = { shots: num };
    return backend.run(circuits, shots);
  } catch (err) {
    shots = num;
    if (typeof callKwargs === 'function') {
      return backend.run(callKwargs(circuits, { shots }));
    }
    throw err;
  }
}

// ---- tiny WebAudio identity (no external audio files) ----
let audioCtx = null;
let soundOn = true;
function blip(freq, at, dur = 0.14, type = 'sine', vol = 0.05) {
  if (!soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime + at;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch {
    /* audio is optional */
  }
}
const SCALE = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33];

let idealCounts = null; // nine counts objects straight from the injected backend
let running = false;

async function run() {
  if (running) return;
  running = true;
  const shots = Math.max(100, Math.min(10000, parseInt($('shots').value, 10) || 1000));
  $('shots').value = shots;
  try {
    $('status').textContent = 'Building the 9 Mermin–Peres context circuits…';
    const circuits = CONTEXTS.map(([r, c]) => buildCircuit(r, c));
    $('status').textContent =
      'Submitting one job with 9 circuits to the Qollab injected simulator…';
    const job = await Promise.resolve(submit(circuits, shots));
    // Depending on the runtime, backend.run resolves to a Job proxy (needs
    // .result()) or straight to a Result-like proxy (has .get_counts()).
    let result;
    if (job && typeof job.result === 'function') {
      result = await job.result();
    } else if (job && typeof job.get_counts === 'function') {
      result = job;
    } else {
      let shape = typeof job;
      try {
        if (job && job.dir) shape = String(job.dir()).slice(0, 200);
      } catch { /* keep the plain type as diagnostic */ }
      throw new Error(`unexpected job shape: ${shape}`);
    }
    let all = null;
    try {
      all = result.get_counts();
      if (all && typeof all.toJs === 'function') all = all.toJs();
      if (all instanceof Map) all = [Object.fromEntries(all)];
      if (all && !Array.isArray(all)) all = [all];
      if (Array.isArray(all)) {
        all = all.map((counts) => (counts instanceof Map ? Object.fromEntries(counts) : counts));
      }
    } catch (_) {}
    if (!Array.isArray(all) || all.length !== CONTEXTS.length) {
      const fallback = [];
      for (let i = 0; i < CONTEXTS.length; i++) {
        let c = result.get_counts(i);
        if (c && typeof c.toJs === 'function') c = c.toJs();
        if (c instanceof Map) c = Object.fromEntries(c);
        fallback.push(c);
      }
      all = fallback;
    }
    if (all.length !== CONTEXTS.length) {
      throw new Error(`Expected ${CONTEXTS.length} count tables, got ${all.length}`);
    }
    idealCounts = all;
    let backendName = 'Qollab injected simulator';
    try {
      if (backend && backend.name) backendName = String(backend.name);
    } catch { /* property may not be proxied; default label stands */ }
    $('status').textContent = `Done. ${shots} shots per context, one job, backend: ${backendName}.`;
    render();
    CONTEXTS.forEach(([r, c], i) => {
      const { wins, total } = scoreCounts(r, c, idealCounts[i]);
      const good = total > 0 && wins / total > 0.9;
      blip(good ? SCALE[i] : 98, i * 0.07, 0.16, good ? 'sine' : 'square');
    });
  } catch (err) {
    $('status').textContent = `Run failed: ${err && err.message ? err.message : err}`;
  } finally {
    running = false;
  }
}

function render() {
  const p = parseFloat($('noise').value) || 0;
  $('noiseVal').textContent = p.toFixed(3);
  const tbody = $('results').querySelector('tbody');
  tbody.innerHTML = '';
  $('bars').innerHTML = '';
  let sumWins = 0;
  let sumTotal = 0;
  let perfect = 0;
  CONTEXTS.forEach(([r, c], i) => {
    const counts = noiseOverlay(idealCounts[i], p);
    const { wins, total } = scoreCounts(r, c, counts);
    const [lo, hi] = wilson(wins, total);
    const rate = total ? wins / total : 0;
    sumWins += wins;
    sumTotal += total;
    if (total && wins === total) perfect += 1;
    const tr = document.createElement('tr');
    tr.innerHTML =
      `<td>Row ${r + 1}, Col ${c + 1}</td>` +
      `<td>${wins} / ${total}</td>` +
      `<td>${(rate * 100).toFixed(2)}%</td>` +
      `<td>[${lo.toFixed(4)}, ${hi.toFixed(4)}]</td>`;
    tbody.appendChild(tr);
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.innerHTML =
      `<span class="label">R${r + 1}C${c + 1}</span>` +
      `<span class="track"><span class="fill" style="width:${(rate * 100).toFixed(1)}%` +
      `; background:${rate > 0.9 ? '#7fb069' : rate > 0.6 ? '#c9a227' : '#b05656'}"></span></span>` +
      `<span class="pct">${(rate * 100).toFixed(0)}%</span>`;
    $('bars').appendChild(bar);
  });
  const overall = sumTotal ? sumWins / sumTotal : 0;
  if (p === 0 && perfect === 9) {
    $('message').textContent =
      `9/9 contexts win (${(overall * 100).toFixed(1)}% overall). Any classical strategy ` +
      'is capped at 8/9 — the two Bell pairs breach it. Simulator-verified, not hardware.';
  } else if (p === 0) {
    $('message').textContent =
      `${perfect}/9 contexts perfect at overall ${(overall * 100).toFixed(1)}% ` +
      '(classical cap: 8/9 contexts).';
  } else {
    $('message').textContent =
      `With browser noise overlay p=${p.toFixed(3)}: overall win rate ` +
      `${(overall * 100).toFixed(1)}% (${perfect}/9 perfect). Noise degrades the ` +
      'quantum advantage toward the classical 8/9 world.';
  }
}

function init() {
  $('run').addEventListener('click', run);
  $('noise').addEventListener('input', () => { if (idealCounts) render(); });
  $('sound').addEventListener('click', () => {
    soundOn = !soundOn;
    $('sound').textContent = `Sound: ${soundOn ? 'on' : 'off'}`;
    if (soundOn) blip(440, 0, 0.1);
  });
  $('status').textContent = 'Ready: one job, 9 circuits, on the Qollab injected simulator.';
}

function boot() {
  if (typeof document === 'undefined') return;
  if (!$('run')) return;
  init();
  run();
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}

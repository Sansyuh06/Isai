# Isai: The 8/9 Duet

**Two players who can't talk, a game that physics says they can't win, and the sound of entanglement breaking the rule.**

Isai (இசை, Tamil for "music") is a browser game that lets you *fail* at a famous quantum puzzle and then *hear* why entangled qubits succeed where classical strategies cannot. A static website, no backend and no accounts. Built for the Qollab Quantum Hackathon.

**Live demo:** _add your deployed URL here_

![License: MIT](https://img.shields.io/badge/license-MIT-blue)
![Static site](https://img.shields.io/badge/hosting-static%20only-teal)
![Qiskit 2.5](https://img.shields.io/badge/Qiskit-2.5.1-purple)

---

## The idea in one minute

A referee secretly picks one row and one column of a 3×3 grid. **Alice** is told only the row. **Bob** is told only the column. They cannot talk. Each answers with three bits:

- Alice's three bits must add up to an **even** number.
- Bob's three bits must add up to an **odd** number.
- They **win** if the one cell where Alice's row crosses Bob's column holds the same bit in both answers.

Before the game they may agree on any strategy they like. It doesn't matter: **no classical strategy wins more than 8 rounds out of 9.** If it did, there would be a grid with every row even and every column odd, and both of those counts add up the same nine cells to a different parity. That's impossible.

Give Alice and Bob two entangled pairs of qubits and each measures their half, and they win **every round, 9 out of 9**, with no message passing between them.

Isai makes that gap something you can play with and hear. A match between Alice and Bob sounds as one clean note. A clash sounds as a harsh semitone.

## Try it in 60 seconds

1. **Act 1: Break it.** Fill in the 12 free bits of your best classical strategy and press *Test Strategy*. Watch the score, and hear the clash. Try as many times as you like, then press *Why can't I get 9/9?*. Stuck? *Show best known 8/9 strategy* is one click away.
2. **Act 2: Entangle it.** Run the same nine rounds with a four-qubit circuit simulated live in your browser. Every round resolves to unison.
3. **Act 3: Corrupt it.** Add gate noise and watch the perfect score decay. A chart shows where entanglement stops beating the classical 8/9 line.

Prefer to learn first? **Why does this happen?** is an optional six-step walkthrough of the same game.

## What's in the app

| Part | What it does |
| :--- | :--- |
| **Act 1: Break it** | A classical puzzle. You pick two free bits per row/column; the third is derived to keep the parity rule. A scoreboard of the nine crossing cells shows every clash. The proof of the 8/9 limit appears only when you ask for it. |
| **Classical communication** | Shows that if Alice simply tells Bob *which row she got* (one of three options), 9/9 is easy. It's a separate classical message, not what entanglement does. |
| **Act 2: Entangle it** | A small four-qubit statevector simulator in TypeScript runs the real circuit. You pick the context, hear the duet, and see the circuit used. |
| **Act 3: Corrupt it** | Pauli gate noise on every gate, a win-rate readout with 95% confidence intervals, and a win-rate-versus-noise chart with the 8/9 line. |
| **Data & Provenance** | Replays saved Qiskit Aer results, shows per-context statistics, and imports a recorded IBM hardware run if you have one. |
| **Why does this happen?** | The optional step-by-step explainer. |

## How it sounds

Each of the nine cells has its own pitch. A bit of 0 plays that pitch; a bit of 1 plays one semitone higher.

| | Col 1 | Col 2 | Col 3 |
| :---: | :---: | :---: | :---: |
| **Row 1** | C4 | D4 | E4 |
| **Row 2** | G4 | A4 | B4 |
| **Row 3** | C5 | D5 | E5 |

- **Full phrase.** Alice's three notes play in the left ear and Bob's in the right, then both play the crossing cell. Same bit means the same pitch (unison). Different bits means a semitone apart (a clash).
- **Nine-beat loop.** One chord per context, played centred in both ears, so the clash is easy to hear on headphones. This is what the scoreboards use.
- Sound starts only after you press play. Every sound is paired with a visual cue, and reduced-motion preferences are respected.

## The physics, briefly

**Why classical play tops out at 8/9.** A deterministic strategy is a pair of grids: Alice's, with each row even, and Bob's, with each column odd. Round $(r, c)$ is won when the two grids agree on cell $(r, c)$. Alice's grid has an even number of 1s and Bob's an odd number, so the grids always disagree in an odd number of cells: 1, 3, 5, 7 or 9, never 0. Exhaustively checking all 4,096 valid pairs gives exactly 144, 1,344, 2,016, 576 and 16 strategies for those five cases, and the best possible score is 8/9. A strategy that mixes in shared randomness is an average of deterministic ones, so it can't do better.

**The quantum strategy.** Alice holds qubits $A_0, A_1$ and Bob holds $B_0, B_1$, prepared as two Bell pairs $|\Phi^+\rangle$ on $(A_0, B_0)$ and $(A_1, B_1)$. Each player applies local gates chosen by their row or column, measures their two qubits, and reconstructs the third bit from the parity rule. Because Bob measures the transposed observable of Alice's, their results agree at the crossing cell with certainty.

<details>
<summary>The Mermin–Peres square and the six measurement circuits</summary>

| Row \ Col | Col 1 | Col 2 | Col 3 | Row product |
| :---: | :---: | :---: | :---: | :---: |
| **Row 1** | −I⊗X | −X⊗I | X⊗X | +I |
| **Row 2** | Y⊗I | I⊗Y | Y⊗Y | +I |
| **Row 3** | Y⊗X | X⊗Y | Z⊗Z | +I |
| **Column product** | −I | −I | −I | |

Alice measures the three commuting observables of her row (product +I, so even parity). Bob measures the transposes of his column (product −I, so odd parity).

| Player | Gates before measuring | Decoding (qubit results $q_0, q_1$) |
| :--- | :--- | :--- |
| Alice, row 1 | H on $A_0$, H on $A_1$ | $a_0=q_0\oplus1,\ a_1=q_1\oplus1,\ a_2=a_0\oplus a_1$ |
| Alice, row 2 | S†·H on $A_0$ and $A_1$ | $a_0=q_1,\ a_1=q_0,\ a_2=a_0\oplus a_1$ |
| Alice, row 3 | S on $A_0$, CX($A_0$,$A_1$), H on $A_0$ | $a_2=q_1,\ a_1=q_0\oplus1,\ a_0=a_1\oplus a_2$ |
| Bob, col 1 | H on $B_0$, S then H on $B_1$ | $b_0=q_0\oplus1,\ b_1=q_1,\ b_2=b_0\oplus b_1\oplus1$ |
| Bob, col 2 | H on $B_1$, S then H on $B_0$ | $b_0=q_1\oplus1,\ b_1=q_0,\ b_2=b_0\oplus b_1\oplus1$ |
| Bob, col 3 | CX($B_0$,$B_1$), H on $B_0$ | $b_0=q_0,\ b_2=q_1,\ b_1=b_0\oplus b_2\oplus1$ |

The third bit is rebuilt from the parity rule, so parity always holds by construction. What noise can break is **agreement at the crossing cell**, which is why that is the sound you hear.

</details>

## How we know it's right

- **The simulator matches Qiskit exactly.** The TypeScript simulator's outcome probabilities for all nine contexts are compared with a checked-in fixture generated from a measurement-free Qiskit `Statevector`, to within 1e-9. The qubit and bit ordering is documented in the generator.
- **The classical bound is exhaustively tested**, including the exact distribution above.
- **Randomness is reproducible.** Simulator measurements and noise draw from an injectable seeded generator (mulberry32), so results and tests can be replayed.
- **The best-known 8/9 strategy is a regression test.** It scores exactly 8/9, with the single clash at row 1, column 1.
- **The noise model was cross-checked against Qiskit Aer.** With the error parameters mapped to match (Aer's depolarizing parameter $\lambda = 4p/3$), win rates agree with the simulator to within sampling error.
- Run the suites yourself: `npm test` and `pytest` (see below).

### The noise model, precisely

After every gate, each qubit that gate touched suffers an independent Pauli error with total probability $p$ (X, Y or Z, each with probability $p/3$). There is **no readout error**, no idle noise, and no crosstalk, and it is **not calibrated to any real device**. For this model the win rate falls below 8/9 at about $p \approx 0.02$. That threshold belongs to this model and circuit, not to quantum hardware in general.

## What this is not

- **Not a new result.** The Mermin–Peres game and its quantum solution are well established. Our contribution is the playable, audible teaching experience and a verified, reproducible pipeline around it.
- **Not a live quantum computer.** Acts 2 and 3 run a classical simulation of the circuit in your browser. The *Data & Provenance* tab replays stored results. The page never calls a quantum device.
- **Not a loophole-free nonlocality test.** All four qubits are simulated on one machine; the players are not space-like separated.
- **Not a claim about hidden variables in general.** The 8/9 bound applies to the classical, context-independent strategies of this game.
- **No recorded IBM hardware run is bundled.** Real devices have gate and readout errors and may not beat 8/9 without mitigation. If you import a run, the app labels it as an imported file; it cannot verify its origin, so check the job ID against IBM.
- Statistical error bars are 95% Wilson score intervals over finite shots.

## Run it

You need Node.js 18+ and, for the Python side, Python 3.10+.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # frontend tests (Vitest)
npm run build      # type-check and production build
npm run preview    # serve the production build
```

```bash
pip install qiskit qiskit-aer pytest
pytest                                              # Python tests, from the repo root
cd python && python scripts/generate_aer_results.py # regenerate the saved Aer dataset
cd python && python generate_golden_fixture.py      # regenerate the exact-probability fixture
```

Constraints we kept: no API keys or secrets, no live calls to IBM from the page, no backend or database, no external audio files.

## Qollab submission package

The `qollab/` folder and `qollab_submission.zip` hold a lean runner for the Qollab platform:

- Four files (`main.py`, `circuit.py`, `scoring.py`, `README.md`), well under Qollab's size limits. No React app, no `node_modules`.
- A top-level `main(shots)` entry point for the Run dialog.
- All nine circuits are submitted in a single `backend.run(circuits, shots=shots)` call, using Qollab's own backend (no `qiskit_aer` import).
- Both classical registers are decoded and checked for parity and crossing-cell agreement.
- Output is labelled as **Qollab Simulator Output** (ideal simulation), not hardware.

## Capturing a real IBM hardware run (optional)

Set your token in your own terminal (never in the repo), run the capture script, and import the file through **Import** in the app header.

```bash
export QISKIT_IBM_TOKEN="your_token_here"        # PowerShell: $env:QISKIT_IBM_TOKEN="..."
python scripts/capture_ibm_hardware.py --shots 1024
```

The script picks an available backend with at least four qubits, transpiles the nine circuits, submits them in one batch, decodes the results, validates them against the schema, and writes a sanitized JSON file.

<details>
<summary>Results file format (schema 1.0.0)</summary>

Defined in `python/schema/mermin_peres_results_schema.json`:

- `schema_version`: must be `"1.0.0"`.
- `source_type`: `"ibm_hardware"` or `"qiskit_aer"`.
- `backend_name`, `timestamp` (ISO-8601 UTC), `shots_per_context`.
- `ibm_job_id`: the IBM job ID for hardware, `null` for Aer data.
- `contexts`: nine objects with `row`, `column`, `shots`, `wins`, `win_rate`, `confidence_interval_95` and the outcome `counts`.
- `summary`: total shots, total wins, overall win rate and its Wilson interval.

</details>

## Repository map

```
src/
  components/   Act 1–3, communication, charts, tutorial, data views
  utils/        statevector simulator, seeded PRNG, classical strategy, scoring
  audio/        Web Audio synthesis and pitch mapping
  tests/        Vitest suites
  data/         saved Aer results and golden fixtures
python/
  mermin_peres/ circuits, decoders, classical search, schema validation
  scripts/      Aer dataset generation
  tests/        pytest suites
scripts/        IBM hardware capture (run locally, never in the browser)
qollab/         Qollab platform runner
```

## References

1. A. Arkhipov, *Extending and Characterizing Quantum Magic Games*, [arXiv:1209.3819](https://arxiv.org/abs/1209.3819) (2012).
2. S. A. Adamson and P. Wallden, *Quantum Magic Rectangles: Characterization and Application to Certified Randomness Expansion*, [arXiv:2008.02370](https://arxiv.org/abs/2008.02370) (2020).
3. S. Kumar et al., *Quantum–Classical Separation in Bounded-Resource Tasks Arising from Measurement Contextuality*, [arXiv:2512.02284](https://arxiv.org/abs/2512.02284) (2025).
4. E. de Dios Rodríguez et al., *The Sound of Entanglement*, [arXiv:2509.08892](https://arxiv.org/abs/2509.08892) (2025).
5. Fun-with-Quantum, interactive Magic Square tutorial ([PR #70](https://github.com/JanLahmann/Fun-with-Quantum/pull/70)) and noisy/hardware extension ([PR #103](https://github.com/JanLahmann/Fun-with-Quantum/pull/103)).

## Credits

Built with React, TypeScript, Vite, Tailwind CSS, Radix UI, Lucide icons and IBM Plex / Fraunces fonts via Fontsource, plus Qiskit and Qiskit Aer for the reference circuits and data. Thanks to Qollab and IonQ for the hackathon.

# Isai 🎵⚛️

> **An Audio-First Quantum Nonlocality Explorer for the Mermin–Peres Magic Square Game (The 8/9 Duet)**  
> *Qollab Hackathon Submission · Repository: `Isai-qollab_hackathon`*

[![Frontend Build](https://img.shields.io/badge/Vite%20%2B%20React%2019-Passed-success)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Typecheck-blue)](https://www.typescriptlang.org/)
[![Qiskit](https://img.shields.io/badge/Qiskit-2.5.1%20%2B%20Aer-purple)](https://qiskit.org/)
[![Vitest](https://img.shields.io/badge/Vitest-31%20Passed-green)](https://vitest.dev/)
[![Pytest](https://img.shields.io/badge/Pytest-28%20Passed%20(1%20skipped)-green)](https://docs.pytest.org/)
[![Qollab Compliant](https://img.shields.io/badge/Qollab%20Platform-Zero%20Secrets%20%7C%20Static%20Only-teal)](#qollab-compliance--security-guarantee)

---

## 🌟 Executive Summary

**Isai** (*Isai*, meaning "music" or "melody" in Tamil, also known as *The 8/9 Duet*) sonifies quantum contextuality and pseudo-telepathy through an interactive, browser-native audiovisual experience structured into three progressive acts and challenge modes:
1. **Act 1: Break It** — An unfilled 12-free-bit classical strategy puzzle where players discover the unavoidable 8/9 parity ceiling and hear the resulting clash.
2. **Act 2: Entangle It** — A reproducible 4-qubit TypeScript statevector simulation with exact Qiskit probability parity (< $10^{-9}$), proving 9/9 unison without communication.
3. **Act 3: Corrupt It** — Circuit-level stochastic Pauli depolarizing noise modeling gate decoherence with an empirical crossover curve and 95% Wilson confidence intervals.
4. **30-Round Survival Gauntlet** — Seeded uniform challenge testing whether classical (2.92% theoretical survival) or quantum (100% ideal) strategies survive 30 referee prompts.
5. **Classical Communication Mode** — Compares 1-message classical signaling to quantum pseudo-telepathy, demonstrating why entanglement is fundamentally not signaling.

---

## 🏆 Alignment with Hackathon Judging Criteria

| Criterion | Implementation in Isai |
| :--- | :--- |
| **Novelty & Creativity** | Transforms abstract operator contextuality into a musical duet. Left/Right stereo panning allows the ear to hear bipartite entanglement; matching crossing bits resonate in pure unison, while classical or noise-induced defects produce distinct semitone dissonance. |
| **Technical Execution** | 59 automated tests passing across Python (`pytest`, 28 passed, 1 skipped) and TypeScript (`vitest`, 31 passed), including golden statevector probability parity against Qiskit at $10^{-9}$ numerical tolerance, reproducible PRNG seeding (`mulberry32`), and exhaustive 4,096-strategy classical search with exact histogram verification. Pure Web Audio API synthesis (no external audio assets, no autoplay). Custom plain SVG charts with 95% Wilson confidence intervals. Strict TypeScript type-checking. |
| **Impact Potential** | An intuitive educational portal for university quantum information courses, hackathon judges, and researchers to understand non-locality, Mermin-Peres squares, and contextuality without opaque mathematics. |
| **Documentation Quality** | Comprehensive documentation, formal mathematical proofs, documented JSON schema, step-by-step reproduction instructions, and clear scientific scope limitations. |

---

## 🛡️ Qollab Compliance & Security Guarantee

This project strictly adheres to all Qollab submission rules:
- **No API keys or secrets in the repo or web app.** All authentication for hardware capture is local via user environment variables.
- **No live IBM API calls from the hosted page.** The web application is 100% static and performs only read-only GET requests or client-side JSON imports.
- **No hosted backend or database.** No FastAPI, Flask, Node server, or cloud storage.
- **No fabricated quantum results.** If no recorded IBM run is present, the app shows *"No recorded IBM hardware run loaded"* alongside instructions to capture and import real data.

---

## 🎲 Game Rules & Mathematical Convention

The game uses **0-indexed internal representations** (`0, 1, 2`) and **1-indexed display representations** (`Row 1, 2, 3`; `Col 1, 2, 3`):

1. A referee selects a row $r \in \{0, 1, 2\}$ and a column $c \in \{0, 1, 2\}$.
2. **Alice** receives only row $r$ and outputs 3 bits left-to-right: $[a_0, a_1, a_2]$.  
   *Even Parity Rule:* $a_0 \oplus a_1 \oplus a_2 = 0$.
3. **Bob** receives only column $c$ and outputs 3 bits top-to-bottom: $[b_0, b_1, b_2]$.  
   *Odd Parity Rule:* $b_0 \oplus b_1 \oplus b_2 = 1$.
4. **Win Condition:** Both parity rules hold, and Alice's bit at column $c$ equals Bob's bit at row $r$:
   $$\text{Win} \iff (a_0 \oplus a_1 \oplus a_2 = 0) \land (b_0 \oplus b_1 \oplus b_2 = 1) \land (a_c = b_r)$$

---

## ⚖️ The Classical Ceiling: 8/9 Bound

### Baseline Deterministic Strategy
The standard classical baseline achieves 8/9 wins:
- **Alice's policy:**
  - Row 1: `[0, 1, 1]` (Even parity: $0 \oplus 1 \oplus 1 = 0$)
  - Row 2: `[0, 0, 0]` (Even parity: $0 \oplus 0 \oplus 0 = 0$)
  - Row 3: `[0, 0, 0]` (Even parity: $0 \oplus 0 \oplus 0 = 0$)
- **Bob's policy:**
  - Column 1: `[1, 0, 0]` (Odd parity: $1 \oplus 0 \oplus 0 = 1$)
  - Column 2: `[1, 0, 0]` (Odd parity: $1 \oplus 0 \oplus 0 = 1$)
  - Column 3: `[1, 0, 0]` (Odd parity: $1 \oplus 0 \oplus 0 = 1$)

Evaluating all 9 input pairs $(r, c)$ reveals that only Context $(1, 1)$ ($r=0, c=0$) fails: Alice outputs $a_0 = 0$, while Bob outputs $b_0 = 1$. All other 8 pairs match, giving **8/9 (88.89%)**.

### The Parity Contradiction Theorem
Why is 9/9 impossible classically? Suppose there existed a deterministic shared 3×3 classical binary grid $M_{ij} \in \{0, 1\}$ agreeing with both players:
- Alice requires each row sum to be even: $\sum_{j=1}^3 M_{ij} \equiv 0 \pmod 2 \implies \sum_{i,j} M_{ij} \equiv 0 \pmod 2$.
- Bob requires each column sum to be odd: $\sum_{i=1}^3 M_{ij} \equiv 1 \pmod 2 \implies \sum_{i,j} M_{ij} \equiv 1 + 1 + 1 \equiv 1 \pmod 2$.

Both sums sum the exact same 9 entries in the grid, yielding the impossibility:
$$0 \equiv 1 \pmod 2$$
Therefore, **no deterministic local classical policy can exceed 8/9**. Our exhaustive search test (`test_classical.py`) iterates over all $4^3 \times 4^3 = 4096$ valid policy pairs and confirms that $\max(\text{score}) = 8/9$.

---

## ⚛️ Quantum Strategy & Circuit Architecture

Alice and Bob share two Bell pairs $|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$ on qubits $(A_0, B_0)$ and $(A_1, B_1)$.

### Signed Mermin–Peres Square Observables

| Row \ Col | Column 1 ($c=0$) | Column 2 ($c=1$) | Column 3 ($c=2$) | Row Product |
| :---: | :---: | :---: | :---: | :---: |
| **Row 1 ($r=0$)** | $-I \otimes X$ | $-X \otimes I$ | $X \otimes X$ | **$+I$** |
| **Row 2 ($r=1$)** | $Y \otimes I$ | $I \otimes Y$ | $Y \otimes Y$ | **$+I$** |
| **Row 3 ($r=2$)** | $Y \otimes X$ | $X \otimes Y$ | $Z \otimes Z$ | **$+I$** |
| **Bob Col Product (Transposed)** | **$-I$** | **$-I$** | **$-I$** | — |

- **Alice** measures commuting observables in row $r$ (product $= +I$, eigenvalue product $= +1$, even bit parity).
- **Bob** measures the transposes of observables in column $c$ (product $= -I$, eigenvalue product $= -1$, odd bit parity).
- **Bell Pair Correlation:** For any 2-qubit operator $M$, $(M \otimes I)|\Phi^+\rangle^{\otimes 2} = (I \otimes M^T)|\Phi^+\rangle^{\otimes 2}$. When Alice measures $M_{rc}$ and Bob measures $M_{rc}^T$, their measurement outcomes are identical with probability 1.

### Independent Local Basis Rotations & Decoding

Each player measures 2 independent compatible observables using local Clifford gates and reconstructs the third via required parity:

1. **Alice Row 0:** $H$ on $A_0$, $H$ on $A_1$. $a_0 = q_0 \oplus 1$, $a_1 = q_1 \oplus 1$, $a_2 = a_0 \oplus a_1$.
2. **Alice Row 1:** $S^\dagger H$ on $A_0$, $S^\dagger H$ on $A_1$. $a_0 = q_1$, $a_1 = q_0$, $a_2 = a_0 \oplus a_1$.
3. **Alice Row 2:** $S$ on $A_0$, $CX(A_0, A_1)$, $H$ on $A_0$. $a_2 = q_1$, $a_1 = q_0 \oplus 1$, $a_0 = a_1 \oplus a_2$.
4. **Bob Col 0:** $H$ on $B_0$, $S$ on $B_1$, $H$ on $B_1$. $b_0 = q_0 \oplus 1$, $b_1 = q_1$, $b_2 = b_0 \oplus b_1 \oplus 1$.
5. **Bob Col 1:** $H$ on $B_1$, $S$ on $B_0$, $H$ on $B_0$. $b_0 = q_1 \oplus 1$, $b_1 = q_0$, $b_2 = b_0 \oplus b_1 \oplus 1$.
6. **Bob Col 2:** $CX(B_0, B_1)$, $H$ on $B_0$. $b_0 = q_0$, $b_2 = q_1$, $b_1 = b_0 \oplus b_2 \oplus 1$.

*Note on Parity:* Because third outputs are reconstructed using algebraic identities, parity checks pass by construction. **Shared-cell agreement** is the true physical noise-sensitive test.

---

## 🎼 Acoustic Sonification (Web Audio API)

The audio engine synthesizes pleasant musical tones in real time using the browser's native `AudioContext`:

### Pitch Assignment Table (MIDI Pitches)

| Row \ Col | Col 1 ($c=0$) | Col 2 ($c=1$) | Col 3 ($c=2$) |
| :---: | :---: | :---: | :---: |
| **Row 1 ($r=0$)** | 60 (C4) | 62 (D4) | 64 (E4) |
| **Row 2 ($r=1$)** | 67 (G4) | 69 (A4) | 71 (B4) |
| **Row 3 ($r=2$)** | 72 (C5) | 74 (D5) | 76 (E5) |

- **Bit 0:** Sounds the base MIDI pitch.
- **Bit 1:** Sounds the base pitch raised by one semitone (+1 semitone).

### Spatial Panning & Harmony Mechanics
- **Alice's Phrase:** Panned **Hard Left** (`StereoPannerNode = -0.7`).
- **Bob's Phrase:** Panned **Hard Right** (`StereoPannerNode = +0.7`).
- **Shared Crossing Check:** Both players play their bits for the crossing cell $(r, c)$:
  - **Match ($a_c = b_r$):** Both sides sound in pure **Unison** (clean, resonant harmony).
  - **Mismatch ($a_c \neq b_r$):** Sounds as adjacent semitones (jarring **minor-second dissonance**).
- **Accessibility:** Audio starts only after user interaction. Every sound is paired with a real-time visual pulse on the 3×3 grid. Reduced motion preferences are strictly respected.

---

## 🚀 Quickstart & Running the App

### Prerequisites
- Node.js (v18+ or v20+)
- Python 3.10+ (with `qiskit`, `qiskit-aer`, `pytest`)

### 1. Web Application Setup & Build
```bash
# Install dependencies
npm install

# Run frontend test suite (Vitest)
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```
Visit `http://localhost:3000` to explore the application!

### 2. Python Circuit & Algebraic Tests
```bash
# Run all Python unit tests
pytest

# Re-generate Aer simulator dataset (from repository root)
python -m scripts.generate_aer_results

# Re-generate Aer noisy benchmark fixture (from repository root)
python -m scripts.generate_aer_noise_fixture

# Run standalone Qollab runner (using core Qiskit BasicSimulator fallback)
python qollab/main.py
```

---

## 🎯 Qollab Submission Package (`qollab_submission.zip`)

For judges evaluating through the Qollab platform:
- **Location:** `qollab/` directory and bundled `qollab_submission.zip`
- **Lean Constraints:** Contains exactly 4 files (`main.py`, `circuit.py`, `scoring.py`, `README.md`), total size < 10 KB (well within Qollab's 100-file and 2 MB limits). Excludes React app, `node_modules`, `.git`, and all extraneous files.
- **Entry Point:** Top-level `main(shots: int)` function conforming to Qollab's Run dialog.
- **Single Batch Job:** Submits all 9 circuits in exactly **one** `backend.run(circuits, shots=shots)` call.
- **No Qiskit Aer Dependency in Runner:** Uses Qollab's provided runtime `backend` without importing `qiskit_aer`.
- **Two Classical Registers Decoded:** Explicitly parses space-separated register keys (`'cb ca'`) and validates parity and crossing rules.
- **Honest Labeling:** Clearly outputs terminal results as **Qollab Simulator Output** (ideal simulation), not physical hardware.

---

## 🛰️ Optional: Capturing Real IBM Quantum Hardware Data

To evaluate physical hardware without exposing credentials or violating Qollab restrictions:

1. Obtain your API token from [quantum.ibm.com](https://quantum.ibm.com).
2. Set your environment variable in your terminal:
   ```powershell
   # Windows PowerShell
   $env:QISKIT_IBM_TOKEN="your_token_here"
   ```
   ```bash
   # Linux / macOS Bash
   export QISKIT_IBM_TOKEN="your_token_here"
   ```
3. Generate or validate your local hardware capture, formatted according to `mermin_peres_results_schema.json`.
4. **Importing into the Web App:** Click **Import Run** in the web app header and select your generated JSON file. The badge will switch to **Recorded IBM run**.

---

## 📑 JSON Schema Specification (`1.0.0`)

Validated results files follow `python/schema/mermin_peres_results_schema.json`:
- `schema_version`: Must be `"1.0.0"`.
- `source_type`: `"ibm_hardware"` or `"qiskit_aer"`.
- `backend_name`: String name of the device (e.g., `"ibm_brisbane"` or `"AerSimulator"`).
- `ibm_job_id`: Official IBM job ID for hardware; strictly `null` for Aer data.
- `timestamp`: ISO-8601 UTC timestamp.
- `shots_per_context`: Integer shot count per context.
- `contexts`: Array of 9 context objects containing `row`, `column`, `shots`, `wins`, `win_rate`, `confidence_interval_95`, and outcome frequency distribution `counts`.
- `summary`: Total shots, total wins, overall win rate, and aggregate Wilson interval.

---

## ⚠️ Honest Scope & Scientific Limitations

Displayed prominently in the web application's About panel:
1. **Established Foundation:** The Mermin–Peres Magic Square game and its quantum solution are established theoretical constructions; this project's unique innovation is the acoustic presentation and verified reproducibility pipeline.
2. **Replay, Not Live Trigger:** The hosted web application replays stored measurement records; it does not trigger live QPU runs from the browser.
3. **Circuit Demonstration:** Centralized 4-qubit device execution demonstrates circuit-level correlations, not a loophole-free nonlocality test with space-like separated observers.
4. **Hardware Noise:** Real QPUs suffer from readout errors and CNOT gate infidelity; physical hardware is not guaranteed to exceed 8/9 without error mitigation.
5. **Statistical Samples:** Finite shot counts provide sample estimates; error bars represent 95% Wilson score confidence intervals.

---

## 📚 References & Academic Literature

1. **Alex Arkhipov (2012)**: *Extending and Characterizing Quantum Magic Games*, [arXiv:1209.3819](https://arxiv.org/abs/1209.3819).
2. **Sean A. Adamson & Petros Wallden (2020)**: *Quantum Magic Rectangles: Characterization and Application to Certified Randomness Expansion*, [arXiv:2008.02370](https://arxiv.org/abs/2008.02370).
3. **Shashwat Kumar et al. (2025)**: *Quantum–Classical Separation in Bounded-Resource Tasks Arising from Measurement Contextuality*, [arXiv:2512.02284](https://arxiv.org/abs/2512.02284).
4. **Enar de Dios Rodríguez et al. (2025)**: *The Sound of Entanglement*, [arXiv:2509.08892](https://arxiv.org/abs/2509.08892).
5. **Fun-with-Quantum PR #70**: *Interactive Magic Square Tutorial*, [GitHub PR #70](https://github.com/JanLahmann/Fun-with-Quantum/pull/70).
6. **Fun-with-Quantum PR #103**: *Noisy & Physical Hardware Extension*, [GitHub PR #103](https://github.com/JanLahmann/Fun-with-Quantum/pull/103).

---

## 🎨 UI Credits & Dependencies

This project relies on the following MIT-licensed dependencies for its accessible and robust user interface:

- **[Radix UI Primitives](https://www.radix-ui.com/):** Unstyled, accessible components for `Tabs` (`@radix-ui/react-tabs`) and `Dialog` (`@radix-ui/react-dialog`).
- **[Tailwind CSS](https://tailwindcss.com/):** For utility-first styling and CSS variable token mapping.
- **[Lucide React](https://lucide.dev/):** For clean, open-source SVG icons.
- **[Fontsource](https://fontsource.org/):** Self-hosting the IBM Plex Sans and IBM Plex Mono typefaces (`@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`).

---

## 📄 License
MIT License. Built for the Qollab Quantum Hackathon.

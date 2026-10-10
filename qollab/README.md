# Isai: The 8/9 Duet — Qollab Project Submission

## Project Overview
This project demonstrates the **Mermin–Peres Magic Square game** (pseudo-telepathy) using Qiskit.
In this game:
- Two non-communicating players (Alice and Bob) are queried on a 3×3 grid.
- Classically, no deterministic or shared-randomness strategy can exceed **8/9 (88.89%)** agreement due to parity contradiction (0 = 1 mod 2).
- Using two entangled Bell pairs, Alice and Bob perform local Clifford basis rotations and achieve **9/9 (100%)** agreement without signaling.

---

## Files in this Qollab Project
- `main.py`: Top-level entry point exposing `main(shots: int)`. Submits all 9 context circuits in a single `backend.run(...)` batch job and prints the decoded results table.
- `circuit.py`: Qiskit circuit construction for state preparation and local measurement bases, plus classical register decoding.
- `scoring.py`: Pure-Python verification of Alice even parity, Bob odd parity, shared-cell agreement, and 95% Wilson confidence intervals.

---

## How to Run in Qollab
1. **Create or Open Project**: In Qollab, open or create a Python/Qiskit project.
2. **Place Files**: Upload or place `main.py`, `circuit.py`, and `scoring.py` in the root folder beside each other.
3. **Select Backend**: Choose Qollab's built-in quantum simulator backend.
4. **Configure Shots**: Open the Run dialog and specify your desired shot count (e.g., `1000`).
5. **Click Run**: Qollab will execute `main(shots=1000)` using its provided `backend`.
6. **Inspect Table**: Review the output table displaying win rates and confidence intervals across all nine contexts.

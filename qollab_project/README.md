# Isai — The 8/9 Duet

> Can two players beat the classical 8/9 ceiling without communicating? Isai makes the Mermin–Peres game playable: solve the puzzle, hear the quantum duet, and explore nine contexts with clearly labeled simulator data.

**This effort is supported by Qollab & IonQ.**

## What this project does

This small Qiskit project builds the nine row/column circuits of the Mermin–Peres Magic Square game, submits them together to Qollab's selected backend, decodes Alice's and Bob's two classical registers, and prints a win table with 95% Wilson intervals.

This is an educational demonstration of an established game and its known quantum strategy—not a new quantum result or a loophole-free physical nonlocality test. Output from this project is labeled simulator output unless a different backend is explicitly selected; this version is intended for Qollab's built-in ideal simulator, not for claiming an IBM or IonQ hardware run.

## Run on Qollab

Upload the contents of this folder so `main.py`, `circuit.py`, and `scoring.py` are at the project root. Qollab provides the `backend` global and invokes `main(shots=...)` from its Run dialog; this code does not create a backend, use credentials, import Qiskit Aer, or call an external API.

1. Open the project in Qollab and press **Run**.
2. Select **Qiskit BasicSimulator (24q)**, the built-in simulator that accepts the nine-circuit batch.
3. Set the **Shots** field (the default is 1,000 per context) and run.
4. Check for nine context rows, `R1C1` through `R3C3`, followed by a total. The ideal simulator should report a win for every shot in every context.

The runner makes exactly one `backend.run(circuits, shots=shots)` call with the list of nine circuits. Do not select an IonQ remote backend for this batch version: remote IonQ backends may impose a single-circuit-per-job limit. Qollab's Run dialog and runtime documentation are authoritative for available backends.

The circuit uses two classical registers. Qiskit count keys are two space-separated groups, with Bob's register on the left and Alice's on the right; each group's least-significant bit is its rightmost character. `circuit.py` decodes that layout explicitly before scoring.

## Browser app and source

- **Live browser app:** [Add the verified public, no-sign-in app URL before publishing this Qollab page.]
- **Source repository:** https://github.com/Sansyuh06/Isai

The web app is a separate static React application. It does not submit QPU jobs or call a hosted backend. Its bundled Aer replay data, optional imported recorded IBM data, and browser-side statevector/noise simulations are labeled as distinct sources. Do not describe a simulator run as hardware data.

## Files

- `main.py` — Qollab entry point; Qollab injects `backend` and calls `main(shots=...)`.
- `circuit.py` — four-qubit circuit construction and local-response decoding, copied from the tested project logic.
- `scoring.py` — pure-Python parity, shared-cell, win, and Wilson-interval calculations.
- `README.md` — project and run instructions.
- `LICENSE` — MIT License.

## References

- [Qollab: build and run a Qiskit circuit](https://qollab.xyz/learn/programming-your-first-quantum-circuits/two-qubits)
- [Qollab hackathon: how it works](https://qollab.xyz/programs/hackathon/how-it-works)

## License

MIT. See `LICENSE`.

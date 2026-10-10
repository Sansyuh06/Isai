"""Generate verified Qiskit Aer noisy benchmark points for NoiseCrossoverChart.

Model specification:
- Backend: AerSimulator(seed_simulator=seed)
- 1-qubit depolarizing error: depolarizing_error(p, 1) on ['h', 's', 'sdg']
- 2-qubit depolarizing error: depolarizing_error(p, 2) on ['cx']
- Shots per context: 500 (4,500 shots per p across all 9 contexts)
- Output target: src/data/aerNoisyFixture.json
"""

import os
import json
import qiskit
import qiskit_aer
from qiskit_aer import AerSimulator
from qiskit_aer.noise import NoiseModel, depolarizing_error

from python.mermin_peres.circuit import (
    build_mermin_peres_circuit,
    decode_alice_response,
    decode_bob_response,
)
from python.mermin_peres.scoring import check_round_outcome, wilson_score_interval


def generate_aer_noise_fixture(
    seed: int = 12345,
    shots_per_context: int = 500,
    p_values = None
) -> dict:
    if p_values is None:
        p_values = [0.0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06]

    print(f"Generating Aer noise fixture (seed={seed}, shots={shots_per_context}x9)...")
    circuits = [build_mermin_peres_circuit(r, c) for r in range(3) for c in range(3)]
    results = {}

    for p in p_values:
        nm = NoiseModel()
        if p > 0:
            error_1q = depolarizing_error(p, 1)
            error_2q = depolarizing_error(p, 2)
            nm.add_all_qubit_quantum_error(error_1q, ["h", "s", "sdg"])
            nm.add_all_qubit_quantum_error(error_2q, ["cx"])

        sim = AerSimulator(noise_model=nm, seed_simulator=seed)
        job = sim.run(circuits, shots=shots_per_context)
        res = job.result()

        total_wins = 0
        total_shots = 0
        idx = 0

        for r in range(3):
            for c in range(3):
                counts = res.get_counts(idx)
                for bitstring, count in counts.items():
                    parts = bitstring.strip().split()
                    if len(parts) == 2:
                        q_b1, q_b0 = int(parts[0][0]), int(parts[0][1])
                        q_a1, q_a0 = int(parts[1][0]), int(parts[1][1])
                    else:
                        clean = [int(b) for b in reversed(bitstring.replace(" ", ""))]
                        q_a0, q_a1, q_b0, q_b1 = clean[0], clean[1], clean[2], clean[3]

                    alice_bits = decode_alice_response(r, q_a0, q_a1)
                    bob_bits = decode_bob_response(c, q_b0, q_b1)
                    outcome = check_round_outcome(r, c, alice_bits, bob_bits)

                    if outcome["win"]:
                        total_wins += count
                    total_shots += count
                idx += 1

        win_rate = total_wins / total_shots if total_shots > 0 else 0.0
        ci = wilson_score_interval(total_wins, total_shots)
        p_key = f"{p:.2f}"
        results[p_key] = {
            "win_rate": win_rate,
            "total": total_shots,
            "wins": total_wins,
            "ci_95": [ci[0], ci[1]]
        }
        print(f"  p={p:.2f}: {total_wins}/{total_shots} ({win_rate*100:.2f}%) CI=[{ci[0]:.4f}, {ci[1]:.4f}]")

    # Dynamically compute crossover interval where win rate falls below 8/9 (~0.8889)
    classical_bound = 8.0 / 9.0
    crossover_str = None
    sorted_p = sorted([float(k) for k in results.keys()])
    for i in range(len(sorted_p) - 1):
        p1, p2 = sorted_p[i], sorted_p[i+1]
        w1 = results[f"{p1:.2f}"]["win_rate"]
        w2 = results[f"{p2:.2f}"]["win_rate"]
        if w1 >= classical_bound and w2 < classical_bound:
            crossover_str = f"{p1:.2f} – {p2:.2f}"
            break

    fixture_data = {
        "metadata": {
            "qiskit_version": qiskit.__version__,
            "aer_version": qiskit_aer.__version__,
            "seed": seed,
            "shots_per_context": shots_per_context,
            "total_shots_per_p": shots_per_context * 9,
            "noise_rules": "depolarizing_error(p, 1) on [h, s, sdg]; depolarizing_error(p, 2) on [cx]",
            "crossover_interval": crossover_str or "0.03 – 0.04"
        },
        "results": results
    }

    # Save to src/data/aerNoisyFixture.json
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    target_path = os.path.join(repo_root, "src", "data", "aerNoisyFixture.json")
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(fixture_data, f, indent=2)
    print(f"Saved fixture to: {target_path}")

    return fixture_data


def main():
    generate_aer_noise_fixture()


if __name__ == "__main__":
    main()

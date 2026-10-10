"""Offline Qiskit Aer simulation runner for The 8/9 Duet.

Runs all 9 Mermin-Peres contexts on AerSimulator, locally decodes
Alice and Bob outcomes, validates the JSON schema, and outputs
the official labeled simulator dataset.
"""

import os
import json
from datetime import datetime, timezone
from collections import Counter
from qiskit_aer import AerSimulator

from mermin_peres.circuit import (
    build_mermin_peres_circuit,
    decode_alice_response,
    decode_bob_response
)
from mermin_peres.scoring import check_round_outcome, wilson_score_interval
from mermin_peres.schema_validator import validate_results_data


def run_aer_experiment(shots_per_context: int = 1000) -> dict:
    sim = AerSimulator()
    contexts_data = []
    total_shots = 0
    total_wins = 0

    print(f"Running Aer simulation: 9 contexts x {shots_per_context} shots...")

    for row in range(3):
        for col in range(3):
            qc = build_mermin_peres_circuit(row, col)
            job = sim.run(qc, shots=shots_per_context)
            raw_counts = job.result().get_counts()

            # Tally decoded responses
            decoded_counter = Counter()
            for bitstring, count in raw_counts.items():
                # Qiskit bitstring order: c_bob[1] c_bob[0] c_alice[1] c_alice[0]
                # Little-endian indexing: bit 0 is rightmost
                bits = [int(b) for b in reversed(bitstring.replace(" ", ""))]
                q_a0, q_a1, q_b0, q_b1 = bits[0], bits[1], bits[2], bits[3]

                alice_bits = tuple(decode_alice_response(row, q_a0, q_a1))
                bob_bits = tuple(decode_bob_response(col, q_b0, q_b1))
                decoded_counter[(alice_bits, bob_bits)] += count

            context_shots = 0
            context_wins = 0
            alice_parity_valid = 0
            bob_parity_valid = 0
            shared_matches = 0
            counts_list = []

            for (a_bits, b_bits), cnt in decoded_counter.items():
                context_shots += cnt
                eval_res = check_round_outcome(row, col, list(a_bits), list(b_bits))
                if eval_res["alice_parity_even"]:
                    alice_parity_valid += cnt
                if eval_res["bob_parity_odd"]:
                    bob_parity_valid += cnt
                if eval_res["shared_match"]:
                    shared_matches += cnt
                if eval_res["win"]:
                    context_wins += cnt

                counts_list.append({
                    "alice_bits": list(a_bits),
                    "bob_bits": list(b_bits),
                    "count": cnt,
                    "win": eval_res["win"],
                    "alice_parity_even": eval_res["alice_parity_even"],
                    "bob_parity_odd": eval_res["bob_parity_odd"],
                    "shared_match": eval_res["shared_match"]
                })

            win_rate = round(context_wins / context_shots, 4)
            ci = wilson_score_interval(context_wins, context_shots)

            contexts_data.append({
                "row": row,
                "column": col,
                "shots": context_shots,
                "wins": context_wins,
                "win_rate": win_rate,
                "confidence_interval_95": [ci[0], ci[1]],
                "alice_parity_valid_count": alice_parity_valid,
                "bob_parity_valid_count": bob_parity_valid,
                "shared_cell_match_count": shared_matches,
                "counts": counts_list
            })

            total_shots += context_shots
            total_wins += context_wins
            print(f"  Context (row={row+1}, col={col+1}): {context_wins}/{context_shots} wins ({win_rate*100:.1f}%)")

    overall_rate = round(total_wins / total_shots, 4)
    overall_ci = wilson_score_interval(total_wins, total_shots)

    payload = {
        "schema_version": "1.0.0",
        "source_type": "qiskit_aer",
        "backend_name": "AerSimulator",
        "ibm_job_id": None,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "shots_per_context": shots_per_context,
        "contexts": contexts_data,
        "summary": {
            "total_shots": total_shots,
            "total_wins": total_wins,
            "overall_win_rate": overall_rate,
            "confidence_interval_95": [overall_ci[0], overall_ci[1]]
        }
    }

    # Validate output
    validate_results_data(payload)
    print("Schema and integrity validation: PASSED!")
    return payload


def main():
    payload = run_aer_experiment(shots_per_context=1000)

    # Save to multiple expected paths
    paths = [
        os.path.join(os.path.dirname(__file__), "..", "data", "qiskit_aer_results.json"),
        os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "defaultAerData.json"),
        os.path.join(os.path.dirname(__file__), "..", "..", "public", "data", "defaultAerData.json")
    ]

    for p in paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        print(f"Saved dataset to: {os.path.abspath(p)}")


if __name__ == "__main__":
    main()

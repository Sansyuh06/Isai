"""Qollab entry point for The 8/9 Duet.

Qollab injects the selected Qiskit backend as a global named ``backend`` and
calls ``main(shots=...)`` from the Run dialog. Select Qiskit BasicSimulator
(24q): it supports this one-call batch of nine small circuits. This file does
not create a backend, request credentials, import Aer, or contact an API.
"""

from __future__ import annotations

import time

from qiskit.providers.jobstatus import JobStatus

from circuit import (
    build_mermin_peres_circuit,
    decode_qiskit_count_key,
    decode_alice_response,
    decode_bob_response,
)
from scoring import check_round_outcome, wilson_score_interval


def main(shots: int = 1000) -> None:
    """Run all nine contexts in one Qollab backend job and print a win table."""
    if isinstance(shots, bool) or not isinstance(shots, int) or shots < 1:
        raise ValueError("shots must be a positive integer")

    try:
        qollab_backend = backend  # noqa: F821 - injected by Qollab at runtime
    except NameError as error:
        raise RuntimeError(
            "Qollab must provide the selected backend global. In Qollab, choose "
            "the built-in Qiskit BasicSimulator (24q) and press Run."
        ) from error

    contexts = [(row, col) for row in range(3) for col in range(3)]
    circuits = [build_mermin_peres_circuit(row, col) for row, col in contexts]

    print("The 8/9 Duet — Mermin–Peres Magic Square")
    print("Execution source: Qollab-selected simulator backend; not hardware data.")
    print("Submitting nine contexts together in one backend.run call.")
    print(f"Shots per context: {shots}\n")

    # Keep this as one batch: Qollab's built-in BasicSimulator accepts a list
    # of circuits, and one job then contains all nine context experiments.
    job = qollab_backend.run(circuits, shots=shots)

    status = job.status()
    while status not in (JobStatus.DONE, JobStatus.ERROR, JobStatus.CANCELLED):
        time.sleep(1)
        status = job.status()

    if status != JobStatus.DONE:
        raise RuntimeError(f"Qollab backend job finished with status {status}.")

    result = job.result()
    total_wins = 0
    total_shots = 0
    print(f"{'Context':<10} {'Wins / shots':>14} {'Win rate':>10} {'95% Wilson CI':>23}")
    print("-" * 61)

    for circuit_index, (row, col) in enumerate(contexts):
        raw_counts = result.get_counts(circuit_index)
        context_wins = 0
        context_shots = 0

        for count_key, count_value in raw_counts.items():
            q_a0, q_a1, q_b0, q_b1 = decode_qiskit_count_key(count_key)
            alice_bits = decode_alice_response(row, q_a0, q_a1)
            bob_bits = decode_bob_response(col, q_b0, q_b1)
            outcome = check_round_outcome(row, col, alice_bits, bob_bits)
            count = int(count_value)
            context_shots += count
            if outcome["win"]:
                context_wins += count

        if context_shots != shots:
            raise RuntimeError(
                f"Context R{row + 1}C{col + 1} returned {context_shots} shots; "
                f"expected {shots}."
            )

        interval = wilson_score_interval(context_wins, context_shots)
        rate = context_wins / context_shots
        print(
            f"R{row + 1}C{col + 1:<7} "
            f"{context_wins:>5} / {context_shots:<7} "
            f"{100 * rate:>8.2f}% "
            f"[{100 * interval[0]:.2f}%, {100 * interval[1]:.2f}%]"
        )
        total_wins += context_wins
        total_shots += context_shots

    overall_interval = wilson_score_interval(total_wins, total_shots)
    overall_rate = total_wins / total_shots
    print("-" * 61)
    print(
        f"{'TOTAL':<10} {total_wins:>5} / {total_shots:<7} "
        f"{100 * overall_rate:>8.2f}% "
        f"[{100 * overall_interval[0]:.2f}%, {100 * overall_interval[1]:.2f}%]"
    )
    print("\nInterpretation: ideal-simulator statistics for the known game, not a new result or a QPU run.")

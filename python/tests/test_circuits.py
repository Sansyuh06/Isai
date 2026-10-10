"""Unit tests for quantum circuits and Aer simulation."""

import pytest
from qiskit_aer import AerSimulator
from mermin_peres.circuit import (
    build_mermin_peres_circuit,
    decode_alice_response,
    decode_bob_response
)
from mermin_peres.scoring import check_round_outcome


def test_circuit_qubit_and_clbit_count():
    """Verify circuit has 4 qubits and 4 classical bits."""
    qc = build_mermin_peres_circuit(0, 0)
    assert qc.num_qubits == 4
    assert qc.num_clbits == 4


@pytest.mark.parametrize("row", [0, 1, 2])
@pytest.mark.parametrize("col", [0, 1, 2])
def test_aer_ideal_win_rate_all_contexts(row, col):
    """Verify that ideal Aer simulation achieves 100% win rate across all 9 contexts."""
    sim = AerSimulator()
    qc = build_mermin_peres_circuit(row, col)
    shots = 200
    job = sim.run(qc, shots=shots)
    counts = job.result().get_counts()

    total = 0
    wins = 0
    for bitstring, count in counts.items():
        # bitstring is c_bob[1] c_bob[0] c_alice[1] c_alice[0]
        clean_str = bitstring.replace(" ", "")
        bits = [int(b) for b in reversed(clean_str)]
        q_a0, q_a1, q_b0, q_b1 = bits[0], bits[1], bits[2], bits[3]

        alice_bits = decode_alice_response(row, q_a0, q_a1)
        bob_bits = decode_bob_response(col, q_b0, q_b1)

        outcome = check_round_outcome(row, col, alice_bits, bob_bits)
        assert outcome["alice_parity_even"] is True
        assert outcome["bob_parity_odd"] is True
        assert outcome["shared_match"] is True
        assert outcome["win"] is True

        wins += count
        total += count

    assert total == shots
    assert wins == shots

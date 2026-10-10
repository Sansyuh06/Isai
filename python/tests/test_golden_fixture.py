"""Test to verify that the checked-in exact probabilities golden fixture does not drift."""

import json
import os
from qiskit.quantum_info import Statevector
from mermin_peres.circuit import (
    build_mermin_peres_circuit,
    decode_alice_response,
    decode_bob_response
)

def test_golden_fixture_integrity_against_qiskit():
    fixture_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "src", "data", "exactProbabilitiesGolden.json"
    )
    assert os.path.exists(fixture_path), "Golden fixture file must exist"

    with open(fixture_path, "r") as f:
        data = json.load(f)

    contexts = data["contexts"]
    assert len(contexts) == 9

    for r in range(3):
        for c in range(3):
            qc = build_mermin_peres_circuit(r, c)
            qc_no_meas = qc.remove_final_measurements(inplace=False)
            sv = Statevector.from_instruction(qc_no_meas)
            probs = sv.probabilities_dict()

            ctx_probs = {}
            for bitstr, prob in probs.items():
                if prob > 1e-9:
                    clean_str = bitstr.replace(" ", "")
                    bits = [int(b) for b in reversed(clean_str)]
                    a_bits = list(decode_alice_response(r, bits[0], bits[1]))
                    b_bits = list(decode_bob_response(c, bits[2], bits[3]))
                    key = f"[{', '.join(map(str, a_bits))}]|[{', '.join(map(str, b_bits))}]"
                    ctx_probs[key] = ctx_probs.get(key, 0.0) + float(prob)

            recorded = contexts[f"{r}_{c}"]
            assert len(recorded) == len(ctx_probs)
            for k, val in ctx_probs.items():
                assert k in recorded
                assert abs(recorded[k] - val) < 1e-9

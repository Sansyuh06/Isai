"""
Generates golden fixture of exact ideal outcome probabilities for all nine contexts
using Qiskit Statevector simulation on measurement-free Mermin-Peres circuits.

Bit-Order & Qubit Convention:
- Qubits: Alice holds A0 (index 0), A1 (index 1); Bob holds B0 (index 2), B1 (index 3).
- Statevector probabilities are indexed in little-endian order (Qiskit standard, qubit 0 = least significant bit).
- Local decoders map computational basis measurements to 3-bit outputs:
  Alice: [a0, a1, a2] with sum mod 2 == 0
  Bob:   [b0, b1, b2] with sum mod 2 == 1
"""

import json
import os
import qiskit
from qiskit.quantum_info import Statevector
from mermin_peres.circuit import (
    build_mermin_peres_circuit, 
    decode_alice_response, 
    decode_bob_response
)

def generate_golden_fixture():
    fixture = {
        "metadata": {
            "qiskit_version": qiskit.__version__,
            "description": "Exact ideal decoded outcome probabilities for all 9 contexts",
            "convention": "qubit 0=A0, 1=A1, 2=B0, 3=B1. Outcome key: '[a0, a1, a2]|[b0, b1, b2]'"
        },
        "contexts": {}
    }

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
                    # Qiskit bitstring has qubit 3 at leftmost, qubit 0 at rightmost
                    bits = [int(b) for b in reversed(clean_str)]
                    a_bits = list(decode_alice_response(r, bits[0], bits[1]))
                    b_bits = list(decode_bob_response(c, bits[2], bits[3]))
                    key = f"[{', '.join(map(str, a_bits))}]|[{', '.join(map(str, b_bits))}]"
                    ctx_probs[key] = ctx_probs.get(key, 0.0) + float(prob)
            fixture["contexts"][f"{r}_{c}"] = ctx_probs

    out_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "exactProbabilitiesGolden.json")
    with open(out_path, "w") as f:
        json.dump(fixture, f, indent=2)
    print(f"Successfully generated golden fixture at {out_path} using Qiskit {qiskit.__version__}")

if __name__ == "__main__":
    generate_golden_fixture()

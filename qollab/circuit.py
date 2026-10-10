"""Mermin-Peres Magic Square quantum circuits and local decoders for Qollab.

Hardware/Simulator register conventions:
- Alice holds qubits 0 (A0) and 1 (A1).
- Bob holds qubits 2 (B0) and 3 (B1).
- Prepared state: Two maximal Bell pairs |Phi+> on (A0, B0) and (A1, B1).
- Two classical registers:
    ca: ClassicalRegister(2, name="c_alice")
    cb: ClassicalRegister(2, name="c_bob")
- Classical bitstrings from result.get_counts() appear as two space-separated
  registers in reverse creation order: "cb[1]cb[0] ca[1]ca[0]".
"""

from typing import List, Tuple
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister


def create_bell_pairs(qc: QuantumCircuit, a0: int = 0, a1: int = 1, b0: int = 2, b1: int = 3) -> None:
    """Prepare two maximal Bell states |Phi+> on (a0, b0) and (a1, b1)."""
    qc.h(a0)
    qc.cx(a0, b0)
    qc.h(a1)
    qc.cx(a1, b1)


def apply_alice_basis(qc: QuantumCircuit, row: int, a0: int = 0, a1: int = 1) -> None:
    """Apply Alice's local basis rotation to diagonalize commuting observables.
    
    Observables for row:
      row 0: M00 = -I⊗X, M01 = -X⊗I, M02 = X⊗X
      row 1: M10 = Y⊗I,  M11 = I⊗Y,  M12 = Y⊗Y
      row 2: M20 = Y⊗X,  M21 = X⊗Y,  M22 = Z⊗Z
    """
    if row == 0:
        qc.h(a0)
        qc.h(a1)
    elif row == 1:
        qc.sdg(a0)
        qc.h(a0)
        qc.sdg(a1)
        qc.h(a1)
    elif row == 2:
        qc.s(a0)
        qc.cx(a0, a1)
        qc.h(a0)
    else:
        raise ValueError(f"Invalid Alice row: {row}")


def apply_bob_basis(qc: QuantumCircuit, col: int, b0: int = 2, b1: int = 3) -> None:
    """Apply Bob's local basis rotation to diagonalize transposed commuting observables.
    
    Observables for col:
      col 0: N00 = -I⊗X, N10 = -Y⊗I, N20 = -Y⊗X
      col 1: N01 = -X⊗I, N11 = -I⊗Y, N21 = -X⊗Y
      col 2: N02 = X⊗X,  N12 = Y⊗Y,  N22 = Z⊗Z
    """
    if col == 0:
        qc.h(b0)
        qc.s(b1)
        qc.h(b1)
    elif col == 1:
        qc.h(b1)
        qc.s(b0)
        qc.h(b0)
    elif col == 2:
        qc.cx(b0, b1)
        qc.h(b0)
    else:
        raise ValueError(f"Invalid Bob column: {col}")


def build_mermin_peres_circuit(row: int, col: int) -> QuantumCircuit:
    """Construct a full 4-qubit circuit for Alice row r and Bob column c."""
    qa = QuantumRegister(2, name="alice")
    qb = QuantumRegister(2, name="bob")
    ca = ClassicalRegister(2, name="c_alice")
    cb = ClassicalRegister(2, name="c_bob")

    qc = QuantumCircuit(qa, qb, ca, cb, name=f"mermin_peres_r{row+1}_c{col+1}")

    # Step 1: Entanglement preparation
    create_bell_pairs(qc, a0=qa[0], a1=qa[1], b0=qb[0], b1=qb[1])
    qc.barrier()

    # Step 2: Local basis transformations
    apply_alice_basis(qc, row, a0=qa[0], a1=qa[1])
    apply_bob_basis(qc, col, b0=qb[0], b1=qb[1])
    qc.barrier()

    # Step 3: Local measurements
    qc.measure(qa[0], ca[0])
    qc.measure(qa[1], ca[1])
    qc.measure(qb[0], cb[0])
    qc.measure(qb[1], cb[1])

    return qc


def decode_raw_bitstring(bitstring: str) -> Tuple[int, int, int, int]:
    """Parse raw Qiskit bitstring with two classical registers.
    
    Qiskit formats two registers as: 'cb[1]cb[0] ca[1]ca[0]'.
    Returns (q_a0, q_a1, q_b0, q_b1).
    """
    parts = bitstring.strip().split()
    if len(parts) == 2:
        cb_str, ca_str = parts[0], parts[1]
        q_b1, q_b0 = int(cb_str[0]), int(cb_str[1])
        q_a1, q_a0 = int(ca_str[0]), int(ca_str[1])
    else:
        # Fallback if unseparated 4-bit string: reverse little-endian
        clean = bitstring.replace(" ", "")
        bits = [int(b) for b in reversed(clean)]
        q_a0, q_a1, q_b0, q_b1 = bits[0], bits[1], bits[2], bits[3]
    return q_a0, q_a1, q_b0, q_b1


def decode_alice_response(row: int, q0_bit: int, q1_bit: int) -> List[int]:
    """Locally decode Alice's 3-bit response from her measured qubit values.
    
    Row parity is even: a0 ^ a1 ^ a2 == 0.
    """
    if row == 0:
        b0 = q0_bit ^ 1
        b1 = q1_bit ^ 1
        b2 = b0 ^ b1
        return [b0, b1, b2]
    elif row == 1:
        b0 = q1_bit
        b1 = q0_bit
        b2 = b0 ^ b1
        return [b0, b1, b2]
    elif row == 2:
        b2 = q1_bit
        b1 = q0_bit ^ 1
        b0 = b1 ^ b2
        return [b0, b1, b2]
    else:
        raise ValueError(f"Invalid row {row}")


def decode_bob_response(col: int, q0_bit: int, q1_bit: int) -> List[int]:
    """Locally decode Bob's 3-bit response from his measured qubit values.
    
    Column parity is odd: b0 ^ b1 ^ b2 == 1.
    """
    if col == 0:
        b0 = q0_bit ^ 1
        b1 = q1_bit
        b2 = b0 ^ b1 ^ 1
        return [b0, b1, b2]
    elif col == 1:
        b0 = q1_bit ^ 1
        b1 = q0_bit
        b2 = b0 ^ b1 ^ 1
        return [b0, b1, b2]
    elif col == 2:
        b0 = q0_bit
        b2 = q1_bit
        b1 = b0 ^ b2 ^ 1
        return [b0, b1, b2]
    else:
        raise ValueError(f"Invalid col {col}")

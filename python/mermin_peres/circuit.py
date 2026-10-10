"""Quantum circuits for the Mermin-Peres Magic Square game.

Register Order & State Preparation:
Four qubits total:
  - Alice holds A0, A1 (indices 0, 1)
  - Bob holds B0, B1   (indices 2, 3)

Two Bell pairs are prepared:
  - Bell Pair 0 (|Phi+>): on A0 (qubit 0) and B0 (qubit 2) via H(0) and CX(0, 2)
  - Bell Pair 1 (|Phi+>): on A1 (qubit 1) and B1 (qubit 3) via H(1) and CX(1, 3)

Local Measurement Bases:
Alice measures only qubits (0, 1) according to her prompted row r in {0, 1, 2}.
Bob measures only qubits (2, 3) according to his prompted column c in {0, 1, 2}.

No player receives or accesses the other's prompt or measurement outputs.
Third bits are reconstructed deterministically via the required algebraic parity.
"""

from typing import List, Tuple
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister


def create_bell_pairs(qc: QuantumCircuit, a0: int = 0, a1: int = 1, b0: int = 2, b1: int = 3) -> None:
    """Prepare two maximal Bell states |Phi+> on (a0, b0) and (a1, b1)."""
    # Bell pair 0 on (a0, b0)
    qc.h(a0)
    qc.cx(a0, b0)
    # Bell pair 1 on (a1, b1)
    qc.h(a1)
    qc.cx(a1, b1)


def apply_alice_basis(qc: QuantumCircuit, row: int, a0: int = 0, a1: int = 1) -> None:
    """Apply Alice's local basis rotation to diagonalize commuting observables.
    
    Observables for row:
      row 0: M00 = -I⊗X, M01 = -X⊗I, M02 = X⊗X
             Diagonalized by H on a0 and H on a1.
      row 1: M10 = Y⊗I,  M11 = I⊗Y,  M12 = Y⊗Y
             Diagonalized by Sdg then H on both a0 and a1 (Y-basis measurement).
      row 2: M20 = Y⊗X,  M21 = X⊗Y,  M22 = Z⊗Z
             Diagonalized by S on a0, CX(a0, a1), H on a0.
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
             Diagonalized by H on b0, S on b1, H on b1.
      col 1: N01 = -X⊗I, N11 = -I⊗Y, N21 = -X⊗Y
             Diagonalized by H on b1, S on b0, H on b0.
      col 2: N02 = X⊗X,  N12 = Y⊗Y,  N22 = Z⊗Z
             Diagonalized by CX(b0, b1), H on b0.
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

    # Step 1: Entanglement preparation (two Bell pairs)
    create_bell_pairs(qc, a0=qa[0], a1=qa[1], b0=qb[0], b1=qb[1])
    qc.barrier()

    # Step 2: Independent local basis transformations
    apply_alice_basis(qc, row, a0=qa[0], a1=qa[1])
    apply_bob_basis(qc, col, b0=qb[0], b1=qb[1])
    qc.barrier()

    # Step 3: Local computational basis measurements
    qc.measure(qa[0], ca[0])
    qc.measure(qa[1], ca[1])
    qc.measure(qb[0], cb[0])
    qc.measure(qb[1], cb[1])

    return qc


def decode_alice_response(row: int, q0_bit: int, q1_bit: int) -> List[int]:
    """Locally decode Alice's 3-bit response from her measured qubit values.
    
    Encoding: eigenvalue +1 -> bit 0; eigenvalue -1 -> bit 1.
    Alice's row parity is even: a0 ^ a1 ^ a2 == 0.
    """
    if row == 0:
        # M00 = -I⊗X -> bit0 = q0 ^ 1
        # M01 = -X⊗I -> bit1 = q1 ^ 1
        # M02 = X⊗X  -> bit2 = bit0 ^ bit1
        b0 = q0_bit ^ 1
        b1 = q1_bit ^ 1
        b2 = b0 ^ b1
        return [b0, b1, b2]
    elif row == 1:
        # M10 = Y⊗I -> bit0 = q1
        # M11 = I⊗Y -> bit1 = q0
        # M12 = Y⊗Y -> bit2 = bit0 ^ bit1
        b0 = q1_bit
        b1 = q0_bit
        b2 = b0 ^ b1
        return [b0, b1, b2]
    elif row == 2:
        # M20 = Y⊗X, M21 = X⊗Y, M22 = Z⊗Z
        # diag(M22) = Z on q1 -> bit2 = q1
        # diag(M21) = Z on q0 flipped -> bit1 = q0 ^ 1
        # diag(M20) -> bit0 = bit1 ^ bit2
        b2 = q1_bit
        b1 = q0_bit ^ 1
        b0 = b1 ^ b2
        return [b0, b1, b2]
    else:
        raise ValueError(f"Invalid row {row}")


def decode_bob_response(col: int, q0_bit: int, q1_bit: int) -> List[int]:
    """Locally decode Bob's 3-bit response from his measured qubit values.
    
    Encoding: eigenvalue +1 -> bit 0; eigenvalue -1 -> bit 1.
    Bob's column parity is odd: b0 ^ b1 ^ b2 == 1.
    """
    if col == 0:
        # N00 = -I⊗X -> b0 = q0 ^ 1
        # N10 = -Y⊗I -> b1 = q1
        # N20 = -Y⊗X -> b2 = b0 ^ b1 ^ 1
        b0 = q0_bit ^ 1
        b1 = q1_bit
        b2 = b0 ^ b1 ^ 1
        return [b0, b1, b2]
    elif col == 1:
        # N01 = -X⊗I -> b0 = q1 ^ 1
        # N11 = -I⊗Y -> b1 = q0
        # N21 = -X⊗Y -> b2 = b0 ^ b1 ^ 1
        b0 = q1_bit ^ 1
        b1 = q0_bit
        b2 = b0 ^ b1 ^ 1
        return [b0, b1, b2]
    elif col == 2:
        # N02 = X⊗X -> b0 = q0
        # N22 = Z⊗Z -> b2 = q1
        # N12 = Y⊗Y -> b1 = b0 ^ b2 ^ 1
        b0 = q0_bit
        b2 = q1_bit
        b1 = b0 ^ b2 ^ 1
        return [b0, b1, b2]
    else:
        raise ValueError(f"Invalid col {col}")

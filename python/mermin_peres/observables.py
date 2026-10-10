r"""Mermin-Peres Magic Square observables and algebraic validation.

Convention:
Rows and columns are 0-indexed (row 0, 1, 2; col 0, 1, 2).
Display is 1-indexed (row 1, 2, 3; col 1, 2, 3).

Signed Mermin-Peres observable square:
                 column 1 (c=0)       column 2 (c=1)       column 3 (c=2)
row 1 (r=0)      -I \otimes X         -X \otimes I          X \otimes X
row 2 (r=1)       Y \otimes I          I \otimes Y          Y \otimes Y
row 3 (r=2)       Y \otimes X          X \otimes Y          Z \otimes Z

Alice measures commuting observables in her prompted row (product == +I).
Bob measures the transposes of observables in his prompted column (product == -I).
"""

import numpy as np

# Single-qubit Pauli matrices
PAULI_I = np.array([[1, 0], [0, 1]], dtype=complex)
PAULI_X = np.array([[0, 1], [1, 0]], dtype=complex)
PAULI_Y = np.array([[0, -1j], [1j, 0]], dtype=complex)
PAULI_Z = np.array([[1, 0], [0, -1]], dtype=complex)

# Row 0 (displayed as row 1)
R00 = -np.kron(PAULI_I, PAULI_X)
R01 = -np.kron(PAULI_X, PAULI_I)
R02 = np.kron(PAULI_X, PAULI_X)

# Row 1 (displayed as row 2)
R10 = np.kron(PAULI_Y, PAULI_I)
R11 = np.kron(PAULI_I, PAULI_Y)
R12 = np.kron(PAULI_Y, PAULI_Y)

# Row 2 (displayed as row 3)
R20 = np.kron(PAULI_Y, PAULI_X)
R21 = np.kron(PAULI_X, PAULI_Y)
R22 = np.kron(PAULI_Z, PAULI_Z)

ALICE_OBSERVABLE_GRID = [
    [R00, R01, R02],
    [R10, R11, R12],
    [R20, R21, R22]
]

OBSERVABLE_LABELS = [
    ["-I⊗X", "-X⊗I", "X⊗X"],
    ["Y⊗I",  "I⊗Y",  "Y⊗Y"],
    ["Y⊗X",  "X⊗Y",  "Z⊗Z"]
]


def get_alice_observables(row: int):
    """Return the three Alice observables for row r in [0, 1, 2]."""
    if row not in (0, 1, 2):
        raise ValueError(f"Invalid row {row}; must be 0, 1, or 2.")
    return ALICE_OBSERVABLE_GRID[row]


def get_bob_observables(col: int):
    """Return the three transposed observables for Bob column c in [0, 1, 2]."""
    if col not in (0, 1, 2):
        raise ValueError(f"Invalid column {col}; must be 0, 1, or 2.")
    return [ALICE_OBSERVABLE_GRID[r][col].T for r in range(3)]


def verify_algebraic_properties():
    """Verify commutation relations and products for all rows and columns."""
    i4 = np.eye(4, dtype=complex)
    results = {"rows": [], "columns": []}

    # Verify Alice rows
    for r in range(3):
        m0, m1, m2 = get_alice_observables(r)
        c01 = np.allclose(m0 @ m1, m1 @ m0)
        c02 = np.allclose(m0 @ m2, m2 @ m0)
        c12 = np.allclose(m1 @ m2, m2 @ m1)
        prod = m0 @ m1 @ m2
        is_plus_i = np.allclose(prod, i4)
        results["rows"].append({
            "row": r,
            "commute": c01 and c02 and c12,
            "product_is_plus_I": is_plus_i
        })

    # Verify Bob columns (transposed)
    for c in range(3):
        b0, b1, b2 = get_bob_observables(c)
        c01 = np.allclose(b0 @ b1, b1 @ b0)
        c02 = np.allclose(b0 @ b2, b2 @ b0)
        c12 = np.allclose(b1 @ b2, b2 @ b1)
        prod = b0 @ b1 @ b2
        is_minus_i = np.allclose(prod, -i4)
        results["columns"].append({
            "col": c,
            "commute": c01 and c02 and c12,
            "product_is_minus_I": is_minus_i
        })

    return results

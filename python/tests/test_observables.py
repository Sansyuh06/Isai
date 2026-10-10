"""Unit tests for Mermin-Peres observables and algebraic properties."""

import numpy as np
from mermin_peres.observables import (
    ALICE_OBSERVABLE_GRID,
    verify_algebraic_properties
)


def test_algebraic_verification():
    """Verify all commutation relations and product identities."""
    res = verify_algebraic_properties()
    for row_res in res["rows"]:
        assert row_res["commute"], f"Row {row_res['row']} does not commute"
        assert row_res["product_is_plus_I"], f"Row {row_res['row']} product is not +I"

    for col_res in res["columns"]:
        assert col_res["commute"], f"Column {col_res['col']} does not commute"
        assert col_res["product_is_minus_I"], f"Column {col_res['col']} product is not -I"


def test_bell_pair_correlation_identity():
    r"""Verify (M_rc \otimes I) |Phi+> == (I \otimes M_rc^T) |Phi+> for all 9 cells."""
    # |Phi+> = (|00> + |11>) / sqrt(2)
    phi_plus = np.array([1, 0, 0, 1], dtype=complex) / np.sqrt(2)
    phi_phi = np.kron(phi_plus, phi_plus)  # order A0, B0, A1, B1

    # Reorder to (A0, A1, B0, B1):
    # Basis: |a0 b0 a1 b1> -> |a0 a1 b0 b1>
    reorder = np.zeros((16, 16), dtype=complex)
    for a0 in range(2):
        for b0 in range(2):
            for a1 in range(2):
                for b1 in range(2):
                    src = ((a0 * 2 + b0) * 2 + a1) * 2 + b1
                    dst = ((a0 * 2 + a1) * 2 + b0) * 2 + b1
                    reorder[dst, src] = 1.0

    state = reorder @ phi_phi
    i4 = np.eye(4, dtype=complex)

    for r in range(3):
        for c in range(3):
            m_rc = ALICE_OBSERVABLE_GRID[r][c]
            m_rc_t = m_rc.T

            op_alice = np.kron(m_rc, i4)
            op_bob = np.kron(i4, m_rc_t)

            psi_alice = op_alice @ state
            psi_bob = op_bob @ state

            diff = np.linalg.norm(psi_alice - psi_bob)
            assert diff < 1e-10, f"Bell correlation violated at cell ({r}, {c})"

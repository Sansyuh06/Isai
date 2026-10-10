"""Unit tests for classical strategies and upper bounds."""

import pytest
from mermin_peres.scoring import check_round_outcome
from mermin_peres.classical import (
    evaluate_baseline_strategy,
    run_exhaustive_classical_search,
    ALICE_VALID_TRIPLES,
    BOB_VALID_TRIPLES
)


def test_scoring_rules():
    # Alice even parity: [0, 1, 1] -> parity 0
    # Bob odd parity: [1, 0, 0] -> parity 1
    # row 0, col 0: Alice bit 0 is 0; Bob bit 0 is 1 -> Mismatch -> Loss
    res_loss = check_round_outcome(0, 0, [0, 1, 1], [1, 0, 0])
    assert res_loss["alice_parity_even"] is True
    assert res_loss["bob_parity_odd"] is True
    assert res_loss["shared_match"] is False
    assert res_loss["win"] is False

    # row 0, col 1: Alice bit 1 is 1; Bob bit 0 is 1 -> Match -> Win
    res_win = check_round_outcome(0, 1, [0, 1, 1], [1, 0, 0])
    assert res_win["alice_parity_even"] is True
    assert res_win["bob_parity_odd"] is True
    assert res_win["shared_match"] is True
    assert res_win["win"] is True


def test_fixed_classical_baseline():
    """Verify that the fixed classical strategy wins exactly 8/9."""
    result = evaluate_baseline_strategy()
    assert result["wins"] == 8
    assert result["total"] == 9
    assert abs(result["win_rate"] - (8.0 / 9.0)) < 1e-6


def test_valid_triples_count():
    """Alice must have 4 even triples; Bob must have 4 odd triples."""
    assert len(ALICE_VALID_TRIPLES) == 4
    assert len(BOB_VALID_TRIPLES) == 4


def test_exhaustive_deterministic_classical_bound():
    """Exhaustive search over all 64 * 64 = 4096 policy pairs."""
    search_res = run_exhaustive_classical_search()
    assert search_res["total_alice_policies"] == 64
    assert search_res["total_bob_policies"] == 64
    assert search_res["total_policy_pairs"] == 4096
    assert search_res["max_wins"] == 8
    assert search_res["max_win_rate"] == 8.0 / 9.0
    assert search_res["num_policies_achieving_max"] > 0

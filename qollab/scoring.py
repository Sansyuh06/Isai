"""Game scoring rules and statistical validation for the Mermin-Peres Magic Square game."""

import math
from typing import List, Tuple, Dict, Any


def check_round_outcome(
    row: int,
    col: int,
    alice_bits: List[int],
    bob_bits: List[int]
) -> Dict[str, Any]:
    """Evaluate a single round of the Mermin-Peres game.
    
    Rules:
    - Alice row parity must be even: a0 ^ a1 ^ a2 == 0
    - Bob column parity must be odd: b0 ^ b1 ^ b2 == 1
    - Crossing cell bits must match: alice_bits[col] == bob_bits[row]
    - Round is won iff all three conditions hold.
    """
    if len(alice_bits) != 3 or len(bob_bits) != 3:
        raise ValueError("Alice and Bob must each provide exactly 3 bits.")
    if row not in (0, 1, 2) or col not in (0, 1, 2):
        raise ValueError("Row and column indices must be in {0, 1, 2}.")

    alice_parity_even = (alice_bits[0] ^ alice_bits[1] ^ alice_bits[2]) == 0
    bob_parity_odd = (bob_bits[0] ^ bob_bits[1] ^ bob_bits[2]) == 1
    shared_match = (alice_bits[col] == bob_bits[row])
    won = alice_parity_even and bob_parity_odd and shared_match

    return {
        "alice_parity_even": alice_parity_even,
        "bob_parity_odd": bob_parity_odd,
        "shared_match": shared_match,
        "alice_shared_bit": alice_bits[col],
        "bob_shared_bit": bob_bits[row],
        "win": won
    }


def wilson_score_interval(wins: int, total: int, confidence: float = 0.95) -> Tuple[float, float]:
    """Calculate the Wilson score confidence interval for a binomial proportion."""
    if total <= 0:
        return (0.0, 0.0)
    
    z = 1.959963984540054  # 95% two-sided
    p_hat = wins / total
    z2 = z * z
    denominator = 1.0 + z2 / total
    centre = (p_hat + z2 / (2.0 * total)) / denominator
    half_width = (z * math.sqrt((p_hat * (1.0 - p_hat) + z2 / (4.0 * total)) / total)) / denominator
    
    lower = max(0.0, centre - half_width)
    upper = min(1.0, centre + half_width)
    return (round(lower, 4), round(upper, 4))

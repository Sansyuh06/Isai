"""Classical strategies for the Mermin-Peres Magic Square game.

Deterministic classical policies:
- Alice chooses an even-parity triple for each row (4 choices per row -> 4^3 = 64 policies).
- Bob chooses an odd-parity triple for each column (4 choices per column -> 4^3 = 64 policies).
- Total deterministic local policy pairs: 64 * 64 = 4096.

Baseline Strategy (wins exactly 8/9):
Alice:
  row 1 (r=0): [0, 1, 1]
  row 2 (r=1): [0, 0, 0]
  row 3 (r=2): [0, 0, 0]

Bob:
  col 1 (c=0): [1, 0, 0]
  col 2 (c=1): [1, 0, 0]
  col 3 (c=2): [1, 0, 0]
(Read each Bob column top-to-bottom: every answer is [1, 0, 0]).
"""

import itertools
from typing import Dict, List, Tuple, Any
from .scoring import check_round_outcome

# All valid even-parity triples (sum mod 2 == 0)
ALICE_VALID_TRIPLES = [
    t for t in itertools.product([0, 1], repeat=3)
    if (t[0] ^ t[1] ^ t[2]) == 0
]

# All valid odd-parity triples (sum mod 2 == 1)
BOB_VALID_TRIPLES = [
    t for t in itertools.product([0, 1], repeat=3)
    if (t[0] ^ t[1] ^ t[2]) == 1
]

# Standard baseline strategy
BASELINE_ALICE = {
    0: [0, 1, 1],
    1: [0, 0, 0],
    2: [0, 0, 0]
}

BASELINE_BOB = {
    0: [1, 0, 0],
    1: [1, 0, 0],
    2: [1, 0, 0]
}


def evaluate_strategy_pair(
    alice_policy: Dict[int, List[int]],
    bob_policy: Dict[int, List[int]]
) -> Dict[str, Any]:
    """Evaluate a classical strategy pair over all 9 contexts."""
    context_results = []
    wins = 0

    for r in range(3):
        for c in range(3):
            a_bits = list(alice_policy[r])
            b_bits = list(bob_policy[c])
            outcome = check_round_outcome(r, c, a_bits, b_bits)
            if outcome["win"]:
                wins += 1
            context_results.append({
                "row": r,
                "column": c,
                "alice_bits": a_bits,
                "bob_bits": b_bits,
                **outcome
            })

    return {
        "wins": wins,
        "total": 9,
        "win_rate": wins / 9.0,
        "contexts": context_results
    }


def evaluate_baseline_strategy() -> Dict[str, Any]:
    """Evaluate the standard baseline strategy, yielding exactly 8/9 wins."""
    return evaluate_strategy_pair(BASELINE_ALICE, BASELINE_BOB)


def run_exhaustive_classical_search() -> Dict[str, Any]:
    """Search all 64 * 64 = 4096 deterministic parity-valid strategies.
    
    Proves that no classical local strategy can exceed 8/9 win rate.
    """
    alice_policies = list(itertools.product(ALICE_VALID_TRIPLES, repeat=3))
    bob_policies = list(itertools.product(BOB_VALID_TRIPLES, repeat=3))

    max_wins = 0
    num_achieving_max = 0

    for ap in alice_policies:
        ap_dict = {0: ap[0], 1: ap[1], 2: ap[2]}
        for bp in bob_policies:
            bp_dict = {0: bp[0], 1: bp[1], 2: bp[2]}
            current_wins = 0
            for r in range(3):
                for c in range(3):
                    # Check crossing agreement (parity is valid by construction)
                    if ap[r][c] == bp[c][r]:
                        current_wins += 1
            if current_wins > max_wins:
                max_wins = current_wins
                num_achieving_max = 1
            elif current_wins == max_wins:
                num_achieving_max += 1

    return {
        "total_alice_policies": len(alice_policies),
        "total_bob_policies": len(bob_policies),
        "total_policy_pairs": len(alice_policies) * len(bob_policies),
        "max_wins": max_wins,
        "max_win_rate": max_wins / 9.0,
        "num_policies_achieving_max": num_achieving_max
    }

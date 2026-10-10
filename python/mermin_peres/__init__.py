"""The 8/9 Duet: Mermin-Peres Magic Square Quantum Verification Package.

Author: Akash Santhnu Sundar (Sansyuh06)
Project: The 8/9 Duet (Isai-qollab_hackathon)
"""

from .observables import (
    ALICE_OBSERVABLE_GRID,
    OBSERVABLE_LABELS,
    get_alice_observables,
    get_bob_observables,
    verify_algebraic_properties
)
from .scoring import check_round_outcome, wilson_score_interval
from .classical import (
    BASELINE_ALICE,
    BASELINE_BOB,
    evaluate_baseline_strategy,
    run_exhaustive_classical_search
)
from .circuit import (
    build_mermin_peres_circuit,
    decode_alice_response,
    decode_bob_response
)
from .schema_validator import validate_results_data, ValidationError

__all__ = [
    "ALICE_OBSERVABLE_GRID",
    "OBSERVABLE_LABELS",
    "get_alice_observables",
    "get_bob_observables",
    "verify_algebraic_properties",
    "check_round_outcome",
    "wilson_score_interval",
    "BASELINE_ALICE",
    "BASELINE_BOB",
    "evaluate_baseline_strategy",
    "run_exhaustive_classical_search",
    "build_mermin_peres_circuit",
    "decode_alice_response",
    "decode_bob_response",
    "validate_results_data",
    "ValidationError"
]

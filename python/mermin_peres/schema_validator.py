"""Validation of Mermin-Peres experiment result JSON files.

Enforces Qollab rules:
- Must have valid schema_version ("1.0.0").
- Must have legitimate source_type ("ibm_hardware" or "qiskit_aer").
- Aer data cannot have an IBM job ID or claim real hardware.
- Exactly 9 contexts (0..2, 0..2) must be present.
- Counts and shot totals must match.
"""

from typing import Dict, Any, Tuple
from .scoring import check_round_outcome


class ValidationError(Exception):
    """Raised when result data fails validation."""
    pass


def validate_results_data(data: Dict[str, Any]) -> Tuple[bool, str]:
    """Validate result structure and internal statistical consistency.
    
    Returns (True, "Valid") on success or raises ValidationError.
    """
    if not isinstance(data, dict):
        raise ValidationError("Result data must be a JSON object.")

    # Schema version
    if data.get("schema_version") != "1.0.0":
        raise ValidationError(f"Unsupported schema_version: {data.get('schema_version')}. Expected '1.0.0'.")

    # Source type
    source_type = data.get("source_type")
    if source_type not in ("ibm_hardware", "qiskit_aer"):
        raise ValidationError(f"Invalid source_type: {source_type}. Must be 'ibm_hardware' or 'qiskit_aer'.")

    backend_name = data.get("backend_name")
    if not backend_name or not isinstance(backend_name, str):
        raise ValidationError("backend_name must be a non-empty string.")

    ibm_job_id = data.get("ibm_job_id")
    if source_type == "qiskit_aer":
        if ibm_job_id is not None:
            raise ValidationError("qiskit_aer results must not specify an ibm_job_id.")
        if "ibm" in backend_name.lower() and "aer" not in backend_name.lower() and "sim" not in backend_name.lower():
            raise ValidationError("Aer results must not falsely claim an IBM physical backend name.")

    if source_type == "ibm_hardware":
        if not ibm_job_id or not isinstance(ibm_job_id, str):
            raise ValidationError("ibm_hardware results must include a valid ibm_job_id.")

    # Contexts
    contexts = data.get("contexts")
    if not isinstance(contexts, list) or len(contexts) != 9:
        raise ValidationError("Results must contain exactly 9 context items.")

    seen_pairs = set()
    total_shots = 0
    total_wins = 0

    for idx, ctx in enumerate(contexts):
        row = ctx.get("row")
        col = ctx.get("column")
        if row not in (0, 1, 2) or col not in (0, 1, 2):
            raise ValidationError(f"Context #{idx} has invalid row {row} or column {col}.")
        pair = (row, col)
        if pair in seen_pairs:
            raise ValidationError(f"Duplicate context pair (row {row}, col {col}).")
        seen_pairs.add(pair)

        shots = ctx.get("shots")
        wins = ctx.get("wins")
        win_rate = ctx.get("win_rate")
        counts = ctx.get("counts")

        if not isinstance(shots, int) or shots < 1:
            raise ValidationError(f"Context {pair} shots must be a positive integer.")
        if not isinstance(wins, int) or wins < 0 or wins > shots:
            raise ValidationError(f"Context {pair} wins must be between 0 and shots.")
        if not isinstance(counts, list) or len(counts) == 0:
            raise ValidationError(f"Context {pair} must have a non-empty counts list.")

        # Check count items
        sum_counts = 0
        sum_wins = 0
        for item in counts:
            c = item.get("count", 0)
            sum_counts += c
            a_bits = item.get("alice_bits")
            b_bits = item.get("bob_bits")
            if not isinstance(a_bits, list) or len(a_bits) != 3:
                raise ValidationError(f"Invalid alice_bits in context {pair}.")
            if not isinstance(b_bits, list) or len(b_bits) != 3:
                raise ValidationError(f"Invalid bob_bits in context {pair}.")

            outcome = check_round_outcome(row, col, a_bits, b_bits)
            if item.get("win") != outcome["win"]:
                raise ValidationError(f"Win mismatch in context {pair} counts.")
            if outcome["win"]:
                sum_wins += c

        if sum_counts != shots:
            raise ValidationError(f"Context {pair} counts sum ({sum_counts}) does not match shots ({shots}).")
        if sum_wins != wins:
            raise ValidationError(f"Context {pair} calculated wins ({sum_wins}) does not match wins field ({wins}).")

        expected_rate = round(wins / shots, 4)
        if round(win_rate, 2) != round(expected_rate, 2):
            raise ValidationError(f"Context {pair} win_rate ({win_rate}) inconsistent with wins/shots ({expected_rate}).")

        total_shots += shots
        total_wins += wins

    # Summary check
    summary = data.get("summary")
    if not isinstance(summary, dict):
        raise ValidationError("Missing summary object.")
    if summary.get("total_shots") != total_shots:
        raise ValidationError("summary.total_shots does not match sum of context shots.")
    if summary.get("total_wins") != total_wins:
        raise ValidationError("summary.total_wins does not match sum of context wins.")

    return True, "Valid"

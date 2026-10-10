"""Unit tests for the lean Qollab runner and submission package.

Verifies:
1. All 9 circuits are submitted in exactly ONE backend.run(...) call.
2. Two-register space-separated count key decoding ('cb ca') works correctly.
3. Scoring produces 100% wins on noiseless quantum execution.
"""

import sys
import os
from unittest.mock import MagicMock
import pytest
from qiskit.providers.basic_provider import BasicProvider

# Add qollab directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../qollab")))

from circuit import (
    build_mermin_peres_circuit,
    decode_raw_bitstring,
    decode_alice_response,
    decode_bob_response,
)
from scoring import check_round_outcome, wilson_score_interval
from main import run_experiment, main


def test_qollab_single_batch_backend_run():
    """Verify backend.run is called exactly once with a list of 9 circuits."""
    mock_backend = MagicMock()
    mock_job = MagicMock()
    mock_result = MagicMock()

    # Configure mock result to return sample counts for 9 circuits
    # Context 0: '00 00' -> bob=[0,0], alice=[0,0]
    # For r=0, c=0: q_a0=0, q_a1=0, q_b0=0, q_b1=0
    # alice = [1, 1, 0], bob = [1, 0, 0] -> crossing a[0]=1, b[0]=1 -> match
    mock_counts = {"00 00": 100}
    mock_result.get_counts.side_effect = lambda idx: mock_counts
    mock_job.result.return_value = mock_result
    mock_backend.run.return_value = mock_job
    mock_backend.name = "mock_qollab_backend"

    results = run_experiment(backend=mock_backend, shots=100)

    # Must be called exactly once
    assert mock_backend.run.call_count == 1
    call_args, call_kwargs = mock_backend.run.call_args
    submitted_circuits = call_args[0]
    assert len(submitted_circuits) == 9
    assert call_kwargs.get("shots") == 100
    assert len(results["contexts"]) == 9


def test_qollab_two_register_decoding():
    """Verify bit decoding for space-separated classical registers ('cb ca')."""
    # Suppose cb='10' (cb1=1, cb0=0), ca='01' (ca1=0, ca0=1)
    bitstring = "10 01"
    q_a0, q_a1, q_b0, q_b1 = decode_raw_bitstring(bitstring)
    assert q_a0 == 1
    assert q_a1 == 0
    assert q_b0 == 0
    assert q_b1 == 1

    # Verify Alice decoding on row 0:
    # row 0: b0 = q0 ^ 1 = 0, b1 = q1 ^ 1 = 1, b2 = b0 ^ b1 = 1 -> [0, 1, 1]
    alice_bits = decode_alice_response(0, q_a0, q_a1)
    assert alice_bits == [0, 1, 1]
    assert (alice_bits[0] ^ alice_bits[1] ^ alice_bits[2]) == 0  # Even parity

    # Verify Bob decoding on col 0:
    # col 0: b0 = q0 ^ 1 = 1, b1 = q1 = 1, b2 = b0 ^ b1 ^ 1 = 1 -> [1, 1, 1]
    bob_bits = decode_bob_response(0, q_b0, q_b1)
    assert (bob_bits[0] ^ bob_bits[1] ^ bob_bits[2]) == 1  # Odd parity


def test_qollab_runner_with_core_qiskit_simulator(capsys):
    """Run full Qollab main() using BasicSimulator and verify 100% win rate."""
    backend = BasicProvider().get_backend("basic_simulator")
    main(shots=50, backend=backend)
    captured = capsys.readouterr().out

    assert "ISAI: THE 8/9 DUET" in captured
    assert "QOLLAB SIMULATOR OUTPUT" in captured
    assert "100.00%" in captured
    assert "9/9" in captured


def test_qollab_zip_file_constraints():
    """Verify that qollab_submission.zip exists, has <= 100 files, and no file > 2MB."""
    import zipfile
    zip_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../qollab_submission.zip"))
    assert os.path.exists(zip_path), "qollab_submission.zip does not exist"

    with zipfile.ZipFile(zip_path, "r") as zf:
        infolist = zf.infolist()
        assert 1 <= len(infolist) <= 100, f"Expected 1..100 files, found {len(infolist)}"
        filenames = {info.filename for info in infolist}
        assert "main.py" in filenames
        assert "circuit.py" in filenames
        assert "scoring.py" in filenames
        for info in infolist:
            assert info.file_size <= 2 * 1024 * 1024, f"{info.filename} exceeds 2MB limit"


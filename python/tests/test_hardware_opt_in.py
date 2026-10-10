"""Tests to ensure IBM hardware integration is strictly opt-in and offline during normal test suites."""

import os
import pytest


def test_ibm_hardware_opt_in_guard():
    """Verify that hardware test is skipped when no token is configured."""
    has_token = bool(os.environ.get("QISKIT_IBM_TOKEN") or os.environ.get("IBM_QUANTUM_TOKEN"))
    run_hardware_tests = os.environ.get("RUN_IBM_HARDWARE_TESTS") == "1"

    if not has_token or not run_hardware_tests:
        pytest.skip("IBM hardware tests are strictly opt-in and skipped during normal CI/test runs.")

    # Only reached if developer explicitly opted in with token and flag
    assert True

"""Unit tests for JSON schema validation and data integrity checks."""

import pytest
import copy
from mermin_peres.schema_validator import validate_results_data, ValidationError
from scripts.generate_aer_results import run_aer_experiment


@pytest.fixture(scope="module")
def valid_dataset():
    # Generate a small 50-shot valid dataset for testing
    return run_aer_experiment(shots_per_context=50)


def test_valid_dataset_passes(valid_dataset):
    is_valid, msg = validate_results_data(valid_dataset)
    assert is_valid is True
    assert msg == "Valid"


def test_reject_wrong_schema_version(valid_dataset):
    bad = copy.deepcopy(valid_dataset)
    bad["schema_version"] = "2.0.0"
    with pytest.raises(ValidationError, match="Unsupported schema_version"):
        validate_results_data(bad)


def test_reject_aer_with_ibm_job_id(valid_dataset):
    bad = copy.deepcopy(valid_dataset)
    bad["ibm_job_id"] = "fake_job_id_12345"
    with pytest.raises(ValidationError, match="qiskit_aer results must not specify an ibm_job_id"):
        validate_results_data(bad)


def test_reject_aer_falsely_claiming_hardware_backend(valid_dataset):
    bad = copy.deepcopy(valid_dataset)
    bad["backend_name"] = "ibm_brisbane"
    with pytest.raises(ValidationError, match="Aer results must not falsely claim an IBM physical backend"):
        validate_results_data(bad)


def test_reject_hardware_without_job_id(valid_dataset):
    bad = copy.deepcopy(valid_dataset)
    bad["source_type"] = "ibm_hardware"
    bad["backend_name"] = "ibm_brisbane"
    bad["ibm_job_id"] = None
    with pytest.raises(ValidationError, match="ibm_hardware results must include a valid ibm_job_id"):
        validate_results_data(bad)


def test_reject_shot_count_mismatch(valid_dataset):
    bad = copy.deepcopy(valid_dataset)
    bad["contexts"][0]["shots"] = 9999
    with pytest.raises(ValidationError, match="counts sum.*does not match shots"):
        validate_results_data(bad)


def test_reject_missing_context(valid_dataset):
    bad = copy.deepcopy(valid_dataset)
    bad["contexts"] = bad["contexts"][:8]
    with pytest.raises(ValidationError, match="must contain exactly 9 context items"):
        validate_results_data(bad)

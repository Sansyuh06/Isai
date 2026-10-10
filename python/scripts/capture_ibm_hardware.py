#!/usr/bin/env python3
"""Local-only IBM Quantum Hardware Capture Tool for The 8/9 Duet.

IMPORTANT SECURITY & COMPLIANCE RULES:
1. This tool is LOCAL ONLY and kept outside the web bundle.
2. Reads credentials strictly from environment variables (e.g. QISKIT_IBM_TOKEN).
   NEVER commits or hardcodes any API tokens.
3. Uses the modern official Qiskit 1.x / IBM Runtime SamplerV2 workflow.
4. Queries genuine physical IBM quantum backends (non-simulator, operational, >= 4 qubits).
5. If no credentials exist, exits with clear instructions. Never fakes hardware results.
"""

import os
import sys
import json
import argparse
from datetime import datetime, timezone
from collections import Counter

# Ensure python directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler  # noqa: E402
    from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager  # noqa: E402
except ImportError as e:
    print(f"Error: Required packages missing. Please install qiskit and qiskit-ibm-runtime.\nDetails: {e}")
    sys.exit(1)

from mermin_peres.circuit import (  # noqa: E402
    build_mermin_peres_circuit,
    decode_alice_response,
    decode_bob_response
)
from mermin_peres.scoring import check_round_outcome, wilson_score_interval  # noqa: E402
from mermin_peres.schema_validator import validate_results_data  # noqa: E402


def get_authenticated_service() -> QiskitRuntimeService:
    token = os.environ.get("QISKIT_IBM_TOKEN") or os.environ.get("IBM_QUANTUM_TOKEN")
    instance = os.environ.get("QISKIT_IBM_INSTANCE", "ibm-q/open/main")
    
    try:
        if token:
            print("[Auth] Authenticating via environment token...")
            return QiskitRuntimeService(channel="ibm_quantum", token=token, instance=instance)
        else:
            print("[Auth] Checking locally saved Qiskit IBM credentials...")
            return QiskitRuntimeService(channel="ibm_quantum")
    except Exception:
        print("\n" + "="*70)
        print("ERROR: IBM Quantum credentials not found or invalid.")
        print("="*70)
        print("To run this hardware capture tool on real IBM Quantum QPUs:")
        print("1. Get your API token from https://quantum.ibm.com")
        print("2. Set the environment variable in your terminal:")
        print("   Windows PowerShell:  $env:QISKIT_IBM_TOKEN=\"your_token_here\"")
        print("   Linux/macOS bash:    export QISKIT_IBM_TOKEN=\"your_token_here\"")
        print("3. Re-run this script.")
        print("\nNotice: The hosted application never requires an API key and operates")
        print("strictly on bundled or imported static JSON data.")
        print("="*70 + "\n")
        sys.exit(1)


def select_physical_backend(service: QiskitRuntimeService, preferred_backend: str = None):
    if preferred_backend:
        backend = service.backend(preferred_backend)
        if backend.simulator:
            raise ValueError(f"Backend '{preferred_backend}' is a simulator, not real hardware.")
        return backend

    print("[Hardware] Searching for operational physical IBM quantum backends (>= 4 qubits)...")
    backends = service.backends(simulator=False, operational=True, min_num_qubits=4)
    if not backends:
        raise RuntimeError("No operational physical IBM backends found for your account tier.")

    # Sort by queue length to pick the least busy device
    sorted_backends = sorted(backends, key=lambda b: getattr(b.status(), "pending_jobs", 9999))
    chosen = sorted_backends[0]
    print(f"[Hardware] Selected backend: {chosen.name} (qubits: {chosen.num_qubits}, pending jobs: {chosen.status().pending_jobs})")
    return chosen


def capture_hardware_run(shots_per_context: int = 1024, preferred_backend: str = None, output_file: str = None):
    service = get_authenticated_service()
    backend = select_physical_backend(service, preferred_backend)

    print(f"\n[Transpilation] Generating preset pass manager for backend {backend.name}...")
    pm = generate_preset_pass_manager(backend=backend, optimization_level=1)

    circuits = []
    meta = []
    for r in range(3):
        for c in range(3):
            qc = build_mermin_peres_circuit(r, c)
            transpiled = pm.run(qc)
            circuits.append(transpiled)
            meta.append((r, c))

    print(f"[Execution] Submitting batch of 9 Mermin-Peres contexts ({shots_per_context} shots each) to {backend.name}...")
    sampler = Sampler(mode=backend)
    
    # Pack into Primitive Unified Blocs (PUBs)
    pubs = [(circ, None, shots_per_context) for circ in circuits]
    job = sampler.run(pubs)
    job_id = job.job_id()
    print(f"[IBM Job] Job submitted! IBM Job ID: {job_id}")
    print("[IBM Job] Waiting for QPU completion (this may take several minutes depending on queue)...")
    
    results = job.result()
    print("[IBM Job] Execution complete! Processing hardware bitstrings...")

    contexts_data = []
    total_shots = 0
    total_wins = 0

    for idx, (r, c) in enumerate(meta):
        pub_result = results[idx]
        # Data contains c_alice and c_bob bit arrays
        c_alice_data = pub_result.data.c_alice.get_bitstrings()
        c_bob_data = pub_result.data.c_bob.get_bitstrings()

        counter = Counter()
        for a_str, b_str in zip(c_alice_data, c_bob_data):
            # Reverse for little-endian: bit 0 is rightmost in bitstring
            qa0 = int(a_str[-1])
            qa1 = int(a_str[-2])
            qb0 = int(b_str[-1])
            qb1 = int(b_str[-2])

            alice_bits = tuple(decode_alice_response(r, qa0, qa1))
            bob_bits = tuple(decode_bob_response(c, qb0, qb1))
            counter[(alice_bits, bob_bits)] += 1

        context_shots = 0
        context_wins = 0
        alice_parity_valid = 0
        bob_parity_valid = 0
        shared_matches = 0
        counts_list = []

        for (a_bits, b_bits), cnt in counter.items():
            context_shots += cnt
            eval_res = check_round_outcome(r, c, list(a_bits), list(b_bits))
            if eval_res["alice_parity_even"]:
                alice_parity_valid += cnt
            if eval_res["bob_parity_odd"]:
                bob_parity_valid += cnt
            if eval_res["shared_match"]:
                shared_matches += cnt
            if eval_res["win"]:
                context_wins += cnt

            counts_list.append({
                "alice_bits": list(a_bits),
                "bob_bits": list(b_bits),
                "count": cnt,
                "win": eval_res["win"],
                "alice_parity_even": eval_res["alice_parity_even"],
                "bob_parity_odd": eval_res["bob_parity_odd"],
                "shared_match": eval_res["shared_match"]
            })

        win_rate = round(context_wins / context_shots, 4)
        ci = wilson_score_interval(context_wins, context_shots)

        contexts_data.append({
            "row": r,
            "column": c,
            "shots": context_shots,
            "wins": context_wins,
            "win_rate": win_rate,
            "confidence_interval_95": [ci[0], ci[1]],
            "alice_parity_valid_count": alice_parity_valid,
            "bob_parity_valid_count": bob_parity_valid,
            "shared_cell_match_count": shared_matches,
            "counts": counts_list
        })

        total_shots += context_shots
        total_wins += context_wins
        print(f"  Context ({r+1}, {c+1}): {context_wins}/{context_shots} ({win_rate*100:.1f}%)")

    overall_rate = round(total_wins / total_shots, 4)
    overall_ci = wilson_score_interval(total_wins, total_shots)

    payload = {
        "schema_version": "1.0.0",
        "source_type": "ibm_hardware",
        "backend_name": backend.name,
        "ibm_job_id": job_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "shots_per_context": shots_per_context,
        "contexts": contexts_data,
        "summary": {
            "total_shots": total_shots,
            "total_wins": total_wins,
            "overall_win_rate": overall_rate,
            "confidence_interval_95": [overall_ci[0], overall_ci[1]]
        }
    }

    validate_results_data(payload)
    print("\n[Validation] Hardware dataset validated successfully against schema!")

    if not output_file:
        output_file = os.path.join(os.path.dirname(__file__), "..", "data", f"ibm_hardware_{backend.name}_{job_id[:8]}.json")

    os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(f"[Done] Hardware run saved to: {os.path.abspath(output_file)}")
    print("To inspect this run in the web app, copy it to src/data/recordedIbmData.json")
    print("or use the in-page 'Import Hardware Run' button.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Capture genuine IBM quantum hardware run for The 8/9 Duet.")
    parser.add_argument("--shots", type=int, default=1024, help="Shots per context (default: 1024)")
    parser.add_argument("--backend", type=str, default=None, help="Specific IBM physical backend name")
    parser.add_argument("--out", type=str, default=None, help="Output JSON filepath")
    args = parser.parse_args()

    capture_hardware_run(shots_per_context=args.shots, preferred_backend=args.backend, output_file=args.out)

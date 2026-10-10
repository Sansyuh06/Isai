"""Root-level proxy for python.scripts.generate_aer_results.

Allows running:
    python -m scripts.generate_aer_results
directly from the repository root.
"""

import sys
import os

# Ensure repository root and python directory are in sys.path
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
python_dir = os.path.join(repo_root, "python")
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)
if python_dir not in sys.path:
    sys.path.insert(0, python_dir)

from python.scripts.generate_aer_results import *
from python.scripts.generate_aer_results import main, run_aer_experiment

if __name__ == "__main__":
    main()

"""Root-level entry point to generate Aer noisy benchmark fixture."""

import sys
import os

repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
python_dir = os.path.join(repo_root, "python")
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)
if python_dir not in sys.path:
    sys.path.insert(0, python_dir)

from python.scripts.generate_aer_noise_fixture import main

if __name__ == "__main__":
    main()

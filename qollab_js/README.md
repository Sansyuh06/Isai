# Isai — the Mermin–Peres magic square, live on Qollab

This effort is supported by Qollab & IonQ.

Isai is a two-player game built on the Mermin–Peres magic square: two silent players share two Bell pairs, each is prompted a row (Alice) or column (Bob), and they must answer with three bits whose parities differ while agreeing on the shared cell. Any classical strategy wins at most 8 of the 9 row–column contexts; the entangled quantum strategy wins all 9. The full Isai app turns those outcomes into music — this Qollab project is the playable physics core of that app.

What it does: pressing Run builds the nine context circuits (two |Phi+> Bell pairs plus each player's local basis rotation), submits them in exactly one backend.run() call to the Qollab-injected simulator, decodes the counts into game rounds, and shows per-context win rates with 95% Wilson intervals. A slider adds a browser-side noise overlay (independent classical bit flips at probability p) to the returned counts so you can watch the quantum advantage erode; it is post-processing of simulator counts and is labelled as such — it is not hardware noise.

How to run: open the project, pick any free simulator (Qiskit BasicSimulator works well), set shots per context (100–10000), press "Run 9 contexts (one job)". The table and bars show wins per context; at p = 0 all nine contexts win, beating the classical 8/9 ceiling.

Honest scope and provenance: everything here runs on simulators — no QPU hardware is claimed. This is a demonstration of a known quantum result (the magic-square game), not a new one. The Isai repository (game, audio identity, tutorial, Aer and recorded-IBM comparisons) predates the hackathon build window and is the prior work this project ports; the Qollab JS frontend itself was built during the window. The full app lives at the repository linked on the project card; a separately hosted build will be linked once publicly available.

How to install on Qollab: Qollab's JS project is exactly 3 panes (JS/Qiskit, HTML, CSS), so this folder ships the paste-ready trio: main.js (self-contained; it is generated — do not edit), index.html, main.css. Create a project with the "JS / Qiskit wrapper" shape (or "Upload your own files" with the 5-file ZIP, which also carries this README and LICENSE) and paste each file into its pane. No "Extra runtime features" are needed — Qiskit Visualizations and the other libraries are optional and unused here.

How to extend: the game logic is pure (no Qiskit, no DOM) in qollab_js/logic.js and the UI in qollab_js/ui.js; edit those sources, run `node tools/build_qollab_main.mjs` to regenerate main.js, and `node --test tests/qollab-node-tests.mjs` to verify (the test suite fails if the paste file is stale). Change scoring, add noise models, or port more of the app's Acts in logic.js; main.js maps the instruction tables onto Qiskit gates and renders results.

License: MIT (see LICENSE), Copyright (c) 2026 Akash Santhnu Sundar. Built with Qiskit 2.x exported to JS by Qollab; no external packages, no network calls, no secrets.

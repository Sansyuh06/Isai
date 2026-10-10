// Build the single self-contained paste file for Qollab's 3-pane JS project.
// Qollab JS projects support only main.js / index.html / main.css, so this
// inlines qollab_js/logic.js (export keywords stripped, imports removed) and
// qollab_js/ui.js into qollab_js/main.js. Run from the repo root:
//   node tools/build_qollab_main.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

// Remove static import statements and `export ` keywords; the bundle wires
// everything together in one module scope instead.
function strip(src) {
  return src
    .replace(/^[ \t]*import\s*\{[^}]*\}\s*from\s*['"][^'"]+['"];?[ \t]*\r?\n/gm, '')
    .replace(/^[ \t]*import\s*\*\s*as\s+\w+\s+from\s*['"][^'"]+['"];?[ \t]*\r?\n/gm, '')
    .replace(/^export\s+/gm, '');
}

export function buildBundle() {
  const logic = readFileSync(path.join(root, 'qollab_js', 'logic.js'), 'utf8');
  const ui = readFileSync(path.join(root, 'qollab_js', 'ui.js'), 'utf8');
  const header = [
    '// Isai on Qollab — the Mermin-Peres magic square, playable in 3 files.',
    '// GENERATED FILE: built by tools/build_qollab_main.mjs from',
    '// qollab_js/logic.js + qollab_js/ui.js. Edit the sources and rebuild;',
    '// this file is checked against the build output by the Node test suite.',
    "// NOTE: 'backend' is pre-created as a global variable by Qollab.",
    '',
    "import { QuantumCircuit } from 'qiskit';",
    '',
    '// ---------------- begin bundled pure logic (mirrors logic.js) --------------',
  ].join('\n');
  const parts = [
    header,
    strip(logic).trim(),
    '',
    '// ---------------- end bundled pure logic ----------------',
    '',
    strip(ui).trim(),
    '',
  ];
  return parts.join('\n').replace(/\n{3,}/g, '\n\n');
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const out = path.join(root, 'qollab_js', 'main.js');
  writeFileSync(out, buildBundle());
  console.log(`wrote ${out} (${buildBundle().split('\n').length} lines)`);
}

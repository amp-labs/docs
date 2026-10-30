// Captures a credential flow with agent-browser: for each step, a screenshot
// before and after the action plus the target's box, written to manifest.json.
//
// tsx .claude/skills/recording-provider-guides/scripts/capture.ts <flow.json> <outDir> key=value...
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

interface Step {
  // The guide's step number this shows; defaults to the step's position.
  number?: number;
  caption: string;
  target: string;
  action: 'click' | 'fill' | 'select' | 'none';
  value?: string;
  // A selector that must exist after the action. A replay that fails here
  // means the UI changed and the guide's steps need a look.
  expect?: string;
}

interface Flow {
  name: string;
  viewport: { width: number; height: number };
  start: string;
  // Selectors for anything secret (client secrets, API keys, emails). Each
  // match is covered with an opaque block before every screenshot.
  mask?: string[];
  steps: Step[];
}

const [flowPath, outArg, ...vars] = process.argv.slice(2);
if (!flowPath || !outArg) {
  console.error('usage: capture.ts <flow.json> <outDir> key=value...');
  process.exit(1);
}

const values = Object.fromEntries(vars.map((v) => v.split(/=(.*)/s).slice(0, 2)));
const fill = (s: string) =>
  s.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in values)) throw new Error(`missing value for {{${k}}}`);
    return values[k];
  });

const flow: Flow = JSON.parse(fill(readFileSync(flowPath, 'utf8')));
const outDir = resolve(outArg);
mkdirSync(outDir, { recursive: true });

const session = process.env.AGENT_BROWSER_SESSION;
if (!session) throw new Error('set AGENT_BROWSER_SESSION to a signed-in agent-browser session');

function ab(...args: string[]): any {
  const out = execFileSync('agent-browser', ['--session', session!, '--restore', '--json', ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const res = JSON.parse(out);
  // Only the command name: arguments can hold typed values.
  if (!res.success) throw new Error(`agent-browser ${args[0]}: ${res.error}`);
  return res.data;
}

const settle = () => {
  ab('wait', '--load', 'networkidle');
  ab('wait', '600');
};

// `wait <selector>` ignores xpath=, so poll `get box`, which accepts it.
function boxOf(selector: string) {
  for (let tries = 0; ; tries++) {
    try {
      return ab('get', 'box', selector);
    } catch (err) {
      if (tries === 20) throw err;
      ab('wait', '500');
    }
  }
}

// Masks are re-applied before every screenshot because navigation drops them.
const MASK_STYLE = `{ color: transparent !important; background: #3a3a3a !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; border-radius: 4px; }`;
function screenshot(path: string) {
  const masks = flow.mask ?? [];
  if (masks.length) {
    const css = masks.map((m) => `${m} ${MASK_STYLE} ${m} * { visibility: hidden !important; }`).join('\n');
    ab('eval', `(() => {
      let s = document.getElementById('__mask');
      if (!s) { s = document.createElement('style'); s.id = '__mask'; document.head.append(s); }
      s.textContent = ${JSON.stringify(css)};
    })()`);
  }
  ab('screenshot', path);
}

ab('set', 'viewport', String(flow.viewport.width), String(flow.viewport.height), '2');
ab('open', flow.start);
ab('wait', '--load', 'networkidle');

const steps = flow.steps.map((step, i) => {
  const n = String(i + 1).padStart(2, '0');
  boxOf(step.target);
  ab('scrollintoview', step.target);
  settle();
  const { x, y, width, height } = boxOf(step.target);
  const before = `${n}-before.png`;
  screenshot(join(outDir, before));

  if (step.action === 'click') ab('click', step.target);
  if (step.action === 'fill') ab('fill', step.target, step.value!);
  if (step.action === 'select') {
    ab('click', step.target);
    ab('keyboard', 'type', step.value!);
    settle();
    ab('press', 'Enter');
  }
  settle();
  if (step.expect) boxOf(step.expect);

  const after = `${n}-after.png`;
  screenshot(join(outDir, after));
  console.log(`${n} ${step.caption}`);
  return { number: step.number ?? i + 1, caption: step.caption, action: step.action, box: { x, y, width, height }, before, after };
});

writeFileSync(
  join(outDir, 'manifest.json'),
  JSON.stringify({ flow: flow.name, viewport: flow.viewport, steps }, null, 2) + '\n',
);

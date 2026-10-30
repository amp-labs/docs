// Replays a flow in a signed-in agent-browser session, screenshots each step,
// and renders an MP4 that zooms to each target with the step's caption below.
//
// AGENT_BROWSER_SESSION=<session> npx tsx record.ts <flow.json> <out.mp4> key=value...
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

interface Step {
  number: number;
  caption: string;
  target: string;
  action: 'click' | 'fill' | 'select' | 'none';
  value?: string;
  // Must exist after the action, so a changed UI fails the run.
  expect?: string;
}

const [flowPath, outArg, ...vars] = process.argv.slice(2);
const session = process.env.AGENT_BROWSER_SESSION;
if (!flowPath || !outArg || !session) {
  console.error('usage: AGENT_BROWSER_SESSION=<session> record.ts <flow.json> <out.mp4> key=value...');
  process.exit(1);
}

const values = Object.fromEntries(vars.map((v) => v.split(/=(.*)/s).slice(0, 2)));
const flow: {
  viewport: { width: number; height: number };
  start: string;
  // Selectors for secrets, emails and account names, covered before every screenshot.
  mask?: string[];
  steps: Step[];
} = JSON.parse(
  readFileSync(flowPath, 'utf8').replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in values)) throw new Error(`missing value for {{${k}}}`);
    return values[k];
  }),
);
const dir = mkdtempSync(join(tmpdir(), 'recording-'));

function ab(...args: string[]): any {
  const out = execFileSync('agent-browser', ['--session', session!, '--restore', '--json', ...args], { encoding: 'utf8' });
  const res = JSON.parse(out);
  // Only the command name: arguments can hold typed values.
  if (!res.success) throw new Error(`agent-browser ${args[0]}: ${res.error}`);
  return res.data;
}
const settle = () => (ab('wait', '--load', 'networkidle'), ab('wait', '600'));
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

// Navigation drops injected styles, so the mask goes on before every screenshot.
function screenshot(name: string) {
  const css = (flow.mask ?? [])
    .map((m) => `${m} { background: #3a3a3a !important; color: transparent !important; -webkit-text-fill-color: transparent !important; } ${m} * { visibility: hidden !important; }`)
    .join('\n');
  if (css) {
    ab('eval', `(() => {
      const s = document.getElementById('__mask') ?? document.head.appendChild(Object.assign(document.createElement('style'), { id: '__mask' }));
      s.textContent = ${JSON.stringify(css)};
    })()`);
  }
  ab('screenshot', join(dir, name));
}

// Capture: a screenshot before and after each action, plus the target's box.
ab('set', 'viewport', String(flow.viewport.width), String(flow.viewport.height), '2');
ab('open', flow.start);
settle();
const shots = flow.steps.map((step, i) => {
  boxOf(step.target);
  ab('scrollintoview', step.target);
  settle();
  const box = boxOf(step.target);
  screenshot(`${i}-before.png`);
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
  screenshot(`${i}-after.png`);
  console.log(`${step.number} ${step.caption}`);
  return { ...step, box };
});

// Build the HyperFrames composition: cursor moves to the target, a ring marks
// it, then the "after" screenshot replaces the "before" one.
const W = flow.viewport.width;
const SH = flow.viewport.height;
const CAPTION_H = 96;
const STEP = 2.6;
const MOVE = 0.9;
const CLICK = 1.1;
// Docs show videos about 690px wide; zooming keeps 14px UI text readable there.
const ZOOM = 1.5;

const bold = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const stage: string[] = [];
const captions: string[] = [];
const tweens: string[] = [];
let cursor = { x: W / 2, y: SH / 2 };
let cam = { x: 0, y: 0, scale: 1 };
tweens.push(`tl.set("#cursor", { x: ${cursor.x}, y: ${cursor.y} }, 0);`);

shots.forEach((step, i) => {
  const t0 = i * STEP;
  const { x, y, width, height } = step.box;
  const target = { x: Math.round(x + width / 2), y: Math.round(y + height / 2) };
  // The ring stays only on the "before" shot, since the action can move the layout.
  const ringFor = step.action === 'none' ? STEP : CLICK;
  stage.push(
    `<img id="b${i}" class="clip shot" src="${i}-before.png" data-start="${t0}" data-duration="${CLICK}" data-track-index="0" />`,
    `<img id="a${i}" class="clip shot" src="${i}-after.png" data-start="${t0 + CLICK}" data-duration="${STEP - CLICK}" data-track-index="0" />`,
    `<div id="r${i}" class="clip ring" data-start="${t0}" data-duration="${ringFor}" data-track-index="1" style="left:${x - 6}px;top:${y - 6}px;width:${width + 12}px;height:${height + 12}px"></div>`,
  );
  captions.push(
    `<div id="c${i}" class="clip caption" data-start="${t0}" data-duration="${STEP}" data-track-index="2"><span class="num">${step.number}</span><span>${bold(step.caption)}</span></div>`,
  );
  // The first step stays wide so the reader sees where they are.
  const next =
    i === 0
      ? cam
      : {
          x: Math.round(clamp(W / 2 - target.x * ZOOM, W - W * ZOOM, 0)),
          y: Math.round(clamp(SH / 2 - target.y * ZOOM, SH - SH * ZOOM, 0)),
          scale: ZOOM,
        };
  tweens.push(
    `tl.fromTo("#r${i}", { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${t0 + MOVE - 0.3});`,
    `tl.fromTo("#cursor", { x: ${cursor.x}, y: ${cursor.y} }, { x: ${target.x}, y: ${target.y}, duration: ${MOVE}, ease: "power3.inOut" }, ${t0});`,
    `tl.fromTo("#stage", { x: ${cam.x}, y: ${cam.y}, scale: ${cam.scale} }, { x: ${next.x}, y: ${next.y}, scale: ${next.scale}, duration: ${MOVE}, ease: "power3.inOut" }, ${t0});`,
  );
  cam = next;
  cursor = target;
});

const duration = shots.length * STEP;
writeFileSync(
  join(dir, 'index.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${SH + CAPTION_H}px; overflow: hidden; background: #1f1f1f; }
      #root { position: relative; width: 100%; height: 100%; font-family: Inter, sans-serif; }
      #screen { position: absolute; width: ${W}px; height: ${SH}px; overflow: hidden; }
      #stage { position: absolute; width: ${W}px; height: ${SH}px; transform-origin: 0 0; }
      .shot { position: absolute; width: ${W}px; height: ${SH}px; }
      .ring { position: absolute; border: 3px solid #f5e663; border-radius: 10px; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.18); }
      .caption { position: absolute; top: ${SH}px; width: ${W}px; height: ${CAPTION_H}px; display: flex; align-items: center; gap: 20px; padding: 0 40px; color: #fff; font-size: 30px; }
      .num { flex: none; width: 44px; height: 44px; border-radius: 50%; background: #f5e663; color: #1f1f1f; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 24px; }
      #cursor { position: absolute; width: 0; height: 0; }
      #cursor svg { position: absolute; left: -4px; top: -2px; width: 30px; height: 30px; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${duration}" data-width="${W}" data-height="${SH + CAPTION_H}">
      <div id="screen" data-layout-allow-overflow>
        <div id="stage">
          ${stage.join('\n          ')}
          <div id="cursor"><svg viewBox="0 0 24 24"><path d="M4 2l16 9.5-7 1.6L9.6 20z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg></div>
        </div>
      </div>
      ${captions.join('\n      ')}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${tweens.join('\n      ')}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`,
);

// CRF 28 keeps UI text sharp at about a quarter of the default file size.
execFileSync('npx', ['-y', 'hyperframes@0.8.221', 'render', dir, '--quiet', '--format', 'mp4', '--crf', '28', '-o', resolve(outArg)], {
  stdio: 'inherit',
});
console.log(resolve(outArg));

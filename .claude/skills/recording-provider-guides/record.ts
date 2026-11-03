// Replays a flow in a signed-in agent-browser session, screenshots each step,
// and renders an MP4 that moves a cursor to each target.
//
// AGENT_BROWSER_SESSION=<session> npx tsx record.ts <flow.json> <out.mp4> key=value...
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

interface Step {
  // The guide step's wording. Not drawn: the guide's text sits beside the video.
  caption: string;
  target: string;
  action: 'click' | 'fill' | 'select' | 'none';
  value?: string;
  // Must exist after the action, so a changed UI fails the run.
  expect?: string;
  // Zoom in when the reader has to read something, such as a field's value.
  zoom?: boolean;
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
  // Inputs whose values must not appear in any frame, checked after rendering.
  secrets?: string[];
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

// Navigation drops the mask, so it goes on before every screenshot. Masks are
// CSS selectors or `xpath=`; each match gets a data attribute the style covers.
function screenshot(name: string) {
  if (flow.mask?.length) {
    ab('eval', `(() => {
      const css = '[data-mask] { background: #3a3a3a !important; color: transparent !important; -webkit-text-fill-color: transparent !important; } [data-mask] * { visibility: hidden !important; }';
      const s = document.getElementById('__mask') ?? document.head.appendChild(Object.assign(document.createElement('style'), { id: '__mask' }));
      s.textContent = css;
      for (const m of ${JSON.stringify(flow.mask)}) {
        const found = m.startsWith('xpath=')
          ? document.evaluate(m.slice(6), document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
          : null;
        const els = found ? Array.from({ length: found.snapshotLength }, (_, i) => found.snapshotItem(i)) : [...document.querySelectorAll(m)];
        els.forEach((el) => el.setAttribute('data-mask', ''));
      }
    })()`);
  }
  ab('screenshot', join(dir, name));
}

// Capture: a screenshot before and after each action, plus the target's box.
ab('set', 'viewport', String(flow.viewport.width), String(flow.viewport.height), '2');
ab('open', flow.start);
settle();
const secrets: string[] = (flow.secrets ?? [])
  .map((s) => ab('eval', `document.querySelector(${JSON.stringify(s)})?.value ?? ''`).result)
  .filter((v: string) => v.length >= 10);
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
  console.log(step.caption);
  return { ...step, box };
});

// The ring uses Ampersand's butter and charcoal, with square corners.
// Build the HyperFrames composition: cursor moves to the target, a ring marks
// it, then the "after" screenshot replaces the "before" one.
const W = flow.viewport.width;
const SH = flow.viewport.height;
const STEP = 2.6;
const MOVE = 0.9;
const CLICK = 1.1;
// Docs show videos about 690px wide; zooming keeps 14px UI text readable there.
const ZOOM = 1.5;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const stage: string[] = [];
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
  const next = step.zoom
    ? {
        x: Math.round(clamp(W / 2 - target.x * ZOOM, W - W * ZOOM, 0)),
        y: Math.round(clamp(SH / 2 - target.y * ZOOM, SH - SH * ZOOM, 0)),
        scale: ZOOM,
      }
    : { x: 0, y: 0, scale: 1 };
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
      html, body { width: ${W}px; height: ${SH}px; overflow: hidden; background: #2B2B2B; }
      #root { position: relative; width: 100%; height: 100%; }
      #screen { position: absolute; width: ${W}px; height: ${SH}px; overflow: hidden; }
      #stage { position: absolute; width: ${W}px; height: ${SH}px; transform-origin: 0 0; }
      .shot { position: absolute; width: ${W}px; height: ${SH}px; }
      .ring { position: absolute; border: 3px solid #F3F89B; outline: 1px solid #2B2B2B; box-shadow: 0 0 0 9999px rgba(18, 18, 18, 0.18); }
      #cursor { position: absolute; width: 0; height: 0; }
      #cursor svg { position: absolute; left: -4px; top: -2px; width: 30px; height: 30px; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${duration}" data-width="${W}" data-height="${SH}">
      <div id="screen" data-layout-allow-overflow>
        <div id="stage">
          ${stage.join('\n          ')}
          <div id="cursor"><svg viewBox="0 0 24 24"><path d="M4 2l16 9.5-7 1.6L9.6 20z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg></div>
        </div>
      </div>
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

// A mask that misses an element hides nothing, so read each secret from the
// page and search every frame for it. A match deletes the video and fails.
if (secrets.length) {
  execFileSync('ffmpeg', ['-loglevel', 'error', '-i', resolve(outArg), '-vf', 'fps=3', join(dir, 'frame-%03d.png')]);
  const frames = readdirSync(dir).filter((f) => f.startsWith('frame-'));
  const leaks = frames.filter((f) => {
    const text = execFileSync('tesseract', [join(dir, f), '-'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).replace(/\s/g, '');
    return secrets.some((s) => text.includes(s.slice(0, 10)));
  });
  if (leaks.length) {
    rmSync(resolve(outArg));
    throw new Error(`a secret shows in ${leaks.length} of ${frames.length} frames; add a mask and record again`);
  }
  console.log(`no secret found in ${frames.length} frames`);
}
console.log(resolve(outArg));

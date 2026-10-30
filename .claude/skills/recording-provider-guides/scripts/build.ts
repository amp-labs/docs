// Turns a capture's manifest.json into a HyperFrames project: each step shows
// its "before" screenshot, moves a cursor to the target, rings it, then cuts
// to the "after" screenshot. The caption sits in a strip under the screen.
//
// tsx .claude/skills/recording-provider-guides/scripts/build.ts <captureDir> <projectDir>
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [captureArg, projectArg] = process.argv.slice(2);
if (!captureArg || !projectArg) {
  console.error('usage: build.ts <captureDir> <projectDir>');
  process.exit(1);
}

interface Box { x: number; y: number; width: number; height: number }
interface Step { number: number; caption: string; action: 'click' | 'fill' | 'select' | 'none'; box: Box; before: string; after: string }
interface Manifest { viewport: { width: number; height: number }; steps: Step[] }

const captureDir = resolve(captureArg);
const projectDir = resolve(projectArg);
const manifest: Manifest = JSON.parse(readFileSync(join(captureDir, 'manifest.json'), 'utf8'));

const W = manifest.viewport.width;
const SCREEN_H = manifest.viewport.height;
const CAPTION_H = 96;
const H = SCREEN_H + CAPTION_H;

// Seconds within each step.
const STEP = 2.6;
const MOVE = 0.9; // cursor travel
const CLICK = 1.1; // press, then the screen changes
const RING_PAD = 6;
// Docs show images at most ~690px wide; zooming toward the target keeps 14px UI text readable there.
const ZOOM = 1.5;

mkdirSync(join(projectDir, 'assets'), { recursive: true });

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const bold = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const clips: string[] = [];
const tweens: string[] = [];
let cursor = { x: W / 2, y: SCREEN_H / 2 };
tweens.push(`tl.set("#cursor", { x: ${cursor.x}, y: ${cursor.y} }, 0);`);

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
// Stage offset that centres a point at ZOOM without showing past the screenshot's edges.
const camera = (p: { x: number; y: number }) => ({
  x: Math.round(clamp(W / 2 - p.x * ZOOM, W - W * ZOOM, 0)),
  y: Math.round(clamp(SCREEN_H / 2 - p.y * ZOOM, SCREEN_H - SCREEN_H * ZOOM, 0)),
});
let cam = { x: 0, y: 0, scale: 1 };

manifest.steps.forEach((step, i) => {
  const n = i + 1;
  const t0 = i * STEP;
  const { x, y, width, height } = step.box;
  const target = { x: Math.round(x + width / 2), y: Math.round(y + height / 2) };

  for (const f of [step.before, step.after]) copyFileSync(join(captureDir, f), join(projectDir, 'assets', f));

  clips.push(
    `<img id="s${n}-before" class="clip shot" src="assets/${step.before}" data-start="${t0}" data-duration="${CLICK}" data-track-index="0" />`,
    `<img id="s${n}-after" class="clip shot" src="assets/${step.after}" data-start="${t0 + CLICK}" data-duration="${STEP - CLICK}" data-track-index="0" />`,
    `<div id="s${n}-ring" class="clip ring" data-start="${t0}" data-duration="${step.action === 'none' ? STEP : CLICK}" data-track-index="1" style="left:${x - RING_PAD}px;top:${y - RING_PAD}px;width:${width + RING_PAD * 2}px;height:${height + RING_PAD * 2}px"><div class="ring-line"></div></div>`,
    `<div id="s${n}-caption" class="clip caption" data-start="${t0}" data-duration="${STEP}" data-track-index="2"><span class="num">${step.number}</span><span class="text">${bold(step.caption)}</span></div>`,
  );

  tweens.push(
    // The ring only shows on the "before" shot: the action can move the layout.
    `tl.fromTo("#s${n}-ring .ring-line", { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, ${t0 + MOVE - 0.3});`,
    `tl.fromTo("#cursor", { x: ${cursor.x}, y: ${cursor.y} }, { x: ${target.x}, y: ${target.y}, duration: ${MOVE}, ease: "power3.inOut" }, ${t0});`,
  );
  if (step.action !== 'none') {
    tweens.push(
      `tl.fromTo("#cursor-arrow", { scale: 1 }, { scale: 0.82, duration: 0.1, yoyo: true, repeat: 1, ease: "power1.inOut" }, ${t0 + CLICK - 0.2});`,
    );
  }
  // The first step stays wide so the reader sees where they are.
  const next = i === 0 ? cam : { ...camera(target), scale: ZOOM };
  tweens.push(
    `tl.fromTo("#stage", { x: ${cam.x}, y: ${cam.y}, scale: ${cam.scale} }, { x: ${next.x}, y: ${next.y}, scale: ${next.scale}, duration: ${MOVE}, ease: "power3.inOut" }, ${t0});`,
  );
  cam = next;
  cursor = target;
});

const duration = manifest.steps.length * STEP;

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      :root {
        --ground: #1f1f1f;
        --ink: #ffffff;
        --accent: #f5e663;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: var(--ground); }
      #root { position: relative; width: 100%; height: 100%; font-family: Inter, sans-serif; }
      #screen { position: absolute; left: 0; top: 0; width: ${W}px; height: ${SCREEN_H}px; overflow: hidden; }
      #stage { position: absolute; left: 0; top: 0; width: ${W}px; height: ${SCREEN_H}px; transform-origin: 0 0; }
      .shot { position: absolute; left: 0; top: 0; width: ${W}px; height: ${SCREEN_H}px; }
      .ring { position: absolute; z-index: 2; }
      .ring-line { width: 100%; height: 100%; border: 3px solid var(--accent); border-radius: 10px; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.18); }
      .caption {
        position: absolute; left: 0; top: ${SCREEN_H}px; width: ${W}px; height: ${CAPTION_H}px; z-index: 3;
        display: flex; align-items: center; gap: 20px; padding: 0 40px;
        color: var(--ink); font-size: 30px; letter-spacing: -0.01em;
      }
      .caption .num {
        flex: none; width: 44px; height: 44px; border-radius: 50%;
        background: var(--accent); color: var(--ground);
        display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 24px;
      }
      .caption strong { font-weight: 700; }
      #cursor { position: absolute; left: 0; top: 0; z-index: 4; width: 0; height: 0; }
      #cursor-arrow { position: absolute; left: -4px; top: -2px; width: 30px; height: 30px; transform-origin: 4px 2px; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${duration}" data-width="${W}" data-height="${H}">
      <div id="screen" data-layout-allow-overflow>
        <div id="stage">
          ${clips.filter((c) => !c.includes('class="clip caption"')).join('\n          ')}
          <div id="cursor">
            <svg id="cursor-arrow" viewBox="0 0 24 24"><path d="M4 2l16 9.5-7 1.6L9.6 20z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>
      ${clips.filter((c) => c.includes('class="clip caption"')).join('\n      ')}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      ${tweens.join('\n      ')}
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;

writeFileSync(join(projectDir, 'index.html'), html);
console.log(`${projectDir}/index.html: ${manifest.steps.length} steps, ${duration}s, ${W}x${H}`);

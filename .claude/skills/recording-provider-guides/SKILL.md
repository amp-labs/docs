---
name: recording-provider-guides
description: Use when a provider guide in src/provider-guides/ needs a video of its credential steps, either the Ampersand dashboard part ("Add your <Provider> app info to Ampersand") or the provider's own app or API key setup. Replays the steps in a real browser and renders an MP4 with HyperFrames.
---

# Recording provider guides

A flow is a JSON list of a guide's steps. `record.ts` replays it in a signed-in browser and renders an MP4 that zooms to each step's target with its caption below. Needs `agent-browser` and `npx`.

## Record

1. Sign in once by hand. The session keeps the login:

   ```sh
   agent-browser --session amp-dashboard --headed --restore --restore-save auto open https://dashboard.withampersand.com
   ```

2. Use a project with no provider apps, then run:

   ```sh
   AGENT_BROWSER_SESSION=amp-dashboard npx tsx .claude/skills/recording-provider-guides/record.ts \
     .claude/skills/recording-provider-guides/flows/ampersand-provider-app.json \
     src/images/provider-guides/<catalogKey>-ampersand.mp4 \
     projectId=<project ID> providerName='<Provider>'
   ```

3. Watch the MP4. Then update the guide's dashboard steps to match the template in `writing-provider-guides`, replace any old image of them (and delete its file), and add the video under the last step:

   ```mdx
   <video autoPlay muted loop playsInline className="w-full rounded-xl" src="/images/provider-guides/<catalogKey>-ampersand.mp4"></video>
   ```

## Record a provider's own steps

Copy `flows/ampersand-provider-app.json` to `flows/<catalogKey>.json`. Each step copies its guide step's `number` and wording as `caption`, and has:

- `target`: a CSS selector, or `xpath=` to match text. Prefer ids, labels and button text. Use `agent-browser snapshot -i` in a `--headed` session to find them.
- `action`: `click`, `fill`, `select` (type into a list, then Enter) or `none`.
- `expect`: an element that must appear after the step, so a changed UI fails the run.

Add a top-level `mask` list of selectors for anything secret, such as the generated Client Secret, emails and account names. They are covered before every screenshot.

Use a test account with nothing private in it, fill only placeholder values, and delete the app afterwards. A mask that stops matching hides nothing, so check every frame that shows a secret.

---
name: recording-provider-guides
description: Use when a provider guide in src/provider-guides/ needs a video of its credential steps, either the Ampersand dashboard part ("Add your <Provider> app info to Ampersand") or the provider's own app or API key setup. Replays the steps in a real browser and renders an MP4 with HyperFrames.
---

# Recording provider guides

A flow is a JSON list of a guide's steps. `record.ts` replays it in a signed-in browser and renders an MP4 that points to each step's target. The video has no captions; the guide's text beside it explains each step. Needs `agent-browser` and `npx`.

## Record

1. Sign in once by hand. The session keeps the login:

   ```sh
   agent-browser --session amp-dashboard --headed --restore --restore-save auto open https://dashboard.withampersand.com
   ```

2. Use a project with no provider apps. The flow starts on **Provider apps**, not the dashboard home page, which changes more often. Run:

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

Needs `op` (1Password CLI) and `tesseract`.

1. **Sign in.** Test accounts are in the `Sandboxes` vault of the `ampersandteam.1password.com` account. Open the provider's sign-in page in a `--headed` session, then type each field with `scripts/fill.sh`, which never prints the value:

   ```sh
   .claude/skills/recording-provider-guides/scripts/fill.sh <session> <item ID> username <selector>
   .claude/skills/recording-provider-guides/scripts/fill.sh <session> <item ID> password <selector>
   .claude/skills/recording-provider-guides/scripts/fill.sh <session> <item ID> otp <selector>   # if the item has a one-time password
   ```

2. **Keep one app per provider for recordings.** Steps after "create" usually happen inside an app, so create one once and reuse it. Stop flows before any click that creates or saves, and use `action: none` on fields the app already holds.

3. **Write `flows/<catalogKey>-<part>.json`**, splitting long setups into parts of about 6 steps. Set `start` to the page where the steps happen, not a home page that leads there: home pages change most, and every extra page is another place the flow can break. Each step copies its guide step's wording as `caption`, so each part of the video maps to a guide step, and has:
   - `target`: a CSS selector, or `xpath=` to match text. Prefer ids, labels and button text. Use `agent-browser snapshot -i` to find them.
   - `action`: `click`, `fill`, `select` (type into a list, then Enter) or `none`.
   - `expect`: an element that must appear after the step, so a changed UI fails the run.
   - `zoom: true` only where the reader must read something small, such as a field's value. Clicks on buttons and menus stay wide.

4. **Hide anything private.** At the top level of the flow:
   - `mask`: selectors (CSS or `xpath=`) for secrets, emails, account names and avatars, covered before every screenshot. Providers often repeat credentials elsewhere, such as a side menu.
   - `secrets`: selectors of inputs holding a secret, such as the Client ID. After rendering, `record.ts` searches every frame for their values and deletes the video if one shows.

5. Record with the `record.ts` command above, using the provider's session and flow. If the guide's steps no longer match the site, fix the guide.

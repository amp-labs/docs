---
name: recording-provider-guides
description: Use when a provider guide in src/provider-guides/ needs an animation of its credential steps, either the Ampersand dashboard part ("Add your <Provider> app info to Ampersand") or the provider's own app or API key setup. Records the steps in a real browser and renders an MP4, WebM and GIF with HyperFrames.
---

# Recording provider guides

A flow is a JSON list of steps. `scripts/make.sh` replays it in a signed-in browser, screenshots each step, and renders an animation that zooms to each target with the step's caption below.

Write the guide's steps first with `writing-provider-guides`. Each flow step copies its guide step's number and wording.

## Sign in

Needs `agent-browser`, `ffmpeg` and `npx`. Create one session per site and sign in by hand:

```sh
agent-browser --session amp-dashboard --headed --restore --restore-save auto open https://dashboard.withampersand.com
```

Never put passwords in a flow.

## Record the Ampersand dashboard steps

Use a project with no provider apps, so no other provider shows on the page:

```sh
AGENT_BROWSER_SESSION=amp-dashboard .claude/skills/recording-provider-guides/scripts/make.sh \
  .claude/skills/recording-provider-guides/flows/ampersand-provider-app.json \
  /tmp/provider-recordings/<catalogKey>-ampersand \
  projectId=<project ID> providerName='<Provider>'
```

## Record a provider's steps

1. Use a test account with nothing private in it.
2. Walk through the guide's steps in a `--headed` session, using `agent-browser snapshot -i` to find elements. Fix the guide if the portal changed.
3. Write `flows/<catalogKey>.json`, based on `flows/ampersand-provider-app.json`:
   - `target`: a CSS selector, or `xpath=` to match text. Prefer ids, labels and button text over generated classes.
   - `action`: `click`, `fill`, `select` (type into a combobox, then Enter) or `none`.
   - `expect`: an element that must appear after the step, so a changed UI fails the run.
   - `mask`: selectors for secrets, emails and account names. They are covered before every screenshot.
4. Run `make.sh` with that session and flow.
5. Delete the app or revoke the key.

## Before committing

- Open every screenshot in `<out>/capture/`. Confirm no secret, email or account name shows; a mask that stops matching hides nothing.
- Commit only the MP4, as `src/images/provider-guides/<catalogKey>-ampersand.mp4` or `<catalogKey>-app.mp4`, placed under the last step it shows:

  ```mdx
  <video autoPlay muted loop playsInline className="w-full rounded-xl" src="/images/provider-guides/<catalogKey>-ampersand.mp4"></video>
  ```

The GIF (690px, the docs column width) is for places video doesn't play, such as READMEs.

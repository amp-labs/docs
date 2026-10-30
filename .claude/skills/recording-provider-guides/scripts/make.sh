#!/usr/bin/env bash
# Captures a flow, builds its HyperFrames project and renders MP4, WebM and GIF.
#
# AGENT_BROWSER_SESSION=<signed-in session> \
#   .claude/skills/recording-provider-guides/scripts/make.sh <flow.json> <outDir> key=value...
set -euo pipefail

flow=$1 out=$2
shift 2
here=$(cd "$(dirname "$0")" && pwd)
name=$(basename "$out")

npx -y tsx@4.19.3 "$here/capture.ts" "$flow" "$out/capture" "$@"
npx -y tsx@4.19.3 "$here/build.ts" "$out/capture" "$out/project"

cd "$out/project"
npx -y hyperframes@0.8.221 check
npx -y hyperframes@0.8.221 render . --quiet --format mp4 -o "$out/$name.mp4"
npx -y hyperframes@0.8.221 render . --quiet --format webm -o "$out/$name.webm"

# HyperFrames' own GIF is ~6x larger; a diff palette from the MP4 keeps text sharp.
# 690px is the widest the docs content column shows an image.
ffmpeg -loglevel error -y -i "$out/$name.mp4" \
  -vf "fps=12,scale=690:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" \
  -loop 0 "$out/$name.gif"

ls -lh "$out/$name".{mp4,webm,gif}

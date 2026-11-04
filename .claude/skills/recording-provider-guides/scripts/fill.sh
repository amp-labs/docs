#!/usr/bin/env bash
# Types one 1Password field into a page element without printing it.
# fill.sh <session> <item-id> <field|otp> <selector>
set -euo pipefail
session=$1 item=$2 field=$3 selector=$4
account=ampersandteam.1password.com

if [ "$field" = otp ]; then
  value=$(op item get "$item" --account "$account" --otp)
else
  value=$(op read "op://Sandboxes/$item/$field" --account "$account")
fi

# --json output is checked for success only, so the value is never echoed.
ok=$(agent-browser --session "$session" --json fill "$selector" "$value" | jq -r '.success')
unset value
echo "fill $field: $ok"
[ "$ok" = true ]

#!/usr/bin/env bash
# Captures README screenshots via headless Chrome.
# Requires: dev server running on $BASE (default http://localhost:3000)
# Usage: bash scripts/shoot.sh

set -e

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="${BASE:-http://localhost:3000}"
OUT="public/screenshots"
mkdir -p "$OUT"

shoot() {
  local name="$1"
  local path="$2"
  local w="${3:-1440}"
  local h="${4:-900}"
  echo "→ $name ($w x $h) $path"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --window-size="$w","$h" \
    --screenshot="$OUT/$name.png" \
    --virtual-time-budget=8000 \
    --force-color-profile=srgb \
    "$BASE$path" >/dev/null 2>&1
}

# Landing — three viewport heights to capture key sections
shoot "01-landing-hero"        "/"                            1440 900
shoot "02-landing-full"        "/"                            1440 3800
# Dashboards — buy verdicts
shoot "03-dashboard-stripe"    "/dashboard/demo-stripe"       1440 3200
shoot "04-dashboard-figma"     "/dashboard/demo-figma"        1440 3200
# Dashboard — pass verdict (fraud)
shoot "05-dashboard-acme"      "/dashboard/demo-acme-batteries" 1440 3200
# Compare — two-twin debate
shoot "06-compare"             "/compare?a=demo-stripe&b=demo-figma" 1600 2200
# Share — public read-only
shoot "07-share-stripe"        "/share/demo-stripe"           1440 2400
# Reports index
shoot "08-reports-index"       "/reports"                     1440 1200
# Workspace
shoot "09-workspace"           "/dashboard"                   1440 1200

ls -la "$OUT" | tail -20
echo "done."

#!/usr/bin/env bash
# Auto-update dependencies using taze
# Called weekly by Hermes cron job
# Minor/patch updates: direct push to main if tests pass
# Major updates: create PR

set -euo pipefail

REPO_DIR="/root/repos/bandwithme"
cd "$REPO_DIR"

export PATH="/root/.local/share/pnpm/bin:$PATH"

# Fetch latest
git fetch origin main

# Only proceed if we're on main and clean
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Not on main branch, skipping"
  exit 0
fi

if ! git diff --quiet; then
  echo "Working tree dirty, skipping"
  exit 0
fi

git pull origin main

# taze maturity period: 1 Tag Cooldown für neue Releases
MATURITY="--maturity-period 1"

# Phase 1: Minor + Patch Updates (direkt auf main)
echo "=== Phase 1: Minor/Patch Updates ==="
pnpm taze minor --include-dependencies --write $MATURITY 2>&1 || true

if ! git diff --quiet pnpm-lock.yaml package.json; then
  echo "=== Updates found, running tests ==="
  git add pnpm-lock.yaml package.json
  git commit -m "chore: update dependencies (auto)

Automated minor/patch update via taze.
Maturity: 1 day. Only minor and patch versions.

Assisted-By: Hermes Agent"

  if pnpm e2e 2>&1; then
    echo "=== Tests passed, pushing ==="
    git push origin main
  else
    echo "=== Tests failed, reverting ==="
    git reset --hard HEAD~1
    echo "!!! Tests failed after dependency update !!!"
    exit 1
  fi
else
  echo "=== No minor/patch updates ==="
fi

# Phase 2: Major Updates (als PR)
echo "=== Phase 2: Major Updates ==="
MAJOR_OUTPUT=$(pnpm taze major --include-dependencies --fail-on-outdated $MATURITY 2>&1) || {
  echo "=== Major updates available ==="
  BRANCH="chore/major-updates-$(date +%Y%m%d)"
  git checkout -b "$BRANCH"
  pnpm taze major --write $MATURITY 2>&1 || true
  
  if ! git diff --quiet pnpm-lock.yaml package.json; then
    git add pnpm-lock.yaml package.json
    git commit -m "chore: major dependency updates

Automated major version update via taze.
Maturity: 1 day. Please review breaking changes.

Assisted-By: Hermes Agent"
    git push origin "$BRANCH"

    gh pr create \
      --title "chore: major dependency updates ($(date +%Y-%m-%d))" \
      --body "Automated major version update via taze (1-day maturity).\n\nPlease review breaking changes before merging.\n\nReview checklist:\n- [ ] Check changelogs for breaking changes\n- [ ] Run local e2e tests\n- [ ] Verify Expo/RN compatibility" \
      --base main \
      --head "$BRANCH" \
      --label "dependencies,major" \
      2>&1 || echo "gh CLI not available, PR not created automatically"

    git checkout main
  else
    git checkout main
    git branch -D "$BRANCH"
  fi
}

echo "=== Done ==="
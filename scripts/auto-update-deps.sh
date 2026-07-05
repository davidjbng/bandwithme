#!/usr/bin/env bash
# Auto-update dependencies using taze
# Called weekly by Hermes cron job
# Minor/patch updates: direct push to main if tests pass
# Major updates: create PR if there are concerns

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

# Pull latest
git pull origin main

# Check for updates with taze (maturity: 1 day minimum)
echo "=== Checking for dependency updates ==="
pnpm taze --include-dependencies --write --exclude major 2>&1 || true

# If there are changes, commit and push
if ! git diff --quiet pnpm-lock.yaml package.json; then
  echo "=== Dependency updates found ==="
  git add pnpm-lock.yaml package.json
  git commit -m "chore: update dependencies (auto)

Automated dependency update via taze.
Minor and patch versions only.

Assisted-By: Hermes Agent"
  
  # Run tests
  if pnpm e2e 2>&1; then
    echo "=== Tests passed, pushing ==="
    git push origin main
  else
    echo "=== Tests failed, reverting ==="
    git reset --hard HEAD~1
    exit 1
  fi
else
  echo "=== No updates available ==="
fi

# Now check for major updates and create PR if any
echo "=== Checking for major updates ==="
MAJOR_UPDATES=$(pnpm taze --include-dependencies --dry-run 2>&1 | grep -c "major" || true)

if [ "$MAJOR_UPDATES" -gt 0 ]; then
  echo "=== Major updates available: $MAJOR_UPDATES ==="
  # Create a branch for major updates
  BRANCH="chore/major-updates-$(date +%Y%m%d)"
  git checkout -b "$BRANCH"
  pnpm taze --write 2>&1 || true
  git add pnpm-lock.yaml package.json
  git commit -m "chore: major dependency updates

Automated major version update via taze.
Please review before merging.

Assisted-By: Hermes Agent"
  git push origin "$BRANCH"
  
  # Create PR using GitHub API
  # This part needs GH_TOKEN
  gh pr create \
    --title "chore: major dependency updates ($(date +%Y-%m-%d))" \
    --body "Automated major version update via taze.\n\nPlease review breaking changes before merging." \
    --base main \
    --head "$BRANCH" \
    --label "dependencies" \
    2>&1 || echo "gh CLI not available, PR not created automatically"
  
  git checkout main
fi

echo "=== Done ==="
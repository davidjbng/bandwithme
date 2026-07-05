#!/usr/bin/env bash
# Auto-update dependencies using taze
# Called weekly by Hermes cron job
# Minor/patch updates (non-Expo): direct push to main if tests pass
# Expo packages: grouped, direct push if tests pass
# Major updates (non-Expo): create PR

set -euo pipefail

REPO_DIR="/root/repos/bandwithme"
cd "$REPO_DIR"

export PATH="/root/.local/share/pnpm/bin:$PATH"

# Fetch latest
git fetch origin main

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

MATURITY="--maturity-period 1"

# ── Phase 1: Expo/RN Core (minor+patch+major, alles gruppiert) ──
echo "=== Phase 1: Expo/React Native ==="
pnpm taze \
  --include 'expo,expo-*,react-native,react-native-*,@expo/*,react,react-dom,@react-native/*,typescript' \
  --write $MATURITY 2>&1 || true

# expo install --fix: richtet alle Expo-Deps auf die passende RN-Version aus
echo "=== Running expo install --fix ==="
npx expo install --fix 2>&1 || true

if ! git diff --quiet pnpm-lock.yaml package.json; then
  echo "=== Expo/RN updates found, running tests ==="
  git add pnpm-lock.yaml package.json
  git commit -m "chore: update Expo/React Native dependencies (auto)

Automated Expo/RN update via taze + expo install --fix.
Maturity: 1 day.

Assisted-By: Hermes Agent"

  if pnpm e2e 2>&1; then
    echo "=== Tests passed, pushing ==="
    git push origin main
  else
    echo "=== Tests failed, reverting ==="
    git reset --hard HEAD~1
    echo "!!! Tests failed after Expo update !!!"
    exit 1
  fi
else
  echo "=== No Expo/RN updates ==="
fi

# ── Phase 2: Minor/Patch (alles andere) ──
echo "=== Phase 2: Minor/Patch (non-Expo) ==="
pnpm taze minor \
  --exclude 'expo,expo-*,react-native,react-native-*,@expo/*,react,react-dom,@react-native/*,typescript' \
  --write $MATURITY 2>&1 || true

if ! git diff --quiet pnpm-lock.yaml package.json; then
  echo "=== Minor/patch updates found, running tests ==="
  git add pnpm-lock.yaml package.json
  git commit -m "chore: update dependencies (auto)

Automated minor/patch update via taze.
Maturity: 1 day. Non-Expo packages only.

Assisted-By: Hermes Agent"

  if pnpm e2e 2>&1; then
    echo "=== Tests passed, pushing ==="
    git push origin main
  else
    echo "=== Tests failed, reverting ==="
    git reset --hard HEAD~1
    echo "!!! Tests failed after minor/patch update !!!"
    exit 1
  fi
else
  echo "=== No minor/patch updates ==="
fi

# ── Phase 3: Major (non-Expo, als PR) ──
echo "=== Phase 3: Major (non-Expo) ==="
MAJOR_EXCLUDE='expo,expo-*,react-native,react-native-*,@expo/*,react,react-dom,@react-native/*,typescript'

pnpm taze major --exclude "$MAJOR_EXCLUDE" --fail-on-outdated $MATURITY 2>&1 || {
  echo "=== Major updates available ==="
  BRANCH="chore/major-updates-$(date +%Y%m%d)"
  git checkout -b "$BRANCH"
  pnpm taze major --exclude "$MAJOR_EXCLUDE" --write $MATURITY 2>&1 || true

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
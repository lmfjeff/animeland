#!/bin/bash
# Usage: bash deploy-wsl.sh /path/to/repo
# Example: bash deploy-wsl.sh /mnt/c/Users/<username>/path/to/animeland
set -e

REPO_SRC="${1:-}"

if [ -z "$REPO_SRC" ]; then
  echo "Error: Please provide the repo path as an argument."
  echo "Usage: bash deploy-wsl.sh /mnt/c/Users/<username>/path/to/animeland"
  exit 1
fi

export PATH="$HOME/.local/share/fnm:$PATH"
eval "$(fnm env --shell bash 2>/dev/null || true)"
fnm use 20 2>/dev/null || true

echo "=== Syncing repo to WSL native filesystem (excluding node_modules) ==="
mkdir -p ~/animeland
rsync -a --delete \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.sst' \
  "$REPO_SRC/" \
  ~/animeland/

echo "=== Sync done. Installing dependencies on native Linux fs ==="
cd ~/animeland
npm install 2>&1 | tail -5

echo "=== Node: $(node -v) | npm: $(npm -v) ==="
echo "=== Deploying with SST ==="
npx sst deploy --stage prod

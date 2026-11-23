#!/usr/bin/env bash
# Copy Go Fast Rally into the Riptide Run site's rally/ folder.
# Usage: tools/deploy-to-riptide.sh /path/to/riptide-run
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:?path to the riptide-run checkout}/rally"
rm -rf "$DEST"
mkdir -p "$DEST"
cp -r "$SRC/index.html" "$SRC/css" "$SRC/js" "$SRC/lib" "$DEST/"
echo "Go Fast Rally copied to $DEST"

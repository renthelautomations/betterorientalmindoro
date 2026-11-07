#!/usr/bin/env bash
# Copy the owner's design kit (worktrees/design-kit) into this tree, read-only on their side.
# i18n.tsx and dict.ts move to src/lib/i18n (as docs/i18n-toggle.md recommends) and imports are rewritten.
set -euo pipefail
K="${1:-../design-kit}"
rm -rf src/components/kit src/app/design-kit
cp -R "$K/src/components/kit" src/components/kit
cp -R "$K/src/app/design-kit" src/app/design-kit
mkdir -p src/lib/i18n/dict
mv src/components/kit/i18n.tsx src/lib/i18n/i18n.tsx
mv src/components/kit/dict.test.ts src/lib/i18n/dict.test.ts
# the kit's dictionary becomes the base layer; area dictionaries (src/lib/i18n/dict/*.ts) sit on top
sed 's/export const DICT = /export const BASE = /; /^export type DictKey/d' src/components/kit/dict.ts > src/lib/i18n/dict/base.ts
rm src/components/kit/dict.ts
grep -rl --include=*.ts --include=*.tsx -E 'from "(\./|@/components/kit/)(i18n|dict)"' src/components src/app | while read -r f; do
  sed -i '' -E 's#from "\./i18n"#from "@/lib/i18n/i18n"#; s#from "@/components/kit/i18n"#from "@/lib/i18n/i18n"#; s#from "\./dict"#from "@/lib/i18n/dict"#; s#from "@/components/kit/dict"#from "@/lib/i18n/dict"#' "$f"
done
cp "$K/src/app/globals.css" src/app/globals.css
echo "kit synced from $K"

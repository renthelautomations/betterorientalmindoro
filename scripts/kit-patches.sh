#!/usr/bin/env bash
# Small edits to the synced kit that make its text follow the EN/FIL toggle. Idempotent; run after every sync.
# Upstream these in worktrees/design-kit and delete the matching patch here.
set -euo pipefail
python3 -I - <<'PY'
import re
# 1. Donut legend: let a slice label be a dictionary key (unknown strings pass through unchanged).
p="src/components/kit/Charts2.tsx"; s=open(p).read()
if "<T k={s.label} />" not in s:
    s=s.replace("<span>{s.label}</span>","<span><T k={s.label} /></span>",1)
    if 'import { T }' not in s and 'T,' not in s.split("\n",8)[0:8].__str__():
        pass
    open(p,"w").write(s)
# 2. SiteSearch: the screen-reader label follows the language like the placeholder does.
p="src/components/kit/SiteSearch.tsx"; s=open(p).read()
s=s.replace('>Maghanap ng bayan, serbisyo o hotline</label>','>{t("search.placeholder")}</label>')
open(p,"w").write(s)
PY
echo "kit patches applied"

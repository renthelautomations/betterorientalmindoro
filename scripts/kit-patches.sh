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
# 3. LineChart: series names are dictionary keys (unknown strings such as town names pass through); empty state translated.
p="src/components/kit/LineChart.tsx"; s=open(p).read()
s=s.replace('<p className="text-sm text-black/60">Walang sapat na datos.</p>','<p className="text-sm text-black/60">{t("chart.nodata")}</p>')
s=s.replace("<option key={x.name}>{x.name}</option>","<option key={x.name} value={x.name}>{t(x.name)}</option>")
s=s.replace("aria-label={`${s.name}: ${s.points","aria-label={`${t(s.name)}: ${s.points")
open(p,"w").write(s)
# 4. CompareTowns: the screen-reader label on each town picker follows the language.
p="src/components/kit/CompareTowns.tsx"; s=open(p).read()
s=s.replace('<span className="sr-only">Bayan</span>','<span className="sr-only">{t("common.town")}</span>')
open(p,"w").write(s)
# 5. HotlineCard: emergency chip text meets AA contrast (4.04:1 before).
p="src/components/kit/Ui.tsx"; s=open(p).read()
s=s.replace('emergency: "bg-fiesta-red/10 text-fiesta-red"','emergency: "bg-fiesta-red/10 text-[#a8281b]"')
open(p,"w").write(s)
# 6. Header: eight section links plus the language toggle need more than the md (768px) width, which made every page
# scroll sideways on tablets. Keep the mobile menu until lg (1024px).
p="src/components/kit/Layout.tsx"; s=open(p).read()
s=s.replace('className="hidden gap-1 md:flex"','className="hidden gap-1 lg:flex"')
s=s.replace('className="ml-auto mr-2 md:ml-4 md:mr-0"','className="ml-auto mr-2 lg:ml-4 lg:mr-0"')
s=s.replace('className="group relative md:hidden"','className="group relative lg:hidden"')
open(p,"w").write(s)
PY
echo "kit patches applied"

# Syncing the design kit

The owner edits the kit in `worktrees/design-kit` (never write there). To pull their latest into this tree:

```
./scripts/sync-kit.sh ../design-kit
```

It copies `src/components/kit` and `src/app/design-kit`, moves `i18n.tsx` and `dict.ts` to `src/lib/i18n/` (the kit's dictionary becomes `dict/base.ts`), and rewrites their imports. Site strings live in `src/lib/i18n/dict/{home,bayan,proyekto,finance,dyn}.ts` and are merged in `src/lib/i18n/dict.ts`, so a sync never overwrites them. Site-only copies of kit parts (`LinkChoropleth`, `LinkNetwork`, `PennantHero`) stay in `src/components/site/` until the kit fixes the underlying issues.

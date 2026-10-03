# Agent instructions

## Provider guides

Before creating or editing provider guides in `src/provider-guides/`, read:

- `PROVIDER_GUIDE.md`
- `CONTRIBUTING.md`
- `scripts/drift-check/README.md`

Keep provider guides aligned with those files even when existing guides differ.

When provider guide work changes navigation, edit `src/generate-docs.ts` and regenerate `src/docs.json` with:

```shell
pnpm run gen-docs
```

Before finishing provider guide work, run the most specific drift check that applies:

```shell
pnpm run drift-check -- --mode provider --provider <providerKey> --out /tmp/ampersand-provider-drift
```

For broader provider-guide changes, run:

```shell
pnpm run drift-check -- --out /tmp/ampersand-docs-drift
```

# Ampersand docs

This repo contains the source files for https://docs.withampersand.com. Merges to the main branch will automatically update the online docs via the Mintlify Github app.

# Generate mint.json

`src/mint.json` is the main configuration file for the docs. Do not edit it manually, it is generated based on:
- `src/generate-mint.ts`, which includes Mintlify's configuration options. See [Mintlify documentation](https://mintlify.com/docs/settings/global).
- files in the [amp-labs/openapi repo](https://github.com/amp-labs/openapi).

If you make any updates to site structure (by editing `src/generate-mint.ts`), re-generate `mint.json` by running:

```shell 
pnpm run gen
```

# Preview docs locally

```shell
pnpm run dev 
```

The local preview is available at http://localhost:3000, and will hot-load any changes to .mdx files.

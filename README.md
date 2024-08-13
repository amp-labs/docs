# Ampersand docs

This repo contains the source files for https://docs.withampersand.com, which includes:

- Guides: their source files are `.mdx` files in the `src` folder
- Reference docs: which are generated from the OpenAPI spec files in the [amp-labs/openapi](https://github.com/amp-labs/openapi) repo when `pnpm run gen` is run.

## Release process

Merges to the main branch will automatically update the online docs via the Mintlify Github app.

## Generate mint.json

`src/mint.json` is the main configuration file for the docs. Do not edit it manually.

If you make any updates to site structure or styling (by editing `src/generate-mint.ts`), re-generate `mint.json` by running:

```shell 
pnpm run gen
```

## Preview docs locally

```shell
pnpm run dev 
```

The local preview is available at http://localhost:3000, and will hot-load any changes to .mdx files.

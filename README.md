# Ampersand docs

This repo contains the source files for https://docs.withampersand.com/docs. Merges to the main branch will automatically update the online docs.

# Generate mint.json

`mint.json` is the main configuration file for the docs. Do not edit it manually, it is generated based on:
- `generate-mint.ts`, which includes Mintlify's configuration options. See (Mintlify documentation)[https://mintlify.com/docs/settings/global].
- files in the [amp-labs/openapi repo](https://github.com/amp-labs/openapi).

To generate `mint.json` run:

```shell 
cd v1.0-mintlify
pnpm run generate
```

# Preview docs locally

```shell 
cd v1.0-mintlify
pnpm run dev 
```

The local preview is available at http://localhost:3000

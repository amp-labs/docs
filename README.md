# Ampersand docs

This repo contains the source files for https://docs.withampersand.com, which includes:

- Guides: their source files are `.mdx` files in the `src` folder
- Reference docs: which are generated from the OpenAPI spec files in the [amp-labs/openapi](https://github.com/amp-labs/openapi) repo when `pnpm run gen` is run.

## Release process

Merges to the main branch will automatically update the online docs via the Mintlify Github app.

## First time setup 

Ensure you have pnpm installed globally 

```shell 
npm install -g pnpm
```

Install dependencies 

```shell
pnpm i
```

## Adding a new page

If you need to add a new page, add it to the `mintConfig` object in `src/generate-docs.ts`, and then follow the steps below for regenerating docs.json.

## Changing the URL of a page

If you are changing the URL of a page, be sure to add the old URL to the `redirects` section of the `mintConfig` object in `src/generate-docs.ts`, and then follow the steps below for regenerating docs.json.

## Generate docs.json & API references

`src/docs.json` is the main configuration file for the docs. Do not edit it manually, edit `src/generate-docs.ts` instead.

The gen command will do 2 things:
- re-generate `src/docs.json` based on `src/generate-docs.ts`
- re-generate API reference docs based on [amp-labs/openapi](https://github.com/amp-labs/openapi)

```shell 
pnpm run gen
```

## Preview docs locally

```shell
cd src && mint dev
```

The local preview is available at http://localhost:3000, and will hot-load any changes to .mdx files.

## Style guide

Please see [CONTRIBUTING.md](https://github.com/amp-labs/docs/blob/main/CONTRIBUTING.md).

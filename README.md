# Ampersand docs

This repo contains the source files for https://docs.withampersand.com/docs/overview. Merges to the main branch will kick off a Github Action that updates the docs via the Readme CLI.


# Generate mint.json 

To generate api reference pages  from the latest OpenAPI spec run
```shell 
cd v1.0-mintlify
pnpm run generate
```

This will recreate `mint.json` that is watched by Mintlify in branch `main` to redeploy the docs when updates happen. 

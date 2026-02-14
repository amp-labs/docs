.PHONY: run
run:
	cd src && mintlify dev

.PHONY: gen
gen:
	pnpm run gen

.PHONY: validate_links
validate_links:
	cd src && mintlify broken-links

.PHONY: test
test:
	pnpm run test:openapi && pnpm run test:links

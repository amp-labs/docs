.PHONY: run
run:
	cd src && mint dev

.PHONY: gen
gen:
	pnpm run gen

.PHONY: validate_links
validate_links:
	cd src && mint broken-links
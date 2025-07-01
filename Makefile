.PHONY: run
run:
	cd src && mintlify dev

.PHONY: gen
gen:
	pnpm run gen

ESBUILD ?= ./node_modules/.bin/esbuild
FILES := $(shell find src -name '*.js' | sort)

all: \
	animatic.js \
	animatic.esm.js \
	animatic.min.js

animatic.js: ${FILES}
	@rm -f $@
	@$(ESBUILD) src/browser.js --bundle --format=iife --target=es2023 --outfile=$@
	@chmod a-w $@

animatic.esm.js: ${FILES}
	@rm -f $@
	@$(ESBUILD) src/core.js --bundle --format=esm --target=es2023 --outfile=$@
	@chmod a-w $@

animatic.min.js: animatic.js
	@rm -f $@
	@$(ESBUILD) src/browser.js --bundle --format=iife --target=es2023 --minify --sourcemap --outfile=$@
	@chmod a-w $@
	@du -h animatic.js animatic.min.js

deps:
	mkdir -p node_modules
	npm install

clean:
	rm -f animatic*.js* animatic*.map

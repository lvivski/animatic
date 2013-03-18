JS_COMPILER ?= ./node_modules/uglify-js/bin/uglifyjs
FILES = \
	src/core.js \
	src/utils.js \
	src/easings.js \
	src/css.js \
	src/eventemitter.js \
	src/animation.js \
	src/collection.js \
	src/parallel.js \
	src/sequence.js \
	src/world.js \
	src/timeline.js \
	src/vector.js \
	src/matrix.js \
	src/item.js

all: \
	anima.js \
	anima.min.js

anima.js: ${FILES}
	@rm -f $@
	@echo "(function(){" > $@.tmp
	@cat $(filter %.js,$^) >> $@.tmp
	@echo "}())" >> $@.tmp
	@$(JS_COMPILER) $@.tmp -b indent-level=2 -o $@
	@rm $@.tmp
	@chmod a-w $@

anima.min.js: anima.js
	@rm -f $@
	@$(JS_COMPILER) $< -c -m -o $@ \
		--source-map $@.map \
		&& du -h anima.js anima.min.js

deps:
	mkdir -p node_modules
	npm install

clean:
	rm -f anima*.js*

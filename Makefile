JS_COMPILER ?= ./node_modules/uglify-js/bin/uglifyjs
FILES = \
	src/core.js \
	src/easings.js \
	src/eventemmiter.js \
	src/animation.js \
	src/world.js \
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
	@$(JS_COMPILER) $< -mt -c -nc -o $@ \
		&& du -h anima.js anima.min.js

install:
	mkdir -p node_modules
	npm install

clean:
	rm -f anima*.js
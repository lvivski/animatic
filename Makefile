JS_COMPILER ?= ./node_modules/uglify-js/bin/uglifyjs
FILES = \
	src/core.js \
	src/utils.js \
	src/math/vector.js \
	src/math/matrix.js \
	src/eventemitter.js \
	src/animations/easings.js \
	src/animations/animation.js \
	src/animations/css_animation.js \
	src/animations/collection.js \
	src/animations/parallel.js \
	src/animations/sequence.js \
	src/css.js \
	src/world.js \
	src/timeline.js \
	src/item.js \
	src/physics/forces/constant.js \
	src/physics/forces/attraction.js \
	src/physics/forces/edge.js \
	src/physics/verlet.js \
	src/physics/particle.js \

all: \
	anima.js \
	anima.min.js

anima.js: ${FILES}
	@rm -f $@
	@echo "(function(){" > $@.tmp
	@echo "'use strict'" >> $@.tmp
	@cat $(filter %.js,$^) >> $@.tmp
	@echo "}())" >> $@.tmp
	@$(JS_COMPILER) $@.tmp -b indent-level=2 -o $@
	@rm $@.tmp
	@chmod a-w $@

anima.min.js: anima.js
	@rm -f $@
	@$(JS_COMPILER) $< -c -m -o $@ \
		--source-map $@.map \
		&& du -h $< $@

deps:
	mkdir -p node_modules
	npm install

clean:
	rm -f anima*.js*

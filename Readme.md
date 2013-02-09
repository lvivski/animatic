# Anima
CSS animations with a soul

With Anima it's easy to animate over a hundred objects at a time.
And it's only **3.5k** when gzipped.

## Motivation
CSS animations have some limits, the main is that you can't really have full control over them. And it's near impossible to stop transitions without dirty hacks.

Another problem is calculating percents for keyframes. People create animations with time in mind, not percents. You always think of _"it should fly and rotate for a half of a second, then stand still for another second and continue flying"_, and not `0% start 50% fly 70% stop 90% fly`.

Anima gives you the ability to use delays and durations normally, even for pure CSS animations. It has two modes: `JS` and `CSS`. The first one doesn't really use CSS transitions or `@keyframes`. On the contrary, it uses CSS transforms and 3d-transforms together with Javascript to create animation. You have full control over the flow, so you can start, stop, cancel animations and even create event-based stuff. `CSS` mode allows you to generate pure CSS animations, but it has less control features for now.

_**Note**: `CSS` mode is experimental for now, not everything works as expected._

## API
At first you cave to initialize the World, so the frame loop will start (so called `JS` mode)
```js
var world = anima.js()
```
You may also get the world without frame loop for pure css animations (`CSS` mode)
```js
var world = anima.css()
```
then you have to add items, you want to animate later
```js
var item = world.add(document.querySelector("div"))
```
so the world is looping now, waiting for item transformations to animate

API remains the same in `CSS` mode, but you have to call the `.css()` method explicitly at the end of desired `.animate`'s
```js
item.animate(...).css()
```

### Single animation
Arguments:
1. The map of transformations to apply. Only `translate`, `rotate` and `scale` are currently supported, but the list will expand.
2. Animation duration
3. Easing function
4. Animation delay
```js
item.animate({translate: [x, y, z]}, 500, 'ease-in-out-quad', 100)
```
It's also possible to pass everything in a single object
```js
item.animate({
  translate: [x, y, z],
  duration: 500,
  ease: 'ease-in-out-quad',
  delay: 100
})
```
_**Note**: transformations' values are relative to the last known `Item` state, it's initial state or the state after previous animation. Angles for `rotate` should be in degrees._

### Sequential animations
You can create sequential animations with ease :)
```js
item.animate(...).animate(...).animate(...)
```

### Parallel animations
Sometimes you need to transform something in parallel
```js
item.animate([{
	translate : [x,y,z],
	duration: 500,
	easing: 'ease-in-out-quad',
	delay: 100
},{
	rotate : [angleX,angleY,angleZ],
	duration: 1000,
	easing: 'ease-in-expo',
	delay: 400
}])
```
So you basically pass an array of transformations to create parallel animation.

### Taking control
#### `JS` mode
Animations start automatically as soon as you call `.animate()` on the item.
You can stop them with
```js
item.stop()
```
#### `CSS` mode
To start your animations you have to call `.css()` after all you desired `.animate`'s
`CSS` mode doesn't support `.stop` for now.

### Animation events
Every animation has it's own `start` and `end` events.
```js
item.animate(...).on('start', callback).on('end', callback)
```

### Timing functions
Here's the list of al supported timing functions
`linear`

`ease-in-quad` `ease-in-cubic` `ease-in-quart` `ease-in-quint` `ease-in-sine` `ease-in-expo` `ease-in-circ` `ease-in-back` 

`ease-out-quad` `ease-out-cubic` `ease-out-quart` `ease-out-quint` `ease-out-sine` `ease-out-expo` `ease-out-circ` `ease-out-back`

`ease-in-out-quad` `ease-in-out-cubic` `ease-in-out-quart` `ease-in-out-quint` `ease-in-out-sine` `ease-in-out-expo` `ease-in-out-circ` `ease-in-out-back`

You can learn more about them at [easings.net](http://easings.net)

## Examples
### requestAnimationFrame
- [keyboard control](example/keyboard.html) (use `↑` `↓` `←` `→` and `W` `A` `S` `D` to transform)
- [animation chain](example/bounce.html)
- [parallel animations](example/parallel.html)
- [delayed animation](example/delay.html)

### pure CSS
- [animation chain](example/bounce_css.html)
- [delayed animation](example/delay_css.html)
- [parallel animations](example/parallel_css.html) (do not support custom `timing-functions` for now)

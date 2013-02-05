# Anima
CSS animations with soul

With Anima it's easy to animate over a hundred object at a time.

## Motivation
CSS animations have some limits, the main is that you can't really have full control over them. And it's near impossible to stop transitions without dirty hacks.

Anima uses uncommon approach to CSS animation. Well, It doesn't really use CSS transitions or `@keyframes`. On the contrary, it uses CSS transforms and 3d-transfors together with Javascript to create animation. You have full control over the flow, so you can start, stop, cancel animations and even create event-based stuff.

## Api
At first you cave to initialize the World, so the frame loop will start

```js
var world = anima.init()
```

then you have to add items, you want to animate later

```js
var item = world.add(document.querySelector("div"))
```
so the world is looping now, waiting for item transformations to animate

### Single animation
Arguments:
1. The map of transformations to apply. Only `translate`, `rotate` and `scale` are currently supported, but the list will expand.
2. Animation duration
3. Easing function
4. Animation delay
```js
item.animate({translate: [x, y, z]}, 500, 'ease-in-out-quad', 100)
```

### Sequential animations
You can create sequential animations with ease :)
```js
item.animate(…).animate(…).animate(...)
```

### Parallel animations
Sometimes you need to transform something in parallel
```js
item.animate([{
	translate : [x,y,z],
	duration: 500,
	easing: 'ease-in-out-quad',
	delay: 100
},
{
	rotate : [angleX,angleY,angleZ],
	duration: 1000,
	easing: 'ease-in-expo',
	delay: 400
}])
```
So you basically pass an array of transformations to create parallel animation.

### Animation events
Every animation has it's own `start` and `end` events.
```js
item.animate(…).on('start', callback).on('end', callback)
```

## Examples
- [keyboard control](anima/blob/master/example/keyboard.html)
- [animation chain](anima/blob/master/example/bounce.html)
- [parallel animations](anima/blob/master/example/parallel.html)
- [delayed animation](anima/blob/master/example/delay.html)

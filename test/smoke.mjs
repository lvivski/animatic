import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import vm from "node:vm"

class FakeAnimation {
  constructor(keyframes, timing) {
    this.keyframes = keyframes
    this.effect = { timing }
    this.currentTime = 0
    this.onfinish = null
    this.playState = "running"
  }

  play() {
    this.playState = "running"
  }

  pause() {
    this.playState = "paused"
  }

  cancel() {
    this.playState = "idle"
  }

  finish() {
    this.currentTime = this.effect.timing.duration
    if (this.onfinish) {
      this.onfinish()
    }
  }
}

class FakeElement {
  constructor() {
    this.style = {}
    this.animations = []
  }

  animate(keyframes, timing) {
    const animation = new FakeAnimation(keyframes, timing)
    this.animations.push(animation)
    this.animation = animation
    return animation
  }
}

function computedStyle(element = {}) {
  const style = element.style || {}
  const computed = ["transform", "animation"]

  computed.transform = style.transform || "none"
  computed.animation = style.animation || ""
  computed.backgroundColor = style.backgroundColor || "rgba(0, 0, 0, 0)"
  computed.color = style.color || "rgb(0, 0, 0)"
  computed.height = style.height || "0px"
  computed.padding = style.padding || "0px"
  computed.width = style.width || "0px"

  return computed
}

let frame = 0
const documentElement = new FakeElement()
const stylesheet = {
  cssRules: [],
  insertRule(rule, index) {
    this.cssRules.splice(index, 0, rule)
  }
}
const context = {
  console,
  performance: {
    now() {
      return frame * 16
    }
  },
  document: {
    documentElement,
    styleSheets: [stylesheet],
    createElement() {
      return new FakeElement()
    },
    getElementsByTagName() {
      return [{ appendChild() {} }]
    }
  },
  getComputedStyle: computedStyle,
  queueMicrotask(callback) {
    Promise.resolve().then(callback)
  },
  requestAnimationFrame() {
    return ++frame
  },
  cancelAnimationFrame() {}
}

context.globalThis = context
context.window = context

vm.createContext(context)
vm.runInContext(await readFile(new URL("../animatic.js", import.meta.url), "utf8"), context)
vm.runInContext(
  (await readFile(new URL("../src/math/vector.js", import.meta.url), "utf8")).replace(
    "export const Vector =",
    "globalThis.Vector ="
  ),
  context
)

const { animatic } = context
const { Vector } = context

assert.equal(typeof animatic.world, "function")
assert.equal(typeof animatic.timeline, "function")
assert.equal(Vector.dist([0, 0, 0], [0, 0, 3]), 3)
assert.deepEqual(Array.from(Vector.cross([1, 0, 0], [0, 1, 0])), [0, 0, 1])

const world = animatic.world()
const node = new FakeElement()
const item = world.add(node)
let ended = false
let eventCount = 0

function countedEvent() {
  eventCount++
}

function ignoredEvent() {
  eventCount += 100
}

item.off("missing", countedEvent)
item.on("review", countedEvent)
item.off("review", ignoredEvent)
item.emit("review")
assert.equal(eventCount, 1)
item.off("review", countedEvent)
item.emit("review")
assert.equal(eventCount, 1)

item
  .animate({ translate: [120, 0, 0] }, 120, "ease-out-quad")
  .animate({ scale: [0.5, 0, 0] }, 80)
  .on("end", () => {
    ended = true
  })

await Promise.resolve()

assert.ok(item.animation.native.player, "world item uses a WAAPI player")
assert.ok(node.animation.keyframes.length > 2, "WAAPI effect contains sampled keyframes")

item.pause()
assert.equal(node.animation.playState, "paused")

item.resume()
assert.equal(node.animation.playState, "running")

item.finish()
assert.ok(ended, "native sequence emits end")
assert.equal(item.animation.length, 0)
assert.match(node.style.transform, /^matrix3d\(/)

const parallelNode = new FakeElement()
const parallelItem = world.add(parallelNode)

parallelItem.animate(
  [
    { translate: [0, 100, 0] },
    { translate: [50, 0, 0] }
  ],
  100
)

await Promise.resolve()
parallelItem.finish()
assert.deepEqual(Array.from(parallelItem.state.translate), [50, 100, 0])

const nestedNode = new FakeElement()
const nestedItem = world.add(nestedNode)

nestedItem.animate([
  [
    { translate: [0, 100, 0], duration: 50 },
    { translate: [0, -100, 0], duration: 50 }
  ],
  { translate: [50, 0, 0], duration: 100 }
])

await Promise.resolve()
nestedItem.finish()
assert.deepEqual(Array.from(nestedItem.state.translate), [50, 0, 0])

const immediateNode = new FakeElement()
const immediateItem = world.add(immediateNode)
let immediateEnded = false

immediateItem.animate({ translate: [25, 0, 0] }, 0).on("end", () => {
  immediateEnded = true
})

await Promise.resolve()

assert.equal(immediateItem.animation.native.player, null)
assert.ok(immediateEnded, "zero-duration native animations end immediately")
assert.deepEqual(Array.from(immediateItem.state.translate), [25, 0, 0])

const timeline = animatic.timeline()
const timelineNode = new FakeElement()
const timelineItem = timeline.add(timelineNode)

timelineItem.animate({ translate: [100, 0, 0] }, 100)
timeline.seek(50)
timeline.update(50)

assert.ok(timelineItem.animation.native.player, "timeline item creates a paused WAAPI player")
assert.equal(timelineItem.animation.native.player.currentTime, 50)
assert.ok(timelineItem.state.translate[0] > 0)
assert.ok(timelineItem.state.translate[0] < 100)

const cssItem = world.add(new FakeElement())
cssItem.animate({ name: "bounce", duration: 100 })
await Promise.resolve()
assert.equal(cssItem.animation.native.player, null, "named CSS animations use the legacy path")

const cssParallelItem = world.add(new FakeElement())
const cssRuleCount = stylesheet.cssRules.length

cssParallelItem
  .animate(
    [
      { translate: [0, 100, 0] },
      { translate: [50, 0, 0] }
    ],
    100
  )
  .css()

const cssRule = stylesheet.cssRules[cssRuleCount]
assert.match(cssRule, /^@keyframes/)
assert.match(cssRule, /0\.000%/)
assert.match(cssRule, /100\.000%/)
assert.match(cssRule, /matrix3d\(/)
assert.match(cssRule, /50,100,0,1/)
assert.equal(cssParallelItem.animation.native.player, null)

const cssManualItem = world.add(new FakeElement())
const cssManualRule = cssManualItem
  .animate(
    [
      { translate: [0, 100, 0] },
      { translate: [50, 0, 0] }
    ],
    100
  )
  .css(true)
  .keyframes("manual")

assert.match(cssManualRule, /^@keyframes manual/)
assert.match(cssManualRule, /50,100,0,1/)

const particleNode = new FakeElement()
const particle = world.add(particleNode, { mass: 1 })
particle.animate({ translate: [10, 0, 0] }, 100)
await Promise.resolve()
assert.ok(particle.animation.native.player, "finite physics items use a sampled WAAPI player")
assert.ok(particleNode.animation.keyframes.length > 2)
particle.finish()
assert.ok(particle.current.position[0] > 0)
assert.ok(particle.current.position[0] < 10)
assert.equal(particle.clock, null)

particle.integrate(500)
assert.equal(particle.clock, 500)

particle.integrate(516)
assert.ok(particle.current.position[0] >= 0)

const liveParticle = world.add(new FakeElement(), { mass: 1, physics: "live" })
liveParticle.animate({ translate: [10, 0, 0] }, 100)
await Promise.resolve()
assert.equal(liveParticle.animation.native.player, null, "live physics uses the legacy path")

const edgeParticle = world.add(new FakeElement(), {
  mass: 1,
  physics: "live",
  edge: { min: [0, 0, 0], max: [5, 5, 5], bounce: true }
})
edgeParticle.clear()
edgeParticle.state.translate = [10, 0, 0]
edgeParticle.current.position = [10, 0, 0]
edgeParticle.previous.position = [10, 0, 0]
edgeParticle.integrate(0)
edgeParticle.integrate(16)
assert.equal(edgeParticle.current.position[0], 5)
assert.equal(edgeParticle.previous.position[0], 5)

console.log("SMOKE_OK")

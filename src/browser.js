import animatic from "./core.js"

const root = typeof globalThis !== "undefined" ? globalThis : window

root.animatic = animatic

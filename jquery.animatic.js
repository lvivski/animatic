/* global jQuery, animatic */

/**
 * @typedef {Object} AnimaticItem
 * @property {HTMLElement} dom
 * @property {{infinite: () => unknown}} animation
 * @property {() => unknown} pause
 * @property {() => unknown} resume
 * @property {(...args: Array<unknown>) => unknown} animate
 */
/** @typedef {{items: Array<AnimaticItem>, add: (node: HTMLElement) => AnimaticItem}} AnimaticWorld */
/** @typedef {{world: () => AnimaticWorld}} AnimaticApi */
/**
 * @typedef {Object} JQueryStatic
 * @property {Record<string, unknown>} fn
 * @property {(collection: ArrayLike<HTMLElement>, callback: (element: HTMLElement) => AnimaticItem) => Array<AnimaticItem>} map
 * @property {(collection: Array<AnimaticItem>, callback: (index: number, item: AnimaticItem) => void) => void} each
 */

/**
 * @param {JQueryStatic} $
 * @param {AnimaticApi} a
 */
(function ($, a) {
	/** @type {AnimaticWorld | null} */
	var world = null;

	$.fn.anima = /** @this {ArrayLike<HTMLElement>} */ function () {
		if (!world) {
			world = a.world();
		}
		var activeWorld = world;

		var context = this;

		var items = $.map(context, function (elem) {
			var index = activeWorld.items.map(function (item) {
				return item.dom;
			}).indexOf(elem);
			return index !== -1 ? activeWorld.items[index] : activeWorld.add(elem);
		});

		/** @param {(item: AnimaticItem) => void} callback */
		var eachItem = function (callback) {
			$.each(items, function (_index, item) {
				callback(item);
			});
		};

		return {
			pause: function () {
				eachItem(function (item) {
					item.pause();
				});
				return this;
			},
			resume: function () {
				eachItem(function (item) {
					item.resume();
				});
				return this;
			},
			animate: function () {
				var args = Array.prototype.slice.call(arguments);
				eachItem(function (item) {
					item.animate.apply(item, args);
				});
				return this;
			},
			infinite: function () {
				eachItem(function (item) {
					item.animation.infinite();
				});
				return this;
			},
			exit: function () {
				return context;
			}
		}
	};
}(jQuery, animatic));

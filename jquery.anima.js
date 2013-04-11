(function($, a){
	var worlds = {
		js: null,
		css: null
	};
	
	$.fn.anima = function (type) {
		if (!worlds.hasOwnProperty(type)) {
			throw new Error('Invalid world type specified');
		}

		if (!worlds[type]) {
			worlds[type] = a[type](); 
		}

		var world = worlds[type],
		    index = world.items.indexOf(this[0]),
		    item = index !== -1 ? world.items[index] : world.add(this[0]);

		return item;
	};
}(jQuery, anima));
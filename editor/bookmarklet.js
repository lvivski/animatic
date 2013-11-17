(function (node, editor) {
	node = document.createElement('link')
	node.setAttribute('rel', 'stylesheet')
	node.href = 'https://rawgithub.com/lvivski/anima/master/editor/css/editor.css'
	document.head.appendChild(node)

	node = document.createElement('script')
	node.onload = function () {
		editor = document.createElement('script')
		editor.onload = function () {
			var selector = prompt('Anima Items Selector')
			if (selector) {
				anima.editor(selector)
			}
		}
		editor.src = 'https://rawgithub.com/lvivski/anima/master/editor/js/editor.js'
		document.head.appendChild(editor)
	}
	node.src = 'https://rawgithub.com/lvivski/anima/master/anima.js'
	document.head.appendChild(node)
}())

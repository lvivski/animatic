!function(){
  var vendors = ['webkit', 'Moz', 'O', 'ms'], i = -1;

  while(!window.requestAnimationFrame && ++i < vendors.length) {
    var vendor = vendors[i].toLowerCase()
    window.requestAnimationFrame = window[vendor + 'RequestAnimationFrame']
    window.cancelAnimationFrame = window[vendor + 'CancelAnimationFrame']
                    || window[vendors[i] + 'CancelRequestAnimationFrame']
  }

  window.transformProperty = function () {
    var style = document.createElement('div').style
    if (typeof style.transform === 'undefined') {
      return vendors.filter(function(vendor){
        return typeof style[vendor + 'Transform'] !== 'undefined'
      })[0] + 'Transform'
    } else {
      return 'transform'
    }
  }()
}()

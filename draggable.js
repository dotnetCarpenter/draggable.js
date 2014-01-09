!(function(moduleName, definition) {
  // Whether to expose Draggable as an AMD module or to the global object.
  if (typeof define === 'function' && typeof define.amd === 'object') define(definition);
  else this[moduleName] = definition();

})('draggable', function definition() {
  var currentElement;
  var fairlyHighZIndex = '10';
  // var rectStruct = {
  //   x: 0,
  //   y: 0
  // };
  var DraggableEvent = function(x, y, mouseevent) {
    this.x = x;
    this.y = y;
    this.mouseEvent = mouseevent;
  }
  var getTranslateCSS = function() {
    var translate = ['translate(',,',',,')'];
    return function(x, y, svg) {
      return svg ?
        (translate[1] = x, translate[3] = y, translate.join('')):
        (translate[1] = inPixels(x), translate[3] = inPixels(y), translate.join(''));
    }
  }();
  var transformOrigin = '';
  var setTransformOrigin = function(x, y) {
    return transformOrigin = 'transform-origin:' + inPixels(x) + ' ' + inPixels(y) + ';';
  };

  function log() {
    var args = Array.prototype.slice.call(arguments, 0);
    console.log(args);
    //args.forEach(function(msg) { console.log(msg); });
  }

  function logPos(axes, original, mousepos, newpos, diff, mouseoffset) {
    var text = [
      "original " + axes + " position",
      "mouse position " + axes,
      "current " + axes + " position",
      "diff: ",
      "moouse pointer inside box offset"
    ];
    log(
      text[0], original,
      text[1], mousepos,
      text[2], newpos,
      text[3], diff,
      text[4], mouseoffset || "n/a"
    )
  }

  function draggable(element, handle) {
    handle = handle || element;

    var rect = getInitialPosition(element);
    setPositionType(element);
    element.startXPosition = rect.x;
    element.startYPosition = rect.y;    
    //doMove({ clientX: rect.x, clientY: rect.y }, element);

    setDraggableListeners(element);
    handle.addEventListener('mousedown', function(event) {
      startDragging(event, element);
    });
  }

  function doMove(event, element) {
    var svg = element instanceof SVGElement && !!element.ownerSVGElement;
    var rect = getInitialPosition(element);
    var moveX = (element.offsetX - event.clientX) * -1;
    var moveY = (element.offsetY - event.clientY) * -1;
    
    // var offsetX = moveX - rect.x;
    // var offsetY = moveY - rect.y;
    var translate = getTranslateCSS(
      moveX,
      moveY,
      svg
    );


logPos("X",
  element.startXPosition,
  event.clientX,
  moveX,
  moveX - element.startXPosition - element.startXPosition * -1,
  event.offsetX
)
logPos("Y",
  element.startYPosition,
  event.clientY,
  moveY,
  moveY - element.startYPosition - element.startYPosition * -1,
  event.offsetY
)
    if(svg) {
      element.setAttribute('transform', translate);
    } else {
log( 'transform:' + translate + ';' + transformOrigin );
      element.style.WebkitTransform = translate;
      element.style.MozTransform = translate;
    }
  }

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  // function parse(regex) {
  //   return function(string) {
  //     return string.match(regex);
  //   }
  // }

  function startDragging(event, element) {
    currentElement && sendToBack(currentElement);
    currentElement = bringToFront(element);
    // //var rect = getInitialPosition(element);
    // var getTranslateValues = parse(/translate(\d+)\,(\d+)/);
    // console.log(currentElement.style.cssText);
    // console.dir(getTranslateValues(currentElement.style.cssText));
    // var rect = element.getAttribute('data-draggable-initial');
    //var currentX = isNumber(currentElement.startXPosition) && (currentElement.startXPosition) ||*/ event.clientX// + (currentElement.startXPosition || 0);
    //var currentY = isNumber(currentElement.startYPosition) && (currentElement.startYPosition) ||*/ event.clientY// + (currentElement.startYPosition || 0);

    if(element.offsetX === undefined) {
      element.offsetX = event.clientX;
      element.offsetY = event.clientY;
    }
    //setTransformOrigin(event.clientX - rectStruct.x, event.clientY - rectStruct.y);
logPos("X",
  element.startXPosition,
  event.clientX,
  currentElement.startXPosition - event.clientX,
  event.clientX - currentElement.startXPosition - element.startXPosition,
  event.offsetX
)
logPos("Y",
  element.startYPosition,
  event.clientY,
  currentElement.startYPosition - event.clientY,
  event.clientY - currentElement.startYPosition - element.startYPosition,
  event.offsetY
)

    doMove(event, element);

    var okToGoOn = triggerEvent('start', new DraggableEvent(event.clientX, event.clientY, event));
    if (!okToGoOn) return;

    addDocumentListeners();
  }

  function getInitialPosition(element) {
    var boundingClientRect = element.getBoundingClientRect();
    return {
      x: boundingClientRect.left,
      y: boundingClientRect.top
    };
  }

  function repositionElement(event) {
    // var style = currentElement.style;
    // var elementXPosition = parseInt(style.left, 10);
    // var elementYPosition = parseInt(style.top, 10);

    // var elementNewXPosition = elementXPosition + (event.clientX - currentElement.lastXPosition);
    // var elementNewYPosition = elementYPosition + (event.clientY - currentElement.lastYPosition);

    // style.left = inPixels(elementNewXPosition);
    // style.top = inPixels(elementNewYPosition);

    // currentElement.lastXPosition = event.clientX;
    // currentElement.lastYPosition = event.clientY;
    var element = currentElement;
    //var rect = rectStruct;
    doMove(event, element);

    //triggerEvent('drag', new DraggableEvent(elementNewXPosition, elementNewYPosition, event));
  }

  function setDraggableListeners(element) {
    element.draggableListeners = {
      start: [],
      drag: [],
      stop: []
    };
    element.whenDragStarts = addListener(element, 'start');
    element.whenDragging = addListener(element, 'drag');
    element.whenDragStops = addListener(element, 'stop');
  }

  function addListener(element, type) {
    return function(listener) {
      element.draggableListeners[type].push(listener);
    };
  }

  function triggerEvent(type, args) {
    var result = true;
    var listeners = currentElement.draggableListeners[type];
    for (var i = listeners.length - 1; i >= 0; i--) {
      if (listeners[i](args) === false) result = false;
    };
    return result;
  }

  function setPositionType(element) {
    element.style.position = 'absolute';
  }

  function sendToBack(element) {
    var decreasedZIndex = fairlyHighZIndex - 1;
    element.style['z-index'] = decreasedZIndex;
    element.style['zIndex'] = decreasedZIndex;
  }

  function bringToFront(element) {
    element.style['z-index'] = fairlyHighZIndex;
    element.style['zIndex'] = fairlyHighZIndex;
    return element;
  }

  function addDocumentListeners() {
    document.addEventListener('selectstart', cancelDocumentSelection);
    document.addEventListener('mousemove', repositionElement);
    document.addEventListener('mouseup', removeDocumentListeners);
  }

  function inPixels(value) {
    return value + 'px';
  }

  function cancelDocumentSelection(event) {
    event.preventDefault && event.preventDefault();
    event.stopPropagation && event.stopPropagation();
    !event.preventDefault && (event.returnValue = false); // returnValue is deprecated
    return false;
  }

  function removeDocumentListeners(event) {
    document.removeEventListener('selectstart', cancelDocumentSelection);
    document.removeEventListener('mousemove', repositionElement);
    document.removeEventListener('mouseup', removeDocumentListeners);
    var element = currentElement;
    element.offsetX = (element.offsetX - event.clientX) * -1;
    element.offsetY = (element.offsetY - event.clientY) * -1;

// console.log("old X position", currentElement.startXPosition, "new X position",  event.clientX - currentElement.startXPosition)
// console.log("old Y position", currentElement.startYPosition, "new Y position", event.clientY - currentElement.startYPosition)
     //currentElement.startXPosition = event.clientX + event.clientX - currentElement.startXPosition// - currentElement.startXPosition // - rect.x;
     //currentElement.startYPosition = event.clientY + event.clientY - currentElement.startXPosition// - currentElement.startYPosition// - rect.y;

    // currentElement.startXPosition = (event.clientX - currentElement.startXPosition);
    // currentElement.startYPosition = (event.clientY - currentElement.startYPosition);
    
    //FIXME: don't use style
    var left = parseInt(currentElement.style.left, 10);
    var top = parseInt(currentElement.style.top, 10);
    triggerEvent('stop', new DraggableEvent(left,top, event));
  }

  return draggable;
});
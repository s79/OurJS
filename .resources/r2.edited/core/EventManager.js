/**
 * @name EventManager
 * @author sundongguo
 * @version 20080826
 * @need ElementManager
 *
 * 管理与event相关的内容。
 *
 * EventManager.bind($element,eventName,onEvent)  绑定事件（增加“鼠标进入/离开”和“拖拽”事件）
 * EventManager.unbind($element,eventName,onEvent)  解除事件
 * EventManager.getTargetElement(event)  获取触发对象（不一定等于监听对象）
 * EventManager.getKey(event)    获取按键信息
 * EventManager.getMouseButton(event)  获取鼠标按键
 * EventManager.getMouseWheel(event)  获取鼠标滚轮
 * EventManager.getMousePosition(event)  获取鼠标坐标
 * EventManager.stopPropagation(event)  取消冒泡
 * EventManager.preventDefault(event)  取消响应
 * EventManager.onDOMReady()    启用文档可用事件（自动运行并启用）
 * EventManager.setOnDOMReady(function)  设置当文档可用时执行的函数
 *
 * bind/unbind方法的eventName以DOM规范为准，绑定的函数为function(event){...}，传入event为事件对象。
 *
 * 自定义事件-鼠标进入/离开，eventName为"DOMMouseEnter"和"DOMMouseLeave"。
 * 这个功能是依赖事件传播的，当一个元素内的子元素绑定于mouseover的函数内取消了事件冒泡的话，当鼠标移入该子元素时，其父元素将触发"DOMMouseLeave"事件。
 *
 * 自定义事件-拖拽，eventName为"DOMDrag"，绑定的函数为function(event,x,y){...}，参数依次为事件对象、偏移横坐标、偏移纵坐标。
 * 当拖拽开始时，如果绑定的函数有before属性的另一函数，将执行之。
 * 当拖拽结束时，如果绑定的函数有after属性的另一函数，将执行之。
 *
 * 同一元素可以绑定多个不同的函数。
 * onEvent函数的this引用目标元素。
 *
 * onDOMReady方法将自动运行，此事件激活后，将删除EventManager对onDOMReady及的setOnDOMReady引用。
 * 用户可以用setOnDOMReady方法添加文档可用后运行的函数，可以多次添加，在文档可用后他们将顺次运行（包括样式表），这时window.onload尚未触发。
 * 使用此方法可避免当一个页面中如果有很多图片时，使用window.onload会有较长的等待才会去执行代码。
 * 在这些添加的函数中可以对DOM进行操作，但要注意此时图片等媒体是尚未载入的，如果有图片的宽度、高度未定义，却又尝试获取该图片可能影响到的元素的宽度或高度时，将得不到预期的效果。
 * 该方法综合了prototype 1.6、jquery 1.2.6、ext 2.0等各种实现方法的优点。
 */
//--------------------------------------------------[EventManager]
var EventManager = function() {
  function bind($element, eventName, onEvent) {
    //包裹函数。如果被DOM2的addEventListener调用则该函数的this为目标元素，如果被IE的attachEvent调用则该函数的this为window。此处统一设置为目标元素。
    function wrapper(event) {
      onEvent.call($element, event || window.event);
    }

    //防止重复绑定，DOM2的addEventListener本身可以防止重复绑定同一函数，但IE的attachEvent确允许多次绑定同一函数，此处阻止重复绑定。
    for (var i = 0; i < pool.length; i++) {
      var statement = pool[i];
      if (statement.$element === $element && statement.eventName === eventName && statement.onEvent === onEvent) {
        return;
      }
    }
    //向池压入。
    pool.push({$element:$element,eventName:eventName,onEvent:onEvent,wrapper:wrapper});
    //鼠标滚轮事件是个特例，IE5不支持，IE6、IE7、Opera、Safari使用的事件名为"mousewheel"，Firefox使用的事件名为"DOMMouseScroll"。
    if (eventName == "DOMMouseScroll" && /compatible|WebKit|Khtml|Opera/i.test(navigator.userAgent)) {
      eventName = "mousewheel";
    }
    //开始绑定，其中IE只支持attachEvent，Firefox、Safari只支持addEventListener，Opera两者都支持。
    if ($element.addEventListener) {
      $element.addEventListener(eventName, wrapper, false);
    }
    else if ($element.attachEvent) {
      $element.attachEvent("on" + eventName, wrapper);
    }
    else {
      $element["on" + eventName] = wrapper;
    }
  }

  function unbind($element, eventName, onEvent) {
    //包裹函数。
    var wrapper = null;
    //找到绑定的项目。
    for (var i = 0; i < pool.length; i++) {
      var statement = pool[i];
      if (statement.$element === $element && statement.eventName === eventName && statement.onEvent === onEvent) {
        wrapper = statement.wrapper;
        //从池弹出。
        pool.splice(i, 1);
        break;
      }
    }
    //找不到则返回。
    if (!wrapper) {
      return;
    }
    //鼠标滚轮特例。
    if (eventName == "DOMMouseScroll" && /compatible|WebKit|Khtml|Opera/i.test(navigator.userAgent)) {
      eventName = "mousewheel";
    }
    //开始解除。
    if ($element.removeEventListener) {
      $element.removeEventListener(eventName, wrapper, false);
    }
    else if ($element.detachEvent) {
      $element.detachEvent("on" + eventName, wrapper);
    }
    else {
      $element["on" + eventName] = null;
    }
  }

  function unbindAll() {
    while (pool.length > 0) {
      var statement = pool[0];
      unbind(statement.$element, statement.eventName, statement.onEvent);
    }
    if (window.onload) {
      window.onload = null;
    }
  }

  //自定义事件-鼠标进入/离开。
  function getElementObject($element) {
    for (var i = 0; i < pEL.length; i++) {
      if (pEL[i].$element === $element) {
        return pEL[i];
      }
    }
  }

  function mouseEnter(event) {
    var oEL = getElementObject(this);
    if (oEL.leave) {
      clearTimeout(oEL.leave);
      oEL.leave = null;
    }
    if (oEL.enter) {
      return;
    }
    for (var i = 0; i < oEL.enterFunctions.length; i++) {
      oEL.enterFunctions[i].call(this, event);
    }
    oEL.enter = true;
  }

  function mouseLeave(event) {
    var oEL = getElementObject(this);
    oEL.leave = setTimeout(function() {
      for (var i = 0; i < oEL.leaveFunctions.length; i++) {
        oEL.leaveFunctions[i].call(oEL.$element, event);
      }
      oEL.enter = oEL.leave = null
    }, 0);
  }

  function bindDOMMouseEnterAndLeave($element, onEvent, type) {
    //同一元素可以绑定多个不同的函数，但不能重复绑定相同的函数。
    for (var i = 0; i < pEL.length; i++) {
      if (pEL[i].$element === $element) {
        for (var j = 0; j < pEL[i][type + "Functions"].length; j++) {
          if (pEL[i][type + "Functions"][j] === onEvent) {
            return;
          }
        }
        pEL[i][type + "Functions"].push(onEvent);
        return;
      }
    }
    var o = {$element:$element,enterFunctions:[],leaveFunctions:[],enter:null,leave:null};
    o[type + "Functions"].push(onEvent);
    pEL.push(o);
    bind($element, "mouseover", mouseEnter);
    bind($element, "mouseout", mouseLeave);
  }

  function unbindDOMMouseEnterAndLeave($element, onEvent, type) {
    //如果解除后该元素可不再有其他绑定的函数，取消事件。
    for (var i = 0; i < pEL.length; i++) {
      if (pEL[i].$element === $element) {
        for (var j = 0; j < pEL[i][type + "Functions"].length; j++) {
          if (pEL[i][type + "Functions"][j] === onEvent) {
            pEL[i][type + "Functions"].splice(j, 1);
            if (pEL[i].enterFunctions.length == 0 && pEL[i].leaveFunctions.length == 0) {
              pEL.splice(i, 1);
              unbind($element, "mouseover", mouseEnter);
              unbind($element, "mouseout", mouseLeave);
            }
            return;
          }
        }
        return;
      }
    }
  }

  //自定义事件-拖拽。
  function drag(event) {
    for (var i = 0; i < oD.functions.length; i++) {
      oD.functions[i].call(oD.$element, event, event.clientX + ElementManager.getWindowSrollLeft() - oD.x, event.clientY + ElementManager.getWindowSrollTop() - oD.y);
    }
  }

  function drop(event) {
    if (oD.$element.releaseCapture) {
      oD.$element.releaseCapture();
    }
    unbind(document, "mousemove", drag);
    unbind(document, "mouseup", drop);
    unbind(window, "blur", drop);
    document.body.focus();
    for (var i = 0; i < oD.functions.length; i++) {
      if (oD.functions[i].after) {
        oD.functions[i].after.call(oD.$element, event);
      }
    }
    oD = {};
  }

  function initDOMDrag(event) {
    if (!EventManager.getMouseButton(event).left) {
      return;
    }
    EventManager.stopPropagation(event);
    EventManager.preventDefault(event);
    for (var i = 0; i < pD.length; i++) {
      if (pD[i].$element === this) {
        oD.$element = this;
        oD.functions = pD[i].functions;
        oD.x = event.clientX + ElementManager.getWindowSrollLeft();
        oD.y = event.clientY + ElementManager.getWindowSrollTop();
        break;
      }
    }
    for (var i = 0; i < oD.functions.length; i++) {
      if (oD.functions[i].before) {
        oD.functions[i].before.call(this, event);
      }
    }
    if (this.setCapture) {
      this.setCapture();
    }
    bind(document, "mousemove", drag);
    bind(document, "mouseup", drop);
    bind(window, "blur", drop);
  }

  function bindDOMDrag($element, onEvent) {
    //同一元素可以绑定多个不同的函数，但不能重复绑定相同的函数。
    for (var i = 0; i < pD.length; i++) {
      if (pD[i].$element === $element) {
        for (var j = 0; j < pD[i].functions.length; j++) {
          if (pD[i].functions[j] === onEvent) {
            return;
          }
        }
        pD[i].functions.push(onEvent);
        return;
      }
    }
    pD.push({$element:$element,functions:[onEvent]});
    bind($element, "mousedown", initDOMDrag);
  }

  function unbindDOMDrag($element, onEvent) {
    //如果解除后该元素可不再有其他绑定的函数，取消事件。
    for (var i = 0; i < pD.length; i++) {
      if (pD[i].$element === $element) {
        for (var j = 0; j < pD[i].functions.length; j++) {
          if (pD[i].functions[j] === onEvent) {
            pD[i].functions.splice(j, 1);
            if (pD[i].functions.length == 0) {
              pD.splice(i, 1);
              unbind($element, "mousedown", initDOMDrag);
            }
            return;
          }
        }
        return;
      }
    }
  }

  var pool = [];
  var pEL = [];
  var pD = [];
  var oD = {};
  var functions =
  {
    bind:function($element, eventName, onEvent) {
      if (eventName == "DOMDrag") {
        bindDOMDrag($element, onEvent);
      }
      else if (eventName == "DOMMouseEnter") {
        bindDOMMouseEnterAndLeave($element, onEvent, "enter");
      }
      else if (eventName == "DOMMouseLeave") {
        bindDOMMouseEnterAndLeave($element, onEvent, "leave");
      }
      else {
        bind($element, eventName, onEvent);
      }
    },
    unbind:function($element, eventName, onEvent) {
      if (eventName == "DOMDrag") {
        unbindDOMDrag($element, onEvent);
      }
      else if (eventName == "DOMMouseEnter") {
        unbindDOMMouseEnterAndLeave($element, onEvent, "enter");
      }
      else if (eventName == "DOMMouseLeave") {
        unbindDOMMouseEnterAndLeave($element, onEvent, "leave");
      }
      else {
        unbind($element, eventName, onEvent);
      }
    },
    getTargetElement:function(event) {
      return event.target || event.srcElement;
    },
    getKey:function(event) {
      var key =
      {
        keyCode:event.keyCode,
        ctrlKey:event.ctrlKey,
        altKey:event.altKey,
        shiftKey:event.shiftKey,
        metaKey:event.metaKey
      };
      return key;
    },
    getMouseButton:function(event) {
      var eW = event.which;
      var eB = event.button;
      var mouseButton =
      {
        left:eW ? eB == 0 : !!(eB & 1),
        middle:eW ? eB == 1 : !!(eB & 4),
        right:eW ? eB == 2 : !!(eB & 2)
      };
      return mouseButton;
    },
    //IE5不支持滚轮，将返回-1。
    getMouseWheel:function(event) {
      return event.wheelDelta == 0 || event.detail == 1 ? 0 : event.wheelDelta < 0 || event.detail > 0 ? 1 : -1;
    },
    getMousePosition:function(event) {
      var mousePosition =
      {
        clientX:event.clientX,
        clientY:event.clientY,
        offsetX:"offsetX" in event ? event.offsetX : event.layerX - 1,
        offsetY:"offsetY" in event ? event.offsetY : event.layerY - 1,
        screenX:event.screenX,
        screenY:event.screenY
      };
      return mousePosition;
    },
    stopPropagation:function(event) {
      event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
    },
    preventDefault:function(event) {
      event.preventDefault ? event.preventDefault() : event.returnValue = false;
    },
    onDOMReady:function() {
      var self = arguments.callee;
      self.pool = [];
      self.fire = function() {
        for (var i = 0; i < self.pool.length; i++) {
          self.pool[i]();
        }
        delete EventManager.onDOMReady;
        delete EventManager.setOnDOMReady;
      };
      //IE。
      if (window.ActiveXObject) {
//				var oDummy = document.createElement('document:ready');var oTimer = setInterval(function(){try{oDummy.doScroll('left');oDummy = null;clearInterval(oTimer);EventManager.onDOMReady.fire();}catch(e){}},10);
//				document.write("<"+"script src=\"//:\" defer=\"true\" onreadystatechange=\"if(this.readyState=='complete'){this.onreadystatechange=null;this.parentNode.removeChild(this);EventManager.onDOMReady.fire();}\"></script"+">");
        //使用removeChild后可能导致iframe的src错乱。未知BUG。
        document.write("<" + "script src=\"//:\" defer=\"true\" onreadystatechange=\"if(this.readyState=='complete'){this.onreadystatechange=null;EventManager.onDOMReady.fire();}\"></script" + ">");
        return;
      }
      //Opera<9。
      if (window.opera && parseInt(window.opera.version()) < 9) {
        function operaDOMReady() {
          for (var i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].disabled) {
              setTimeout(arguments.callee, 0);
              return;
            }
          }
          EventManager.onDOMReady.fire();
        }

        (function() {
          /loaded|complete/.test(document.readyState) ? operaDOMReady() : setTimeout(arguments.callee, 0);
        })();
        return;
      }
      //Safari。
      if (/WebKit|Khtml/i.test(navigator.userAgent)) {
        function safariDOMReady() {
          var nStyles = 0;
          var aLinks = document.getElementsByTagName("link");
          var aStyles = document.getElementsByTagName("style");
          for (var i = 0; i < aLinks.length; i++) {
            if (aLinks[i].rel.toLowerCase() == "stylesheet") {
              nStyles++;
            }
          }
          nStyles += aStyles.length;
          (function() {
            document.styleSheets.length == nStyles ? EventManager.onDOMReady.fire() : setTimeout(arguments.callee, 0);
          })();
        }

        (function() {
          /loaded|complete/.test(document.readyState) ? safariDOMReady() : setTimeout(arguments.callee, 0);
        })();
        return;
      }
      //原生支持的浏览器。
      if (document.addEventListener) {
        document.addEventListener("DOMContentLoaded", EventManager.onDOMReady.fire, false);
      }
      //极少情况，绑定到window.onload。
      else {
        window.onload = EventManager.onDOMReady.fire;
      }
    },
    setOnDOMReady:function(onDOMReady) {
      EventManager.onDOMReady.pool.push(onDOMReady);
    }
  };
  bind(window, "unload", unbindAll);
  return functions;
}();
EventManager.onDOMReady();
EventManager.setOnDOMReady(function() {
  if (typeof onDOMReady == "function") {
    onDOMReady();
  }
});

/*!
 * Highcharts adapter for OurJS.
 *  Highcharts version: v2.2.5 (2012-06-08)
 *  Highcharts license: www.highcharts.com/license
 */

/**
 * @fileOverview 为 Highcharts 提供的适配器。
 * @author sundongguo@gmail.com
 * @version 20120808
 */

execute(function($) {
//==================================================[Highcharts 适配器]
  var uid = 0;
  var pathAnimation;
  var copy = function(destination, original) {
    Object.forEach(original, function(value, key) {
      value = original[key];
      if (value && typeof value === 'object' && value.constructor !== Array && typeof value.nodeType !== 'number') {
        destination[key] = copy(destination[key] || {}, value);
      } else {
        destination[key] = original[key];
      }
    });
    return destination;
  };

//--------------------------------------------------[HighchartsAdapter]
  window.HighchartsAdapter = {
    /**
     * Initialize the adapter. This is run once as Highcharts is first run.
     * @param {Object} pathAnim The helper object to do animations across adapters.
     */
    init: function(pathAnim) {
      pathAnimation = pathAnim;
    },

    /**
     * Run a general method on the framework, following jQuery syntax.
     * @param {Object} el The HTML element.
     * @param {String} method Which method to run on the wrapped element.
     */
    adapterRun: function(el, method) {
      // This currently works for getting inner width and height. If adding
      // more methods later, we need a conditional implementation for each.
      return parseInt($(el).getStyle(method), 10);
    },

    /**
     * Downloads a script and executes a callback when done.
     */
    getScript: function(scriptLocation, callback) {
      document.loadScript(scriptLocation, callback ? {onLoad: callback} : null);
    },

    /**
     * Executes a provided function once per array element.
     */
    each: function(arr, fn) {
      // IE9- 有时会传入 Collection。
      Array.from(arr).forEach(fn);
    },

    /**
     * Creates a new array with all elements that pass the test implemented by the provided function.
     */
    grep: function(arr, fn) {
      return arr.filter(fn);
    },

    /**
     * Creates a new array with the results of calling a provided function on every element in this array.
     */
    map: function(arr, fn) {
      return arr.map(fn);
    },

    /**
     * Deep merge two or more objects and return a new object.
     */
    merge: function() {
      var result = {};
      var i;
      for (i = 0; i < arguments.length; i++) {
        result = copy(result, arguments[i]);
      }
      return result;
    },

    /**
     * Add an event listener.
     * @param {Object} el HTML element or custom object.
     * @param {String} type Event type.
     * @param {Function} fn Event handler.
     */
    addEvent: function(el, type, fn) {
      if (!fn.uid) {
        fn.uid = ++uid;
      }
      if (el.fire) {
        el.on(type + '.hc' + uid, fn);
      } else {
        if (!el.events) {
          el.events = {};
        }
        // 自定义对象的 events 可能被 Highcharts 占用，且对应的 key 的类型为 function，OurJS 需要数组，因此先将名称进行转义。
        if (typeof el.events[type] === 'function') {
          type = '_' + type + '_';
        }
        Component.prototype.on.call(el, type, fn);
      }
    },

    /**
     * Remove an event listener.
     */
    removeEvent: function(el, type, fn) {
      var uid = '';
      if (fn && fn.uid) {
        uid = fn.uid;
      }
      if (el.fire) {
        if (type) {
          el.off(type + '.hc' + uid);
        } else {
        }
      } else {
        if (!el.events) {
          el.events = {};
        }
        if (type) {
          if (typeof el.events[type] === 'function') {
            delete el.events[type];
            type = '_' + type + '_';
          }
          Component.prototype.off.call(el, type);
        } else {
          el.events = {};
        }
      }
    },

    /**
     * Fire an event.
     */
    fireEvent: function(el, type, eventArguments, defaultFunction) {
      eventArguments = eventArguments || {};
      eventArguments.preventDefault = function() {
        this.isDefaultPrevented = function() {
          return true;
        };
        defaultFunction = null;
      };
      var event;
      if (el.fire) {
        event = el.fire(type, eventArguments);
      } else {
        if (!el.events) {
          el.events = {};
        }
        if (typeof el.events[type] === 'function') {
          var originalType = type;
          type = '_' + type + '_';
        }
        event = Component.prototype.fire.call(el, type, eventArguments);
        if (originalType) {
          if (el.events[originalType].call(el, event) === false) {
            event.preventDefault();
          }
        }
      }
      if (defaultFunction) {
        defaultFunction(event);
      }
    },

    /**
     * Set back e.pageX and e.pageY.
     */
    washMouseEvent: function(e) {
      return e;
    },

    /**
     * Get the offset of an element relative to the top left corner of the viewport.
     */
    offset: function(el) {
      return $(el).getClientRect();
    },

    /**
     * Animate a SVG element wrapper.
     */
    animate: function(el, params, options) {
      options = options || {};
      var duration = options.duration || 400;
      var onFinish = options.complete;
      // 不播放不必要的动画（约占所有动画的 15% - 20%）。
      var enabled = false;
      var morphing = {};
      var paths;
      if (params.d) {
        paths = pathAnimation.init(el, el.d, params.d);
        paths.push(params.d);
        delete params.d;
        enabled = true;
      }
      Object.forEach(params, function(value, key) {
        // 当前值和增量，数字类型。
        var currentValue = el.attr(key);
        var increment = params[key] - currentValue;
        // 要变化的值，若增量为零则不添加。
        if (increment) {
          morphing[key] = [currentValue, increment];
          enabled = true;
        }
      });
      if (enabled) {
        el.animation = new Animation()
            .addClip(
            Animation.createBasicRenderer(function(x, y) {
              Object.forEach(morphing, function(value, key) {
                el.attr(key, value[0] + value[1] * y);
              });
              if (paths) {
                el.attr('d', pathAnimation.step(paths[0], paths[1], y, paths[2]));
              }
            }), 0, duration, 'linear')
            .on('playfinish', function() {
              delete el.animation;
              if (onFinish) {
                onFinish();
              }
            })
            .play();
      }
    },

    /**
     * Stop running animations on the object.
     */
    stop: function(el) {
      if (el.animation) {
        el.animation.pause();
        delete el.animation;
      }
    }
  };

});

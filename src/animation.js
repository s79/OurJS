/**
 * @fileOverview 动画效果控制。
 * @author sundongguo@gmail.com
 * @version 20120214
 */
// TODO: scroll 方法。
// TODO: stop 后一个动画的耗时（用于反向动画）。
(function() {
//==================================================[Animation]
  /*
   * 调用流程：
   *   var animation = new Animation(proceed, options);
   *   animation.play() -> animation.onStart() -> proceed(x, y) -> animation.onFinish()
   *   animation.play() -> animation.onStart() -> proceed(x, y) [动画执行过程中调用 animation.stop()]
   *
   * 说明：
   *   上述步骤到达 proceed(x, y) 时，该函数会以每秒最多 62.5 次的频率被调用（每 16 毫秒一次），实际频率视计算机的速度而定，当计算机的速度比期望的慢时，动画会以“跳帧”的方式来确保整个动画效果的消耗时间尽可能的接近设定时间。
   *   传入 proceed 函数的参数 x 为时间轴，从 0 趋向于 1；y 为偏移量，通常在 0 和 1 之间。
   *   在动画在进行中时，执行动画对象的 stop 方法即可停止 proceed 的继续调用，但也会阻止回调函数 onFinish 的执行。
   *   play 可以反向播放，但要注意，若要支持反向播放，需要对 proceed 的 x 的值为 0 和 1 时做的事情（如果有）或者 start/finish 也做反向处理，如添加事件 backwardsstart/backwardsfinish。  // TODO
   */
  // 唯一识别码。
  var uid = 0;

  // 空函数。
  var empty = function() {
  };

  // 动画引擎，用于挂载各播放中的动画，并同频同步播放他们的每一帧。
  var engine = {
    mountedAnimations: {},
    mountedCount: 0,
    mountAnimation: function(animation) {
      animation.mounted = true;
      this.mountedAnimations[animation.uid] = animation;
      this.mountedCount++;
      // 启动引擎。
      if (!engine.timer) {
        engine.timer = setInterval(function() {
          // 播放全部挂载的动画。
//          console.log('>ENGING RUNNING mountedCount:', engine.mountedCount);
          var timestamp = Date.now();
          Object.forEach(engine.mountedAnimations, function(animation) {
            var backwards = animation.backwards;
            var timeline = animation.timeline;
            var lastTimestamp = animation.timestamp || timestamp;
            var duration = animation.duration;
            // 计算步长。
            var step = (duration > 0 ? (timestamp - lastTimestamp) / duration : 1) * (backwards ? -1 : 1);
            // 动画的时间轴。
            var x = animation.timeline = Math.limit(timeline + step, 0, 1);
            animation.timestamp = timestamp;
            // 本帧为第一帧。
            if (x == backwards) {
              animation.onStart();
            }
            // 播放当前帧。
            var y = x === 0 ? 0 : (x === 1 ? 1 : animation.timingFunction(x));
            animation.proceed(x, y);
            animation.onStep();
            // 本帧为最后一帧。
            if (x == !backwards) {
              animation.stop();
              animation.onFinish();
            }
          });
          // 停止引擎。
          if (engine.mountedCount === 0) {
            console.warn('>ENGING STOP', engine.timer);
            clearInterval(engine.timer);
            delete engine.timer;
          }
        }, 16);
        console.warn('>ENGING START', engine.timer);
      }
//      console.log('[engine.mountAnimation] mountedCount:', engine.mountedCount, JSON.stringify(Object.keys(engine.mountedAnimations)));
    },
    unmountAnimation: function(animation) {
      delete animation.mounted;
      delete this.mountedAnimations[animation.uid];
      this.mountedCount--;
//      console.log('[engine.unmountAnimation] mountedCount:', this.mountedCount, Date.now());
    }
  };

  // 根据指定的 X 坐标（时间点）获取一个 cubic bezier 函数的 Y 坐标（偏移量）。
  // http://www.netzgesta.de/dev/cubic-bezier-timing-function.html
  var cubicBezier = function(p1x, p1y, p2x, p2y) {
    var ax = 0, bx = 0, cx = 0, ay = 0, by = 0, cy = 0;
    var sampleCurveX = function(t) {
      return ((ax * t + bx) * t + cx) * t;
    };
    var sampleCurveY = function(t) {
      return ((ay * t + by) * t + cy) * t;
    };
    var solveCurveX = function(t) {
      var t0, t1, t2, x2, d2, i;
      var epsilon = 0.001;
      for (t2 = t, i = 0; i < 8; i++) {
        x2 = sampleCurveX(t2) - t;
        if (Math.abs(x2) < epsilon) {
          return t2;
        }
        d2 = (3.0 * ax * t2 + 2.0 * bx) * t2 + cx;
        if (Math.abs(d2) < 1e-6) {
          break;
        }
        t2 = t2 - x2 / d2;
      }
      t0 = 0.0;
      t1 = 1.0;
      t2 = t;
      if (t2 < t0) {
        return t0;
      }
      if (t2 > t1) {
        return t1;
      }
      while (t0 < t1) {
        x2 = sampleCurveX(t2);
        if (Math.abs(x2 - t) < epsilon) {
          return t2;
        }
        if (t > x2) {
          t0 = t2;
        } else {
          t1 = t2;
        }
        t2 = (t1 - t0) * .5 + t0;
      }
      return t2;
    };
    cx = 3.0 * p1x;
    bx = 3.0 * (p2x - p1x) - cx;
    ax = 1.0 - cx - bx;
    cy = 3.0 * p1y;
    by = 3.0 * (p2y - p1y) - cy;
    ay = 1.0 - cy - by;
    return function(t) {
      return sampleCurveY(solveCurveX(t));
    };
  };

  // 内置控速函数。  // TODO: 对外暴露并提供添加/删除的 API。
  // http://www.w3.org/TR/css3-transitions/
  var timingFunctions = {
    linear: function(x) {
      return x;
    },
    bounce: function(x) {
      var y;
      for (var a = 0, b = 1; 1; a += b, b /= 2) {
        if (x >= (7 - 4 * a) / 11) {
          y = b * b - Math.pow((11 - 6 * a - 11 * x) / 4, 2);
          break;
        }
      }
      return y;
    },
    ease: cubicBezier(0.25, 0.1, 0.25, 1.0),
    easeIn: cubicBezier(0.42, 0, 1.0, 1.0),
    easeOut: cubicBezier(0, 0, 0.58, 1.0),
    easeInOut: cubicBezier(0.42, 0, 0.58, 1.0),
    easeOutIn: cubicBezier(0, 0.42, 1.0, 0.58)
  };

//--------------------------------------------------[Animation Constructor]
  /**
   * 创建动画效果。
   * @name Animation
   * @constructor
   * @param {Function} proceed 执行函数。
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Animation.options 中。
   * @param {string} options.transition 控速方式，默认为 'ease'。
   * @param {number} options.duration 动画持续时间，单位为毫秒，默认为 400。
   * @param {Function} options.onStart 动画开始时（绘制第一帧之前）执行的回调函数。
   * @param {Function} options.onFinish 动画结束时（绘制最后一帧之后）执行的回调函数。
   */
  function Animation(proceed, options) {
    this.uid = ++uid;
    this.proceed = proceed;
    Object.append(this, Object.append(Object.clone(Animation.options, true), options));
    var timingFunction = timingFunctions[this.transition];
    if (!timingFunction) {
      if (this.transition.startsWith('cubicBezier')) {
//        'cubicBezier(0.42, 1.0, 0.75, 1.0)'.match(/^cubicBezier\((0\.\d+|0|1\.0+|1),\s*(0\.\d+|0|1\.0+|1),\s*(0\.\d+|0|1\.0+|1),\s*(0\.\d+|0|1\.0+|1)/)
        timingFunction = cubicBezier.apply(null, this.transition.slice(12, -1).split(',').map(function(item) {
          return parseFloat(item);
        }));
      } else {
        timingFunction = timingFunctions.ease;
      }
    }
    this.timingFunction = timingFunction;
  }

  window.Animation = Animation;

//--------------------------------------------------[Animation.prototype.play]
  /**
   * 播放动画。
   * @name Animation.prototype.play
   * @function
   * @param {boolean} [backwards] 是否倒放。
   * @returns {Object} animation 对象。
   */
  Animation.prototype.play = function(backwards) {
    if (!this.mounted) {
      this.backwards = backwards = !!backwards;
      this.timeline = this.timeline || (backwards ? 1 : 0);
      engine.mountAnimation(this);
    }
    return this;
  };

//--------------------------------------------------[Animation.prototype.pause]
  /**
   * 暂停动画。
   * @name Animation.prototype.pause
   * @function
   * @returns {Object} animation 对象。
   */
  Animation.prototype.pause = function() {
    if (this.mounted) {
      delete this.backwards;
      delete this.timestamp;
      engine.unmountAnimation(this);
      this.onPause();
    }
    return this;
  };

//--------------------------------------------------[Animation.prototype.stop]
  /**
   * 停止动画。
   * @name Animation.prototype.stop
   * @function
   * @returns {Object} animation 对象。
   */
  Animation.prototype.stop = function() {
    if (this.mounted) {
      // 先卸载动画，以免一个动画的 onFinish 回调中无法重新播放自身。
      delete this.backwards;
      delete this.timeline;
      delete this.timestamp;
      engine.unmountAnimation(this);
      // 若此时有新的动画插入，将直接开始播放。
      this.onStop();
    } else if (this.timeline) {  // TODO: 优化合并。
      delete this.timeline;
      this.onStop();
    }
    return this;
  };

//--------------------------------------------------[Animation.options]
  /**
   * 默认选项。
   * @name Animation.options
   */
  Animation.options = {
    transition: 'ease',
    duration: 400,
    onStart: empty,
    onStep: empty,
    onPause: empty,
    onFinish: empty,
    onStop: empty
  };

})();

(function() {
//==================================================[Element 扩展 - 动画]
  /*
   * 为 Element 扩展动画方法。
   *
   * 扩展方法：
   *   Element.prototype.animate
   *   Element.prototype.stopAnimate
   *   Element.prototype.fadeIn
   *   Element.prototype.fadeOut
   */
  // 保存队列。
  var queuePool = {};

//--------------------------------------------------[Element.prototype.animate]
  // 可变的 CSS properties 类型。
  var TYPE_NUMBER = 1;
  var TYPE_LENGTH = 2;
  var TYPE_COLOR = 4;

  // 可变的 CSS properties 列表。
  //   - 'font-weight' 在 IE6 IE7 IE8 下不能设置数字值。
  //   - 'zoom' 各浏览器支持情况差异较大。
  // http://www.w3.org/TR/css3-transitions/#properties-from-css-
  var acceptableProperties = {};
  var typeIsNumber = ['opacity'];
  var typeIsLength = ['top', 'right', 'bottom', 'left', 'width', 'height', 'outlineWidth', 'backgroundPositionX', 'backgroundPositionY', 'fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing', 'textIndent'];
  var typeIsColor = ['color', 'backgroundColor', 'outlineColor'];
  ['Top', 'Right', 'Bottom', 'Left'].forEach(function(side) {
    typeIsLength.push('margin' + side, 'padding' + side, 'border' + side + 'Width');
    typeIsColor.push('border' + side + 'Color');
  });
  typeIsNumber.forEach(function(property) {
    acceptableProperties[property] = TYPE_NUMBER;
  });
  typeIsLength.forEach(function(property) {
    acceptableProperties[property] = TYPE_LENGTH;
  });
  typeIsColor.forEach(function(property) {
    acceptableProperties[property] = TYPE_COLOR;
  });

  // 转换数字和长度值为整数。
  var parseNumberAndLength = function(value) {
    var parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? 0 : parsedValue;
  };

  // 转换颜色值为包含三个整数的数组。
  var RE_HEX_COLOR = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
  var RE_RGB_COLOR = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
  var parseColor = function(value) {
    // 将默认的颜色设置为白色。
    var parsedValue = [255, 255, 255];
    var match;
    if (match = value.match(RE_HEX_COLOR)) {
      parsedValue = Array.from(match).slice(1).map(function(hexadecimal) {
        return parseInt(hexadecimal, 16);
      });
    } else if (match = value.match(RE_RGB_COLOR)) {
      parsedValue = Array.from(match).slice(1).map(function(decimal) {
        return +decimal;
      });
    }
    return parsedValue;
  };

  // 过滤和转换动画需要改变的样式。
  var parsedStyles = function(styles) {
    var parsedStyles = {};
    Object.forEach(styles, function(value, name) {
      switch (acceptableProperties[name]) {
        case TYPE_NUMBER:
        case TYPE_LENGTH:
          parsedStyles[name] = parseNumberAndLength(value);
          break;
        case TYPE_COLOR:
          parsedStyles[name] = parseColor(value);
          break;
      }
    });
    return parsedStyles;
  };

  // 播放指定队列的动画。
  // queue.currentAnimation 为当前正在播放的动画，queue 数组中的内容为排队的动画。
  var playAnimationQueue = function(queueId) {
    var queue = queuePool[queueId];
    if (!queue) {
      return;
    }
//    console.log('[playAnimationQueue] queue.length:', queue.length);
    if (!queue.length) {
      delete queuePool[queueId];
      return;
    }
    // 要播放的动画的参数。
    var item = queue.shift();
    var $element = item[0];
    var styles = item[1] || {};
    var options = item[2] || {};
    // 将 onStart 传递到 Animation 的选项中。
    var onStart = options.onStart;
    if (onStart) {
      options.onStart = function() {
        return onStart.call($element);
      };
    }
    // 选项 onPlay 在每一次处理时都会调用。
    var onPlay = options.onPlay || null;
    // 覆盖 onFinish，并将已有的 onFinish 传递到 Animation 的选项中。
    var onFinish = options.onFinish;
    options.onFinish = function() {
      var onFinishResult;
      if (onFinish) {
        onFinishResult = onFinish.call($element);
      }
      delete queue.currentAnimation;
      playAnimationQueue(queueId);
      return onFinishResult;
    };
    // 过滤和转换样式。
    var transitiveProperties = {  // TODO: 可优化，合二为一。
      before: parsedStyles($element.getStyles(Object.keys(styles))),
      after: parsedStyles(styles)
    };
    // 开始播放动画。
    queue.currentAnimation = new Animation(function(x, y) {
      Object.forEach(transitiveProperties.before, function(beforeValue, name) {
        var afterValue = transitiveProperties.after[name];
        var currentValue;
        switch (acceptableProperties[name]) {
          case TYPE_NUMBER:
            currentValue = (beforeValue + (afterValue - beforeValue) * y).toFixed(2);
            break;
          case TYPE_LENGTH:
            currentValue = Math.floor(beforeValue + (afterValue - beforeValue) * y) + 'px';  // TODO: 支持多种长度单位
            break;
          case TYPE_COLOR:
            currentValue = 'rgb(' +
                Math.floor(beforeValue[0] + (afterValue[0] - beforeValue[0]) * y) + ', ' +
                Math.floor(beforeValue[1] + (afterValue[1] - beforeValue[1]) * y) + ', ' +
                Math.floor(beforeValue[2] + (afterValue[2] - beforeValue[2]) * y) + ')';
            break;
        }
        $element.setStyle(name, currentValue);
      });
      onPlay && onPlay.call($element);
    }, options).play();
  };

  /**
   * 在元素的动画队列中添加一个动画效果。
   * @name Element.prototype.animate
   * @function
   * @param {Object} styles 目标样式，元素将向指定的目标样式过渡。目标样式包含一条或多条要设置的样式声明，具体如下：
   *   1. 与 setStyles 的参数一致，格式为 {propertyName: propertyValue, ...} 的对象。
   *   2. propertyName 只支持 camel case，并且不能使用复合属性。
   *   3. propertyValue 若为数字，则为期望长度单位的特性值自动添加长度单位 'px'。
   *   4. lineHeight 仅支持 'px' 单位的长度设置，而不支持数字。
   * @param {Object} [options] 动画选项，与 Animation 的 options 参数基本一致，区别是：
   *   1. 增加 onPlay 回调选项。
   *   2. onStart、onPlay、(TODO: onStop、)onFinish 的 this 均为调用本方法的元素。
   *   3. 提供了一个 queueName 属性用来更方便的控制队列。
   * @param {Object} options.onPlay 每播放完一帧动画后的回调函数。
   * @returns {Element} 调用本方法的元素。
   * @description
   *   队列是指将需要较长时间完成的多个指令排序，以先进先出的形式逐个执行这些指令。
   *   在元素上调用本方法添加动画时：
   *     - 若该元素并未播放动画，新添加的动画会直接开始播放。
   *     - 若该元素正在播放动画，新添加的动画将被添加到队列末端，在前一个动画播放完毕后自动播放。
   *   给不同元素添加的动画永远有不同的队列，给相同元素添加的动画默认有相同的队列，但可以通过 options.queueName 来指定新队列的名称。
   *   若需要连接不同元素的动画队列，请配合动画参数 options.onFinish 来实现。
   *   允许使用的“可过渡样式”仅限于值为长度单位或颜色单位的样式。
   */
  Element.prototype.animate = function(styles, options) {
    options = options || {};
    var queueName = options.queueName;
    var queueId = this.uid + (queueName ? ':' + queueName : '');
    var queue = queuePool[queueId];
    if (queue) {
      queue.push([this, styles, options]);
    } else {
      queuePool[queueId] = [
        [this, styles, options]
      ];
      playAnimationQueue(queueId);
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.stopAnimate]
  /**
   * 停止播放指定的动画队列。
   * @name Element.prototype.stopAnimate
   * @function
   * @param {string} [queueName] 队列名。
   * @returns {Element} 调用本方法的元素。
   */
  Element.prototype.stopAnimate = function(queueName) {
    var queueId = this.uid + (queueName ? ':' + queueName : '');
    var queue = queuePool[queueId];
    if (queue) {
      if (queue.currentAnimation) {
        queue.currentAnimation.stop();
        delete queue.currentAnimation;
      }
      queue.length = 0;
      delete queuePool[queueId];
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.getAnimationQueue]
  /**
   * 获取指定的动画队列，队里中仅包含尚未播放的动画效果。如果队列为空，将返回 null。
   * @name Element.prototype.getAnimationQueue
   * @function
   * @param {string} [queueName] 队列名。
   * @returns {Array} 指定的动画队列。
   * @description
   *   可以通过此方法判断指定的动画队列是否正在播放。返回数组即正在播放，数组的 currentAnimation 属性为播放中的动画，数组中的内容为排队的动画。
   *   可以通过操作这个队列改变动画的播放行为。
   *   队列格式：[Element element, Object styles, Object options]
   */
  Element.prototype.getAnimationQueue = function(queueName) {
    var queueId = this.uid + (queueName ? ':' + queueName : '');
    return queuePool[queueId] || null;
  };

//--------------------------------------------------[Element.prototype.fadeIn]
  /**
   * 让元素渐显。
   * @name Element.prototype.fadeIn
   * @function
   * @param {Object} [options] 动画选项，请参考 Element.prototype.animate 的 options 参数。
   * @returns {Element} 调用本方法的元素。
   */
  Element.prototype.fadeIn = function(options) {
    options = options || {};
    var styles = {};
    var onBeforeStart = options.onBeforeStart;
    options.onBeforeStart = function() {
      if (this.offsetWidth) {
        return false;
      }
      var returnValue;
      if (onBeforeStart) {
        returnValue = onBeforeStart.call(this);
      }
      if (returnValue !== false) {
        styles.opacity = this.getStyle('opacity');
        this.setStyles({'display': 'block', 'opacity': 0});
      }
      return returnValue;
    };
    return this.animate(styles, options);
  };

//--------------------------------------------------[Element.prototype.fadeOut]
  /**
   * 让元素渐隐。
   * @name Element.prototype.fadeOut
   * @function
   * @param {Object} [options] 动画选项，请参考 Element.prototype.animate 的 options 参数。
   * @returns {Element} 调用本方法的元素。
   */
  Element.prototype.fadeOut = function(options) {
    options = options || {};
    var opacity;
    var onBeforeStart = options.onBeforeStart;
    options.onBeforeStart = function() {
      if (!this.offsetWidth) {
        return false;
      }
      var returnValue;
      if (onBeforeStart) {
        returnValue = onBeforeStart.call(this);
      }
      if (returnValue !== false) {
        opacity = this.getStyle('opacity');
      }
      return returnValue;
    };
    var onFinish = options.onFinish;
    options.onFinish = function() {
      this.setStyles({'display': 'none', 'opacity': opacity});
      if (onFinish) {
        return onFinish.call(this);
      }
    };
    return this.animate({opacity: 0}, options);
  };

})();

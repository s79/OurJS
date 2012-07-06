/**
 * @fileOverview 动画。
 * @author sundongguo@gmail.com
 * @version 20120412
 */
(function() {
//==================================================[Animation]
  /*
   * 调用流程：
   *   var animation = new Animation(...).addClip(...);
   *   animation.play()<play><playstart>          -> (x, y) <step> -> ... -> <playfinish>
   *   animation.reverse()<reverse><reversestart> -> (x, y) <step> -> ... -> <reversefinish>
   *                                                               -> animation.pause<pause> -> animation.stop()<stop>
   *                                                                                         -> animation.play()<play>       -> (x, y) <step> ->>>
   *                                                                                         -> animation.reverse()<reverse> -> (x, y) <step> ->>>
   *                                                               -> animation.stop<stop>
   *
   * 说明：
   *   上述步骤到达 (x, y) 时，每个剪辑会以每秒最多 62.5 次的频率被播放（每 16 毫秒一次），实际频率视计算机的速度而定，当计算机的速度比期望的慢时，动画会以“跳帧”的方式来确保整个动画的消耗时间尽可能的接近设定时间。
   *   传入函数的参数 x 为时间点，y 为偏移量，他们的值都将从 0 趋向于 1。
   *   在动画在进行中时，执行动画对象的 stop 方法即可停止的继续调用，但也会阻止事件 end 的触发。
   *   调用 reverse 可以反向播放，但要注意，反向播放时，需要对动画剪辑中正向播放时非线性变换的内容也做反向处理。
   *   播放一个动画时，调用 play 或 reverse 方法后即同步播放对应方向的首帧，中间帧及末帧由引擎异步播放。
   *   如果一个动画剪辑的持续时间为 0，则 play 时传入的 x 值为 1，reverse 时传入的 x 值为 0。
   *
   * 操作 Animation 对象和调用 Element 上的相关动画方法的差别：
   *   当需要定制一个可以精确控制的动画时，建议使用 Animation，Animation 对象中的 Clip 会记录动画创建时的状态，而且不仅可以正向播放，还可以随时回退到起点。
   *   否则应使用 Element 实例上的对应简化动画方法，这些简化方法每次调用都会自动创建新的 Animation 对象，而不保留之前的状态，这样就可以随时以目标元素最新的状态作为起点来播放动画。
   *   一个明显的差异是为不同类型的样式渐变动画设置相同的相对长度的变化值：
   *   在直接使用 Animation 的情况下，无论如何播放/反向播放，目标元素将始终在起点/终点之间渐变。
   *   在使用 Element.prototype.morph 方法时，传入同样的参数，多次播放时，目标元素将以上一次的终点作为起点，开始渐变。
   */

  // 唯一识别码。
  var uid = 0;

  // 供内部调用的标记值。
  var INTERNAL_IDENTIFIER_REVERSE = {};

  // 动画的状态。
  var START_POINT = -2;
  var REVERSING = -1;
  var PASUING = 0;
  var PLAYING = 1;
  var END_POINT = 2;

  // 动画剪辑的状态。
  var BEFORE_START_POINT = -1;
  var ACTIVE = 0;
  var AFTER_END_POINT = 1;

  // 三次贝塞尔曲线生成函数，根据指定的 X 坐标（时间点）获取 Y 坐标（偏移量）。
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
  // 内置控速函数。
  // http://www.w3.org/TR/css3-transitions/
  var builtInTimingFunctions = {
    linear: function(x) {
      return x;
    },
    bounceIn: function(x) {
      x = 1 - x;
      var y;
      for (var a = 0, b = 1; 1; a += b, b /= 2) {
        if (x >= (7 - 4 * a) / 11) {
          y = b * b - Math.pow((11 - 6 * a - 11 * x) / 4, 2);
          break;
        }
      }
      return 1 - y;
    },
    bounceOut: function(x) {
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
  // 获取控速函数。
  var getTimingFunction = function(name) {
    name = name || '';
    return builtInTimingFunctions[name] || (name.startsWith('cubicBezier') ? cubicBezier.apply(null, name.slice(12, -1).split(',').map(function(item) {
      return parseFloat(item);
    })) : builtInTimingFunctions.ease);
  };

  // 播放动画对应某一时间点的某一帧。
  var playAnimation = function(animation, timePoint, isPlayMethod) {
    // 播放当前帧。
    animation.clips.forEach(function(clip) {
      var active = false;
      var duration = clip.duration;
      var x = (timePoint - clip.delay) / Math.max(1, duration);
      if (isPlayMethod) {
        if (clip.status === AFTER_END_POINT) {
          return;
        }
        if (clip.status === BEFORE_START_POINT) {
          if (x >= 0) {
            x = duration ? 0 : 1;
            clip.status = ACTIVE;
          }
        }
        if (clip.status === ACTIVE) {
          active = true;
          if (x >= 1) {
            x = 1;
            clip.status = AFTER_END_POINT;
          }
        }
      } else {
        if (clip.status === BEFORE_START_POINT) {
          return;
        }
        if (clip.status === AFTER_END_POINT) {
          if (x <= 1) {
            x = duration ? 1 : 0;
            clip.status = ACTIVE;
          }
        }
        if (clip.status === ACTIVE) {
          active = true;
          if (x <= 0) {
            x = 0;
            clip.status = BEFORE_START_POINT;
          }
        }
      }
      if (active) {
        clip.call(animation, x, x === 0 ? 0 : (x === 1 ? 1 : clip.timingFunction(x)));
      }
    });
    // 触发事件。
    animation.fire('step');
    if (isPlayMethod) {
      if (timePoint === animation.duration) {
        if (animation.timestamp) {
          unmountAnimation(animation);
        }
        animation.status = END_POINT;
        animation.fire('playfinish');
      }
    } else {
      if (timePoint === 0) {
        if (animation.timestamp) {
          unmountAnimation(animation);
        }
        animation.status = START_POINT;
        animation.fire('reversefinish');
      }
    }
  };

  // 动画引擎，用于挂载各播放中的动画，并同频同步播放他们的每一帧。
  var engine;
  var mountedAnimations = {};
  var mountedCount = 0;
  var mountAnimation = function(animation) {
    animation.timestamp = Date.now();
    mountedAnimations[animation.uid] = animation;
    mountedCount++;
//    console.log('[mountAnimation] mountedCount:', mountedCount, JSON.stringify(Object.keys(mountedAnimations)));
    // 启动引擎。
    if (!engine) {
      engine = setInterval(function() {
        // 播放挂载的动画。
//        console.log('>ENGING RUNNING mountedCount:', mountedCount);
        var timestamp = Date.now();
        Object.forEach(mountedAnimations, function(animation) {
          var isPlayMethod = animation.status === PLAYING;
          var timePoint = Math.limit(animation.timePoint + (timestamp - animation.timestamp) * (isPlayMethod ? 1 : -1), 0, animation.duration);
          animation.timestamp = timestamp;
          animation.timePoint = timePoint;
          playAnimation(animation, timePoint, isPlayMethod);
        });
        // 停止引擎。
        if (mountedCount === 0) {
//          console.warn('>ENGING STOP', engine);
          clearInterval(engine);
          engine = undefined;
        }
      }, 16);
//      console.warn('>ENGING START', engine);
    }
  };
  var unmountAnimation = function(animation) {
    delete animation.timestamp;
    delete mountedAnimations[animation.uid];
    mountedCount--;
//    console.log('[unmountAnimation] mountedCount:', mountedCount, JSON.stringify(Object.keys(mountedAnimations)));
  };

//--------------------------------------------------[Animation Constructor]
  /**
   * 动画。
   * @name Animation
   * @constructor
   * @fires play
   *   成功调用 play 方法后，正向播放开始前触发。
   * @fires playstart
   *   正向播放开始前（渲染整个动画的第一帧之前）触发。
   * @fires playfinish
   *   正向播放结束后（渲染整个动画的最后一帧之后）触发。
   * @fires reverse
   *   成功调用 reverse 方法后，反向播放开始前触发。
   * @fires reversestart
   *   反向播放开始前（渲染整个动画的第一帧之前）触发。
   * @fires reversefinish
   *   反向播放结束后（渲染整个动画的最后一帧之后）触发。
   * @fires step
   *   渲染动画的每一帧之后触发。
   * @fires pause
   *   成功调用 pause 方法后触发。
   * @fires stop
   *   成功调用 stop 方法后触发。
   * @description
   *   高级应用：
   *   向一个动画中添加多个剪辑，并调整每个剪辑的 delay，duration，timingFunction 参数，以实现复杂的动画。
   *   仅应在动画初始化时（播放之前）添加动画剪辑，不要在开始播放后添加或更改动画剪辑。
   *   在 step 事件监听器中访问 this.timePoint 可以获得当前帧所处的时间点。
   */
  function Animation() {
    this.uid = ++uid;
    this.clips = [];
    this.timePoint = 0;
    this.status = START_POINT;
    this.duration = 0;
  }

//--------------------------------------------------[Animation.options]
  /**
   * 默认选项。
   * @name Animation.options
   */
  Animation.options = {};

//--------------------------------------------------[Animation.prototype.addClip]
  /**
   * 添加动画剪辑。
   * @name Animation.prototype.addClip
   * @function
   * @param {Function} renderer 使用 Animation.create*Renderer 创建的渲染器。
   *   函数中的 this 指向所属的 Animation 对象。
   * @param {number} delay 延时。
   * @param {number} duration 播放时间。
   * @param {string} timingFunction 控速函数名称或表达式。
   *   支持的名称有 linear，bounceIn，bounceOut，ease，easeIn，easeOut，easeInOut，easeOutIn。
   *   表达式的格式为 <dfn>cubicBezier(<var>p1x</var>, <var>p1y</var>, <var>p2x</var>, <var>p2y</var>)</dfn>，各参数均为浮点数，其中 <var>p1x</var> 和 <var>p2x</var> 的取值范围必须在 [0, 1] 之间。
   * @returns {Object} Animation 对象。
   */
  Animation.prototype.addClip = function(renderer, delay, duration, timingFunction) {
    // 使用各项配置组合动画剪辑（实际是将渲染器升级为动画剪辑）。
    renderer.delay = delay;
    renderer.duration = duration;
    renderer.timingFunction = getTimingFunction(timingFunction);
    renderer.status = BEFORE_START_POINT;
    this.clips.push(renderer);
    // 重新计算整个动画持续的时间。
    this.duration = Math.max(this.duration, delay + duration);
    return this;
  };

//--------------------------------------------------[Animation.prototype.play]
  /**
   * 播放动画。
   * @name Animation.prototype.play
   * @function
   * @returns {Object} Animation 对象。
   * @description
   *   如果当前动画的时间点在终点，则调用此方法无效。
   */
  Animation.prototype.play = function(reverse) {
    var animation = this;
    var isPlayMethod = reverse !== INTERNAL_IDENTIFIER_REVERSE;
    var status = animation.status;
    if (isPlayMethod && status != PLAYING && status != END_POINT || !isPlayMethod && status != REVERSING && status != START_POINT) {
      // 触发事件。
      if (isPlayMethod) {
        animation.status = PLAYING;
        animation.fire('play');
        if (status === START_POINT && animation.status === PLAYING) {
          animation.fire('playstart');
        }
      } else {
        animation.status = REVERSING;
        animation.fire('reverse');
        if (status === END_POINT && animation.status === REVERSING) {
          animation.fire('reversestart');
        }
      }
      // 未挂载到引擎（执行此方法前为暂停/停止状态）。
      if (!animation.timestamp && (animation.status === PLAYING || animation.status === REVERSING)) {
        var timePoint = animation.timePoint;
        var duration = animation.duration;
        // 每次播放/反向播放时的首帧同步播放。
        playAnimation(animation, timePoint/* ? timePoint : (isPlayMethod ? 0 : duration)*/, isPlayMethod);
        // 如果尚有未播放的帧，则将其挂载到动画引擎，异步播放中间帧及末帧。
        if (isPlayMethod ? timePoint !== duration : timePoint !== 0) {
          mountAnimation(animation);
        }
      }
    }
    return animation;
  };

//--------------------------------------------------[Animation.prototype.reverse]
  /**
   * 反向播放动画。
   * @name Animation.prototype.reverse
   * @function
   * @returns {Object} Animation 对象。
   * @description
   *   如果当前动画的时间点在起点，则调用此方法无效。
   */
  Animation.prototype.reverse = function() {
    return this.play(INTERNAL_IDENTIFIER_REVERSE);
  };

//--------------------------------------------------[Animation.prototype.pause]
  /**
   * 暂停动画。
   * @name Animation.prototype.pause
   * @function
   * @returns {Object} Animation 对象。
   * @description
   *   仅在动画处于“播放”或“反向播放”状态时，调用此方法才有效。
   */
  Animation.prototype.pause = function() {
    var animation = this;
    if (animation.status === PLAYING || animation.status === REVERSING) {
      if (animation.timestamp) {
        unmountAnimation(animation);
      }
      animation.status = PASUING;
      animation.fire('pause');
    }
    return animation;
  };

//--------------------------------------------------[Animation.prototype.stop]
  /**
   * 停止动画，并将动画的时间点复位至起点。
   * @name Animation.prototype.stop
   * @function
   * @returns {Object} Animation 对象。
   * @description
   *   如果当前动画的时间点在起点，则调用此方法无效。
   *   调用此方法时，动画中所有的剪辑都将回到起点状态。
   */
  Animation.prototype.stop = function() {
    var animation = this;
    if (animation.status !== START_POINT) {
      if (animation.timestamp) {
        unmountAnimation(animation);
      }
      animation.timePoint = 0;
      animation.status = START_POINT;
      animation.clips.forEach(function(clip) {
        clip.call(animation, 0, 0);
        clip.status = BEFORE_START_POINT;
      });
      animation.fire('stop');
    }
    return animation;
  };

//--------------------------------------------------[Animation]
  window.Animation = new Component(Animation, Animation.options, Animation.prototype);

})();

(function() {
//==================================================[Animation.create*Renderer]
  /*
   * 创建用于绘制动画每一帧的渲染器。
   * 渲染器实际上是一个函数，接受两个参数 x 和 y，其中 x 为时间轴，y 为偏移量，两者均从 0 趋向于 1。
   */

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
  typeIsLength.push('margin', 'padding', 'borderWidth', 'borderColor');  // TODO: 支持复合属性的解析。
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

  // 提取数字值为一个浮点数。
  var extractNumberValue = function(value) {
    var extractedValue = parseFloat(value);
    return isFinite(extractedValue) ? extractedValue : 0;
  };

  // 提取颜色值为一个包含 RGB 整数表示的数组。
  var NAMED_COLORS = {aliceblue: '#F0F8FF', antiquewhite: '#FAEBD7', aqua: '#00FFFF', aquamarine: '#7FFFD4', azure: '#F0FFFF', beige: '#F5F5DC', bisque: '#FFE4C4', black: '#000000', blanchedalmond: '#FFEBCD', blue: '#0000FF', blueviolet: '#8A2BE2', brown: '#A52A2A', burlywood: '#DEB887', cadetblue: '#5F9EA0', chartreuse: '#7FFF00', chocolate: '#D2691E', coral: '#FF7F50', cornflowerblue: '#6495ED', cornsilk: '#FFF8DC', crimson: '#DC143C', cyan: '#00FFFF', darkblue: '#00008B', darkcyan: '#008B8B', darkgoldenrod: '#B8860B', darkgray: '#A9A9A9', darkgreen: '#006400', darkkhaki: '#BDB76B', darkmagenta: '#8B008B', darkolivegreen: '#556B2F', darkorange: '#FF8C00', darkorchid: '#9932CC', darkred: '#8B0000', darksalmon: '#E9967A', darkseagreen: '#8FBC8B', darkslateblue: '#483D8B', darkslategray: '#2F4F4F', darkturquoise: '#00CED1', darkviolet: '#9400D3', deeppink: '#FF1493', deepskyblue: '#00BFFF', dimgray: '#696969', dodgerblue: '#1E90FF', firebrick: '#B22222', floralwhite: '#FFFAF0', forestgreen: '#228B22', fuchsia: '#FF00FF', gainsboro: '#DCDCDC', ghostwhite: '#F8F8FF', gold: '#FFD700', goldenrod: '#DAA520', gray: '#808080', green: '#008000', greenyellow: '#ADFF2F', honeydew: '#F0FFF0', hotpink: '#FF69B4', indianred: '#CD5C5C', indigo: '#4B0082', ivory: '#FFFFF0', khaki: '#F0E68C', lavender: '#E6E6FA', lavenderblush: '#FFF0F5', lawngreen: '#7CFC00', lemonchiffon: '#FFFACD', lightblue: '#ADD8E6', lightcoral: '#F08080', lightcyan: '#E0FFFF', lightgoldenrodyellow: '#FAFAD2', lightgreen: '#90EE90', lightgrey: '#D3D3D3', lightpink: '#FFB6C1', lightsalmon: '#FFA07A', lightseagreen: '#20B2AA', lightskyblue: '#87CEFA', lightslategray: '#778899', lightsteelblue: '#B0C4DE', lightyellow: '#FFFFE0', lime: '#00FF00', limegreen: '#32CD32', linen: '#FAF0E6', magenta: '#FF00FF', maroon: '#800000', mediumaquamarine: '#66CDAA', mediumblue: '#0000CD', mediumorchid: '#BA55D3', mediumpurple: '#9370DB', mediumseagreen: '#3CB371', mediumslateblue: '#7B68EE', mediumspringgreen: '#00FA9A', mediumturquoise: '#48D1CC', mediumvioletred: '#C71585', midnightblue: '#191970', mintcream: '#F5FFFA', mistyrose: '#FFE4E1', moccasin: '#FFE4B5', navajowhite: '#FFDEAD', navy: '#000080', oldlace: '#FDF5E6', olive: '#808000', olivedrab: '#6B8E23', orange: '#FFA500', orangered: '#FF4500', orchid: '#DA70D6', palegoldenrod: '#EEE8AA', palegreen: '#98FB98', paleturquoise: '#AFEEEE', palevioletred: '#DB7093', papayawhip: '#FFEFD5', peachpuff: '#FFDAB9', peru: '#CD853F', pink: '#FFC0CB', plum: '#DDA0DD', powderblue: '#B0E0E6', purple: '#800080', red: '#FF0000', rosybrown: '#BC8F8F', royalblue: '#4169E1', saddlebrown: '#8B4513', salmon: '#FA8072', sandybrown: '#F4A460', seagreen: '#2E8B57', seashell: '#FFF5EE', sienna: '#A0522D', silver: '#C0C0C0', skyblue: '#87CEEB', slateblue: '#6A5ACD', slategray: '#708090', snow: '#FFFAFA', springgreen: '#00FF7F', steelblue: '#4682B4', tan: '#D2B48C', teal: '#008080', thistle: '#D8BFD8', tomato: '#FF6347', turquoise: '#40E0D0', violet: '#EE82EE', wheat: '#F5DEB3', white: '#FFFFFF', whitesmoke: '#F5F5F5', yellow: '#FFFF00', yellowgreen: '#9ACD32'};
  var RE_HEX_COLOR = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i;
  var RE_HEX_COLOR_SHORT = /^#([\da-f])([\da-f])([\da-f])$/i;
  var RE_RGB_COLOR = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
  var extractColorValue = function(value) {
    var extractedValue = [255, 255, 255];
    if (NAMED_COLORS.hasOwnProperty(value)) {
      value = NAMED_COLORS[value];
    }
    var match;
    if (match = value.match(RE_HEX_COLOR)) {
      extractedValue = Array.from(match).slice(1).map(function(hexadecimal) {
        return parseInt(hexadecimal, 16);
      });
    } else if (match = value.match(RE_HEX_COLOR_SHORT)) {
      extractedValue = Array.from(match).slice(1).map(function(hexadecimal) {
        return parseInt(hexadecimal + hexadecimal, 16);
      });
    } else if (match = value.match(RE_RGB_COLOR)) {
      extractedValue = Array.from(match).slice(1).map(function(decimal) {
        return +decimal;
      });
    }
    return extractedValue;
  };

  // 获取可变样式的映射表。
  var RE_RELATIVE_LENGTH = /^[+\-]=\d+$/;
  var getStylesMap = function($element, afterStyles) {
    var beforeStyles = $element.getStyles(Object.keys(afterStyles));
    var map = {before: {}, after: {}};
    Object.forEach(beforeStyles, function(beforeValue, name) {
      var afterValue = afterStyles[name];
      switch (acceptableProperties[name]) {
        case TYPE_NUMBER:
          map.before[name] = extractNumberValue(beforeValue);
          map.after[name] = extractNumberValue(afterValue);
          break;
        case TYPE_LENGTH:
          map.before[name] = beforeValue = extractNumberValue(beforeValue);
          if (typeof afterValue === 'string' && RE_RELATIVE_LENGTH.test(afterValue)) {
            map.after[name] = beforeValue + (+(afterValue.slice(0, 1) + '1') * +afterValue.slice(2));
          } else {
            map.after[name] = extractNumberValue(afterValue);
          }
          break;
        case TYPE_COLOR:
          map.before[name] = extractColorValue(beforeValue);
          map.after[name] = extractColorValue(afterValue);
          break;
      }
    });
    return map;
  };

  // 将包含 RGB 整数表示的数组转换为颜色值。
  var convertToRGBValue = function(colorArray) {
    return 'rgb(' + colorArray[0] + ', ' + colorArray[1] + ', ' + colorArray[2] + ')';
  };

//--------------------------------------------------[Animation.createBasicRenderer]
  /**
   * 创建基本渲染器。
   * @name Animation.createBasicRenderer
   * @function
   * @param {Function} renderer 渲染函数，this 指向所属的 Animation 对象，传入两个参数：时间轴和偏移量。
   * @returns {Function} 生成的渲染器。
   */
  Animation.createBasicRenderer = function(renderer) {
    renderer.type = 'basic';
    return renderer;
  };

//--------------------------------------------------[Animation.createStyleRenderer]
  /**
   * 创建样式渐变效果渲染器。
   * @name Animation.createStyleRenderer
   * @function
   * @param {Element} element 要实施渐变效果的元素。
   * @param {Object} styles 要实施渐变效果的样式。支持相对长度值和颜色值，其中相对长度值目前仅支持像素单位，颜色值支持 140 个预命名颜色名称、#RRGGBB 格式、#RGB 格式或 rgb(正整数R, 正整数G, 正整数B) 格式。
   * @returns {Function} 生成的渲染器。
   * @description
   *   样式渐变效果渲染器只能指定一个元素。
   */
  var $ = document.$;
  Animation.createStyleRenderer = function(element, styles) {
    var $element = $(element);
    var map;
    var renderer = function(x, y) {
      if (map === undefined) {
        map = getStylesMap($element, styles);
      }
      Object.forEach(map.before, function(beforeValue, name) {
        var afterValue = map.after[name];
        var currentValue;
        switch (acceptableProperties[name]) {
          case TYPE_NUMBER:
            currentValue = (beforeValue + (afterValue - beforeValue) * y).toFixed(2);
            break;
          case TYPE_LENGTH:
            currentValue = Math.floor(beforeValue + (afterValue - beforeValue) * y) + 'px';  // TODO: 支持多种长度单位。
            break;
          case TYPE_COLOR:
            currentValue = convertToRGBValue([
              Math.floor(beforeValue[0] + (afterValue[0] - beforeValue[0]) * y),
              Math.floor(beforeValue[1] + (afterValue[1] - beforeValue[1]) * y),
              Math.floor(beforeValue[2] + (afterValue[2] - beforeValue[2]) * y)
            ]);
            break;
        }
        $element.setStyle(name, currentValue);
      });
    };
    renderer.type = 'style';
    return renderer;
  };

//--------------------------------------------------[Animation.createScrollRenderer]

})();

(function() {
//==================================================[Element 扩展 - 动画]
  /*
   * 为 Element 扩展动画方法。
   *
   * 扩展方法：
   *   Element.prototype.morph
   *   Element.prototype.fadeIn
   *   Element.prototype.fadeOut
   *   Element.prototype.highlight
   */

  // 空函数。
  var empty = function() {
  };

  // 元素的动画播放列表，供动画合并使用。
  var animationLists = {};
  var getAnimationList = function($element) {
    var uid = $element.uid;
    return animationLists[uid] || (animationLists[uid] = {});
  };

  // 获取供 FadeIn/FadeOut 使用的 Animation 对象。
  var getFadeAnimation = function($element, isFadeInMode, originalOpacity, duration, timingFunction) {
    var animation = new Animation().addClip(Animation.createBasicRenderer(function(x, y) {
      $element.setStyle('opacity', (originalOpacity * (isFadeInMode ? y : 1 - y)).toFixed(2));
    }), 0, duration, timingFunction);
    if (isFadeInMode) {
      animation
          .on('playstart', function() {
            $element.setStyles({display: 'block', opacity: 0});
          })
          .on('reversefinish', function() {
            $element.setStyles({display: 'none', opacity: originalOpacity});
          });
    } else {
      animation
          .on('reversestart', function() {
            $element.setStyles({display: 'block', opacity: 0});
          })
          .on('playfinish', function() {
            $element.setStyles({display: 'none', opacity: originalOpacity});
          });
    }
    animation.originalFadeMode = isFadeInMode ? 'fadeIn' : 'fadeOut';
    return animation;
  };

//--------------------------------------------------[Element.prototype.morph]
  /**
   * 让本元素播放一个渐变动画。
   * @name Element.prototype.morph
   * @function
   * @param {Object} styles 目标样式，元素将向指定的目标样式渐变。目标样式包含一条或多条要设置的样式声明，与 setStyles 的参数的差异如下：
   *   1. 不能使用复合属性。  // TODO: 待支持。
   *   2. lineHeight 仅支持 'px' 单位的长度设置，而不支持数字。
   * @param {Object} [options] 动画选项。
   * @param {number} options.duration 播放时间，单位是毫秒，默认为 400。
   * @param {string} options.timingFunction 控速函数名称或表达式，细节请参考 Animation.prototype.addClip 的同名参数，默认为 'ease'。
   * @param {Function} options.onStart 播放开始时的回调。
   * @param {Function} options.onFinish 播放完成时的回调。
   * @returns {Element} 本元素。
   * @description
   *   如果本元素的动画播放列表中已经存在一个 morph 动画，则丢弃旧的，播放新的。
   */
  Element.prototype.morph = function(styles, options) {
    var $element = this;
    options = Object.append({duration: 400, timingFunction: 'ease', onStart: empty, onFinish: empty}, options || {});
    var list = getAnimationList($element);
    if (list.morph) {
      list.morph.pause();
    }
    list.morph = new Animation()
        .addClip(Animation.createStyleRenderer($element, styles), 0, options.duration, options.timingFunction)
        .on('playstart', function(e) {
          options.onStart.call($element, e);
        })
        .on('playfinish', function(e) {
          delete list.morph;
          options.onFinish.call($element, e);
        });
    list.morph.play();
    return $element;
  };

//--------------------------------------------------[Element.prototype.highlight]
  /**
   * 让本元素播放一个高亮动画。
   * @name Element.prototype.highlight
   * @function
   * @param {string} [color] 高亮颜色，默认为 'yellow'。
   * @param {string} [property] 高亮样式名，默认为 'backgroundColor'。
   * @param {Object} [options] 动画选项。
   * @param {number} options.duration 播放时间，单位是毫秒，默认为 500。
   * @param {string} options.timingFunction 控速函数名称或表达式，细节请参考 Animation.prototype.addClip 的同名参数，默认为 'easeIn'。
   * @param {Function} options.onStart 播放开始时的回调。
   * @param {Function} options.onFinish 播放完成时的回调。
   * @returns {Element} 本元素。
   * @description
   *   如果本元素的动画播放列表中已经存在一个 highlight 动画，则丢弃旧的，播放新的。
   */
  Element.prototype.highlight = function(color, property, options) {
    var $element = this;
    color = color || 'yellow';
    property = property || 'backgroundColor';
    options = Object.append({duration: 500, timingFunction: 'easeIn', onStart: empty, onFinish: empty}, options || {});
    var originalColor;
    var list = getAnimationList($element);
    if (list.highlight) {
      var prevHighlight = list.highlight.pause();
      if (property === prevHighlight.highlightProperty) {
        originalColor = prevHighlight.originalColor;
      } else {
        $element.setStyle(prevHighlight.highlightProperty, prevHighlight.originalColor);
      }
    }
    if (!originalColor) {
      originalColor = $element.getStyle(property);
    }
    var styles = {};
    styles[property] = originalColor;
    list.highlight = new Animation()
        .addClip(Animation.createStyleRenderer($element, styles), 0, options.duration, options.timingFunction)
        .on('playstart', function(e) {
          $element.setStyle(property, color);
          options.onStart.call($element, e);
        })
        .on('playfinish', function(e) {
          delete list.highlight;
          options.onFinish.call($element, e);
        });
    list.highlight.originalColor = originalColor;
    list.highlight.highlightProperty = property;
    list.highlight.play();
    return $element;
  };

//--------------------------------------------------[Element.prototype.fadeIn]
  /**
   * 让本元素播放一个淡入动画。
   * @name Element.prototype.fadeIn
   * @function
   * @param {Object} [options] 动画选项。
   * @param {number} options.duration 播放时间，单位是毫秒，默认为 200。
   * @param {string} options.timingFunction 控速函数名称或表达式，细节请参考 Animation.prototype.addClip 的同名参数，默认为 'easeIn'。
   * @param {Function} options.onStart 播放开始时的回调。
   * @param {Function} options.onFinish 播放完成时的回调。
   * @returns {Element} 本元素。
   * @description
   *   display 不为 none 的元素不能播放淡入动画。
   *   如果本元素的动画播放列表中已经存在一个 fadeOut 动画，则反向播放前者，并丢弃前者的 onFinish 回调，执行后者的 onStart 回调，并在反向播放结束时执行后者的 onFinish 回调。
   */
  Element.prototype.fadeIn = function(options) {
    var $element = this;
    options = Object.append({duration: 200, timingFunction: 'easeIn', onStart: empty, onFinish: empty}, options || {});
    var onStart = function(e) {
      options.onStart.call($element, e);
    };
    var onFinish = function(e) {
      delete list.fadeIn;
      options.onFinish.call($element, e);
    };
    var list = getAnimationList($element);
    if (list.fadeIn) {
//      console.log('合并[同类丢弃]');
      return $element;
    }
    if (list.fadeOut) {
//      console.log('合并[反向播放]');
      var prevFadeOut = list.fadeOut.off('play.callback, playfinish.callback, reverse.callback, reversefinish.callback');
      list.fadeIn = prevFadeOut;
      delete list.fadeOut;
      if (prevFadeOut.originalFadeMode === 'fadeIn') {
        prevFadeOut.on('play.callback', onStart).on('playfinish.callback', onFinish).play();
      } else {
        prevFadeOut.on('reverse.callback', onStart).on('reversefinish.callback', onFinish).reverse();
      }
      return $element;
    }
    if ($element.getStyle('display') === 'none') {
//      console.log('正常[开始播放]');
      list.fadeIn = getFadeAnimation($element, true, $element.getStyle('opacity'), options.duration, options.timingFunction)
          .on('play.callback', onStart)
          .on('playfinish.callback', onFinish);
      list.fadeIn.play();
    } else {
//      console.log('不符[结束执行]');
    }
    return $element;
  };

//--------------------------------------------------[Element.prototype.fadeOut]
  /**
   * 让本元素播放一个淡出动画。
   * @name Element.prototype.fadeOut
   * @function
   * @param {Object} [options] 动画选项。
   * @param {number} options.duration 播放时间，单位是毫秒，默认为 200。
   * @param {string} options.timingFunction 控速函数名称或表达式，细节请参考 Animation.prototype.addClip 的同名参数，默认为 'easeIn'。
   * @param {Function} options.onStart 播放开始时的回调。
   * @param {Function} options.onFinish 播放完成时的回调。
   * @returns {Element} 本元素。
   * @description
   *   display 为 none 的元素不能播放淡出动画。
   *   如果本元素的动画播放列表中已经存在一个 fadeIn 动画，则反向播放前者，并丢弃前者的 onFinish 回调，执行后者的 onStart 回调，并在反向播放结束时执行后者的 onFinish 回调。
   */
  Element.prototype.fadeOut = function(options) {
    var $element = this;
    options = Object.append({duration: 200, timingFunction: 'easeIn', onStart: empty, onFinish: empty}, options || {});
    var onStart = function(e) {
      options.onStart.call($element, e);
    };
    var onFinish = function(e) {
      delete list.fadeOut;
      options.onFinish.call($element, e);
    };
    var list = getAnimationList($element);
    if (list.fadeOut) {
//      console.log('合并[同类丢弃]');
      return $element;
    }
    if (list.fadeIn) {
//      console.log('合并[反向播放]');
      var prevfadeIn = list.fadeIn.off('play.callback, playfinish.callback, reverse.callback, reversefinish.callback');
      list.fadeOut = prevfadeIn;
      delete list.fadeIn;
      if (prevfadeIn.originalFadeMode === 'fadeOut') {
        prevfadeIn.on('play.callback', onStart).on('playfinish.callback', onFinish).play();
      } else {
        prevfadeIn.on('reverse.callback', onStart).on('reversefinish.callback', onFinish).reverse();
      }
      return $element;
    }
    if ($element.getStyle('display') !== 'none') {
//      console.log('正常[开始播放]');
      list.fadeOut = getFadeAnimation($element, false, $element.getStyle('opacity'), options.duration, options.timingFunction)
          .on('play.callback', onStart)
          .on('playfinish.callback', onFinish);
      list.fadeOut.play();
    } else {
//      console.log('不符[结束执行]');
    }
    return $element;
  };

})();

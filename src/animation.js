/**
 * @fileOverview 动画。
 * @author sundongguo@gmail.com
 * @version 20120412
 */
// TODO: Fx.Slide 和 Fx.Scroll 效果。
(function() {
//==================================================[Animation]
  /*
   * 调用流程：
   *   var animation = new Animation(...).addClip(...);
   *   animation.play()<playstart>       -> (x, y) <step> -> ... -> <playfinish>
   *   animation.reverse()<reversestart> -> (x, y) <step> -> ... -> <reversefinish>
   *                                                      -> animation.pause<pause> -> animation.stop()<stop>
   *                                                                                -> animation.play()<play>       -> (x, y) <step> ->>>
   *                                                                                -> animation.reverse()<reverse> -> (x, y) <step> ->>>
   *                                                      -> animation.stop<stop>
   *
   * 说明：
   *   上述步骤到达 (x, y) 时，每个剪辑会以每秒最多 62.5 次的频率被播放（每 16 毫秒一次），实际频率视计算机的速度而定，当计算机的速度比期望的慢时，动画会以“跳帧”的方式来确保整个动画效果的消耗时间尽可能的接近设定时间。
   *   传入函数的参数 x 为时间点，y 为偏移量，他们的值都将从 0 趋向于 1。
   *   在动画在进行中时，执行动画对象的 stop 方法即可停止的继续调用，但也会阻止事件 end 的触发。
   *   调用 reverse 可以反向播放，但要注意，反向播放时，需要对动画剪辑中正向播放时非线性变换的内容也做反向处理。
   *   播放一个动画时，调用 play 或 reverse 方法后即同步播放对应方向的首帧，中间帧及末帧由引擎异步播放。
   *   如果一个动画剪辑的持续时间为 0，则 play 时传入的 x 值为 1，reverse 时传入的 x 值为 0。
   *
   * 操作 Animation 对象和调用 Element 上的相关动画方法的差别：
   *   当需要定制一个可以预期的动画效果时，建议使用 Animation，因为 Animation 对象不仅可以正向播放，还可以随时回退到起点。
   *   否则应使用 Element 实例上的对应简化动画方法，这些简化方法每次调用都会自动创建新的 Animation 对象，而不保留之前的状态，这样就可以随时以目标元素最新的状态作为起点来播放动画。
   *   一个明显的差异是使用 Fx.Morph 时传入相对长度的样式值：
   *   在直接使用 Animation 的情况下，无论如何播放/反向播放，目标元素将始终在起点/终点之间渐变。
   *   在使用 Element.prototype.morph 方法时，传入同样的参数，多次播放时，目标元素将以上一次的终点作为起点，开始渐变。
   */

  // 唯一识别码。
  var uid = 0;

  // 供内部调用的标记值。
  var INTERNAL_IDENTIFIER_REVERSE = {};

  // 动画的状态。
  var STARTING_POINT = -2;
  var REVERSING = -1;
  var PASUING = 0;
  var PLAYING = 1;
  var END_POINT = 2;

  // 动画剪辑的状态。
  var BEFORE_STARTING_POINT = -1;
  var ACTIVE = 0;
  var AFTER_END_POINT = 1;

  // 播放动画对应某一时间点的某一帧。
  var playAnimation = function(animation, timePoint, isPlayMethod) {
    animation.clips.forEach(function(clip) {
      var active = false;
      var duration = clip.duration;
      var x = (timePoint - clip.delay) / Math.max(1, duration);
      if (isPlayMethod) {
        if (clip.status === AFTER_END_POINT) {
          return;
        }
        if (clip.status === BEFORE_STARTING_POINT) {
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
        if (clip.status === BEFORE_STARTING_POINT) {
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
            clip.status = BEFORE_STARTING_POINT;
          }
        }
      }
      if (active) {
        clip.handler.call(animation, x, x === 0 ? 0 : (x === 1 ? 1 : clip.timingFunction(x)));
      }
    });
    // 触发事件。
    if (isPlayMethod) {
      if (timePoint === 0) {
        animation.fire('playstart');
      }
      animation.fire('step');
      if (timePoint === animation.duration) {
        if (animation.timestamp) {
          unmountAnimation(animation);
        }
        animation.status = END_POINT;
        animation.fire('playfinish');
      }
    } else {
      if (timePoint === animation.duration) {
        animation.fire('reversestart');
      }
      animation.fire('step');
      if (timePoint === 0) {
        if (animation.timestamp) {
          unmountAnimation(animation);
        }
        animation.status = STARTING_POINT;
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
   * 创建动画效果。
   * @name Animation
   * @constructor
   * @fires play
   *   开始播放时，渲染本次播放的第一帧之前触发。
   * @fires playstart
   *   开始播放时，渲染整个动画的第一帧之后触发。
   * @fires playfinish
   *   播放结束时，渲染整个动画的最后一帧之后触发。
   * @fires reverse
   *   开始反向播放时，渲染本次播放的第一帧之前触发。
   * @fires reversestart
   *   开始反向播放时，渲染整个动画的第一帧之后触发。
   * @fires reversefinish
   *   反向播放结束时，渲染整个动画的最后一帧之后触发。
   * @fires step
   *   渲染每一帧之后触发。
   * @fires pause
   *   暂停播放时触发。
   * @fires stop
   *   停止播放时触发。
   * @description
   *   高级应用：
   *   向一个动画中添加多个剪辑，并调整每个剪辑的 delay，duration，timingFunction 参数，以实现复杂的动画效果。
   *   仅应在动画初始化时（播放之前）添加影片剪辑，不要在开始播放后添加或更改影片剪辑。
   */
  function Animation() {
    this.uid = ++uid;
    this.clips = [];
    this.timePoint = 0;
    this.status = STARTING_POINT;
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
   * @param {Object} clip 使用 Fx.* 创建的动画剪辑对象。
   * @returns {Object} Animation 对象。
   */
  Animation.prototype.addClip = function(clip) {
    clip.status = BEFORE_STARTING_POINT;
    this.clips.push(clip);
    // 重新计算整个动画持续的时间。
    this.duration = Math.max(this.duration, clip.delay + clip.duration);
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
    var isPlayMethod = reverse !== INTERNAL_IDENTIFIER_REVERSE;
    var status = this.status;
    var duration = this.duration;
    if (isPlayMethod && status != PLAYING && status != END_POINT || !isPlayMethod && status != REVERSING && status != STARTING_POINT) {
      this.status = isPlayMethod ? PLAYING : REVERSING;
      // 触发事件。
      this.fire(isPlayMethod ? 'play' : 'reverse');
      // 未挂载到引擎（执行此方法前为暂停/停止状态）。
      if (!this.timestamp) {
        // 每次播放/反向播放时的首帧同步播放。
        playAnimation(this, isPlayMethod ? 0 : duration, isPlayMethod);
        // 如果动画超出一帧，则将其挂载到动画引擎，异步播放中间帧及末帧。
        if (duration) {
          mountAnimation(this);
        }
      }
    }
    return this;
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
    if (this.timestamp) {
      unmountAnimation(this);
      this.status = PASUING;
      this.fire('pause');
    }
    return this;
  };

//--------------------------------------------------[Animation.prototype.stop]
  /**
   * 停止动画，并将动画的时间点复位至起点。
   * @name Animation.prototype.stop
   * @function
   * @returns {Object} Animation 对象。
   * @description
   *   如果当前动画的时间点在起点，则调用此方法无效。
   */
  Animation.prototype.stop = function() {
    if (this.status !== STARTING_POINT) {
      if (this.timestamp) {
        unmountAnimation(this);
      }
      this.timePoint = 0;
      this.clips.forEach(function(clip) {
        clip.status = BEFORE_STARTING_POINT;
      });
      this.status = STARTING_POINT;
      this.fire('stop');
    }
    return this;
  };

//--------------------------------------------------[Animation]
  window.Animation = new Component(Animation, Animation.options, Animation.prototype);

//==================================================[Fx]
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

  // 转换数字值为浮点数。
  var parseNumberValue = function(value) {
    var parsedValue = parseFloat(value);
    return isFinite(parsedValue) ? parsedValue : 0;
  };

  // 转换颜色值为一个包含 RGB 整数表示的数组。
  var NAMED_COLORS = {aliceblue: '#F0F8FF', antiquewhite: '#FAEBD7', aqua: '#00FFFF', aquamarine: '#7FFFD4', azure: '#F0FFFF', beige: '#F5F5DC', bisque: '#FFE4C4', black: '#000000', blanchedalmond: '#FFEBCD', blue: '#0000FF', blueviolet: '#8A2BE2', brown: '#A52A2A', burlywood: '#DEB887', cadetblue: '#5F9EA0', chartreuse: '#7FFF00', chocolate: '#D2691E', coral: '#FF7F50', cornflowerblue: '#6495ED', cornsilk: '#FFF8DC', crimson: '#DC143C', cyan: '#00FFFF', darkblue: '#00008B', darkcyan: '#008B8B', darkgoldenrod: '#B8860B', darkgray: '#A9A9A9', darkgreen: '#006400', darkkhaki: '#BDB76B', darkmagenta: '#8B008B', darkolivegreen: '#556B2F', darkorange: '#FF8C00', darkorchid: '#9932CC', darkred: '#8B0000', darksalmon: '#E9967A', darkseagreen: '#8FBC8B', darkslateblue: '#483D8B', darkslategray: '#2F4F4F', darkturquoise: '#00CED1', darkviolet: '#9400D3', deeppink: '#FF1493', deepskyblue: '#00BFFF', dimgray: '#696969', dodgerblue: '#1E90FF', firebrick: '#B22222', floralwhite: '#FFFAF0', forestgreen: '#228B22', fuchsia: '#FF00FF', gainsboro: '#DCDCDC', ghostwhite: '#F8F8FF', gold: '#FFD700', goldenrod: '#DAA520', gray: '#808080', green: '#008000', greenyellow: '#ADFF2F', honeydew: '#F0FFF0', hotpink: '#FF69B4', indianred: '#CD5C5C', indigo: '#4B0082', ivory: '#FFFFF0', khaki: '#F0E68C', lavender: '#E6E6FA', lavenderblush: '#FFF0F5', lawngreen: '#7CFC00', lemonchiffon: '#FFFACD', lightblue: '#ADD8E6', lightcoral: '#F08080', lightcyan: '#E0FFFF', lightgoldenrodyellow: '#FAFAD2', lightgreen: '#90EE90', lightgrey: '#D3D3D3', lightpink: '#FFB6C1', lightsalmon: '#FFA07A', lightseagreen: '#20B2AA', lightskyblue: '#87CEFA', lightslategray: '#778899', lightsteelblue: '#B0C4DE', lightyellow: '#FFFFE0', lime: '#00FF00', limegreen: '#32CD32', linen: '#FAF0E6', magenta: '#FF00FF', maroon: '#800000', mediumaquamarine: '#66CDAA', mediumblue: '#0000CD', mediumorchid: '#BA55D3', mediumpurple: '#9370DB', mediumseagreen: '#3CB371', mediumslateblue: '#7B68EE', mediumspringgreen: '#00FA9A', mediumturquoise: '#48D1CC', mediumvioletred: '#C71585', midnightblue: '#191970', mintcream: '#F5FFFA', mistyrose: '#FFE4E1', moccasin: '#FFE4B5', navajowhite: '#FFDEAD', navy: '#000080', oldlace: '#FDF5E6', olive: '#808000', olivedrab: '#6B8E23', orange: '#FFA500', orangered: '#FF4500', orchid: '#DA70D6', palegoldenrod: '#EEE8AA', palegreen: '#98FB98', paleturquoise: '#AFEEEE', palevioletred: '#DB7093', papayawhip: '#FFEFD5', peachpuff: '#FFDAB9', peru: '#CD853F', pink: '#FFC0CB', plum: '#DDA0DD', powderblue: '#B0E0E6', purple: '#800080', red: '#FF0000', rosybrown: '#BC8F8F', royalblue: '#4169E1', saddlebrown: '#8B4513', salmon: '#FA8072', sandybrown: '#F4A460', seagreen: '#2E8B57', seashell: '#FFF5EE', sienna: '#A0522D', silver: '#C0C0C0', skyblue: '#87CEEB', slateblue: '#6A5ACD', slategray: '#708090', snow: '#FFFAFA', springgreen: '#00FF7F', steelblue: '#4682B4', tan: '#D2B48C', teal: '#008080', thistle: '#D8BFD8', tomato: '#FF6347', turquoise: '#40E0D0', violet: '#EE82EE', wheat: '#F5DEB3', white: '#FFFFFF', whitesmoke: '#F5F5F5', yellow: '#FFFF00', yellowgreen: '#9ACD32'};
  var RE_HEX_COLOR = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i;
  var RE_HEX_COLOR_SHORT = /^#([\da-f])([\da-f])([\da-f])$/i;
  var RE_RGB_COLOR = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
  var parseColorValue = function(value) {
    // 将默认的颜色设置为白色。
    var parsedValue = [255, 255, 255];
    if (NAMED_COLORS.hasOwnProperty(value)) {
      value = NAMED_COLORS[value];
    }
    var match;
    if (match = value.match(RE_HEX_COLOR)) {
      parsedValue = Array.from(match).slice(1).map(function(hexadecimal) {
        return parseInt(hexadecimal, 16);
      });
    } else if (match = value.match(RE_HEX_COLOR_SHORT)) {
      parsedValue = Array.from(match).slice(1).map(function(hexadecimal) {
        return parseInt(hexadecimal + hexadecimal, 16);
      });
    } else if (match = value.match(RE_RGB_COLOR)) {
      parsedValue = Array.from(match).slice(1).map(function(decimal) {
        return +decimal;
      });
    }
    return parsedValue;
  };

  // 过滤和转换动画需要改变的样式。
  var RE_RELATIVE_LENGTH = /^[+\-]=\d+$/;
  var parseStyles = function($element, afterStyles) {
    var beforeStyles = $element.getStyles(Object.keys(afterStyles));
    var parsedStyles = {before: {}, after: {}};
    Object.forEach(beforeStyles, function(beforeValue, name) {
      var afterValue = afterStyles[name];
      switch (acceptableProperties[name]) {
        case TYPE_NUMBER:
          parsedStyles.before[name] = parseNumberValue(beforeValue);
          parsedStyles.after[name] = parseNumberValue(afterValue);
          break;
        case TYPE_LENGTH:
          parsedStyles.before[name] = beforeValue = parseNumberValue(beforeValue);
          if (typeof afterValue === 'string' && RE_RELATIVE_LENGTH.test(afterValue)) {
            parsedStyles.after[name] = beforeValue + (+(afterValue.slice(0, 1) + '1') * +afterValue.slice(2));
          } else {
            parsedStyles.after[name] = parseNumberValue(afterValue);
          }
          break;
        case TYPE_COLOR:
          parsedStyles.before[name] = parseColorValue(beforeValue);
          parsedStyles.after[name] = parseColorValue(afterValue);
          break;
      }
    });
    return parsedStyles;
  };

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
  var timingFunctions = {
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

  var getTimingFunction = function(name) {
    name = name || '';
//    'cubicBezier(0.42, 1.0, 0.75, 1.0)'.match(/^cubicBezier\((0\.\d+|0|1\.0+|1),\s*(0\.\d+|0|1\.0+|1),\s*(0\.\d+|0|1\.0+|1),\s*(0\.\d+|0|1\.0+|1)/)
    return timingFunctions[name] || (name.startsWith('cubicBezier') ? cubicBezier.apply(null, name.slice(12, -1).split(',').map(function(item) {
      return parseFloat(item);
    })) : timingFunctions.ease);
  };

  /**
   * 用于创建影片剪辑的一组特效。
   * @name Fx
   * @namespace
   */
  window.Fx = {};

//--------------------------------------------------[Fx.Base]
  /**
   * 基础动画效果。
   * @name Fx.Base
   * @constructor
   * @param {Function} handler 动画处理函数，this 指向所属的 Animation 对象。
   * @param {number} delay 延时。
   * @param {number} duration 播放时间。
   * @param {string} timingFunction 控速函数名称或表达式。
   * @description
   *   可以通过定制动画处理函数来制作各种动画，Fx 下的其他动画效果都是这样实现的。
   */
  Fx.Base = function(handler, delay, duration, timingFunction) {
    this.handler = handler;
    this.delay = delay;
    this.duration = duration;
    this.timingFunction = getTimingFunction(timingFunction);
  };

//--------------------------------------------------[Fx.Morph]
  /**
   * 渐变效果。
   * @name Fx.Morph
   * @constructor
   * @param {Element} $element 要实施渐变效果的元素。
   * @param {Object} styles 要实施渐变的样式。支持相对长度值和颜色值，其中相对长度值目前仅支持像素单位，颜色值支持 140 个预命名颜色名称、#RRGGBB 格式、#RGB 格式或 rgb(正整数R, 正整数G, 正整数B) 格式。
   * @param {number} delay 延时。
   * @param {number} duration 播放时间。
   * @param {string} timingFunction 控速函数名称或表达式。
   */
  Fx.Morph = function($element, styles, delay, duration, timingFunction) {
    var transitiveStyles;
    this.handler = function(x, y) {
      if (transitiveStyles === undefined) {
        transitiveStyles = parseStyles($element, styles);
      }
      Object.forEach(transitiveStyles.before, function(beforeValue, name) {
        var afterValue = transitiveStyles.after[name];
        var currentValue;
        switch (acceptableProperties[name]) {
          case TYPE_NUMBER:
            currentValue = (beforeValue + (afterValue - beforeValue) * y).toFixed(2);
            break;
          case TYPE_LENGTH:
            currentValue = Math.floor(beforeValue + (afterValue - beforeValue) * y) + 'px';  // TODO: 支持多种长度单位。
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
    };
    this.delay = delay;
    this.duration = duration;
    this.timingFunction = getTimingFunction(timingFunction);
  };

//--------------------------------------------------[Fx.Fade]
  /**
   * 渐隐效果。
   * @name Fx.Fade
   * @constructor
   * @param {Element} $element 要实施渐隐效果的元素。
   * @param {string} mode 渐隐模式，in 为渐入，out 为渐出。
   * @param {number} delay 延时。
   * @param {number} duration 播放时间。
   * @param {string} timingFunction 控速函数名称或表达式。
   */
  Fx.Fade = function($element, mode, delay, duration, timingFunction) {
    var isFadeInMode = mode === 'in';
    var originalOpacity;
    this.handler = function(x, y) {
      if (originalOpacity === undefined) {
        originalOpacity = $element.getStyle('opacity');
      }
      var isPlayMethod = this.status === PLAYING;
      var styles = {
        // 正常状态。
        normal: {'display': 'block', 'opacity': originalOpacity},
        // 全透明状态。
        fullTransparency: {'display': 'block', 'opacity': 0},
        // 隐藏状态。
        noDisplay: {'display': 'none', 'opacity': originalOpacity}
      };
      switch (x) {
        case 0:
          $element.setStyles(styles[isFadeInMode ? (isPlayMethod ? 'fullTransparency' : 'noDisplay') : 'normal']);
          break;
        case 1:
          $element.setStyles(styles[isFadeInMode ? 'normal' : (isPlayMethod ? 'noDisplay' : 'fullTransparency')]);
          break;
        default:
          $element.setStyle('opacity', (originalOpacity * (isFadeInMode ? y : 1 - y)).toFixed(2));
          break;
      }
    };
    this.delay = delay;
    this.duration = duration;
    this.timingFunction = getTimingFunction(timingFunction);
  };

//--------------------------------------------------[Fx.Slide]

//--------------------------------------------------[Fx.Highlight]
  var getColorString = function(colorArray) {
    return 'rgb(' + colorArray[0] + ', ' + colorArray[1] + ', ' + colorArray[2] + ')';
  };

  /**
   * 高亮效果。
   * @name Fx.Highlight
   * @constructor
   * @param {Element} $element 要实施渐隐效果的元素。
   * @param {string} color 高亮的颜色。
   * @param {number} times 高亮的次数。
   * @param {number} delay 延时。
   * @param {number} duration 播放时间。
   * @param {string} timingFunction 控速函数名称或表达式。
   */
  Fx.Highlight = function($element, color, times, delay, duration, timingFunction) {
    // 内部分多次动画换算后，使用此控速函数。
    var nativeTimingFunction = getTimingFunction(timingFunction);
    var nativeSection = 1 / times;
    var transitiveBackgroundColor;
    this.handler = function(x) {
      if (transitiveBackgroundColor === undefined) {
        transitiveBackgroundColor = parseStyles($element, {backgroundColor: color});
      }
      var beforeValue = transitiveBackgroundColor.before.backgroundColor;
      var afterValue = transitiveBackgroundColor.after.backgroundColor;
      if (x === 0 || x === 1) {
        $element.setStyle('backgroundColor', getColorString(beforeValue));
      } else {
        var nativeX = (x % nativeSection) / nativeSection;
        var nativeY = nativeTimingFunction(nativeX);
        $element.setStyle('backgroundColor', getColorString([
          Math.floor(afterValue[0] + (beforeValue[0] - afterValue[0]) * nativeY),
          Math.floor(afterValue[1] + (beforeValue[1] - afterValue[1]) * nativeY),
          Math.floor(afterValue[2] + (beforeValue[2] - afterValue[2]) * nativeY)
        ]));
      }
    };
    this.delay = delay;
    this.duration = duration;
    this.timingFunction = timingFunctions.linear;
  };

//--------------------------------------------------[Fx.Scroll]

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

  // 简单动画的队列。
  var queuePool = {};

  // 播放指定的队列。
  var playQueue = function(uid) {
    var queue = queuePool[uid];
    if (queue) {
      // 要播放的动画的参数。
      var item = queue[0];
      var $element = item[0];
      var type = item[1];
      var clip = item[2];
      var callback = item[3];
      var onPlayFinish = function() {
        queue.shift();
        if (queue.length) {
          playQueue(uid);
        } else {
          delete queuePool[uid];
        }
      };
      // fadeIn/fadeOut 的特殊情况处理。
      if (type === 'fadeIn' && $element.offsetWidth || type === 'fadeOut' && !$element.offsetWidth) {
        onPlayFinish();
        return;
      }
      // 开始播放动画。
      queue.currentAnimation = new Animation().addClip(clip).on('playfinish', onPlayFinish).on('playfinish', callback).play();
    }
  };

  // 在指定的队列中添加一个动画。
  var addToQueue = function($element, type, clip, callback) {
    var uid = $element.uid;
    var queue = queuePool[uid];
    if (queue) {
      // highlight 的特殊情况处理。
      if (type === 'highlight') {
        var currentAnimation = queue.currentAnimation;
        if (queue[queue.length - 1] && queue[queue.length - 1][2] instanceof Fx.Highlight) {
          if (currentAnimation && currentAnimation.clips[0] instanceof Fx.Highlight) {
            currentAnimation.stop().play();
          }
          return;
        }
      }
    } else {
      queue = queuePool[uid] = [];
    }
    queue.push([$element, type, clip, callback]);
    if (!queue.currentAnimation) {
      playQueue(uid);
    }
  };

//--------------------------------------------------[Element.prototype.morph]
  /**
   * 在本元素的动画队列中添加一个渐变效果。
   * @name Element.prototype.morph
   * @function
   * @param {Object} styles 目标样式，元素将向指定的目标样式渐变。目标样式包含一条或多条要设置的样式声明，与 setStyles 的参数的差异如下：
   *   1. 不能使用复合属性。  // TODO: 待支持。
   *   2. lineHeight 仅支持 'px' 单位的长度设置，而不支持数字。
   * @param {Object} [options] 动画选项。
   * @param {number} options.delay 延时，默认为 0，即马上开始播放。
   * @param {number} options.duration 播放时间，单位是毫秒，默认为 400。
   * @param {string} options.timingFunction 控速函数名称或表达式。
   * @param {Function} options.callback 播放完成后的回调。
   * @returns {Element} 本元素。
   * @description
   *   队列是指将需要较长时间完成的多个指令排序，以先进先出的形式逐个执行这些指令。
   *   在元素上调用本方法添加动画时：
   *     - 若该元素并未播放动画，新添加的动画会直接开始播放。
   *     - 若该元素正在播放动画，新添加的动画将被添加到队列末端，在前一个动画播放完毕后自动播放。
   *   一个元素对应一个队列。即给不同元素添加的动画永远有不同的队列，给相同元素添加的动画永远有相同的队列。
   *   所有 Element.prototype 上提供的动画相关的方法均为实现动画的简单方式，它们只是一个捷径，可以解决大部分需求。若需要更复杂的动画效果，请考虑使用 Animation 对象实现。
   */
  Element.prototype.morph = function(styles, options) {
    var $element = this;
    options = options || {};
    addToQueue(
        $element,
        'morph',
        new Fx.Morph($element, styles, options.delay || 0, options.duration || 400, options.timingFunction || 'ease'),
        function() {
          options.callback && options.callback.call($element);
        }
    );
    return $element;
  };

//--------------------------------------------------[Element.prototype.fadeIn]
  /**
   * 在本元素的动画队列中添加一个淡入效果。
   * @name Element.prototype.fadeIn
   * @function
   * @param {Object} [options] 动画选项。
   * @param {number} options.duration 播放时间，单位是毫秒，默认为 200。
   * @param {Function} options.callback 播放完成后的回调。
   * @returns {Element} 本元素。
   * @description
   *   当前已被渲染的元素不能执行淡入效果。
   */
  Element.prototype.fadeIn = function(options) {
    var $element = this;
    options = options || {};
    addToQueue(
        $element,
        'fadeIn',
        new Fx.Fade($element, 'in', 0, options.duration || 200, 'easeIn'),
        function() {
          options.callback && options.callback.call($element);
        }
    );
    return $element;
  };

//--------------------------------------------------[Element.prototype.fadeOut]
  /**
   * 在本元素的动画队列中添加一个淡出效果。
   * @name Element.prototype.fadeOut
   * @function
   * @param {Object} [options] 动画选项。
   * @param {number} options.duration 播放时间，单位是毫秒，默认为 200。
   * @param {Function} options.callback 播放完成后的回调。
   * @returns {Element} 本元素。
   * @description
   *   当前并未被渲染的元素不能执行淡出效果。
   */
  Element.prototype.fadeOut = function(options) {
    var $element = this;
    options = options || {};
    addToQueue(
        $element,
        'fadeOut',
        new Fx.Fade($element, 'out', 0, options.duration || 200, 'easeOut'),
        function() {
          options.callback && options.callback.call($element);
        }
    );
    return $element;
  };

//--------------------------------------------------[Element.prototype.highlight]
  /**
   * 在本元素的动画队列中添加一个高亮效果。
   * @name Element.prototype.highlight
   * @function
   * @param {Object} [options] 动画选项。
   * @param {string} options.color 高亮颜色，默认为 yellow。
   * @param {number} options.times 高亮次数，默认为 2。
   * @param {number} options.duration 播放时间，单位是毫秒，默认为 500。
   * @param {Function} options.callback 播放完成后的回调。
   * @returns {Element} 本元素。
   * @description
   *   调用本方法时，如果当前队列的前一个动画也是高亮动画，则丢弃当前的高亮动画。若此时本元素正在播放一个高亮动画，则重新播放该动画。
   */
  Element.prototype.highlight = function(options) {
    var $element = this;
    options = options || {};
    addToQueue(
        $element,
        'highlight',
        new Fx.Highlight($element, options.color || 'yellow', options.times || 1, 0, options.duration || 500, 'easeIn'),
        function() {
          options.callback && options.callback.call($element);
        }
    );
    return $element;
  };

})();

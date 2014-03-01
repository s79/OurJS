/**
 * @fileOverview 动画
 * @author sundongguo@gmail.com
 * @version 20120412
 */

(function(window) {
//==================================================[动画]
  /*
   * 调用流程：
   *   var animation = new Animation(...).addClip(...);
   *   animation.play()<play><playstart>          -> <step> -> ... -> <playfinish>
   *   animation.reverse()<reverse><reversestart> -> <step> -> ... -> <reversefinish>
   *                                                        -> animation.pause<pause>
   *                                                                                  -> animation.play()<play>       -> <step> ->>>
   *                                                                                  -> animation.reverse()<reverse> -> <step> ->>>
   *
   * 说明：
   *   上述步骤到达 (x, y) 时，每个剪辑会以每秒最多 62.5 次的频率被播放（每 16 毫秒一次），实际频率视计算机的速度而定，当计算机的速度比期望的慢时，动画会以“跳帧”的方式来确保整个动画的消耗时间尽可能的接近设定时间。
   *   传入函数的参数 x 为时间点，y 为偏移量，它们的值都将从 0 趋向于 1。
   *   在动画在进行中时，调用动画对象的 pause 方法即可在当前帧停止动画的播放。
   *   调用 reverse 可以倒放，但要注意，倒放时，需要对动画剪辑中正向播放时非线性变换的内容也做反向处理。
   *   播放一个动画时，调用 play 或 reverse 方法后即同步播放对应方向的首帧，中间帧及末帧由引擎异步播放。
   *   如果一个动画剪辑的持续时间为 0，则 play 时传入的 x 值为 1，reverse 时传入的 x 值为 0。
   *
   * 操作 Animation 对象和调用 Element 上的相关动画方法的差别：
   *   当需要定制一个可以精确控制的动画时，建议使用 Animation，Animation 对象中的 Clip 会记录动画创建时的状态，而且不仅可以正向播放，还可以随时回退到起点。
   *   否则应使用 Element 实例上的对应简化动画方法，这些简化方法每次调用都会自动创建新的 Animation 对象，而不保留之前的状态，这样就可以随时以目标元素最新的状态作为起点来播放动画。
   *   一个明显的差异是在为不同类型的样式渐变动画设置相同的相对长度的变化值时：
   *   在直接使用 Animation 的情况下，无论如何播放/倒放，目标元素将始终在起点/终点之间渐变。
   *   在使用 Element.prototype.morph 方法多次播放时，目标元素将以上一次的终点作为起点，开始渐变。
   */

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

  // 动画引擎，用于挂载各播放中的动画，并同频同步播放它们的每一帧。
  var engine;
  var mountedAnimations = [];
  var mountAnimation = function(animation) {
    animation.timestamp = Date.now();
    mountedAnimations.push(animation);
    // 启动引擎。
    if (!engine) {
      engine = setInterval(function() {
        // 播放挂载的动画。
        var timestamp = Date.now();
        mountedAnimations.forEach(function(animation) {
          var isPlayMethod = animation.status === PLAYING;
          var timePoint = Math.limit(animation.timePoint + (timestamp - animation.timestamp) * (isPlayMethod ? 1 : -1), 0, animation.duration);
          animation.timestamp = timestamp;
          animation.timePoint = timePoint;
          playAnimation(animation, timePoint, isPlayMethod);
        });
        // 停止引擎。
        if (!mountedAnimations.length) {
          clearInterval(engine);
          engine = undefined;
//          console.warn('>ENGING STOP');
        }
      }, 1000 / Math.limit(Animation.fps, 10, 60));
//      console.warn('>ENGING START');
    }
//    console.log('[mountAnimation]: ' + mountedAnimations.length);
  };
  var unmountAnimation = function(animation) {
    delete animation.timestamp;
    mountedAnimations.remove(animation);
//    console.log('[unmountAnimation]: ' + mountedAnimations.length);
  };

//--------------------------------------------------[Animation]
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
   *   成功调用 reverse 方法后，倒放开始前触发。
   * @fires reversestart
   *   倒放开始前（渲染整个动画的第一帧之前）触发。
   * @fires reversefinish
   *   倒放结束后（渲染整个动画的最后一帧之后）触发。
   * @fires step
   *   渲染动画的每一帧之后触发。
   * @fires pause
   *   成功调用 pause 方法后触发。
   * @description
   *   所有 Animation 的实例也都是一个 JSEventTarget 对象。
   * * 向一个动画中添加多个剪辑，并调整每个剪辑的 delay，duration，timingFunction 参数，以实现复杂的动画。
   * * 仅应在动画初始化时（播放之前）添加动画剪辑，不要在开始播放后添加或更改动画剪辑。
   * * 不要在多个剪辑中变更同一个元素的样式。
   */
  var Animation = window.Animation = function() {
    this.clips = [];
    /**
     * 当前帧所处的时间点。
     * @name Animation#timePoint
     * @type number
     */
    this.timePoint = 0;
    this.status = START_POINT;
    this.duration = 0;
    JSEventTarget.create(this);
  };

//--------------------------------------------------[Animation.fps]
  /**
   * 指定动画引擎播放动画时的每秒帧数。
   * @name fps
   * @memberOf Animation
   * @type number
   * @description
   *   应指定 10 到 60 之间的数字，默认为 60。
   *   仅在对性能敏感的环境下，才需要降低这个数值。过低的 fps 将导致动画播放不流畅。
   */
  Animation.fps = 60;

//--------------------------------------------------[Animation.prototype.addClip]
  /**
   * 添加动画剪辑。
   * @name Animation.prototype.addClip
   * @function
   * @param {Function} renderer 使用 Animation.create*Renderer 创建的渲染器。
   *   该函数被调用时 this 的值为所属的 Animation 对象。
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
   * @returns {boolean} 本方法是否已被成功调用。
   * @description
   *   如果当前动画正在播放中，或时间点已到达终点，则调用本方法无效。
   */
  Animation.prototype.play = function(reverse) {
    var animation = this;
    var isPlayMethod = reverse !== INTERNAL_IDENTIFIER_REVERSE;
    var status = animation.status;
    if (isPlayMethod && status !== PLAYING && status !== END_POINT || !isPlayMethod && status !== REVERSING && status !== START_POINT) {
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
      // 未挂载到引擎（调用本方法前为暂停/停止状态）。
      if (!animation.timestamp && (animation.status === PLAYING || animation.status === REVERSING)) {
        var timePoint = animation.timePoint;
        var duration = animation.duration;
        // 每次播放/倒放时的首帧同步播放。
        playAnimation(animation, timePoint, isPlayMethod);
        // 如果尚有未播放的帧，则将其挂载到动画引擎，异步播放中间帧及末帧。
        if (isPlayMethod ? timePoint !== duration : timePoint !== 0) {
          mountAnimation(animation);
        }
      }
      return true;
    }
    return false;
  };

//--------------------------------------------------[Animation.prototype.reverse]
  /**
   * 倒放动画。
   * @name Animation.prototype.reverse
   * @function
   * @returns {boolean} 本方法是否已被成功调用。
   * @description
   *   如果当前动画正在倒放中，或时间点已到达起点，则调用本方法无效。
   */
  Animation.prototype.reverse = function() {
    return this.play(INTERNAL_IDENTIFIER_REVERSE);
  };

//--------------------------------------------------[Animation.prototype.pause]
  /**
   * 暂停动画。
   * @name Animation.prototype.pause
   * @function
   * @returns {boolean} 本方法是否已被成功调用。
   * @description
   *   仅在动画处于“播放”或“倒放”状态时，调用本方法才有效。
   */
  Animation.prototype.pause = function() {
    var animation = this;
    if (animation.status === PLAYING || animation.status === REVERSING) {
      if (animation.timestamp) {
        unmountAnimation(animation);
      }
      animation.status = PASUING;
      animation.fire('pause');
      return true;
    }
    return false;
  };

//==================================================[动画 - 渲染器]
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
  var reHexColor = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i;
  var reShortHexColor = /^#([\da-f])([\da-f])([\da-f])$/i;
  var reRgbColor = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
  var extractColorValue = function(value) {
    var extractedValue = [255, 255, 255];
    if (NAMED_COLORS.hasOwnProperty(value)) {
      value = NAMED_COLORS[value];
    }
    var match;
    if (match = value.match(reHexColor)) {
      extractedValue = Array.from(match).slice(1).map(function(hexadecimal) {
        return parseInt(hexadecimal, 16);
      });
    } else if (match = value.match(reShortHexColor)) {
      extractedValue = Array.from(match).slice(1).map(function(hexadecimal) {
        return parseInt(hexadecimal + hexadecimal, 16);
      });
    } else if (match = value.match(reRgbColor)) {
      extractedValue = Array.from(match).slice(1).map(function(decimal) {
        return +decimal;
      });
    }
    return extractedValue;
  };

  // 计算新数字，支持相对数值变化。
  var reRelativeValue = /^[+\-]=\d+$/;
  var calculateNewValue = function(valueBefore, newValue) {
    return typeof newValue === 'string' && reRelativeValue.test(newValue) ? valueBefore + (+(newValue.slice(0, 1) + '1') * newValue.slice(2)) : extractNumberValue(newValue);
  };

  // 获取可变样式的映射表。
  var getStylesMap = function($element, stylesAfter) {
    var stylesBefore = $element.getStyles(Object.keys(stylesAfter));
    var map = {before: {}, after: {}};
    Object.forEach(stylesBefore, function(valueBefore, name) {
      var valueAfter = stylesAfter[name];
      switch (acceptableProperties[name]) {
        case TYPE_NUMBER:
          map.before[name] = extractNumberValue(valueBefore);
          map.after[name] = extractNumberValue(valueAfter);
          break;
        case TYPE_LENGTH:
          map.before[name] = valueBefore = extractNumberValue(valueBefore);
          map.after[name] = calculateNewValue(valueBefore, valueAfter);
          break;
        case TYPE_COLOR:
          map.before[name] = extractColorValue(valueBefore);
          map.after[name] = extractColorValue(valueAfter);
          break;
      }
    });
    return map;
  };

//--------------------------------------------------[Animation.createBasicRenderer]
  /**
   * 创建基本渲染器。
   * @name Animation.createBasicRenderer
   * @function
   * @param {Function} renderer 渲染函数，传入两个参数“时间轴”和“偏移量”。
   *   该函数被调用时 this 的值为所属的 Animation 对象。
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
   * @param {Object} styles 要实施渐变效果的样式。支持相对长度值和颜色值，其中相对长度值目前仅支持像素单位，颜色值支持 140 个颜色名称、#RRGGBB 格式、#RGB 格式或 rgb(R, G, B) 格式。
   * @returns {Function} 生成的渲染器。
   */
  Animation.createStyleRenderer = function(element, styles) {
    var $element = document.$(element);
    var map = getStylesMap($element, styles);
    var renderer = function(x, y) {
      Object.forEach(map.before, function(valueBefore, name) {
        var valueAfter = map.after[name];
        var currentValue;
        switch (acceptableProperties[name]) {
          case TYPE_NUMBER:
            currentValue = (valueBefore + (valueAfter - valueBefore) * y).toFixed(2);
            break;
          case TYPE_LENGTH:
            currentValue = Math.floor(valueBefore + (valueAfter - valueBefore) * y) + 'px';  // TODO: 支持多种长度单位。
            break;
          case TYPE_COLOR:
            currentValue = 'rgb(' + Math.floor(valueBefore[0] + (valueAfter[0] - valueBefore[0]) * y) + ', ' + Math.floor(valueBefore[1] + (valueAfter[1] - valueBefore[1]) * y) + ', ' + Math.floor(valueBefore[2] + (valueAfter[2] - valueBefore[2]) * y) + ')';
            break;
        }
        $element.setStyle(name, currentValue);
      });
    };
    renderer.type = 'style';
    return renderer;
  };

//--------------------------------------------------[Animation.createScrollRenderer]
  /**
   * 创建平滑滚动效果渲染器。
   * @name Animation.createScrollRenderer
   * @function
   * @param {Element} element 要实施滚动效果的元素。
   * @param {number} x 横向滚动坐标，元素的内容将向指定的坐标平滑滚动。
   * @param {number} y 纵向滚动坐标，元素的内容将向指定的坐标平滑滚动。
   * @returns {Function} 生成的渲染器。
   */
  Animation.createScrollRenderer = function(element, x, y) {
    var $element = document.$(element);
    var leftBefore;
    var topBefore;
    var calledByViewport = $element === document.documentElement || $element === document.body;
    if (calledByViewport) {
      var pageOffset = window.getPageOffset();
      leftBefore = pageOffset.x;
      topBefore = pageOffset.y;
    } else {
      leftBefore = $element.scrollLeft;
      topBefore = $element.scrollTop;
    }
    var leftDifference = calculateNewValue(leftBefore, x) - leftBefore;
    var topDifference = calculateNewValue(topBefore, y) - topBefore;
    var renderer = function(x, y) {
      var left = Math.round(leftBefore + leftDifference * y);
      var top = Math.round(topBefore + topDifference * y);
      if (calledByViewport) {
        window.scrollTo(left, top);
      } else {
        $element.scrollLeft = left;
        $element.scrollTop = top;
      }
    };
    renderer.type = 'scroll';
    return renderer;
  };

//==================================================[Element 扩展 - 动画]
  /*
   * 为 Element 扩展动画方法。
   *
   * 扩展方法：
   *   Element.prototype.morph
   *   Element.prototype.highlight
   *   Element.prototype.fade
   *   Element.prototype.smoothScroll
   *   Element.prototype.cancelAnimation
   */

  // 参数分隔符。
  var reSeparator = /\s*,\s*/;

  // 空函数。
  var empty = function() {
  };

  // 获取元素正在播放中的动画列表。
  var getAnimations = function($element) {
    return $element._animations_ || ($element._animations_ = {});
  };

//--------------------------------------------------[Element.prototype.morph]
  /**
   * 让本元素播放一个渐变动画。
   * @name Element.prototype.morph
   * @function
   * @param {Object} styles 目标样式，元素将向指定的目标样式渐变。目标样式包含一条或多条要设置的样式声明，与 setStyles 的参数的差异如下：
   *   1. 不能使用复合属性。
   *   2. lineHeight 仅支持 'px' 单位的长度设置，而不支持数字。
   *   3. 支持相对长度，如 '+=10' 表示在现有长度的基础上增加 10 像素，'-=10' 表示在现有长度的基础上减少 10 像素。
   * @param {Object} [options] 动画选项。
   * @param {number} [options.duration] 播放时间，单位为毫秒，默认为 400。
   * @param {string} [options.timingFunction] 控速函数名称或表达式，细节请参考 Animation.prototype.addClip 的同名参数，默认为 'ease'。
   * @param {Function} [options.onStart] 播放开始时的回调。
   *   该函数被调用时 this 的值为本元素。
   * @param {Function} [options.onStep] 播放每一帧之后的回调。
   *   该函数被调用时 this 的值为本元素。
   * @param {Function} [options.onFinish] 播放完成时的回调。
   *   该函数被调用时 this 的值为本元素。
   * @returns {Element} 本元素。
   * @description
   *   如果本元素的动画播放列表中已经存在一个 morph 动画，则停止旧的，播放新的。
   */
  Element.prototype.morph = function(styles, options) {
    var $element = this;
    options = Object.mixin({duration: 400, timingFunction: 'ease', onStart: empty, onStep: empty, onFinish: empty}, options || {});
    var animations = getAnimations($element);
    var prevMorph = animations.morph;
    if (prevMorph) {
      prevMorph.pause();
    }
    var morph = animations.morph = new Animation()
        .addClip(Animation.createStyleRenderer($element, styles), 0, options.duration, options.timingFunction)
        .on('playstart', function(event) {
          options.onStart.call($element, event);
        })
        .on('step', function(event) {
          options.onStep.call($element, event);
        })
        .on('playfinish', function(event) {
          delete animations.morph;
          options.onFinish.call($element, event);
        });
    morph.play();
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
   * @param {number} [options.duration] 播放时间，单位为毫秒，默认为 500。
   * @param {string} [options.timingFunction] 控速函数名称或表达式，细节请参考 Animation.prototype.addClip 的同名参数，默认为 'easeIn'。
   * @param {Function} [options.onStart] 播放开始时的回调。
   *   该函数被调用时 this 的值为本元素。
   * @param {Function} [options.onStep] 播放每一帧之后的回调。
   *   该函数被调用时 this 的值为本元素。
   * @param {Function} [options.onFinish] 播放完成时的回调。
   *   该函数被调用时 this 的值为本元素。
   * @returns {Element} 本元素。
   * @description
   *   如果本元素的动画播放列表中已经存在一个 highlight 动画，则停止旧的，播放新的。
   */
  Element.prototype.highlight = function(color, property, options) {
    var $element = this;
    color = color || 'yellow';
    property = property || 'backgroundColor';
    options = Object.mixin({duration: 500, timingFunction: 'easeIn', onStart: empty, onStep: empty, onFinish: empty}, options || {});
    var animations = getAnimations($element);
    var prevHighlight = animations.highlight;
    if (prevHighlight) {
      prevHighlight.pause();
      $element.setStyle(prevHighlight.property, prevHighlight.originalColor);
    }
    var styles = {};
    styles[property] = $element.getStyle(property);
    var highlight = animations.highlight = new Animation()
        .on('playstart', function(event) {
          $element.setStyle(property, color);
          this.addClip(Animation.createStyleRenderer($element, styles), 0, options.duration, options.timingFunction);
          options.onStart.call($element, event);
        })
        .on('step', function(event) {
          options.onStep.call($element, event);
        })
        .on('playfinish', function(event) {
          $element.setStyle(this.property, this.originalColor);
          delete animations.highlight;
          options.onFinish.call($element, event);
        });
    highlight.property = property;
    highlight.originalColor = $element.style[property];
    highlight.play();
    return $element;
  };

//--------------------------------------------------[Element.prototype.fade]
  /**
   * 让本元素播放一个淡入或淡出动画。
   * @name Element.prototype.fade
   * @function
   * @param {string} [mode] 模式，默认为 'toggle'。
   *   <table>
   *     <tr><th>可选值</th><th>含义</th></tr>
   *     <tr><td><dfn>toggle</dfn></td><td>如果本元素的动画播放列表中已经存在一个 fade 动画，则使用与这个已存在的动画相反的模式。<br>否则若本元素的 display 为 none 则为淡入模式，display 不为 none 则为淡出模式。</td></tr>
   *     <tr><td><dfn>in</dfn></td><td>淡入模式。</td></tr>
   *     <tr><td><dfn>out</dfn></td><td>淡出模式。</td></tr>
   *   </table>
   * @param {Object} [options] 动画选项。
   * @param {number} [options.duration] 播放时间，单位为毫秒，默认为 200。
   * @param {string} [options.timingFunction] 控速函数名称或表达式，细节请参考 Animation.prototype.addClip 的同名参数，默认为 'easeIn'。
   * @param {Function} [options.onStart] 播放开始时的回调。
   *   该函数被调用时 this 的值为本元素。
   * @param {Function} [options.onStep] 播放每一帧之后的回调。
   *   该函数被调用时 this 的值为本元素。
   * @param {Function} [options.onFinish] 播放完成时的回调。
   *   该函数被调用时 this 的值为本元素。
   * @returns {Element} 本元素。
   * @description
   *   如果本元素的动画播放列表中已经存在一个 fade 动画，则停止旧的，播放新的。这种情况下新动画的播放时间会小于设定的时间（具体取决于旧动画已播放的百分比）。
   *   否则若本元素的 display 不为 none 则不能播放淡入动画，display 为 none 则不能播放淡出动画。
   */
  Element.prototype.fade = function(mode, options) {
    var $element = this;
    var animations = getAnimations($element);
    var prevFade = animations.fade;
    // 根据当前已有的信息确定本次调用应为 fade in 模式还是 fade out 模式。
    var shouldBeFadeInMode = prevFade ? !prevFade.isFadeInMode : $element.getStyle('display') === 'none';
    // 实际为 fade in 模式还是 fade out 模式。
    var isFadeInMode;
    switch ((mode || 'toggle').toLowerCase()) {
      case 'toggle':
        isFadeInMode = shouldBeFadeInMode;
        break;
      case 'in':
        isFadeInMode = true;
        break;
      case 'out':
        isFadeInMode = false;
        break;
      default:
        throw new Error('Invalid mode "' + mode + '"');
    }
    // 检查是否可以播放 fade 动画。
    if (prevFade || isFadeInMode === shouldBeFadeInMode) {
      options = Object.mixin({duration: 200, timingFunction: 'easeIn', onStart: empty, onStep: empty, onFinish: empty}, options || {});
      var originalOpacity;
      var percentageNeedsPlay;
      if (prevFade) {
        originalOpacity = prevFade.originalOpacity;
        // 新动画与旧动画的方向相同：需要播放的百分比 = 旧动画要播放的百分比 * 旧动画未播完的百分比。
        // 新动画与旧动画的方向相反：需要播放的百分比 = 1 - 旧动画要播放的百分比 * 旧动画未播完的百分比。
        percentageNeedsPlay = Math.abs((isFadeInMode === prevFade.isFadeInMode ? 0 : 1) - prevFade.percentageNeedsPlay * (1 - (prevFade.timePoint / prevFade.duration)));
        // 停止播放旧动画。
        prevFade.pause();
      } else {
        originalOpacity = $element.getStyle('opacity');
        percentageNeedsPlay = 1;
        // 如果是 fade in 则将透明度设置为 0。
        if (isFadeInMode) {
          $element.setStyles({display: 'block', opacity: 0});
        }
      }
      var fade = animations.fade = new Animation()
          .addClip(Animation.createStyleRenderer($element, {opacity: isFadeInMode ? originalOpacity : 0}), 0, options.duration * percentageNeedsPlay, options.timingFunction)
          .on('playstart', function(event) {
            options.onStart.call($element, event);
          })
          .on('step', function(event) {
            options.onStep.call($element, event);
          })
          .on('playfinish', function(event) {
            delete animations.fade;
            // 如果是 fade out 则在播放完毕后恢复原始透明度。
            if (!isFadeInMode) {
              $element.setStyles({display: 'none', opacity: originalOpacity});
            }
            options.onFinish.call($element, event);
          });
      fade.isFadeInMode = isFadeInMode;
      fade.originalOpacity = originalOpacity;
      fade.percentageNeedsPlay = percentageNeedsPlay;
      fade.play();
    }
    return $element;
  };

//--------------------------------------------------[Element.prototype.smoothScroll]
  /**
   * 让本元素播放一个平滑滚动动画。
   * @name Element.prototype.smoothScroll
   * @function
   * @param {number} x 横向滚动坐标，支持相对坐标，如 '+=10' 表示在现有横坐标的基础上向左滚动 10 像素，'-=10' 表示在现有横坐标的基础上向右滚动 10 像素。
   * @param {number} y 纵向滚动坐标，支持相对坐标，如 '+=10' 表示在现有纵坐标的基础上向下滚动 10 像素，'-=10' 表示在现有纵坐标的基础上向上滚动 10 像素。
   * @param {Object} [options] 动画选项。
   * @param {number} [options.duration] 播放时间，单位为毫秒，默认为 200。
   * @param {string} [options.timingFunction] 控速函数名称或表达式，细节请参考 Animation.prototype.addClip 的同名参数，默认为 'easeInOut'。
   * @param {Function} [options.onStart] 播放开始时的回调。
   *   该函数被调用时 this 的值为本元素。
   * @param {Function} [options.onStep] 播放每一帧之后的回调。
   *   该函数被调用时 this 的值为本元素。
   * @param {Function} [options.onFinish] 播放完成时的回调。
   *   该函数被调用时 this 的值为本元素。
   * @returns {Element} 本元素。
   * @description
   *   如果本元素的动画播放列表中已经存在一个 smoothScroll 动画，则停止旧的，播放新的。
   *   如果在 HTML 或 BODY 元素上调用本方法，则滚动整个视口。
   */
  Element.prototype.smoothScroll = function(x, y, options) {
    var $element = this;
    options = Object.mixin({duration: 200, timingFunction: 'easeInOut', onStart: empty, onStep: empty, onFinish: empty}, options || {});
    var animations = getAnimations($element);
    var prevScroll = animations.smoothScroll;
    if (prevScroll) {
      prevScroll.pause();
    }
    var smoothScroll = animations.smoothScroll = new Animation()
        .addClip(Animation.createScrollRenderer($element, x, y), 0, options.duration, options.timingFunction)
        .on('playstart', function(event) {
          options.onStart.call($element, event);
        })
        .on('step', function(event) {
          options.onStep.call($element, event);
        })
        .on('playfinish', function(event) {
          delete animations.smoothScroll;
          options.onFinish.call($element, event);
        });
    smoothScroll.play();
    return $element;
  };

//--------------------------------------------------[Element.prototype.cancelAnimation]
  /**
   * 取消本元素正在播放的动画。
   * @name Element.prototype.cancelAnimation
   * @function
   * @param {string} [type] 要取消的动画类型，如果要取消多种类型的动画，使用逗号将它们分开即可。
   *   如果省略该参数，则取消本元素所有正在播放的动画。
   * @returns {Element} 本元素。
   * @description
   *   对于 morph 类型的动画，会在当前帧停止。
   *   对于 highlight 类型的动画，会恢复到动画播放前的状态。
   *   对于 fade 类型的动画，会跳过补间帧直接完成显示/隐藏。
   *   对于 smoothScroll 类型的动画，会立即停止滚动。
   */
  Element.prototype.cancelAnimation = function(type) {
    var $element = this;
    var animations = getAnimations($element);
    var types = type ? type.split(reSeparator) : null;
    Object.forEach(animations, function(animation, type) {
      if (types === null || types.contains(type)) {
        animation.pause();
        delete animations[type];
        switch (type) {
          case 'morph':
            break;
          case 'highlight':
            $element.setStyle(animation.property, animation.originalColor);
            break;
          case 'fade':
            $element.setStyles({display: animation.isFadeInMode ? 'block' : 'none', opacity: animation.originalOpacity});
            break;
          case 'smoothScroll':
            break;
        }
      }
    });
    return $element;
  };

})(window);

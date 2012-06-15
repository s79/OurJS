/**
 * @fileOverview 提供 DOM 对象的补缺及扩展。
 * @author sundongguo@gmail.com
 * @version 20111115
 */
(function() {
  // 文档根元素。
  var html = document.documentElement;

  // 将字符串从 Hyphenate 转换为 CamelCase。  // TODO: 所有用到此转换的部分考虑仅支持 Camel Case。
  var HYPHENATE_FIRST_LETTER = /-([a-z])/g;
  var hyphenateToCamelCase = function(string) {
    return string.replace(HYPHENATE_FIRST_LETTER, function(_, letter) {
      return letter.toUpperCase();
    });
  };

  // 将字符串从 Hyphenate 转换为 CamelCase。
  var CAMEL_CASE_FIRST_LETTER = /[A-Z]/g;
  var camelCaseToHyphenate = function(string) {
    return string.replace(CAMEL_CASE_FIRST_LETTER, function(letter) {
      return '-' + letter.toLowerCase();
    });
  };

//==================================================[DOM 补缺]
  /*
   * 为不支持某些特性的浏览器添加这些特性。
   *
   * 补缺属性：
   *   document.head
   *   HTMLElement.prototype.innerText
   *   HTMLElement.prototype.outerText
   *   HTMLElement.prototype.outerHTML
   */

//--------------------------------------------------[document.head]
  // 为 IE6 IE7 IE8 的 document 增加 head 属性。
  /**
   * 获取文档的 head 元素。
   * @name head
   * @memberOf document
   * @type Element
   * @description
   *   与 document.documentElement 和 document.body 的作用一样，document.head 是获取文档的 head 元素的快捷方式。
   * @example
   *   document.documentElement === document.getElementsByTagName('html')[0];
   *   // true
   *   document.head === document.getElementsByTagName('head')[0];
   *   // true
   *   document.body === document.getElementsByTagName('body')[0];
   *   // true
   */
  if (!document.head) {
    document.head = html.firstChild;
  }

//--------------------------------------------------[HTMLElement.prototype.innerText]
  // 为 Firefox 添加 HTMLElement.prototype.innerText 属性。
  /**
   * 获取/设置本元素内的文本信息。
   * @name Element.prototype.innerText
   * @type string
   * @description
   *   注意：
   *   getter 在遇到 br 元素或换行符时，各浏览器行为不一致。
   */
  if (!('innerText' in document.head)) {
    HTMLElement.prototype.__defineGetter__('innerText', function() {
      return this.textContent;
    });
    HTMLElement.prototype.__defineSetter__('innerText', function(text) {
      this.textContent = text;
      return text;
    });
  }

//--------------------------------------------------[HTMLElement.prototype.outerText]
  // 为 Firefox 添加 HTMLElement.prototype.outerText 属性。
  /**
   * 获取本元素内的文本信息，或使用文本信息替换本元素。
   * @name Element.prototype.outerText
   * @type string
   * @description
   *   注意：
   *   getter 在遇到 br 元素或换行符时，各浏览器行为不一致。
   *   setter 在特殊元素上调用时（如 body）各浏览器行为不一致。
   *   与 innerText 不同，如果设置一个元素的 outerText，那么设置的字符串将作为文本节点替换本元素在文档树中的位置。
   */
  if (!('outerText' in document.head)) {
    HTMLElement.prototype.__defineGetter__('outerText', function() {
      return this.textContent;
    });
    HTMLElement.prototype.__defineSetter__('outerText', function(text) {
      var textNode = this.ownerDocument.createTextNode(text);
      this.parentNode.replaceChild(textNode, this);
      return text;
    });
  }

//--------------------------------------------------[HTMLElement.prototype.outerHTML]
  // 为 Firefox 添加 HTMLElement.prototype.outerHTML 属性。
  /**
   * 获取/设置本元素（包含后代节点在内）的序列化字符串。
   * @name Element.prototype.outerHTML
   * @type string
   * @description
   *   注意：
   *   getter 在处理空标签及特殊字符时，各浏览器行为不一致。
   */
  if (!('outerHTML' in document.head)) {
    var RE_EMPTY_ELEMENT = /^(area|base|br|col|embed|hr|img|input|link|meta|param|command|keygen|source|track|wbr)$/;
    var isEmptyElement = function(nodeName) {
      return RE_EMPTY_ELEMENT.test(nodeName);
    };

    HTMLElement.prototype.__defineGetter__('outerHTML', function() {
      var nodeName = this.nodeName.toLowerCase();
      var html = '<' + nodeName;
      var attributes = this.attributes;
      var i = 0;
      var length = attributes.length;
      while (i < length) {
        if (attributes[i].specified) {
          html += ' ' + attributes[i].name + '="' + attributes[i].value + '"';
        }
        i++;
      }
      if (isEmptyElement(nodeName)) {
        html += '>';
      } else {
        html += '>' + this.innerHTML + '</' + nodeName + '>';
      }
      return html;
    });
    HTMLElement.prototype.__defineSetter__('outerHTML', function(html) {
      var range = this.ownerDocument.createRange();
      range.setStartBefore(this);
      this.parentNode.replaceChild(range.createContextualFragment(html), this);
      return html;
    });
  }

//==================================================[Element 的浏览器差异处理]
  /*
   * 为 Element 扩展新特性，而不是所有 Node 类型。
   *
   * 提供屏蔽浏览器差异的，针对元素操作的方法有以下三种方案：
   * 一、静态方法
   *   方式：
   *     提供一些静态方法，将元素以参数（一般是方法的第一个参数）的形式传入并进行处理。
   *   优点：
   *     各方法间依赖性小，可以轻易分离。
   *     不修改原生对象，可以跨 frame 操作，可与其他脚本库共存。
   *   缺点：
   *     对一个元素的连续操作以方法嵌套的形式进行，代码冗长、不易读。
   *     有时需要使用静态方法，有时又要使用原生方法（特性），缺乏一致性。
   * 二、包装对象
   *   方式：
   *     创建一个对象包装目标元素，在这个包装对象的原型链中添加屏蔽浏览器差异的方法。
   *   优点：
   *     对一个元素的连续操作可以链式调用，代码通顺。
   *     提供的方法都是实例方法，具备较好的一致性。
   *     不修改原生对象，可以跨 frame 操作，可与其他脚本库共存。
   *   缺点：
   *     访问元素的属性时需要使用 getter 和 setter 方法，或者说包装对象已没有“属性”的概念，对一致性略有影响。
   *     必须以约定的方式获取元素以便对其包装。
   * 三、为原生对象添加方法
   *   方式：
   *     直接在 Element.prototype 上扩展特性。对于不支持 Element 构造函数的浏览器 (IE6 IE7)，将对应特性直接附加在元素上。
   *   优点：
   *     对一个元素的连续操作，如果使用的是方法，则可以链式调用，代码通顺。
   *     本身就是在对元素操作，易理解，API 的一致性最好。
   *   缺点：
   *     对一个元素的连续操作，如果中间有对属性的操作则无法进行链式调用。
   *     修改了原生对象，跨 frame 操作需要特殊处理 frame 中的 window 和 document 对象，不建议与其他脚本库共存。
   *     必须以约定的方式获取元素。
   *
   * 这里使用第三种方式。
   * 要处理的元素必须由本脚本库提供的 document.$ 方法来获取，或通过已获取的元素上提供的方法（如 find，getNext 等）来查找/遍历并获取。
   * 使用其他途径如元素本身的 parentNode 来获取的元素，在 IE6 IE7 中将丢失这些附加特性。
   * 为保持简单性，不予提供跨 frame 的操作，实际上跨 frame 操作并不常见，通常也不建议这样做。
   * 必须跨 frame 时，应将 frame 作为一个模块，在其内也引入 js 库，两侧通过事件通信，这样的代码更易于理解与划分模块。
   */

  /**
   * 为无 Element 构造函数的浏览器创建 Element 对象，以确保在各浏览器中都可以通过 Element.prototype 为元素扩展新特性。
   * @name Element
   * @class
   */

//--------------------------------------------------[Element.prototype]
  /**
   * 可以通过扩展本对象来为页面中的所有元素扩展新特性。
   * @name prototype
   * @memberOf Element
   * @type Object
   * @description
   *   注意：
   *   受 IE6 IE7 实现方式的限制，扩展新特性应在获取元素之前进行，否则已获取的元素将无法访问新扩展的特性。
   * @example
   *   Element.prototype.getNodeName = function() {
   *     return this.nodeName;
   *   };
   *   $(document.head).getNodeName();
   *   // HEAD
   */
  var elementPrototype;
  if (!window.Element) {
    window.Element = {
      prototype: {}
    };
    elementPrototype = Element.prototype;
  }

//--------------------------------------------------[$ <内部方法>]
  // 唯一识别码，元素上有 uid 属性表示该元素已被扩展，uid 属性的值也可用于反向查找该元素的 key。
  var uid = 0;

  /**
   * 为一个元素扩展新特性，对于无 Element 构造函数的浏览器 (IE6 IE7) 将在该元素上直接附加这些新特性。
   * @name $
   * @function
   * @private
   * @param {Element} element 要扩展的元素，只能传入 Element、document（事件对象的 target 属性）或 null。
   * @returns {Element} 扩展后的元素。
   * @description
   *   注意：
   *   不能获取并扩展其他页面的 DOM 元素！
   */
  var $ = elementPrototype ? function(element) {
    if (element && !element.uid) {
      element.uid = ++uid;
      // Object.append(element, elementPrototype);
      // 使用以下方式附加新属性以降低开销。此处不必判断 hasOwnProperty，也无需考虑 hasDontEnumBug 的问题。
      for (var key in elementPrototype) {
        element[key] = elementPrototype[key];
      }
    }
    return element;
  } : function(element) {
    if (element && !element.uid) {
      element.uid = ++uid;
    }
    return element;
  };

//==================================================[Element 扩展 - 处理类]
  /*
   * 针对元素的类的操作。
   *
   * 扩展方法：
   *   Element.prototype.hasClass
   *   Element.prototype.addClass
   *   Element.prototype.removeClass
   *   Element.prototype.toggleClass
   */

//--------------------------------------------------[Element.prototype.hasClass]
  /**
   * 判断本元素是否有指定的类名。
   * @name Element.prototype.hasClass
   * @function
   * @param {string} className 类名。
   * @returns {boolean} 本元素是否有指定的类名。
   */
  Element.prototype.hasClass = function(className) {
    return (' ' + this.className.clean() + ' ').contains(' ' + className + ' ');
  };

//--------------------------------------------------[Element.prototype.addClass]
  /**
   * 为本元素添加一个类名。
   * @name Element.prototype.addClass
   * @function
   * @param {string} className 类名。
   * @returns {Element} 本元素。
   */
  Element.prototype.addClass = function(className) {
    if (!this.hasClass(className)) {
      this.className = (this.className + ' ' + className).clean();
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.removeClass]
  /**
   * 为本元素删除一个类名。
   * @name Element.prototype.removeClass
   * @function
   * @param {string} className 类名。
   * @returns {Element} 本元素。
   */
  Element.prototype.removeClass = function(className) {
    this.className = (' ' + this.className.clean() + ' ').replace(' ' + className + ' ', ' ').trim();
    return this;
  };

//--------------------------------------------------[Element.prototype.toggleClass]
  /**
   * 为本元素添加一个类名（如果本元素没有这个类名）或删除一个类名（如果本元素有这个类名）。
   * @name Element.prototype.toggleClass
   * @function
   * @param {string} className 类名。
   * @returns {Element} 本元素。
   */
  Element.prototype.toggleClass = function(className) {
    return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
  };

//==================================================[Element 扩展 - 处理样式]
  /*
   * 获取/修改元素的样式。
   *
   * 扩展方法：
   *   Element.prototype.getStyle
   *   Element.prototype.getStyles
   *   Element.prototype.setStyle
   *   Element.prototype.setStyles
   */

  // 单位为数字时不自动添加 'px' 的 CSS 特性。
  var numericValues = {
    fillOpacity: true,
    fontWeight: true,
    lineHeight: true,
    opacity: true,
    orphans: true,
    widows: true,
    zIndex: true,
    zoom: true
  };

  // 设置特殊 CSS 特性的值。
  var specialCSSPropertySetter = 'getComputedStyle' in window ? {
    'float': function($element, propertyValue) {
      $element.style.cssFloat = propertyValue;
    }
  } : {
    'float': function($element, propertyValue) {
      $element.style.styleFloat = propertyValue;
    },
    'opacity': function($element, propertyValue) {
      if ($element.filters.alpha) {
        // 这样更直接，缺点是不会更改 style.filter 或 style.cssText 中的文字。
        $element.filters.alpha.opacity = propertyValue * 100;
      } else {
        if ($element.style.filter) {
          // 可以不加空格。
          $element.style.filter += ' ';
        }
        $element.style.filter += 'alpha(opacity=' + (propertyValue * 100) + ')';
      }
    }
  };

  // 获取特殊 CSS 特性的值。
  var specialCSSPropertyGetter = {};

  // 修复 IE6 不支持 position: fixed 的问题。
  //
  // 注意：
  //   目前仅考虑 direction: ltr 的情况，并且不支持嵌套使用 position: fixed。事实上这两点不会影响现有的绝大部分需求。
  //   目前仅支持在 left right top bottom 上使用像素长度来设置偏移量。修复后，目标元素的样式中有 left 则 right 失效，有 top 则 bottom 失效。
  //   因此要保证兼容，在应用中设置 position: fixed 的元素应有明确的尺寸设定，并只使用（left right top bottom）的（像素长度）来定位，否则在 IE6 中的表现会有差异。
  //
  // 处理流程：
  //   position 的修改 = 启用/禁用修复，如果已启用修复，并且 display 不是 none，则同时启用表达式。
  //   display 的修改 = 如果已启用修复，则启用/禁用表达式。
  //   left/right/top/bottom 的修改 = 如果已启用修复，则调整值。如果已启用表达式，则更新表达式。
  //   由于 IE6 设置为 position: absolute 的元素的 right bottom 定位与 body 元素的 position 有关，并且表现怪异，因此设置表达式时仍使用 left top 实现。
  //   这样处理的附加好处是不必在每次更新表达式时启用/禁用设置在 right bottom 上的表达式。
  //
  // 参考：
  //   http://www.qianduan.net/fix-ie6-dont-support-position-fixed-bug.html
  //
  // 实测结果：
  //   X = 页面背景图片固定，背景图直接放在 html 上即可，若要放在 body 上，还要加上 background-attachment: fixed。
  //   A = 为元素添加 CSS 表达式。
  //   B = 为元素绑定事件监听器，在监听器中修改元素的位置。
  //   X + A 可行，X + B 不可行。
  if (navigator.isIE6) {
    // 保存已修复的元素的偏移量及是否启用的数据。
    /*
     * <Object ie6FixedPositionedElements> {
     *   <string uid>: <Object fixedData> {
     *     left: <Object leftData> {
     *       specifiedValue: <string specifiedValue>,
     *       usedValue: <number usedValue>
     *     },
     *     right: <Object rightData> {
     *       specifiedValue: <string specifiedValue>,
     *       usedValue: <number usedValue>
     *     },
     *     top: <Object topData> {
     *       specifiedValue: <string specifiedValue>,
     *       usedValue: <number usedValue>
     *     },
     *     bottom: <Object bottomData> {
     *       specifiedValue: <string specifiedValue>,
     *       usedValue: <number usedValue>
     *     },
     *     enabled: <boolean enabled>
     *   }
     * };
     */
    var ie6FixedPositionedElements = {};

    // 已修复的元素的总数。
    var ie6FixedPositionedElementCount = 0;

    // 添加 CSS 表达式。
    var setExpressions = function($element, fixedData) {
      var left = fixedData.left.usedValue;
      var top = fixedData.top.usedValue;
      var right = fixedData.right.usedValue;
      var bottom = fixedData.bottom.usedValue;
      if (isFinite(left)) {
        $element.style.setExpression('left', '(document && document.documentElement.scrollLeft + ' + left + ') + "px"');
      } else {
        $element.style.setExpression('left', '(document && (document.documentElement.scrollLeft + document.documentElement.clientWidth - this.offsetWidth - (parseInt(this.currentStyle.marginLeft, 10) || 0) - (parseInt(this.currentStyle.marginRight, 10) || 0)) - ' + right + ') + "px"');
      }
      if (isFinite(top)) {
        $element.style.setExpression('top', '(document && document.documentElement.scrollTop + ' + top + ') + "px"');
      } else {
        $element.style.setExpression('top', '(document && (document.documentElement.scrollTop + document.documentElement.clientHeight - this.offsetHeight - (parseInt(this.currentStyle.marginTop, 10) || 0) - (parseInt(this.currentStyle.marginBottom, 10) || 0)) - ' + bottom + ') + "px"');
      }
//      console.log('*** setExpressions: ' + $element.uid + ': ' + left + '/' + right + '/' + top + '/' + bottom + ' ***');
    };

    // 删除 CSS 表达式。
    var removeExpressions = function($element) {
      $element.style.removeExpression('left');
      $element.style.removeExpression('top');
//      console.log('*** removeExpressions: uid = ' + $element.uid + ' ***');
    };

    // IE6 设置 position 特性时的特殊处理。
    specialCSSPropertySetter.position = function($element, propertyValue) {
      var uid = $element.uid;
      // 本元素的偏移量数据，如果未启用修复则不存在。
      var fixedData = ie6FixedPositionedElements[uid];
      if (propertyValue.toLowerCase() === 'fixed') {
        // 设置固定定位。
        if (!fixedData) {
          // 启用修复。
          fixedData = ie6FixedPositionedElements[uid] = {left: {}, right: {}, top: {}, bottom: {}, enabled: false};
          var offset = {};
          var currentStyle = $element.currentStyle;
          fixedData.left.specifiedValue = offset.left = currentStyle.left;
          fixedData.right.specifiedValue = offset.right = currentStyle.right;
          fixedData.top.specifiedValue = offset.top = currentStyle.top;
          fixedData.bottom.specifiedValue = offset.bottom = currentStyle.bottom;
          Object.forEach(offset, function(length, side, offset) {
            fixedData[side].usedValue = offset[side] = length.endsWith('px') ? parseInt(length, 10) : NaN;
          });
          // 如果 usedValue 中横向或纵向的两个值均为 NaN，则给 left 或 top 赋值为当前该元素相对于页面的偏移量。
          isNaN(fixedData.left.usedValue) && isNaN(fixedData.right.usedValue) && (fixedData.left.usedValue = document.documentElement.scrollLeft + $element.getClientRect().left - (parseInt($element.currentStyle.marginLeft, 10) || 0));
          isNaN(fixedData.top.usedValue) && isNaN(fixedData.bottom.usedValue) && (fixedData.top.usedValue = document.documentElement.scrollTop + $element.getClientRect().top - (parseInt($element.currentStyle.marginTop, 10) || 0));
//          console.log(JSON.stringify(fixedData));
          // 如果元素已被渲染（暂不考虑祖先级元素未被渲染的情况），启用表达式。
          if ($element.currentStyle.display !== 'none') {
            fixedData.enabled = true;
            setExpressions($element, fixedData);
          }
          // 若是本页面的第一次修复则设置页面背景。
          if (ie6FixedPositionedElementCount++ === 0) {
            document.documentElement.style.backgroundImage = 'url(about:blank)';
          }
        }
        propertyValue = 'absolute';
      } else {
        // 设置非固定定位。
        if (fixedData) {
          // 禁用修复。
          removeExpressions($element);
          $element.style.left = fixedData.left.specifiedValue;
          $element.style.right = fixedData.right.specifiedValue;
          $element.style.top = fixedData.top.specifiedValue;
          $element.style.bottom = fixedData.bottom.specifiedValue;
          delete ie6FixedPositionedElements[uid];
          // 若本页面已不存在需修复的元素则取消页面背景设置。
          if (--ie6FixedPositionedElementCount === 0) {
            document.documentElement.style.backgroundImage = 'none';
          }
        }
      }
      // 设置样式。
      $element.style.position = propertyValue;
//      console.log('ie6FixedPositionedElementCount: ' + ie6FixedPositionedElementCount);
    };

    // IE6 获取 position 特性时的特殊处理。
    specialCSSPropertyGetter.position = function($element) {
      return ie6FixedPositionedElements[$element.uid] ? 'fixed' : $element.currentStyle.position;
    };

    // IE6 设置 display 特性时的特殊处理。
    specialCSSPropertySetter.display = function($element, propertyValue) {
      var fixedData = ie6FixedPositionedElements[$element.uid];
      // 仅在本元素已启用修复的情况下需要进行的处理。
      if (fixedData) {
        if (propertyValue.toLowerCase() === 'none') {
          // 不渲染元素，禁用表达式。
          if (fixedData.enabled) {
            fixedData.enabled = false;
            removeExpressions($element);
          }
        } else {
          // 渲染元素，启用表达式。
          if (!fixedData.enabled) {
            fixedData.enabled = true;
            setExpressions($element, fixedData);
          }
        }
      }
      // 设置样式。
      $element.style.display = propertyValue;
    };

    // IE6 设置 left/right/top/bottom 特性时的特殊处理。
    var setOffset = function($element, propertyName, propertyValue) {
      var fixedData = ie6FixedPositionedElements[$element.uid];
      // 仅在本元素已启用修复的情况下需要进行的处理。
      if (fixedData) {
        fixedData[propertyName].specifiedValue = propertyValue;
        // 如果值可用，更新使用值。
        if (propertyValue.endsWith('px')) {
          var usedValue = parseInt(propertyValue, 10);
          if (fixedData[propertyName].usedValue !== usedValue) {
            fixedData[propertyName].usedValue = usedValue;
            // 如果表达式已启用，更新表达式。
            if (fixedData.enabled) {
              setExpressions($element, fixedData);
            }
          }
        }
      } else {
        // 设置样式。
        $element.style[propertyName] = propertyValue;
      }
    };

    // IE6 获取 left/right/top/bottom 特性时的特殊处理。
    var getOffset = function($element, propertyName) {
      var fixedData = ie6FixedPositionedElements[$element.uid];
      return fixedData ? fixedData[propertyName].specifiedValue : $element.currentStyle[propertyName];
    };

    ['left', 'right', 'top', 'bottom'].forEach(function(side) {
      specialCSSPropertySetter[side] = function($element, propertyValue) {
        setOffset($element, side, propertyValue);
      };
      specialCSSPropertyGetter[side] = function($element) {
        return getOffset($element, side);
      };
    });

  }

  // 为不支持 getComputedStyle 的浏览器 (IE6 IE7 IE8) 提供的 CurrentStyle 类，并模拟 CSSStyleDeclaration 对象的 getPropertyValue 方法。
  function CurrentStyle($element) {
    this.element = $element;
    this.currentStyle = $element.currentStyle;
  }

  CurrentStyle.prototype.getPropertyValue = function(name) {
    var value;
    switch (name) {
      case 'float':
        value = this.currentStyle.styleFloat;
        break;
      case 'opacity':
        value = this.element.filters['alpha'] && this.element.filters['alpha'].opacity / 100 + '' || '1';
        break;
      default:
        // 仅 IE6 有 specialCSSPropertyGetter，因此放在此处处理。
        value = specialCSSPropertyGetter[name] ? specialCSSPropertyGetter[name](this.element) : this.currentStyle[hyphenateToCamelCase(name)];
    }
    return value === undefined ? '' : value;
  };

  // 获取元素的“计算后的样式”。
  // 实际上各浏览器返回的“计算后的样式”中各特性的值未必是 CSS 规范中描述的 computed values，而可能是 used/actual values。
  var getComputedStyle = 'getComputedStyle' in window ? function($element) {
    return window.getComputedStyle($element, null);
  } : function($element) {
    return new CurrentStyle($element);
  };

//--------------------------------------------------[Element.prototype.getStyle]
  /**
   * 获取本元素的“计算后的样式”中某个特性的值。
   * @name Element.prototype.getStyle
   * @function
   * @param {string} propertyName 特性名，支持 camel case 和 hyphenate 格式。
   * @returns {string} 对应的特性值，如果获取的是长度值，其单位未必是 px，可能是其定义时的单位。
   * @description
   *   注意：
   *   不要尝试获取复合属性的值，它们存在兼容性问题。
   *   不要尝试获取未插入文档树的元素的“计算后的样式”，它们存在兼容性问题。
   */
  Element.prototype.getStyle = function(propertyName) {
    return getComputedStyle(this).getPropertyValue(camelCaseToHyphenate(propertyName));
  };

//--------------------------------------------------[Element.prototype.getStyles]
  /**
   * 获取本元素的“计算后的样式”中一组特性的值。
   * @name Element.prototype.getStyles
   * @function
   * @param {Array} propertyNames 指定要获取的特性名，可以为任意个。
   * @returns {Object} 包含一组特性值的，格式为 {propertyName: propertyValue, ...} 的对象。
   */
  Element.prototype.getStyles = function(propertyNames) {
    var styles = {};
    var computedStyle = getComputedStyle(this);
    propertyNames.forEach(function(propertyName) {
      styles[propertyName] = computedStyle.getPropertyValue(camelCaseToHyphenate(propertyName));
    });
    return styles;
  };

//--------------------------------------------------[Element.prototype.setStyle]
  /**
   * 为本元素设置一条行内样式声明。
   * @name Element.prototype.setStyle
   * @function
   * @param {string} propertyName 特性名，支持 camel case 和 hyphenate 格式。
   * @param {number|string} propertyValue 特性值，若为数字，则为期望长度单位的特性值自动添加长度单位 'px'。
   * @returns {Element} 本元素。
   * @description
   *   注意：
   *   如果设置的是长度值，若长度单位不是 'px' 则不能省略长度单位。
   *   可以设置复合属性的值。
   */
  Element.prototype.setStyle = function(propertyName, propertyValue) {
    propertyName = hyphenateToCamelCase(propertyName);
    if (typeof propertyValue === 'number' && isFinite(propertyValue)) {
      propertyValue += numericValues.hasOwnProperty(propertyName) ? '' : 'px';
    }
    if (typeof propertyValue === 'string') {
      var setSpecialCSSProperty = specialCSSPropertySetter[propertyName];
      if (setSpecialCSSProperty) {
        setSpecialCSSProperty(this, propertyValue);
      } else {
        this.style[propertyName] = propertyValue;
      }
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.setStyles]
  /**
   * 为本元素设置一组行内样式声明。
   * @name Element.prototype.setStyles
   * @function
   * @param {Object} declarations 包含一条或多条要设置的样式声明，格式为 {propertyName: propertyValue, ...} 的对象。
   * @returns {Element} 本元素。
   */
  Element.prototype.setStyles = function(declarations) {
    for (var propertyName in declarations) {
      this.setStyle(propertyName, declarations[propertyName]);
    }
    return this;
  };

//==================================================[Element 扩展 - 获取位置及尺寸]
  /*
   * 获取元素在视口的位置及尺寸。
   *
   * 扩展方法：
   *   Element.prototype.getClientRect
   */

//--------------------------------------------------[Element.prototype.getClientRect]
  /*
   * —— 2009 年的测试结果 (body's direction = ltr) ——
   * 测试浏览器：IE6 IE7 IE8 FF3 Safari4 Chrome2 Opera9。
   *
   * 浏览器        compatMode  [+html.border,+body.border]  [+html.border,-body.border]  [-html.border,+body.border]  [-html.border,-body.border]
   * IE6 IE7 IE8  BackCompat        +body.clientLeft             +body.clientLeft             +body.clientLeft             +body.clientLeft
   * Others       BackCompat              准确
   * IE6 IE7      CSS1Compat        +html.clientLeft             +html.clientLeft             +html.clientLeft             +html.clientLeft
   * Others       CSS1Compat              准确
   *
   * 根据上表可知，只有 IE8 以下会出现问题。
   * 混杂模式下，IE6 IE7 IE8 减去 body.clientLeft 的值即可得到准确结果。
   * body.clientLeft 的值取决于 body 的 border 属性，如果未设置 body 的 border 属性，则 body 会继承 html 的 border 属性。如果 html 的 border 也未设置，则 html 的 border 默认值为 medium，计算出来是 2px。
   * 标准模式下，IE6 IE7 减去 html.clientLeft 的值即可得到准确结果。
   * html.clientLeft 在 IE6 中取决于 html 的 border 属性，而在 IE7 中的值则始终为 2px。
   */

  /**
   * 获取本元素的 border-box 在视口中的坐标。
   * @name Element.prototype.getClientRect
   * @function
   * @returns {Object} 包含位置（left、right、top、bottom）及尺寸（width、height）的对象，所有属性值均为 number 类型，单位为像素。
   * @description
   *   注意：
   *   不考虑非标准模式。
   *   标准模式下 IE7(IE9 模拟) 的 body 的计算样式 direction: rtl 时，如果 html 设置了边框，则横向坐标获取仍不准确。由于极少出现这种情况，此处未作处理。
   */
  Element.prototype.getClientRect = navigator.isIElt8 ? function() {
    var clientRect = this.getBoundingClientRect();
    var left = clientRect.left - html.clientLeft;
    var top = clientRect.top - html.clientTop;
    var width = this.offsetWidth;
    var height = this.offsetHeight;
    return {
      left: left,
      right: left + width,
      top: top,
      bottom: top + height,
      width: width,
      height: height
    };
  } : function() {
    var clientRect = this.getBoundingClientRect();
    if ('width' in clientRect) {
      return clientRect;
    } else {
      return {
        left: clientRect.left,
        right: clientRect.right,
        top: clientRect.top,
        bottom: clientRect.bottom,
        width: this.offsetWidth,
        height: this.offsetHeight
      };
    }
  };

//==================================================[Element 扩展 - 处理自定义数据]
  /*
   * 获取/添加/删除元素的自定义数据。
   *
   * 扩展方法：
   *   Element.prototype.getData
   *   Element.prototype.setData
   *   Element.prototype.removeData
   */

  var VALID_NAME = /^[a-z][a-zA-Z]*$/;
  var parseName = function(name) {
    return VALID_NAME.test(name) ? 'data-' + camelCaseToHyphenate(name) : '';
  };

//--------------------------------------------------[Element.prototype.getData]
  /**
   * 从本元素中读取一条自定义数据。
   * @name Element.prototype.getData
   * @function
   * @param {string} key 数据名。
   * @returns {string} 数据值。
   * @description
   *   注意：
   *   Chrome 在 dataset 中不存在名称为 key 的值时，返回空字符串，Firefox Safari Opera 返回 undefined。此处均返回 undefined。
   * @see http://www.w3.org/TR/2011/WD-html5-20110525/elements.html#embedding-custom-non-visible-data-with-the-data-attributes
   */
  Element.prototype.getData = 'dataset' in html ? function(key) {
    return this.dataset[key] || undefined;
  } : function(key) {
    key = parseName(key);
    var value = this.getAttribute(key);
    return typeof value === 'string' ? value : undefined;
  };

//--------------------------------------------------[Element.prototype.setData]
  /**
   * 在本元素中保存一条自定义数据。
   * @name Element.prototype.setData
   * @function
   * @param {string} key 数据名，必须为 camelCase 形式，并且只能包含英文字母。
   * @param {string} value 数据值，必须为字符串。
   * @returns {Element} 本元素。
   */
  Element.prototype.setData = function(key, value) {
    key = parseName(key);
    if (key) {
      this.setAttribute(key, value);
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.removeData]
  /**
   * 从本元素中删除一条自定义数据。
   * @name Element.prototype.removeData
   * @function
   * @param {string} key 数据名。
   * @returns {Element} 本元素。
   * @description
   *   注意：
   *   IE6 IE7 在 removeAttribute 时，key 参数是大小写敏感的。
   */
  Element.prototype.removeData = function(key) {
    key = parseName(key);
    if (key) {
      this.removeAttribute(key);
    }
    return this;
  };

//==================================================[Element 扩展 - 比较位置关系]
  /*
   * 比较两个元素在文档树中的位置关系。
   *
   * 扩展方法：
   *   Element.prototype.comparePosition
   *   Element.prototype.contains
   */

//--------------------------------------------------[Element.prototype.comparePosition]
  /**
   * 比较本元素和目标元素在文档树中的位置关系。  // TODO: 高级用法，标记为 master。
   * @master
   * @name Element.prototype.comparePosition
   * @function
   * @param {Element} target 目标元素。
   * @returns {number} 比较结果。
   * @description
   *   调用本方法后返回的 number 值的含义：
   *   <table>
   *     <tr><th>Bits</th><th>Number</th><th>Meaning</th></tr>
   *     <tr><td>000000</td><td>0</td><td>节点 A 与节点 B 相等</td></tr>
   *     <tr><td>000001</td><td>1</td><td>节点 A 与节点 B 在不同的文档（或者一个在文档之外）</td></tr>
   *     <tr><td>000010</td><td>2</td><td>节点 B 在节点 A 之前</td></tr>
   *     <tr><td>000100</td><td>4</td><td>节点 A 在节点 B 之前</td></tr>
   *     <tr><td>001000</td><td>8</td><td>节点 B 包含节点 A</td></tr>
   *     <tr><td>010000</td><td>16</td><td>节点 A 包含节点 B</td></tr>
   *     <tr><td>100000</td><td>32</td><td>浏览器的私有使用</td></tr>
   *   </table>
   * @see http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition
   * @see http://ejohn.org/blog/comparing-document-position/
   */
  Element.prototype.comparePosition = 'compareDocumentPosition' in html ? function(target) {
    return this.compareDocumentPosition(target);
  } : function(target) {
    return (this != target && this.contains(target) && 16) +
        (this != target && target.contains(this) && 8) +
        (this.sourceIndex >= 0 && target.sourceIndex >= 0 ?
            (this.sourceIndex < target.sourceIndex && 4) + (this.sourceIndex > target.sourceIndex && 2) :
            1) +
        0;
  };

//--------------------------------------------------[Element.prototype.contains]
  /**
   * 判断本元素是否包含目标元素。
   * @name Element.prototype.contains
   * @function
   * @param {Element} target 目标元素。
   * @returns {boolean} 判断结果。
   * @description
   *   注意，如果本元素和目标元素一致，本方法也将返回 true。
   */
  if (!('contains' in html)) {
    Element.prototype.contains = function(target) {
      return (this === target || !!(this.compareDocumentPosition(target) & 16));
    };
  }

//==================================================[Element 扩展 - 遍历文档树]
  /*
   * 获取文档树中与目标元素相关的元素。
   *
   * 扩展方法：
   *   Element.prototype.getParent
   *   Element.prototype.getPrevious
   *   Element.prototype.getNext
   *   Element.prototype.getFirst
   *   Element.prototype.getLast
   *   Element.prototype.getChildren
   *   Element.prototype.getChildCount
   *
   * 参考：
   *   http://dev.w3.org/2006/webapi/ElementTraversal/publish/ElementTraversal.html#interface-elementTraversal
   *   http://www.quirksmode.org/dom/w3c_core.html
   *   http://w3help.org/zh-cn/causes/SD9003
   */

//--------------------------------------------------[Element.prototype.getParent]
  /**
   * 获取本元素的父元素。
   * @name Element.prototype.getParent
   * @function
   * @returns {Element} 本元素的父元素。
   */
  Element.prototype.getParent = 'parentElement' in html ? function() {
    return $(this.parentElement);
  } : function() {
    var element = this.parentNode;
    // parentNode 可能是 DOCUMENT_NODE(9) 或 DOCUMENT_FRAGMENT_NODE(11)。
    if (element.nodeType != 1) {
      element = null;
    }
    return $(element);
  };

//--------------------------------------------------[Element.prototype.getPrevious]
  /**
   * 获取与本元素相邻的上一个元素。
   * @name Element.prototype.getPrevious
   * @function
   * @returns {Element} 与本元素相邻的上一个元素。
   */
  Element.prototype.getPrevious = 'previousElementSibling' in html ? function() {
    return $(this.previousElementSibling);
  } : function() {
    var element = this;
    while ((element = element.previousSibling) && element.nodeType !== 1) {
    }
    return $(element);
  };

//--------------------------------------------------[Element.prototype.getNext]
  /**
   * 获取与本元素相邻的下一个元素。
   * @name Element.prototype.getNext
   * @function
   * @returns {Element} 与本元素相邻的下一个元素。
   */
  Element.prototype.getNext = 'nextElementSibling' in html ? function() {
    return $(this.nextElementSibling);
  } : function() {
    var element = this;
    while ((element = element.nextSibling) && element.nodeType !== 1) {
    }
    return $(element);
  };

//--------------------------------------------------[Element.prototype.getFirst]
  /**
   * 获取本元素的第一个子元素。
   * @name Element.prototype.getFirst
   * @function
   * @returns {Element} 本元素的第一个子元素。
   */
  Element.prototype.getFirst = 'firstElementChild' in html ? function() {
    return $(this.firstElementChild);
  } : function() {
    var element = this.firstChild;
    while (element && element.nodeType !== 1 && (element = element.nextSibling)) {
    }
    return $(element);
  };

//--------------------------------------------------[Element.prototype.getLast]
  /**
   * 获取本元素的最后一个子元素。
   * @name Element.prototype.getLast
   * @function
   * @returns {Element} 本元素的最后一个子元素。
   */
  Element.prototype.getLast = 'lastElementChild' in html ? function() {
    return $(this.lastElementChild);
  } : function() {
    var element = this.lastChild;
    while (element && element.nodeType !== 1 && (element = element.previousSibling)) {
    }
    return $(element);
  };

//--------------------------------------------------[Element.prototype.getChildren]
  /**
   * 获取本元素的所有子元素。
   * @name Element.prototype.getChildren
   * @function
   * @returns {Array} 包含本元素的所有子元素的数组，数组内各元素的顺序为执行本方法时各元素在文档树中的顺序。
   */
  Element.prototype.getChildren = function() {
    var children = [];
    var $element = this.getFirst();
    while ($element) {
      children.push($element);
      $element = $element.getNext();
    }
    return children;
  };

//--------------------------------------------------[Element.prototype.getChildCount]
  /**
   * 获取本元素的子元素的总数。
   * @name Element.prototype.getChildCount
   * @function
   * @returns {number} 本元素的子元素的总数。
   */
  Element.prototype.getChildCount = 'childElementCount' in html ? function() {
    return this.childElementCount;
  } : function() {
    var count = 0;
    var node = this.firstChild;
    while (node) {
      if (node.nodeType === 1) {
        count++;
      }
      node = node.nextSibling;
    }
    return count;
  };

//==================================================[Element 扩展 - 修改文档树]
  /*
   * 对元素在文档树中的位置的操作。
   *
   * 扩展方法：
   *   Element.prototype.append
   *   Element.prototype.prepend
   *   Element.prototype.putBefore
   *   Element.prototype.putAfter
   *   Element.prototype.remove
   *   Element.prototype.replace
   *   Element.prototype.empty
   *   Element.prototype.clone  // TODO: pending。
   */

//--------------------------------------------------[Element.prototype.append]
  /**
   * 将目标元素追加为本元素的最后一个子元素。
   * @name Element.prototype.append
   * @function
   * @param {Element} target 目标元素。
   * @returns {Element} 本元素。
   */
  Element.prototype.append = function(target) {
    this.appendChild(target);
    return this;
  };

//--------------------------------------------------[Element.prototype.prepend]
  /**
   * 将目标元素追加为本元素的第一个子元素。
   * @name Element.prototype.prepend
   * @function
   * @param {Element} target 目标元素。
   * @returns {Element} 本元素。
   */
  Element.prototype.prepend = function(target) {
    this.insertBefore(target, this.firstChild);
    return this;
  };

//--------------------------------------------------[Element.prototype.putBefore]
  /**
   * 将本元素放到目标元素之前。
   * @name Element.prototype.putBefore
   * @function
   * @param {Element} target 目标元素。
   * @returns {Element} 本元素。
   */
  Element.prototype.putBefore = function(target) {
    var $parent = $(target).getParent();
    if ($parent) {
      $parent.insertBefore(this, target);
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.putAfter]
  /**
   * 将本元素放到目标元素之后。
   * @name Element.prototype.putAfter
   * @function
   * @param {Element} target 目标元素。
   * @returns {Element} 本元素。
   */
  Element.prototype.putAfter = function(target) {
    var $parent = $(target).getParent();
    if ($parent) {
      $parent.insertBefore(this, target.nextSibling);
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.remove]
  /**
   * 将本元素从文档树中删除。
   * @name Element.prototype.remove
   * @function
   * @param {boolean} [keepListeners] 是否保留本元素及后代元素上绑定的所有事件监听器。
   * @returns {Element} 本元素。
   */
  Element.prototype.remove = function(keepListeners) {
    var $parent = this.getParent();
    if ($parent) {
      if (!keepListeners) {
        Array.from(removeAllListeners(this).getElementsByTagName('*')).forEach(removeAllListeners);
      }
      $parent.removeChild(this);
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.replace]
  /**
   * 使用本元素替换目标元素。
   * @name Element.prototype.replace
   * @function
   * @param {Element} target 目标元素。
   * @param {boolean} [keepListeners] 是否保留目标元素及后代元素上绑定的所有事件监听器。
   * @returns {Element} 本元素。
   */
  Element.prototype.replace = function(target, keepListeners) {
    var $target = $(target);
    var $parent = $target.getParent();
    if ($parent) {
      if (!keepListeners) {
        Array.from(removeAllListeners($target).getElementsByTagName('*')).forEach(removeAllListeners);
      }
      $parent.replaceChild($target, this);
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.empty]
  /**
   * 将本元素的内容清空，并删除本元素及后代元素上绑定的所有事件监听器。
   * @name Element.prototype.empty
   * @function
   * @returns {Element} 本元素。
   */
  Element.prototype.empty = function() {
    Array.from(this.getElementsByTagName('*')).forEach(removeAllListeners);
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
    return this;
  };

//==================================================[Element 扩展 - 处理事件]
  /*
   * 提供事件兼容性处理的解决方案。
   *
   * 事件兼容性的处理在与 DOM 相关的问题中比较复杂，这里提供的方案中，有以下几个主要概念：
   *   管理器 (manager)：
   *     用来管理派发器及处理器的添加、删除和事件的派发。
   *   派发器 (dispatcher)：
   *     封装事件对象，在条件满足的时候将事件对象派发给相应的监听器。
   *   处理器 (handler)：
   *     包括事件名称、监听器和过滤器。
   *     进一步判断事件是否可以在目标元素上进行代理，若有效则交给监听器处理。
   *   事件名称 (name)：
   *     用户使用 on 添加一个监听器时，可以为该监听器指定一个别名，别名与事件类型组成事件名称，事件名称在删除该监听器时使用。
   *   事件类型 (type)：
   *     供用户使用的事件类型可能是普通事件、扩展的事件，或是用户自定义的事件。
   *     内部事件模型使用的事件类型不一定与供用户使用的事件类型完全匹配。
   *   监听器 (listener)：
   *     用户使用 on 添加的直接或代理事件处理函数。在对应的事件触发时，会传入封装后的事件对象。
   *     用户可以调用该事件对象上的方法，来控制事件的传播或响应情况。
   *     如果用户在一个事件的监听器中返回布尔值 false，则该事件将停止传播及响应。
   *   过滤器 (filter)：
   *     在使用 on 的元素上发生事件时，会根据用户设定的条件过滤出符合条件的后代元素，并模拟这个事件是在这些后代元素上被监听到的。
   *     过滤器返回布尔值 true 则为过滤通过。
   *   事件对象 (event)：
   *     供用户使用的事件对象是封装后的，以屏蔽浏览器差异，并为扩展的事件提供必要的信息。
   *     供内部 DOM 事件模型使用的原始事件对象不直接对外暴露，该对象上可能有用的特性已被复制到封装后的对象上。
   *     必须访问原始事件对象时，可以通过调用 event.originalEvent 来得到它。
   *
   * 扩展方法：
   *   Element.prototype.on
   *   Element.prototype.off
   *   Element.prototype.fire
   *
   * 参考：
   *   http://jquery.com/
   *   http://www.quirksmode.org/dom/w3c_events.html
   *   http://www.w3.org/TR/2011/WD-DOM-Level-3-Events-20110531/#events-module
   *   http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
   */

  var EVENT_CODES = {'mousedown': 1, 'mouseup': 1, 'click': 1, 'dblclick': 1, 'contextmenu': 1, 'mousemove': 1, 'mouseover': 1, 'mouseout': 1, 'mousewheel': 1, 'mouseenter': 1, 'mouseleave': 1, 'mousedragstart': 1, 'mousedrag': 1, 'mousedragend': 1, 'keydown': 2, 'keyup': 2, 'keypress': 2, 'focus': 4, 'blur': 4, 'focusin': 0, 'focusout': 0, 'select': 4, 'input': 4, 'change': 4, 'submit': 4, 'reset': 4, 'scroll': 4, 'resize': 4, 'load': 4, 'unload': 4, 'error': 4, 'domready': 4, 'beforeunload': 4};
  var returnTrue = function() {
    return true;
  };
  var returnFalse = function() {
    return false;
  };

  /**
   * 事件包装对象。
   * @name Event
   * @constructor
   * @param {Object} e 原始事件对象。
   * @param {string} type 事件类型。
   * @description
   *   当事件对象通过调用 Element/document/window 的 fire 方法传递到监听器时，其属性可能会被重写。
   *   在一些需要获取浏览器提供的真实事件属性时，可以通过事件对象的 originalEvent.type 属性来辨别事件的真实类型，由上述 fire 方法生成的事件对象的对应属性为空字符串。
   */
  function Event(e, type) {
    // 保存原始 event 对象。
    this.originalEvent = e;
    // 事件类型，这时候的 type 就是调用 on 时使用的事件类型。
    this.type = type;
    // 事件代码，用于分组处理事件及确定是否可冒泡。
    var code = EVENT_CODES[type] || 0;
    this.isMouseEvent = !!(code & 1);
    this.isKeyboardEvent = !!(code & 2);
    this.bubbles = !(code & 4);
    // 目标元素。
    var target = 'target' in e ? e.target : e.srcElement || document;
    if (target.nodeType === 3) {
      target = target.parentNode;
    }
    this.target = $(target);
    // 相关元素。
    var relatedTarget = 'relatedTarget' in e ? e.relatedTarget : ('fromElement' in e ? (e.fromElement === target ? e.toElement : e.fromElement) : null);
    if (relatedTarget) {
      this.relatedTarget = $(relatedTarget);
    }
    // 发生时间。
    this.timeStamp = Date.now();
    // 鼠标和键盘事件，由 fire 方法传递过来的模拟事件对象没有以下信息。
    if (this.isMouseEvent || this.isKeyboardEvent) {
      this.ctrlKey = !!e.ctrlKey;
      this.altKey = !!e.altKey;
      this.shiftKey = !!e.shiftKey;
      this.metaKey = !!e.metaKey;
      if (this.isMouseEvent) {
        // 坐标。
        this.clientX = e.clientX || 0;
        this.clientY = e.clientY || 0;
        this.screenX = e.screenX || 0;
        this.screenY = e.screenY || 0;
        if ('pageX' in e) {
          this.pageX = e.pageX;
          this.pageY = e.pageY;
        } else {
          var pageOffset = window.getPageOffset();
          this.pageX = this.clientX + pageOffset.x;
          this.pageY = this.clientY + pageOffset.y;
        }
        // 按键。
        if ('which' in e) {  // TODO: mousemove 时 which 总为 1。
          var which = e.which;
          this.leftButton = which === 1;
          this.middleButton = which === 2;
          this.rightButton = which === 3;
        } else {
          var button = e.button;
          this.leftButton = !!(button & 1);
          this.middleButton = !!(button & 4);
          this.rightButton = !!(button & 2);
        }
      } else {
        this.which = e.which || e.charCode || e.keyCode || 0;
      }
    }
  }

  /**
   * 原始事件对象。
   * @name Event#originalEvent
   * @type Object
   */

  /**
   * 事件类型。
   * @name Event#type
   * @type string
   */

  /**
   * 是否为鼠标事件。
   * @name Event#isMouseEvent
   * @type boolean
   */

  /**
   * 是否为键盘事件。
   * @name Event#isKeyboardEvent
   * @type boolean
   */

  /**
   * 是否可以冒泡，不冒泡的事件不能使用事件代理。
   * @name Event#bubbles
   * @type boolean
   */

  /**
   * 触发事件的对象。
   * @name Event#target
   * @type Element
   */

  /**
   * 事件被触发时的相关对象，仅在 mouseover/mouseout 类型的事件对象上有效。
   * @name Event#relatedTarget
   * @type Element
   */

  /**
   * 事件发生的时间。
   * @name Event#timeStamp
   * @type number
   */

  /**
   * 事件发生时，ctrl 键是否被按下。
   * @name Event#ctrlKey
   * @type boolean
   */

  /**
   * 事件发生时，alt 键是否被按下。
   * @name Event#altKey
   * @type boolean
   */

  /**
   * 事件发生时，shift 键是否被按下。
   * @name Event#shiftKey
   * @type boolean
   */

  /**
   * 事件发生时，meta 键是否被按下。
   * @name Event#metaKey
   * @type boolean
   */

  /**
   * 事件发生时鼠标在视口中的 X 坐标，仅在鼠标事件对象上有效。
   * @name Event#clientX
   * @type number
   */

  /**
   * 事件发生时鼠标在视口中的 Y 坐标，仅在鼠标事件对象上有效。
   * @name Event#clientY
   * @type number
   */

  /**
   * 事件发生时鼠标在屏幕上的 X 坐标，仅在鼠标事件对象上有效。
   * @name Event#screenX
   * @type number
   */

  /**
   * 事件发生时鼠标在屏幕上的 Y 坐标，仅在鼠标事件对象上有效。
   * @name Event#screenY
   * @type number
   */

  /**
   * 事件发生时鼠标在页面中的 X 坐标，仅在鼠标事件对象上有效。
   * @name Event#pageX
   * @type number
   */

  /**
   * 事件发生时鼠标在页面中的 Y 坐标，仅在鼠标事件对象上有效。
   * @name Event#pageY
   * @type number
   */

  /**
   * 事件发生时鼠标在横向移动的偏移量，仅在 mousedragstart/mousedrag/mousedragend 类型的事件对象上有效。
   * @name Event#offsetX
   * @type number
   */

  /**
   * 事件发生时鼠标在纵向移动的偏移量，仅在 mousedragstart/mousedrag/mousedragend 类型的事件对象上有效。
   * @name Event#offsetY
   * @type number
   */

  /**
   * 事件发生时，鼠标左键是否被按下，仅在鼠标事件对象上有效。
   * @name Event#leftButton
   * @type boolean
   */

  /**
   * 事件发生时，鼠标中键是否被按下，仅在鼠标事件对象上有效。
   * @name Event#middleButton
   * @type boolean
   */

  /**
   * 事件发生时，鼠标右键是否被按下，仅在鼠标事件对象上有效。
   * @name Event#rightButton
   * @type boolean
   */

  /**
   * 事件发生时鼠标滚轮是否正在向上滚动，仅在 mousewheel 类型的事件对象上有效。
   * @name Event#wheelUp
   * @type boolean
   */

  /**
   * 事件发生时鼠标滚轮是否正在向下滚动，仅在 mousewheel 类型的事件对象上有效。
   * @name Event#wheelDown
   * @type boolean
   */

  /**
   * 当一个设备触发事件时的相关代码。在键盘事件中为按下的键的代码。
   * @name Event#which
   * @type number
   */

  Object.append(Event.prototype, {
    /**
     * 阻止事件的传递，被阻止传递的事件将不会向其他元素传递。
     * @name Event.prototype.stopPropagation
     * @function
     */
    stopPropagation: function() {
      var e = this.originalEvent;
      e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
      this.isPropagationStopped = returnTrue;
    },

    /**
     * 查询事件的传递是否已被阻止。
     * @name Event.prototype.isPropagationStopped
     * @function
     * @returns {boolean} 查询结果。
     */
    isPropagationStopped: returnFalse,

    /**
     * 阻止事件的默认行为。
     * @name Event.prototype.preventDefault
     * @function
     */
    preventDefault: function() {
      var e = this.originalEvent;
      e.preventDefault ? e.preventDefault() : e.returnValue = false;
      this.isDefaultPrevented = returnTrue;
    },

    /**
     * 查询事件的默认行为是否已被阻止。
     * @name Event.prototype.isDefaultPrevented
     * @function
     * @returns {boolean} 查询结果。
     */
    isDefaultPrevented: returnFalse,

    /**
     * 立即阻止事件的传递，被立即阻止传递的事件不仅不会向其他元素传递，也不会在当前元素上触发其他事件监听器。
     * @name Event.prototype.stopImmediatePropagation
     * @function
     */
    stopImmediatePropagation: function() {
      this.stopPropagation();
      this.isImmediatePropagationStopped = returnTrue;
    },

    /**
     * 查询事件的传递是否已被立即阻止。
     * @name Event.prototype.isImmediatePropagationStopped
     * @function
     * @returns {boolean} 查询结果。
     */
    isImmediatePropagationStopped: returnFalse

  });

  // 添加/删除事件处理函数的 DOM 方法。
  var addEventListener = 'addEventListener' in window ? function($element, eventType, eventListener, useCapture) {
    $element.addEventListener(eventType, eventListener, useCapture);
  } : function($element, eventType, eventListener) {
    $element.attachEvent('on' + eventType, eventListener);
  };

  var removeEventListener = 'removeEventListener' in window ? function($element, eventType, eventListener, useCapture) {
    $element.removeEventListener(eventType, eventListener, useCapture);
  } : function($element, eventType, eventListener) {
    $element.detachEvent('on' + eventType, eventListener);
  };

  // 事件管理。
  var eventPool = {};

  var eventHelper = {
    mousedragstart: {related: ['mousedrag', 'mousedragend']},
    mousedrag: {related: ['mousedragstart', 'mousedragend']},
    mousedragend: {related: ['mousedragstart', 'mousedrag']},
    input: {
      dispatchers: {},
      setup: function($element) {
        $element.currentValue = $element.value;
        addEventListener(document, 'selectionchange', this.dispatchers[$element.uid] = function(e) {
          if ($element.currentValue !== $element.value) {
            $element.currentValue = $element.value;
            $element.fire('input');
          }
        });
      },
      teardown: function($element) {
        removeEventListener(document, 'selectionchange', this.dispatchers[$element.uid]);
        delete this.dispatchers[$element.uid];
      }
    },
    change: {
      dispatcher: function(e) {
        if (e.propertyName === 'checked') {
          e.srcElement.changed = true;
        }
      },
      setup: function($element) {
        addEventListener($element, 'propertychange', this.dispatcher);
      },
      teardown: function($element) {
        removeEventListener($element, 'propertychange', this.dispatcher);
      }
    }
  };

  // 将被捕获到的 DOM 事件对象进行包装后派发到目标元素上。
  // 在目标元素上使用 on 绑定的、包括自身和代理的所有事件监听器都会运行，但以其他方式绑定的事件监听器将不会被运行。
  var dispatchEvent = function($element, handlers, event, isTriggered) {
    var delegateCount = handlers.delegateCount;
    var $target = delegateCount ? event.target : $element;
    var handler;
    var needsBubble;
    var from;
    var to;
    while ($target) {
      if ($target !== $element) {
        // 运行代理。
        needsBubble = true;
        from = 0;
        to = delegateCount;
      } else {
        // 运行自身。
        needsBubble = false;
        from = delegateCount;
        to = handlers.length;
      }
      while (from < to) {
        handler = handlers[from];
        if (!handler.filter || handler.filter.call($target)) {
          // isTriggered 为判断预期的事件是否被触发的函数，返回 false 则忽略该事件。
          if (!isTriggered || isTriggered.call($target, event)) {
            if (handler.listener.call($target, event) === false) {
              event.preventDefault();
              event.stopPropagation();
            }
            if (event.isImmediatePropagationStopped()) {
              break;
            }
          }
        }
        from++;
      }
      if (event.isPropagationStopped() || !needsBubble) {
        break;
      }
      // 如果是在 document 上代理的事件，在 html 元素之后以下方法就会返回 null，不过不影响处理，代理的情况本身就不必检查 document 自身。
      $target = $target.getParent();
    }
    // 返回 event 对象以用于 fire 方法中事件的传递及复合事件的处理。
    return event;
  };

  // 删除在目标元素上绑定的所有监听器。
  var removeAllListeners = function(element) {
    var uid = element.uid;
    // 无法为未经扩展的元素删除监听器。
    if (!uid) {
      return element;
    }
    // 尝试获取对应的项，以便删除该项中的所有管理器。
    var item = eventPool[uid];
    if (!item) {
      return element;
    }
    for (var type in item) {
      element.off(type);
    }
    return element;
  };

//--------------------------------------------------[Element.prototype.on]
  /**
   * 为本元素添加事件监听器。
   * @name Element.prototype.on
   * @function
   * @param {string} name 事件名称，包括事件类型和可选的别名，二者间用 . 分割。
   *   使用空格分割多个事件名称，即可同时为多个事件注册同一个监听器（或为相同的后代元素代理多个事件）。
   * @param {Function} listener 要添加的事件监听器。
   * @param {Function} [filter] 为符合条件的后代元素代理事件。
   *   要注意的是，在代理事件监听器中调用 e.stopPropagation 或 e.stopImmediatePropagation 时，事件对象实际上已经从触发对象传递到监听对象了。
   * @returns {Element} 本元素。
   * @see http://www.quirksmode.org/dom/events/index.html
   */
  Element.prototype.on = function(name, listener, filter) {
    var uid = this.uid;
    // 无法为未经扩展的元素添加监听器。
    if (!uid) {
      return this;
    }
    var $element = this;
    // 同时为多个事件类型添加监听器。
    if (name.contains(' ')) {
      name.split(' ').forEach(function(name) {
        // 允许 window/document.on 的多次调用。
        Element.prototype.on.call($element, name, listener, filter);
      });
      return $element;
    }
    // 从事件名称中取出事件类型。
    var dotIndex = name.indexOf('.');
    var type = dotIndex === -1 ? name : name.slice(0, dotIndex);
    // 尝试获取对应的项，及其管理器和处理器组，以便向处理器组中添加监听器和过滤器。
    var item = eventPool[uid] || (eventPool[uid] = {});
    var manager = item[type] || (item[type] = {handlers: null, dispatcher: null});
    var handlers = manager.handlers;
    // 首次注册此类型的事件。
    if (!handlers) {
      // 新处理器组。
      handlers = [];
      handlers.delegateCount = 0;
      // 新派发器（默认）。
      var dispatcher = function(e) {
        dispatchEvent($element, handlers, new Event(e || window.event, type));
      };
      dispatcher.type = type;
      dispatcher.useCapture = false;
      // 特殊事件，可能使用自定义的派发器（或其属性）覆盖默认的派发器（或其属性）。
      switch (type) {
        case 'mousewheel':
          // 鼠标滚轮事件，Firefox 的事件名称为 DOMMouseScroll。
          dispatcher = function(e) {
            e = e || window.event;
            var event = new Event(e, type);
            var wheel = 'wheelDelta' in e ? -e.wheelDelta : e.detail || 0;
            event.wheelUp = wheel < 0;
            event.wheelDown = wheel > 0;
            dispatchEvent($element, handlers, event);
          };
          dispatcher.type = navigator.isFirefox ? 'DOMMouseScroll' : 'mousewheel';
          break;
        case 'mouseenter':
        case 'mouseleave':
          // 鼠标进入/离开事件，目前仅 IE 支持，但不能冒泡。此处使用 mouseover/mouseout 模拟。
          dispatcher = function(e) {
            dispatchEvent($element, handlers, new Event(e || window.event, type), function(event) {
              var $relatedTarget = event.relatedTarget;
              return !$relatedTarget || !this.contains($relatedTarget);
            });
          };
          dispatcher.type = type === 'mouseenter' ? 'mouseover' : 'mouseout';
          break;
        case 'mousedragstart':
        case 'mousedrag':
        case 'mousedragend':
          // 拖动相关事件，为避免覆盖 HTML5 草案中引入的同名事件，加入前缀 mouse。
          // 这三个事件是关联的，使用同一个派发器，这个派发器会动态添加/删除其他辅助派发器。
          // 向这三个关联事件中添加第一个监听器时，即创建上述公用的派发器，在这三个关联事件中删除最后一个监听器时，即删除上述公用的派发器。
          // 只支持鼠标左键的拖拽，拖拽过程中松开左键、按下其他键、或当前窗口失去焦点都将导致拖拽事件结束。
          // 注意：应避免在拖拽进行时删除本组事件的监听器，否则可能导致拖拽动作无法正常完成。
          var dragState = null;
          var dragstart = function(e) {
            var event = new Event(e || window.event, 'mousedragstart');
            event.offsetX = event.offsetY = 0;
            if (!event.leftButton || dispatchEvent($element, dragHandlers.mousedragstart, event).isDefaultPrevented()) {
              return;
            }
            var $target = event.target;
            $target.setCapture && $target.setCapture();
            event.preventDefault();
            dragState = {target: $target, startX: event.pageX, startY: event.pageY};
            dragState.lastEvent = event;
            addEventListener(document, 'mousemove', drag);
            addEventListener(document, 'mousedown', dragend);
            addEventListener(document, 'mouseup', dragend);
            addEventListener(window, 'blur', dragend);
          };
          var drag = function(e) {
            var event = new Event(e || window.event, 'mousedrag');
            event.target = dragState.target;
            event.offsetX = event.pageX - dragState.startX;
            event.offsetY = event.pageY - dragState.startY;
            dispatchEvent($element, dragHandlers.mousedrag, event);
            dragState.lastEvent = event;
          };
          var dragend = function(e) {
            var event = new Event(e || window.event, 'mousedragend');
            if (e.type === 'mousedown' && event.leftButton) {
              return;
            }
            var $target = dragState.target;
            $target.releaseCapture && $target.releaseCapture();
            event = dragState.lastEvent;
            event.type = 'mousedragend';
            dispatchEvent($element, dragHandlers.mousedragend, event);
            dragState = null;
            removeEventListener(document, 'mousemove', drag);
            removeEventListener(document, 'mousedown', dragend);
            removeEventListener(document, 'mouseup', dragend);
            removeEventListener(window, 'blur', dragend);
          };
          dispatcher = dragstart;
          dispatcher.type = 'mousedown';
          // HACK：这三个关联事件有相同的派发器和各自的处理器组，此处分别创建另外两个关联事件的项和处理器组。
          var dragHandlers = {};
          eventHelper[type].related.forEach(function(type) {
            var handlers = [];
            handlers.delegateCount = 0;
            item[type] = {handlers: handlers, dispatcher: dispatcher};
            dragHandlers[type] = handlers;
          });
          dragHandlers[type] = handlers;
          break;
        case 'focusin':
        case 'focusout':
          // 后代元素获得/失去焦点，目前仅 Firefox 不支持，监听 focus/blur 的捕获阶段模拟。
          if (navigator.isFirefox) {
            dispatcher.type = type === 'focusin' ? 'focus' : 'blur';
            dispatcher.useCapture = true;
          }
          break;
        case 'input':
          // IE6 IE7 IE8 可以使用 onpropertychange 即时相应用户输入，其他浏览器中可以使用 input 事件即时响应用户输入（需使用 addEventListener 绑定）。
          // 但是 IE9 的 INPUT[type=text|password] 和 TEXTAREA 在删除文本内容时（按键 Backspace 和 Delete、右键菜单删除/剪切、拖拽内容出去）不触发 input 事件和 propertychange 事件。IE8 的 TEXTAREA 也有以上问题，因此需要添加辅助派发器。
          // 通过 keydown，cut 和 blur 事件能解决按键删除和剪切、菜单剪切、拖拽内容出去的问题，但不能解决菜单删除的问题。
          // 除了 setInterval 轮询 value 外的一个更好的办法是通过监听 document 的 selectionchange 事件来解决捷键剪切、菜单剪切、菜单删除、拖拽内容出去的问题，再通过这些元素的 propertychange 事件处理其他情况。但此时需要避免两个事件都触发的时候导致两次调用监听器。
          var nodeName = $element.nodeName.toLowerCase();
          var nodeType = $element.type;
          if (navigator.isIElt10 && (nodeName === 'textarea' || nodeName === 'input' && (nodeType === 'text' || nodeType === 'password'))) {
            if (navigator.isIE9) {
              eventHelper.input.setup($element);
              dispatcher = function(e) {
                $element.currentValue = $element.value;
                dispatchEvent($element, handlers, new Event(e || window.event, type));
              };
              dispatcher.type = 'input';
            } else if (navigator.isIE8 && nodeName === 'textarea') {
              eventHelper.input.setup($element);
              dispatcher = function(e) {
                if (e.propertyName === 'value' && $element.currentValue !== $element.value) {
                  $element.currentValue = $element.value;
                  dispatchEvent($element, handlers, new Event(e || window.event, type));
                }
              };
              dispatcher.type = 'propertychange';
            } else {
              dispatcher = function(e) {
                if (e.propertyName === 'value') {
                  dispatchEvent($element, handlers, new Event(e || window.event, type));
                }
              };
              dispatcher.type = 'propertychange';
            }
          }
          break;
        case 'change':
          // TODO: 一些浏览器拖拽内容出去时有不触发事件的问题，目前尚未处理。
          // IE6 IE7 IE8 的 INPUT[type=radio|checkbox] 上的 change 事件在失去焦点后才触发。
          // 需要添加辅助派发器。
          if (navigator.isIElt9 && $element.nodeName.toLowerCase() === 'input' && ($element.type === 'checkbox' || $element.type === 'radio')) {
            eventHelper.change.setup($element);
            dispatcher = function(e) {
              var target = e.srcElement;
              if (target.changed) {
                target.changed = false;
                dispatchEvent($element, handlers, new Event(e || window.event, type));
              }
            };
            dispatcher.type = 'click';
          }
          break;
      }
      // 绑定派发器。
      addEventListener($element, dispatcher.type, dispatcher, dispatcher.useCapture);
      // 存储处理器组和派发器。
      manager.handlers = handlers;
      manager.dispatcher = dispatcher;
    }

    // 添加监听器（允许重复添加同一个监听器 - W3C 的事件模型不允许多次添加同一个监听器）。
    if (filter) {
      // 代理类型的监听器。
      handlers.splice(handlers.delegateCount++, 0, {name: name, listener: listener, filter: filter});
    } else {
      // 普通类型的监听器。
      handlers.push({name: name, listener: listener});
    }
    return $element;
  };

//--------------------------------------------------[Element.prototype.off]
  /**
   * 根据名称删除本元素上已添加的事件监听器。
   * @name Element.prototype.off
   * @function
   * @param {string} name 通过 on 添加监听器时使用的事件名称。可以使用空格分割多个事件名称。
   * @returns {Element} 本元素。
   */
  Element.prototype.off = function(name) {
    var uid = this.uid;
    // 无法为未经扩展的元素删除监听器。
    if (!uid) {
      return this;
    }
    var $element = this;
    // 同时删除该元素上的多个监听器。
    if (name.contains(' ')) {
      name.split(' ').forEach(function(name) {
        Element.prototype.off.call($element, name);
      });
      return $element;
    }
    // 从事件名称中取出事件类型。
    var dotIndex = name.indexOf('.');
    var type = dotIndex === -1 ? name : name.slice(0, dotIndex);
    // 尝试获取对应的项，及其管理器和处理器组，以便从处理器组中删除监听器（和过滤器）。
    var item = eventPool[uid];
    if (!item) {
      return $element;
    }
    var manager = item[type];
    if (!manager) {
      return $element;
    }
    var handlers = manager.handlers;
    // 删除监听器（和过滤器）。
    var i = 0;
    var handler;
    if (name === type) {
      // 未指定别名，删除该类型所有监听器。
      handlers.length = handlers.delegateCount = 0;
    } else {
      // 指定了别名，删除名称相匹配的监听器。
      while (i < handlers.length) {
        handler = handlers[i];
        if (handler.name === name) {
          handlers.splice(i, 1);
          if (handler.filter) {
            handlers.delegateCount--;
          }
        } else {
          i++;
        }
      }
    }
    // 若处理器组为空，则删除派发器的注册，并删除对应的管理器。
    if (handlers.length === 0) {
      var dispatcher = manager.dispatcher;
      switch (type) {
        case 'mousedragstart':
        case 'mousedrag':
        case 'mousedragend':
          // 必须在这组关联事件的最后一个监听器被删除后才清理派发器。
          var listenersCount = 0;
          eventHelper[type].related.forEach(function(type) {
            listenersCount += item[type].handlers.length;
          });
          if (listenersCount) {
            return $element;
          }
          removeEventListener($element, dispatcher.type, dispatcher);
          // HACK：分别删除另外两个关联事件的触发器及项。
          eventHelper[type].related.forEach(function(type) {
            var dispatcher = item[type].dispatcher;
            removeEventListener($element, dispatcher.type, dispatcher);
            delete item[type];
          });
          break;
        case 'input':
          // 需要删除辅助派发器。
          if (eventHelper.input.dispatchers[$element.uid]) {
            eventHelper.input.teardown($element);
          }
          removeEventListener($element, dispatcher.type, dispatcher);
          break;
        case 'change':
          // 需要删除辅助派发器。
          if (navigator.isIElt9 && $element.nodeName.toLowerCase() === 'input' && ($element.type === 'checkbox' || $element.type === 'radio')) {
            eventHelper.change.teardown($element);
          }
          removeEventListener($element, dispatcher.type, dispatcher);
          break;
        default:
          removeEventListener($element, dispatcher.type, dispatcher, dispatcher.useCapture);
      }
      delete item[type];
    }
    // 若该项再无其他管理器，删除该项。
    if (Object.keys(item).length === 0) {
      delete eventPool[uid];
    }
    return $element;
  };

//--------------------------------------------------[Element.prototype.fire]
  /**
   * 触发本元素的某类事件，运行相关的事件监听器。
   * @name Element.prototype.fire
   * @function
   * @param {String} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   *   data 的属性会被追加到事件对象中，但名称为 originalEvent 的属性除外。
   * @returns {Element} 本元素。
   */
  Element.prototype.fire = function(type, data) {
    var handlers;
    var dummyEvent = {
      // 使用空字符串作为虚拟事件的标识符。
      type: '',
      target: this,
      // 添加这两个属性以确保可以和真实事件一样支持 stopPropagation，preventDefault 和 stopImmediatePropagation 方法。
      stopPropagation: returnTrue,
      preventDefault: returnTrue
    };
    // 避免事件对象的 originalEvent 属性被参数 data 的同名属性覆盖。
    var event = Object.append(new Event(dummyEvent, type), data || {}, {blackList: ['originalEvent']});
    var $element = this;
    while ($element) {
      if (handlers = (handlers = eventPool[$element.uid]) && (handlers = handlers[type]) && handlers.handlers) {
        event = dispatchEvent($element, handlers, event);
      }
      if (!event.bubbles || event.isPropagationStopped() || $element === window) {
        break;
      }
      $element = $element === document ? window : $element.getParent() || $element === html && document || null;
    }
    return this;
  };

//==================================================[document 扩展]
  /*
   * 为 document 扩展新特性，提供与 Element 类似的事件机制。
   *
   * 扩展方法：
   *   document.$
   *   document.on
   *   document.off
   *   document.fire
   *   document.preloadImages
   */

  /**
   * 扩展 document 对象。
   * @name document
   * @namespace
   */

  document.uid = 'document';

//--------------------------------------------------[document.$]
  var RE_TAG_NAME = /^<(\w+)/;

  var wrappers = {
    area: [1, '<map>', '</map>'],
    legend: [1, '<fieldset>', '</fieldset>'],
    option: [1, '<select>', '</select>'],
    tbody: [1, '<table><tbody></tbody>', '</table>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
    col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>']
  };
  wrappers.optgroup = wrappers.option;
  wrappers.thead = wrappers.tfoot = wrappers.colgroup = wrappers.caption = wrappers.tbody;
  wrappers.th = wrappers.td;
  if (navigator.isIElt9) {
    // IE6 IE7 IE8 对 link style script 元素的特殊处理。
    wrappers.link = wrappers.style = wrappers.script = [1, '#<div>', '</div>'];
  }

  /**
   * 根据指定的参数获取/创建一个元素，并对其进行扩展。
   * @name document.$
   * @function
   * @param {string|Element} e 不同类型的元素表示。
   * @returns {Element} 扩展后的元素。
   * @description
   *   当参数为一个元素的序列化之后的字符串（它可以包含子元素）时，会返回扩展后的、根据这个字符串反序列化的元素。
   *   这里与其他实现相比有以下几点差异：
   *   <ul>
   *     <li>忽略“IE 丢失源代码前的空格”的问题，通过脚本修复这个问题无实际意义（需要深度遍历）。</li>
   *     <li>修改“IE 添加多余的 tbody 元素”的问题的解决方案，在 wrappers 里预置一个 tbody 即可。</li>
   *     <li>忽略“脚本不会在动态创建并插入文档树后自动执行”的问题，因为这个处理需要封装 append 等方法，并且还需要考虑脚本的 defer 属性在各浏览器的差异（IE 中添加 defer 属性的脚本在插入文档树后会执行），对于动态载入外部脚本文件的需求，会提供专门的方法，不应该使用本方法。</li>
   *   </ul>
   *   在创建元素时，如果包含 table，建议写上 tbody 以确保结构严谨。举例如下：
   *   $('&lt;div&gt;&lt;table&gt;&lt;tbody id="ranking"&gt;&lt;/tbody&gt;&lt;/table&gt;&lt;/div&gt;');
   *   当参数为一个元素的 id 时，会返回扩展后的、与指定 id 相匹配的元素。
   *   当参数本身即为一个元素时，会返回扩展后的该元素。
   *   当参数为其他情况时（包括 document 和 window）均返回 null。
   * @see http://jquery.com/
   * @see http://mootools.net/
   * @see http://w3help.org/zh-cn/causes/SD9003
   */
  document.$ = function(e) {
    var element = null;
    switch (typeof e) {
      case 'string':
        if (e.charAt(0) === '<' && e.charAt(e.length - 1) === '>') {
          var wrapper = wrappers[(RE_TAG_NAME.exec(e) || ['', ''])[1].toLowerCase()] || [0, '', ''];
          var depth = wrapper[0] + 1;
          var div = document.createElement('div');
          element = div;
          div.innerHTML = wrapper[1] + e + wrapper[2];
          while (depth--) {
            element = element.lastChild;
          }
          element = element && element.nodeType === 1 ? element : div;
        } else if (e.charAt(0) === '#') {
          element = document.getElementById(e.slice(1));
        }
        break;
      case 'object':
        if (e.nodeType === 1) {
          element = e;
        }
        break;
    }
    return $(element);
  };

//--------------------------------------------------[document.on]
  var domready = function() {
    // 保存 domready 事件的监听器。
    var listeners = [];

    // 派发 domready 事件，监听器在运行后会被删除。
    var callListener = function(listener) {
      // 将 listener 的 this 设置为 document。
      // 不会传入事件对象。
      setTimeout(function() {
        listener.call(document);
      }, 0);
    };

    // 派发 domready 事件，监听器在运行后会被删除。
    var dispatchEvent = function() {
      // IE6 IE7 IE8 可能调用两次。
      if (listeners) {
        // 参考：http://bugs.jquery.com/ticket/5443
        if (document.body) {
          listeners.forEach(callListener);
          listeners = null;
        } else {
          setTimeout(dispatchEvent, 10);
        }
      }
    };

    // 视情况绑定及清理派发器。
    var dispatcher;
    if ('addEventListener' in document) {
      dispatcher = function() {
        document.removeEventListener('DOMContentLoaded', dispatcher, false);
        window.removeEventListener('load', dispatcher, false);
        dispatchEvent();
      };
      document.addEventListener('DOMContentLoaded', dispatcher, false);
      window.addEventListener('load', dispatcher, false);
    } else {
      // 第二个参数在 doScrollCheck 成功时使用。
      dispatcher = function(_, domIsReady) {
        if (domIsReady || document.readyState === 'complete') {
          document.detachEvent('onreadystatechange', dispatcher);
          window.detachEvent('onload', dispatcher);
          dispatchEvent();
        }
      };
      document.attachEvent('onreadystatechange', dispatcher);
      window.attachEvent('onload', dispatcher);
      // 参考：http://javascript.nwbox.com/IEContentLoaded/
      if (window == top && html.doScroll) {
        (function doScrollCheck() {
          try {
            html.doScroll('left');
          } catch (e) {
            setTimeout(doScrollCheck, 10);
            return;
          }
          dispatcher(undefined, true);
        })();
      }
    }

    return {
      addListener: function(listener) {
        listeners ? listeners.push(listener) : callListener(listener);
      }
    };

  }();

  /**
   * 为 document 添加事件监听器。
   * @name document.on
   * @function
   * @param {string} name 事件名称。参考 Element.prototype.on 的同名参数。
   * @param {Function} listener 要添加的事件监听器。
   * @param {Function} [filter] 为符合条件的子元素代理事件。
   * @returns {Object} document 对象。
   * @description
   *   特殊事件：domready
   *   <ul>
   *     <li>在文档可用时触发，只能添加监听器，不能删除监听器，因此不能使用别名。</li>
   *     <li>不会有事件对象作为参数传入监听器。</li>
   *     <li>如果在此事件触发后添加此类型的监听器，这个新添加的监听器将立即运行。</li>
   *   </ul>
   */
  document.on = function(name, listener, filter) {
    var filteredName = name.split(' ')
        .filter(function(name) {
          if (name === 'domready') {
            domready.addListener(listener);
            return false;
          }
          return true;
        })
        .join(' ');
    if (filteredName) {
      Element.prototype.on.call(document, filteredName, listener, filter);
    }
    return this;
  };

//--------------------------------------------------[document.off]
  /**
   * 根据名称删除 document 上已添加的事件监听器。
   * @name document.off
   * @function
   * @param {string} name 通过 on 添加监听器时使用的事件名称。可以使用空格分割多个事件名称。
   * @returns {Object} document 对象。
   */
  document.off = Element.prototype.off;

//--------------------------------------------------[document.fire]
  /**
   * 触发 document 的某类事件，运行相关的事件监听器。
   * @name document.fire
   * @function
   * @param {String} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   * @returns {Object} document 对象。
   */
  document.fire = Element.prototype.fire;

//--------------------------------------------------[document.preloadImages]
  /**
   * 预加载图片。
   * @name document.preloadImages
   * @function
   * @param {Array} urlArray 包含需预加载的图片路径的数组。
   */
  document.preloadImages = function(urlArray) {
    urlArray.forEach(function(url) {
      new Image().src = url;
    });
  };

//==================================================[window 扩展]
  /*
   * 为 window 扩展新特性，除与视口相关的方法外，还提供与 Element 类似的事件机制。
   * 前三个是与视口相关的方法，在 document.body 解析后方可用。
   *
   * 扩展方法：
   *   window.getClientSize
   *   window.getScrollSize
   *   window.getPageOffset
   *   window.$
   *   window.on
   *   window.off
   *   window.fire
   */

  /**
   * 扩展 DOMWindow 对象。
   * @name window
   * @namespace
   */

  window.uid = 'window';

//--------------------------------------------------[window.getClientSize]
  /**
   * 获取视口可视区域的尺寸。
   * @name window.getClientSize
   * @function
   * @returns {Object} 尺寸，包含 width 和 height 两个数字类型的属性，单位为像素。
   * @description
   *   IE9 Firefox Chrome Safari Opera 有 window.innerWidth 和 window.innerHeight 属性，但这个值是包含了滚动条宽度的值。
   *   为保持一致性，不使用这两个属性来获取文档可视区域尺寸。
   * @see http://www.w3.org/TR/cssom-view/#dom-window-innerwidth
   * @see http://www.w3.org/TR/cssom-view/#dom-window-innerheight
   */
  window.getClientSize = function() {
    return {
      width: html.clientWidth,
      height: html.clientHeight
    };
  };

//--------------------------------------------------[window.getScrollSize]
  /**
   * 获取视口滚动区域的尺寸。当内容不足以充满视口可视区域时，返回视口可视区域的尺寸。
   * @name window.getScrollSize
   * @function
   * @returns {Object} 尺寸，包含 width 和 height 两个数字类型的属性，单位为像素。
   */
  window.getScrollSize = function() {
    var body = document.body;
    return {
      width: Math.max(html.scrollWidth, body.scrollWidth, html.clientWidth),
      height: Math.max(html.scrollHeight, body.scrollHeight, html.clientHeight)
    };
  };

//--------------------------------------------------[window.getPageOffset]
  /**
   * 获取视口的滚动偏移量。
   * @name window.getPageOffset
   * @function
   * @returns {Object} 坐标，包含 x 和 y 两个数字类型的属性，单位为像素。
   * @description
   *   一些浏览器支持 window.scrollX/window.scrollY 或 window.pageXOffset/window.pageYOffset 直接获取视口的滚动偏移量。
   *   这里使用通用性更强的方法实现。
   * @see http://w3help.org/zh-cn/causes/BX9008
   */
  window.getPageOffset = function() {
    var body = document.body;
    return {
      x: html.scrollLeft || body.scrollLeft,
      y: html.scrollTop || body.scrollTop
    };
  };

//--------------------------------------------------[window.$]
  /*
   * 将全局作用域的 $ 作为 document.$ 的别名，以便于书写代码。
   * @name window.$
   * @function
   */
  // 移除 window.$，推荐使用 execute 方法封装代码块，并使用其参数中的 $ 来代替 window.$ 的便利性。
  // window.$ = document.$;

//--------------------------------------------------[window.on]
  /**
   * 为 window 添加事件监听器。
   * @name window.on
   * @function
   * @param {string} name 事件名称。参考 Element.prototype.on 的同名参数。
   * @param {Function} listener 要添加的事件监听器。
   * @param {Function} [filter] 为符合条件的子元素代理事件。
   * @returns {Object} window 对象。
   * @description
   *   特殊事件：beforeunload
   *   <ul>
   *     <li>该事件只能存在一个监听器，因此不能使用别名。</li>
   *     <li>不会有事件对象作为参数传入监听器。</li>
   *     <li>如果添加了多个监听器，则只有最后添加的生效。</li>
   *     <li>可以删除当前生效的监听器。</li>
   *   </ul>
   */
  window.on = function(name, listener, filter) {
    var filteredName = name.split(' ')
        .filter(function(name) {
          if (name === 'beforeunload') {
            window.onbeforeunload = function() {
              // 将 listener 的 this 设置为 window。不使用 call this 也是 window，此处使用以强调意图。
              // 不会传入事件对象。
              return listener.call(window);
            };
            return false;
          }
          return true;
        })
        .join(' ');
    if (filteredName) {
      Element.prototype.on.call(window, filteredName, listener, filter);
    }
    return this;
  };

//--------------------------------------------------[window.off]
  /**
   * 根据名称删除 window 上已添加的事件监听器。
   * @name window.off
   * @function
   * @param {string} name 通过 on 添加监听器时使用的事件名称。可以使用空格分割多个事件名称。
   * @returns {Object} window 对象。
   */
  window.off = function(name) {
    var filteredName = name.split(' ')
        .filter(function(name) {
          if (name === 'beforeunload') {
            window.onbeforeunload = null;
            return false;
          }
          return true;
        })
        .join(' ');
    if (filteredName) {
      Element.prototype.off.call(window, filteredName);
    }
    return this;
  };

//--------------------------------------------------[window.fire]
  /**
   * 触发 window 的某类事件，运行相关的事件监听器。
   * @name window.fire
   * @function
   * @param {String} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   * @returns {Object} window 对象。
   */
  window.fire = Element.prototype.fire;

})();

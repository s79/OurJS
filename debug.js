/*!
 * OurJS
 *  sundongguo
 *  http://s79.github.com/OurJS/
 *  2013-05-28
 *  Released under the MIT License.
 */
/**
 * @fileOverview JavaScript 原生对象补缺及扩展
 * @version 20111101
 * @author: sundongguo@gmail.com
 */

(function() {
  // 将提供的值转化为整数。
  // http://es5.github.com/#x9.4
  var toInteger = function(value) {
    value = +value || 0;
    value = Math[value < 0 ? 'ceil' : 'floor'](value);
    return value;
  };

  // 将提供的值转化为字符串。
  var toString = Object.prototype.toString;

  // 将提供的值转化为对象。
  // http://es5.github.com/#x9.9
  var stringIsIndexable = 'x'[0] === 'x';
  var toObject = function(value) {
    if (value == null) {
      throw new TypeError('toObject');
    }
    if (!stringIsIndexable && typeof value === 'string') {
      return value.split('');
    }
    return Object(value);
  };

  // 空白字符。
  var WHITESPACES = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF';

//==================================================[ES5 补缺]
  /*
   * 为旧浏览器添加 ES5 中引入的部分常用方法。
   *
   * 补缺方法：
   *   Object.keys
   *   Function.prototype.bind
   *   Array.isArray
   *   Array.prototype.forEach
   *   Array.prototype.map
   *   Array.prototype.filter
   *   Array.prototype.every
   *   Array.prototype.some
   *   Array.prototype.indexOf
   *   Array.prototype.lastIndexOf
   *   Array.prototype.reduce  // TODO: pending
   *   Array.prototype.reduceRight  // TODO: pending
   *   String.prototype.trim
   *   Date.now
   *
   * 参考：
   *   https://github.com/kriskowal/es5-shim/
   */

//--------------------------------------------------[Object.keys]
  /**
   * 获取对象的键列表。
   * @name Object.keys
   * @function
   * @param {Object} object 要获取键列表的对象。
   * @returns {Array} 对象的键列表。
   * @example
   *   Object.keys({a: 97, b: 98, c: 99});
   *   // ['a', 'b', 'c']
   * @see http://es5.github.com/#x15.2.3.14
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
   * @see http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
   */
  if (!Object.keys) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var hasDontEnumBug = !{toString: null}.propertyIsEnumerable('toString');
    var DONT_ENUM_PROPERTIES = [
      'toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor'
    ];
    var DONT_ENUM_PROPERTIES_LENGTH = DONT_ENUM_PROPERTIES.length;
    Object.keys = function(object) {
      if (typeof object !== 'object' && typeof object !== 'function' || object === null) {
        throw new TypeError('Object.keys called on non-object');
      }
      var keys = [];
      for (var name in object) {
        if (hasOwnProperty.call(object, name)) {
          keys.push(name);
        }
      }
      if (hasDontEnumBug) {
        var i = 0;
        while (i < DONT_ENUM_PROPERTIES_LENGTH) {
          var dontEnumProperty = DONT_ENUM_PROPERTIES[i];
          if (hasOwnProperty.call(object, dontEnumProperty)) {
            keys.push(dontEnumProperty);
          }
          i++;
        }
      }
      return keys;
    };
  }

//--------------------------------------------------[Function.prototype.bind]
  /**
   * 生成一个 this 及其参数均被绑定到指定的值的新函数。
   * @name Function.prototype.bind
   * @function
   * @param {Object} thisObject 绑定到本函数的 this 的值。
   * @param {*} [arg1] 绑定到本函数的第一个参数的值。
   * @param {*} [arg2] 绑定到本函数的第二个参数的值。
   * @param {*} […] 绑定到本函数的第 n 个参数的值。
   * @returns {Function} 绑定后的新函数。
   * @example
   *   var counter = {
   *     symbol: '$',
   *     count: function(rate, number) {
   *       return this.symbol + rate * number;
   *     }
   *   };
   *   counter.count(0.157, 1000);
   *   // $157
   *   var simplifiedCount = counter.count.bind({symbol: '￥'}, 6.362);
   *   simplifiedCount(500);
   *   // ￥3181
   * @see http://es5.github.com/#x15.3.4.5
   * @see https://developer.mozilla.org/en/docs/JavaScript/Reference/Global_Objects/Function/bind
   */
  if (!Function.prototype.bind) {
    var slice = Array.prototype.slice;
    Function.prototype.bind = function bind(thisObject) {
      var target = this;
      if (typeof target !== 'function') {
        throw new TypeError('Bind must be called on a function');
      }
      var boundArguments = slice.call(arguments, 1);
      var boundFunction = function() {
        if (this instanceof boundFunction) {
          var TempConstructor = function() {
          };
          TempConstructor.prototype = target.prototype;
          var selfObject = new TempConstructor;
          var result = target.apply(selfObject, boundArguments.concat(slice.call(arguments)));
          return (Object(result) === result) ? result : selfObject;
        } else {
          return target.apply(thisObject, boundArguments.concat(slice.call(arguments)));
        }
      };
      return boundFunction;
    };
  }

//--------------------------------------------------[Array.isArray]
  /**
   * 检查提供的值是否为数组。
   * @name Array.isArray
   * @function
   * @param {*} value 提供的值。
   * @returns {boolean} 检查结果。
   * @example
   *   Array.isArray([]);
   *   // true
   * @see http://es5.github.com/#x15.4.3.2
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
   */
  if (!Array.isArray) {
    Array.isArray = function(value) {
      return toString.call(value) === '[object Array]';
    };
  }

//--------------------------------------------------[Array.prototype.indexOf]
  /**
   * 返回数组中第一次出现指定的元素的索引。
   * @name Array.prototype.indexOf
   * @function
   * @param {*} searchElement 指定的元素。
   * @param {number} [fromIndex] 从指定索引为起始点开始查找，默认为 0。
   *   如果该值大于数组的长度，则使用数组的长度作为查找起始点。
   *   如果该值为负数，则表示从数组的末尾开始计算的偏移量，即使用 (fromIndex + 数组的长度) 作为查找起始点，如果这个结果仍为负数，则使用 0 作为查找起始点。
   * @returns {number} 索引值，如果数组中不包含指定的元素，则返回 -1。
   * @example
   *   [1, 2, 3, 2, 1].indexOf(2);
   *   // 1
   *   [1, 2, 3, 2, 1].indexOf(2, 2);
   *   // 3
   *   [1, 2, 3, 2, 1].indexOf(2, -3)
   *   // 3
   *   [1, 2, 3, 2, 1].indexOf(8)
   *   // -1
   * @see http://es5.github.com/#x15.4.4.14
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
   */
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement) {
      var object = toObject(this);
      var length = object.length >>> 0;
      if (!length) {
        return -1;
      }
      var i = 0;
      if (arguments.length > 1) {
        i = toInteger(arguments[1]);
        if (i < 0) {
          i = Math.max(0, length + i);
        }
      }
      while (i < length) {
        if (i in object && object[i] === searchElement) {
          return i;
        }
        i++;
      }
      return -1;
    };
  }

//--------------------------------------------------[Array.prototype.lastIndexOf]
  /**
   * 返回数组中最后一次出现指定的元素的索引。
   * @name Array.prototype.lastIndexOf
   * @function
   * @param {*} searchElement 指定的元素。
   * @param {number} [fromIndex] 从指定索引为起始点开始查找，默认为数组的长度。
   *   如果该值大于数组的长度，则使用数组的长度作为查找起始点。
   *   如果该值为负数，则表示从数组的末尾开始计算的偏移量，即使用 (fromIndex + 数组的长度) 作为查找起始点，如果这个结果仍为负数，则使用 0 作为查找起始点。
   * @returns {number} 索引值，如果数组中不包含指定的元素，则返回 -1。
   * @example
   *   [1, 2, 3, 2, 1].lastIndexOf(2);
   *   // 3
   *   [1, 2, 3, 2, 1].lastIndexOf(2, 2);
   *   // 1
   *   [1, 2, 3, 2, 1].lastIndexOf(2, -3)
   *   // 1
   *   [1, 2, 3, 2, 1].lastIndexOf(8)
   *   // -1
   * @see http://es5.github.com/#x15.4.4.15
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
   */
  if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function(searchElement) {
      var object = toObject(this);
      var length = object.length >>> 0;
      if (!length) {
        return -1;
      }
      var i = length - 1;
      if (arguments.length > 1) {
        i = Math.min(i, toInteger(arguments[1]));
        if (i < 0) {
          i = length + i;
        }
      }
      while (i > -1) {
        if (i in object && object[i] === searchElement) {
          return i;
        }
        i--;
      }
      return -1;
    };
  }

//--------------------------------------------------[Array.prototype.every]
  /**
   * 检查数组中的所有元素是否都符合某个条件。
   * @name Array.prototype.every
   * @function
   * @param {Function} callback 用来检查的回调函数。
   *   回调函数有三个参数：当前元素，当前元素的索引和调用该方法的数组对象。
   *   回调函数返回 true 表示当前元素通过检查，反之表示未通过检查。
   * @param {Object} [thisObject] callback 被调用时 this 的值，如果省略或指定为 null，则使用全局对象 window。
   * @returns {boolean} 检查结果。
   * @example
   *   [1, 2, 3].every(function(item) {
   *     return item < 5;
   *   });
   *   // true
   * @see http://es5.github.com/#x15.4.4.16
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
   */
  if (!Array.prototype.every) {
    Array.prototype.every = function(callback) {
      var object = toObject(this);
      var thisObject = arguments[1];
      var length = object.length >>> 0;
      if (typeof callback !== 'function') {
        throw new TypeError('Array.prototype.every');
      }
      var i = 0;
      while (i < length) {
        if (i in object && !callback.call(thisObject, object[i], i, object)) {
          return false;
        }
        i++;
      }
      return true;
    };
  }

//--------------------------------------------------[Array.prototype.some]
  /**
   * 检查数组中是否有任一元素符合某个条件。
   * @name Array.prototype.some
   * @function
   * @param {Function} callback 用来检查的回调函数。
   *   回调函数有三个参数：当前元素，当前元素的索引和调用该方法的数组对象。
   *   回调函数返回 true 表示当前元素通过检查，反之表示未通过检查。
   * @param {Object} [thisObject] callback 被调用时 this 的值，如果省略或指定为 null，则使用全局对象 window。
   * @returns {boolean} 检查结果。
   * @example
   *   [1, 2, 3].some(function(item) {
   *     return item === 2;
   *   });
   *   // true
   * @see http://es5.github.com/#x15.4.4.17
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
   */
  if (!Array.prototype.some) {
    Array.prototype.some = function(callback) {
      var object = toObject(this);
      var thisObject = arguments[1];
      var length = object.length >>> 0;
      if (typeof callback !== 'function') {
        throw new TypeError('Array.prototype.some');
      }
      var i = 0;
      while (i < length) {
        if (i in object && callback.call(thisObject, object[i], i, object)) {
          return true;
        }
        i++;
      }
      return false;
    };
  }

//--------------------------------------------------[Array.prototype.forEach]
  /**
   * 遍历数组，对数组中的每一个元素都调用一次指定的函数。
   * @name Array.prototype.forEach
   * @function
   * @param {Function} callback 对数组中的每个元素都调用一次的回调函数。
   *   回调函数有三个参数：当前元素，当前元素的索引和调用该方法的数组对象。
   * @param {Object} [thisObject] callback 被调用时 this 的值，如果省略或指定为 null，则使用全局对象 window。
   * @example
   *   var s = '';
   *   [1, 2, 3].forEach(function(item) {
   *     s += item;
   *   });
   *   s;
   *   // 123
   * @see http://es5.github.com/#x15.4.4.18
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach
   */
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback) {
      var object = toObject(this);
      var thisObject = arguments[1];
      var length = object.length >>> 0;
      if (typeof callback !== 'function') {
        throw new TypeError('Array.prototype.forEach');
      }
      var i = 0;
      while (i < length) {
        if (i in object) {
          callback.call(thisObject, object[i], i, object);
        }
        i++;
      }
    };
  }

//--------------------------------------------------[Array.prototype.map]
  /**
   * 对数组中的每一个元素都调用一次回调函数，并返回一个包含这个回调函数的每次调用后的返回值的新数组。
   * @name Array.prototype.map
   * @function
   * @param {Function} callback 对数组中的每个元素都调用一次的回调函数。
   *   回调函数有三个参数：当前元素，当前元素的索引和调用该方法的数组对象。
   * @param {Object} [thisObject] callback 被调用时 this 的值，如果省略或指定为 null，则使用全局对象 window。
   * @returns {Array} 包含 callback 的每次调用后的返回值的新数组。
   * @example
   *   var a = [1, 2, 3].map(function(item) {
   *     return item + 10;
   *   });
   *   a;
   *   // [11, 12, 13]
   * @see http://es5.github.com/#x15.4.4.19
   * @see https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
   */
  if (!Array.prototype.map) {
    Array.prototype.map = function(callback) {
      var object = toObject(this);
      var thisObject = arguments[1];
      var length = object.length >>> 0;
      if (typeof callback !== 'function') {
        throw new TypeError('Array.prototype.map');
      }
      var result = new Array(length);
      var i = 0;
      while (i < length) {
        if (i in object) {
          result[i] = callback.call(thisObject, object[i], i, object);
        }
        i++;
      }
      return result;
    };
  }

//--------------------------------------------------[Array.prototype.filter]
  /**
   * 对数组中的每一个元素都调用一次回调函数，并且创建一个新的数组，该数组包含所有调用回调函数后返回值为 true 时对应的原数组元素。
   * @name Array.prototype.filter
   * @function
   * @param {Function} callback 对数组中的每个元素都调用一次的回调函数。
   *   回调函数有三个参数：当前元素，当前元素的索引和调用该方法的数组对象。
   * @param {Object} [thisObject] callback 被调用时 this 的值，如果省略或指定为 null，则使用全局对象 window。
   * @returns {Array} 包含所有调用 callback 后返回值为 true 时对应的原数组元素的新数组。
   * @example
   *   var a = [1, 2, 3].filter(function(item) {
   *     return item % 2 === 1;
   *   });
   *   a;
   *   // [1, 3]
   * @see http://es5.github.com/#x15.4.4.20
   * @see https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
   */
  if (!Array.prototype.filter) {
    Array.prototype.filter = function(callback) {
      var object = toObject(this);
      var thisObject = arguments[1];
      var length = object.length >>> 0;
      if (typeof callback !== 'function') {
        throw new TypeError('Array.prototype.filter');
      }
      var result = [];
      var i = 0;
      var item;
      while (i < length) {
        if (i in object) {
          item = object[i];
          if (callback.call(thisObject, item, i, object)) {
            result.push(item);
          }
        }
        i++;
      }
      return result;
    };
  }

//--------------------------------------------------[String.prototype.trim]
  /**
   * 删除字符串两端的空白符。
   * @name String.prototype.trim
   * @function
   * @returns {string} 删除两端的空白符后的字符串。
   * @example
   *   ' hello  '.trim();
   *   // 'hello'
   * @see http://blog.stevenlevithan.com/archives/faster-trim-javascript
   * @see http://es5.github.com/#x15.5.4.20
   */
  if (!String.prototype.trim || WHITESPACES.trim()) {
    var startWhitespacesPattern = new RegExp('^[' + WHITESPACES + ']+');
    var endWhitespacesPattern = new RegExp('[' + WHITESPACES + ']+$');
    String.prototype.trim = function() {
      return String(this).replace(startWhitespacesPattern, '').replace(endWhitespacesPattern, '');
    };
  }

//--------------------------------------------------[Date.now]
  /**
   * 获取系统当前的时间戳。
   * @name Date.now
   * @function
   * @returns {number} 系统当前的时间戳。
   * @example
   *   Date.now() === new Date().getTime();
   *   // true
   * @see http://es5.github.com/#x15.9.4.4
   */
  if (!Date.now) {
    Date.now = function() {
      return new Date().getTime();
    };
  }

//==================================================[ES6 补缺]
  /*
   * 添加 ES6 中引入的部分常用方法。
   *
   * 补缺方法：
   *   String.prototype.repeat
   *   String.prototype.startsWith
   *   String.prototype.endsWith
   *   String.prototype.contains
   *   String.prototype.toArray
   *   Number.isFinite
   *   Number.isNaN
   *   Number.isInteger
   *   Number.toInteger
   *
   * 参考：
   *   http://wiki.ecmascript.org/doku.php?id=harmony:harmony
   */

//--------------------------------------------------[String.prototype.repeat]
  /**
   * 将字符串重复指定的次数。
   * @name String.prototype.repeat
   * @function
   * @param {number} count 要重复的次数。
   * @returns {string} 重复指定次数后的字符串。
   * @example
   *   '*'.repeat(5);
   *   // '*****'
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:string.prototype.repeat
   */
  String.prototype.repeat = function(count) {
    count = toInteger(count);
    var result = '';
    while (count--) {
      result += this;
    }
    return result;
  };

//--------------------------------------------------[String.prototype.startsWith]
  /**
   * 检查字符串是否以指定的子串开始。
   * @name String.prototype.startsWith
   * @function
   * @param {string} substring 指定的子串。
   * @returns {boolean} 检查结果。
   * @example
   *   'abcdefg'.startsWith('a');
   *   // true
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   */
  String.prototype.startsWith = function(substring) {
    return this.indexOf(substring) === 0;
  };

//--------------------------------------------------[String.prototype.endsWith]
  /**
   * 检查字符串是否以指定的子串结束。
   * @name String.prototype.endsWith
   * @function
   * @param {string} substring 指定的子串。
   * @returns {boolean} 检查结果。
   * @example
   *   'abcdefg'.endsWith('a');
   *   // false
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   */
  String.prototype.endsWith = function(substring) {
    var lastIndex = this.lastIndexOf(substring);
    return lastIndex >= 0 && lastIndex === this.length - substring.length;
  };

//--------------------------------------------------[String.prototype.contains]
  /**
   * 检查字符串是否包含指定的子串。
   * @name String.prototype.contains
   * @function
   * @param {string} substring 指定的子串。
   * @returns {boolean} 检查结果。
   * @example
   *   'abcdefg'.contains('cd');
   *   // true
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   */
  String.prototype.contains = function(substring) {
    return this.indexOf(substring) !== -1;
  };

//--------------------------------------------------[String.prototype.toArray]
  /**
   * 将字符串转化为数组。
   * @name String.prototype.toArray
   * @function
   * @returns {Array} 从字符串转化的数组。
   * @example
   *   'abcdefg'.toArray();
   *   // ['a', 'b', 'c', 'd', 'e', 'f', 'g']
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   */
  String.prototype.toArray = function() {
    return this.split('');
  };

//--------------------------------------------------[Number.isFinite]
  /**
   * 检查提供的值是否为有限的数字。
   * @name Number.isFinite
   * @function
   * @param {*} value 提供的值。
   * @returns {boolean} 检查结果。
   * @example
   *   isFinite(null);
   *   // true
   *   Number.isFinite(null);
   *   // false
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:number.isfinite
   */
  Number.isFinite = function(value) {
    return typeof value === 'number' && isFinite(value);
  };

//--------------------------------------------------[Number.isNaN]
  /**
   * 检查提供的值是否为非数字。
   * @name Number.isNaN
   * @function
   * @param {*} value 提供的值。
   * @returns {boolean} 检查结果。
   * @example
   *   isNaN(undefined);
   *   // true
   *   Number.isNaN(undefined);
   *   // false
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:number.isnan
   */
  Number.isNaN = function(value) {
    return typeof value === 'number' && isNaN(value);
  };

//--------------------------------------------------[Number.isInteger]
  /**
   * 检查提供的值是否为 IEEE-754 双精度整数。
   * @name Number.isInteger
   * @function
   * @param {*} value 提供的值。
   * @returns {boolean} 检查结果。
   * @description
   *   取值范围在 ±Math.pow(2, 53) 之间。
   * @example
   *   Number.isInteger(9007199254740992);
   *   // false
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:number.isinteger
   */
  Number.isInteger = function(value) {
    return Number.isFinite(value) && Math.floor(value) === value && value > -9007199254740992 && value < 9007199254740992;
  };

//--------------------------------------------------[Number.toInteger]
  /**
   * 将提供的值转化为整数。
   * @name Number.toInteger
   * @function
   * @param {*} value 提供的值。
   * @returns {number} 转化结果。
   * @example
   *   Number.toInteger([10.75]);
   *   // 10
   *   Number.toInteger('10px');
   *   // 0
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:number.tointeger
   */
  Number.toInteger = toInteger;

//==================================================[自定义扩展]
  /*
   * 其他自定义的扩展方法。
   *
   * 扩展方法：
   *   typeOf
   *   execScript
   *   Object.forEach
   *   Object.clone
   *   Object.mixin
   *   Object.toQueryString
   *   Object.fromQueryString
   *   Array.from
   *   Array.prototype.shuffle
   *   Array.prototype.contains
   *   Array.prototype.remove
   *   Array.prototype.getFirst
   *   Array.prototype.getLast
   *   String.prototype.clean
   *   String.prototype.camelize
   *   String.prototype.dasherize
   *   Number.prototype.padZero
   *   Math.limit
   *   Math.randomRange
   *   Date.parseExact
   *   Date.prototype.format
   *   RegExp.escape
   */

  /**
   * 全局对象。
   * @name Global
   * @namespace
   */

  // 将字符串中的单词分隔符压缩或转换为一个空格字符。
  var wordSeparatorsPattern = /(-(?=\D|$)|_)+/g;
  var camelizedLettersPattern = /[^A-Z\s]([A-Z])|[A-Z][^A-Z\s]/g;
  var segmentWords = function(string) {
    return string
        .replace(wordSeparatorsPattern, ' ')
        .replace(camelizedLettersPattern, function(letters, capitalLetterInTheBack) {
          return capitalLetterInTheBack ? letters.charAt(0) + ' ' + letters.charAt(1) : ' ' + letters;
        })
        .clean();
  };

  // 日期标识符。
  var dateFormatPattern = /YYYY|MM|DD|hh|mm|ss|s|TZD/g;

//--------------------------------------------------[typeOf]
  /**
   * 判断提供的值的数据类型，比 typeof 运算符返回的结果更明确（将对结果为 'object' 的情况进行更细致的区分）。
   * @name typeOf
   * @memberOf Global
   * @function
   * @param {*} value 要判断的值。
   * @returns {string} 值的类型，可能为以下几种情况之一：
   *   undefined
   *   boolean
   *   number
   *   string
   *   function
   *   null
   *   object.Boolean
   *   object.Number
   *   object.String
   *   object.Array
   *   object.Date
   *   object.RegExp
   *   object.Error
   *   object.Math
   *   object.JSON
   *   object.Arguments
   *   object.Global
   *   object.Node
   *   object.Collection
   *   object.Object
   * @description
   *   特殊情况：
   *   一些特殊的对象，如 IE7 IE8 中的 XMLHttpRequest，是作为构造函数使用的，但使用本方法将得到 'object.Object' 的结果。考虑到需要判断这类对象的情况极为少见，因此未作处理。
   *   IE6 IE7 IE8 IE9 IE10 中 SELECT.options === SELECT 为 true，因此 SELECT.options 将得到 'object.Node'，而不是预期的 'object.Collection'。
   *   IE6 IE7 IE8 中在试图访问某些对象提供的属性/方法时，如 new ActiveXObject('Microsoft.XMLHTTP').abort，将抛出“对象不支持此属性或方法”的异常，因此也无法使用本方法对其进行判断。但可以对其使用 typeof 运算符并得到结果 'unknown'。
   * @example
   *   typeOf(document);
   *   // 'object.Node'
   * @see http://mootools.net/
   * @see http://jquery.com/
   */
  var types = {};
  ['Boolean', 'Number', 'String', 'Array', 'Date', 'RegExp', 'Error', 'Math', 'JSON', 'Arguments'].forEach(function(type) {
    types['[object ' + type + ']'] = 'object.' + type;
  });
  var nativeFunctionPattern = /^\s+function .+\s+\[native code\]\s+\}\s+$/;
  window.typeOf = function(value) {
    var type = typeof value;
    if (type === 'function' && typeof value.item === 'function') {
      // Safari 中类型为 HTMLCollection 的值 type === 'function'。
      type = 'object.Collection';
    } else if (type === 'object') {
      // 进一步判断 type === 'object' 的情况。
      if (value === null) {
        type = 'null';
      } else {
        // 使用 Object.prototype.toString 判断。
        type = types[toString.call(value)] || 'object.Object';
        if (type === 'object.Object') {
          // 转化为字符串判断。
          var string = String(value);
          if (string === '[object Window]' || string === '[object DOMWindow]') {
            type = 'object.Global';
          } else if (string === '[object JSON]') {
            type = 'object.JSON';
          } else if (nativeFunctionPattern.test(string)) {
            type = 'function';
          } else {
            // 使用特性判断。
            if ('nodeType' in value) {
              type = 'object.Node';
            } else if (typeof value.length === 'number') {
              if ('navigator' in value) {
                type = 'object.Global';
              } else if ('item' in value) {
                type = 'object.Collection';
              } else if ('callee' in value) {
                type = 'object.Arguments';
              }
            }
          }
        }
      }
    }
    return type;
  };

//--------------------------------------------------[execScript]
  /**
   * 将字符串作为脚本执行，执行时的作用域为全局作用域。
   * @name execScript
   * @memberOf Global
   * @function
   * @param {string} code 要执行的代码。
   * @example
   *   var a;
   *   execScript('a = 128 * 2 + 256;');
   *   a;
   *   // 512
   * @see http://w3help.org/zh-cn/causes/BX9056
   */
  if (!window.execScript) {
    window.execScript = function(code) {
      window['eval'](code);
    };
  }

//--------------------------------------------------[Object.forEach]
  /**
   * 遍历一个对象。
   * @name Object.forEach
   * @function
   * @param {Object} object 要遍历的对象。
   * @param {Function} callback 用来遍历的函数，参数为 value，key，object。
   * @param {Object} [thisObject] callback 被调用时 this 的值，如果省略或指定为 null，则使用全局对象 window。
   */
  Object.forEach = function(object, callback, thisObject) {
    Object.keys(object).forEach(function(key) {
      callback.call(thisObject, object[key], key, object);
    });
  };

//--------------------------------------------------[Object.clone]
  /**
   * 克隆一个对象。
   * @name Object.clone
   * @function
   * @param {Object} source 原始对象。
   * @param {boolean} [recursively] 是否进行深克隆。
   * @returns {Object} 克隆对象。
   * @description
   *   实例关系和原型链都不会被克隆。
   *   一些类型的值是无法被克隆的，当尝试克隆它们时，会抛出异常，它们是 (传入 typeOf 方法后返回的值)：
   *   <ul>
   *     <li>function</li>
   *     <li>object.Error</li>
   *     <li>object.Math</li>
   *     <li>object.JSON</li>
   *     <li>object.Arguments</li>
   *     <li>object.Global</li>
   *     <li>object.Node</li>
   *     <li>object.Collection</li>
   *   </ul>
   *   如果成功对一个对象进行深克隆，则对克隆对象的任何操作都不会影响原始对象。
   */
  Object.clone = function(source, recursively) {
    var cloning;
    var type = typeOf(source);
    switch (type) {
      case 'undefined':
      case 'boolean':
      case 'number':
      case 'string':
      case 'null':
        cloning = source;
        break;
      case 'object.Boolean':
      case 'object.Number':
      case 'object.String':
      case 'object.Date':
      case 'object.RegExp':
        cloning = new source.constructor(source.valueOf());
      case 'object.Array':
        if (!cloning) {
          cloning = [];
        }
      case 'object.Object':
        if (!cloning) {
          cloning = {};
        }
        Object.forEach(source, function(value, key) {
          cloning[key] = recursively ? Object.clone(value, true) : value;
        });
        break;
      default:
        throw new TypeError('Object.clone called on no-cloning type: ' + type);
    }
    return cloning;
  };

//--------------------------------------------------[Object.mixin]
  /**
   * 将源对象（不包含原型链）上的 properties 添加到目标对象中。
   * @name Object.mixin
   * @function
   * @param {Object} destination 目标对象。
   * @param {Object} source 源对象，其 properties 会被复制到 destination 中。
   * @param {Object} [filter] 过滤要添加的 source 中的 properties 的名单。
   * @param {Array} [filter.whiteList] 仅当 source 中的 key 包含于 whiteList 时，对应的 property 才会被复制到 destination 中。
   * @param {Array} [filter.blackList] 如果 source 中的 key 包含于 blackList，则对应的 property 不会被复制到 destination 中。
   *   如果 blackList 与 whiteList 有重复的值，则 whiteList 中的将被忽略。
   * @returns {Object} 目标对象。
   * @description
   *   source 中的 property 会覆盖 destination 中的同名 property。
   *   <table>
   *     <tr><th>destination (before)</th><th>source</th><th>destination (after)</th></tr>
   *     <tr><td>a: 0</td><td></td><td>a: 0</td></tr>
   *     <tr><td>b: 0</td><td>b: 1</td><td>b: 1</td></tr>
   *     <tr><td></td><td>c: 1</td><td>c: 1</td></tr>
   *   </table>
   * @example
   *   Object.mixin({a: 0}, {b: 1});
   *   // {a: 0, b: 1}
   * @example
   *   Object.mixin({a: 0, b: 0}, {a: 1, b: 1}, {whiteList: ['a']});
   *   // {a: 1, b: 0}
   *   Object.mixin({a: 0, b: 0}, {a: 1, b: 1}, {whiteList: ['a', 'b'], blackList: ['a']});
   *   // {a: 0, b: 1}
   */
  Object.mixin = function(destination, source, filter) {
    var keys = Object.keys(source);
    if (filter) {
      var whiteList = filter.whiteList;
      var blackList = filter.blackList;
      if (whiteList) {
        keys = keys.filter(function(item) {
          return whiteList.contains(item);
        });
      }
      if (blackList) {
        keys = keys.filter(function(item) {
          return !blackList.contains(item);
        });
      }
    }
    keys.forEach(function(item) {
      destination[item] = source[item];
    });
    return destination;
  };

//--------------------------------------------------[Object.toQueryString]
  /**
   * 将一个对象转换为用于 HTTP 传输的查询字符串。
   * @name Object.toQueryString
   * @function
   * @param {Object} object 要转换的对象，该对象的每个属性名和属性值都将以键值对的形式被转换为字符串。
   *   如果某个属性值为 undefined 或 null，则忽略该属性。
   *   如果某个属性值为数组，则表示其对应的属性名有多个有效值。
   * @param {boolean} [dontEncode] 转换时不使用 encodeURIComponent 编码。
   * @returns {string} 转换后的字符串。
   * @example
   *   Object.toQueryString({a: undefined, b: null, c: '', d: 100, e: ['Composite Value', true]});
   *   // "c=&d=100&e=Composite%20Value&e=true"
   */
  Object.toQueryString = function(object, dontEncode) {
    var valuePairs = [];
    var parseValuePair = function(key, value) {
      if (value != null) {
        valuePairs.push(dontEncode ? key + '=' + value : encodeURIComponent(key) + '=' + encodeURIComponent(value));
      }
    };
    Object.forEach(object, function(value, key) {
      if (Array.isArray(value)) {
        value.forEach(function(value) {
          parseValuePair(key, value);
        });
      } else {
        parseValuePair(key, value);
      }
    });
    return valuePairs.join('&');
  };

//--------------------------------------------------[Object.fromQueryString]
  /**
   * 将一个用于 HTTP 传输的查询字符串转换为对象。
   * @name Object.fromQueryString
   * @function
   * @param {string} string 要转换的查询字符串。
   * @param {boolean} [dontDecode] 转换时不使用 decodeURIComponent 解码。
   * @returns {Object} 转换后的对象。
   * @example
   *   Object.fromQueryString('c=&d=100&e=Composite%20Value&e=true');
   *   // {c: '', d: '100', e: ['Composite Value', 'true']}
   */
  Object.fromQueryString = function(string, dontDecode) {
    var object = {};
    string.split('&').forEach(function(item) {
      var valuePair = item.split('=');
      var key = valuePair[0];
      var value = valuePair[1];
      if (value !== undefined) {
        if (!dontDecode) {
          key = decodeURIComponent(key);
          value = decodeURIComponent(value);
        }
        if (object.hasOwnProperty(key)) {
          typeof object[key] === 'string' ? object[key] = [object[key], value] : object[key].push(value);
        } else {
          object[key] = value;
        }
      }
    });
    return object;
  };

//--------------------------------------------------[Array.from]
  /**
   * 将一个值转化为数组。
   * @name Array.from
   * @function
   * @param {*} value 要转化为数组的值。
   *   如果该值为 undefined 或 null，则返回空数组。
   *   如果该值本身即为一个数组，则直接返回这个数组。
   *   如果该值有 toArray 方法，则返回调用该方法后的结果。
   *   如果该值可遍历，则返回一个包含各可遍历项的数组。
   *   否则，返回一个仅包含该值的数组。
   * @returns {Array} 由 value 转化而来的数组。
   */
  Array.from = function(value) {
    if (value == null) {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value.toArray === 'function') {
      return value.toArray();
    }
    switch (typeOf(value)) {
      case 'object.Arguments':
      case 'object.Collection':
      case 'object.Object':
        var i = 0;
        var length = value.length;
        if (typeof length === 'number') {
          var result = [];
          while (i < length) {
            if (!value.hasOwnProperty || value.hasOwnProperty(i)) {
              result[i] = value[i];
            }
            i++;
          }
          result.length = length;
          return result;
        }
    }
    return [value];
  };

//--------------------------------------------------[Array.prototype.shuffle]
  /**
   * 随机排序本数组中的各元素。
   * @name Array.prototype.shuffle
   * @function
   * @returns {Array} 随机排序后的本数组。
   * @example
   *   [0, 1, 2, 3, 4].shuffle();
   *   // [4, 0, 2, 1, 3]
   * @see http://bost.ocks.org/mike/shuffle/
   */
  Array.prototype.shuffle = function() {
    var i = this.length;
    var random;
    var temp;
    if (i > 1) {
      while (--i) {
        random = Math.floor(Math.random() * (i + 1));
        temp = this[i];
        this[i] = this[random];
        this[random] = temp;
      }
    }
    return this;
  };

//--------------------------------------------------[Array.prototype.contains]
  /**
   * 检查本数组中是否包含指定的元素。
   * @name Array.prototype.contains
   * @function
   * @param {*} element 指定的元素。
   * @returns {boolean} 检查结果。
   * @example
   *   [0, 1, 2, 3, 4].contains(2);
   *   // true
   */
  Array.prototype.contains = function(element) {
    return this.indexOf(element) !== -1;
  };

//--------------------------------------------------[Array.prototype.remove]
  /**
   * 移除数组中第一个与指定的元素相同的元素。
   * @name Array.prototype.remove
   * @function
   * @param {*} element 指定的元素。
   * @returns {boolean} 指定的元素是否存在并被移除。
   * @description
   *   IE6 无法通过 [undefined].remove(undefined) 或 [undefined].remove() 成功移除数组中的元素。
   * @example
   *   [1, 2, 1].remove(1);
   *   // [2, 1]
   */
  Array.prototype.remove = function(element) {
    var index = this.indexOf(element);
    if (index > -1) {
      this.splice(index, 1);
      return true;
    }
    return false;
  };

//--------------------------------------------------[Array.prototype.getFirst]
  /**
   * 获取本数组的第一个元素。
   * @name Array.prototype.getFirst
   * @function
   * @returns {*} 本数组的第一个元素。
   * @example
   *   [0, 1, 2, 3, 4].getFirst();
   *   // 0
   */
  Array.prototype.getFirst = function() {
    return this[0];
  };

//--------------------------------------------------[Array.prototype.getLast]
  /**
   * 获取本数组的最后一个元素。
   * @name Array.prototype.getLast
   * @function
   * @returns {*} 本数组的最后一个元素。
   * @example
   *   [0, 1, 2, 3, 4].getLast();
   *   // 4
   */
  Array.prototype.getLast = function() {
    return this[this.length - 1];
  };

//--------------------------------------------------[String.prototype.clean]
  /**
   * 合并字符串中的空白字符，并去掉首尾的空白字符。
   * @name String.prototype.clean
   * @function
   * @returns {string} 清理后的字符串。
   * @example
   *   ' a b  c   d    e     f      g       '.clean();
   *   // 'a b c d e f g'
   */
  var whitespacesPattern = new RegExp('[' + WHITESPACES + ']+', 'g');
  String.prototype.clean = function() {
    return this.replace(whitespacesPattern, ' ').trim();
  };

//--------------------------------------------------[String.prototype.camelize]
  /**
   * 以 camelize 的形式重组字符串。
   * @name String.prototype.camelize
   * @function
   * @param {boolean} [useUpperCamelCase] 是否使用大驼峰式命名法（又名 Pascal 命名法），默认为 false，即使用小驼峰式命名法。
   * @returns {string} 重组后的字符串。
   * @example
   *   'foo-bar'.camelize();
   *   // 'fooBar'
   *   'foo-bar'.camelize(true);
   *   // 'FooBar'
   *   'HTMLFormElement'.camelize();
   *   // 'htmlFormElement'
   */
  var firstWordLeadingLowercaseLetterPattern = /^[a-z]/;
  var firstWordLeadingUppercaseLettersPattern = /^[A-Z]*/;
  var followingWordsFirstLetterPattern = /(?:\s)(\S)/g;
  String.prototype.camelize = function(useUpperCamelCase) {
    var result = segmentWords(this);
    result = useUpperCamelCase ?
        result.replace(firstWordLeadingLowercaseLetterPattern, function(lowercaseLetter) {
          return lowercaseLetter.toUpperCase();
        }) :
        result.replace(firstWordLeadingUppercaseLettersPattern, function(uppercaseLetter) {
          return uppercaseLetter.toLowerCase();
        });
    return result.replace(followingWordsFirstLetterPattern, function(_, firstLetter) {
      return firstLetter.toUpperCase();
    });
  };

//--------------------------------------------------[String.prototype.dasherize]
  /**
   * 以 dasherize 的形式重组字符串。
   * @name String.prototype.dasherize
   * @function
   * @returns {string} 重组后的字符串。
   * @example
   *   'foo_bar'.dasherize();
   *   // 'foo-bar'
   *   'FooBar'.dasherize();
   *   // 'foo-bar'
   */
  var whitespacePattern = / /g;
  String.prototype.dasherize = function() {
    return segmentWords(this).replace(whitespacePattern, '-').toLowerCase();
  };

//--------------------------------------------------[Number.prototype.padZero]
  /**
   * 在数字左侧补零，以使数字更整齐。
   * @name Number.prototype.padZero
   * @function
   * @param {number} digits 数字总位数（包括整数位和小数位），当数字实际位数小于指定的数字总位数时，会在左侧补零。
   * @returns {string} 补零后的数字、NaN、Infinity 或 -Infinity 的字符形式。
   */
  Number.prototype.padZero = function(digits) {
    var sign = (this < 0) ? '-' : '';
    var number = String(Math.abs(this));
    if (isFinite(this)) {
      var length = number.length - (Math.ceil(this) == this ? 0 : 1);
      if (length < digits) {
        number = '0'.repeat(digits - length) + number;
      }
    }
    return sign + number;
  };

//--------------------------------------------------[Math.limit]
  /**
   * 参考输入的数字 number，返回介于 min 和 max 之间（包含 min 和 max）的数字。
   * @name Math.limit
   * @function
   * @param {number} number 输入的数字。
   * @param {number} min 允许的数字下限。
   * @param {number} max 允许的数字上限。
   * @returns {number} 输出的数字。
   * @description
   *   如果 number 小于 min 则返回 min；如果 number 大于 max 则返回 max；否则返回 number。
   * @example
   *   Math.limit(100, 0, 80);
   *   // 80
   *   Math.limit(NaN, 0, 80);
   *   // 0
   * @see http://mootools.net/
   */
  Math.limit = function(number, min, max) {
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : (number === Infinity ? max : min);
  };

//--------------------------------------------------[Math.randomRange]
  /**
   * 生成介于 min 和 max 之间（包含 min 和 max）的伪随机整数。
   * @name Math.randomRange
   * @function
   * @param {number} min 要获取的随机数的下限，整数。
   * @param {number} max 要获取的随机数的上限，整数。
   * @returns {number} 生成的伪随机整数。
   * @see http://mootools.net/
   */
  Math.randomRange = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

//--------------------------------------------------[Date.parseExact]
  /**
   * 将以指定格式表示日期的字符串转换为日期对象。
   * @name Date.parseExact
   * @function
   * @param {string} string 代表日期的字符串，该字符串应该能够通过 Date.prototype.format 生成。
   *   日期字符串中缺失的部分将使用默认值代替，各部分的默认值如下：
   *   <table>
   *     <tr><th>日期字段</th><th>默认值</th></tr>
   *     <tr><td>年</td><td>当前年份</td></tr>
   *     <tr><td>月</td><td>1</td></tr>
   *     <tr><td>日</td><td>1</td></tr>
   *     <tr><td>时</td><td>0</td></tr>
   *     <tr><td>分</td><td>0</td></tr>
   *     <tr><td>秒</td><td>0</td></tr>
   *     <tr><td>毫秒</td><td>0</td></tr>
   *     <tr><td>时区</td><td>当地时区</td></tr>
   *   </table>
   *   注意：未检查字符串内包含数据的有效性，若数据异常，将得不到预期的日期值。
   * @param {string} [format] 由代表日期字段的标识符和其他字符组成的格式字符串，默认为 'YYYY-MM-DD'。格式请参考 Date.prototype.format 的同名参数。
   * @param {boolean} [isUTC] 字符串是否为世界标准时间。
   *   当 isUTC 与 string 中已存在的 TZD 标识冲突时，isUTC 将被忽略。
   * @returns {Date} 转换后的日期对象。
   * @example
   *   Date.parseExact('2012-06-25 12:00:00', 'YYYY-MM-DD hh:mm:ss')
   *   // 各浏览器中日期的字符串形式略有差异。
   *   // "Mon Jun 25 2012 12:00:00 GMT+0800"
   *   Date.parseExact('2012-12-21T23:14:35.000+08:00', 'YYYY-MM-DDThh:mm:ss.sTZD', true).format('世界标准时间YYYY年MM月DD日hh点mm分ss秒', true)
   *   // "世界标准时间2012年12月21日15点14分35秒"
   *   Date.parseExact('02-29 16:00', 'MM-DD hh:mm')
   *   // 年份缺失，使用默认值代替。
   *   // "Wed Feb 29 2012 16:00:00 GMT+0800"
   */
  var now = new Date();
  var timeZoneOffset = now.getTimezoneOffset() * 60000;
  Date.parseExact = function(string, format, isUTC) {
    format = format || 'YYYY-MM-DD';
    // 从 string 中参考 format 解析出日期数据。
    var extractedData = {};
    var match;
    var index;
    var key;
    var value;
    var start;
    var currentCorrectedValue;
    var totalCorrectedValue = 0;
    while (match = dateFormatPattern.exec(format)) {
      key = match[0];
      index = match.index;
      start = index + totalCorrectedValue;
      // 定位值。
      if (key === 'TZD') {
        currentCorrectedValue = string.charAt(start) === 'Z' ? -2 : 3;
      } else if (key === 's') {
        currentCorrectedValue = 2;
      } else {
        currentCorrectedValue = 0;
      }
      // 取出值。
      value = string.substring(start, start + key.length + currentCorrectedValue);
      // 转换值。
      if (key === 'TZD') {
        value = value === 'Z' ? 0 : (value.slice(0, 1) === '-' ? 1000 : -1000) * (value.slice(1, 3) * 3600 + value.slice(4, 6) * 60);
      } else {
        value = Number.toInteger(value);
        if (key === 'MM') {
          --value;
        }
      }
      // 保存值。
      extractedData[key] = value;
      totalCorrectedValue += currentCorrectedValue;
    }

    // 缺失的值使用以下默认值代替。
    var dateValues = Object.mixin({YYYY: now.getFullYear(), MM: 0, DD: 1, hh: 0, mm: 0, ss: 0, s: 0, TZD: isUTC ? 0 : timeZoneOffset}, extractedData);

    // 转换为日期类型。
    return new Date(Date.UTC(dateValues.YYYY, dateValues.MM, dateValues.DD, dateValues.hh, dateValues.mm, dateValues.ss, dateValues.s) + dateValues.TZD);
  };

//--------------------------------------------------[Date.prototype.format]
  /**
   * 将日期对象格式化为字符串。
   * @name Date.prototype.format
   * @function
   * @param {string} [format] 由代表日期字段的标识符和其他字符组成的格式字符串，默认为 'YYYY-MM-DD'。
   *   各标识符及其含义：
   *   <table>
   *     <tr><th>字符</th><th>含义</th></tr>
   *     <tr><td>YYYY</td><td>四位数年份。</td></tr>
   *     <tr><td>MM</td><td>两位数月份。</td></tr>
   *     <tr><td>DD</td><td>两位数日期。</td></tr>
   *     <tr><td>hh</td><td>两位数小时，24 小时制。</td></tr>
   *     <tr><td>mm</td><td>两位数分钟。</td></tr>
   *     <tr><td>ss</td><td>两位数秒钟。</td></tr>
   *     <tr><td>s</td><td>三位数毫秒。</td></tr>
   *     <tr><td>TZD</td><td>时区指示。世界标准时间显示大写字母 Z，其他时区用当地时间加时差表示。</td></tr>
   *   </table>
   * @param {boolean} [toUTC] 是否格式化为世界标准时间。
   * @returns {string} 格式化后的字符串。
   * @example
   *   new Date(2000,0,1).format()
   *   // "2000-01-01"
   *   new Date(2000,2,1).format('MM-DD hh:mm', true)
   *   // "02-29 16:00"
   *   new Date('Fri, 21 Dec 2012 15:14:35 GMT').format('YYYY-MM-DDThh:mm:ss.sTZD')
   *   // "2012-12-21T23:14:35.000+08:00"
   *   new Date(2012, 0, 1).format('YYYYYY')
   *   // 未被成功匹配的字符均会作为普通字符显示。
   *   // "2012YY"
   * @see http://www.w3.org/TR/NOTE-datetime
   * @see http://en.wikipedia.org/wiki/ISO_8601
   * @see http://blog.stevenlevithan.com/archives/date-time-format
   */
  Date.prototype.format = function(format, toUTC) {
    format = format || 'YYYY-MM-DD';

    var get = toUTC ? 'getUTC' : 'get';
    var timezoneOffset = this.getTimezoneOffset();
    var timezoneOffsetSign = timezoneOffset < 0 ? '+' : '-';
    var timezoneOffsetHours = (Math.floor(Math.abs(timezoneOffset) / 60)).padZero(2);
    var timezoneOffsetMinutes = (Math.abs(timezoneOffset) - timezoneOffsetHours * 60).padZero(2);
    var keys = {
      YYYY: this[get + 'FullYear'](),
      MM: (this[get + 'Month']() + 1).padZero(2),
      DD: this[get + 'Date']().padZero(2),
      hh: this[get + 'Hours']().padZero(2),
      mm: this[get + 'Minutes']().padZero(2),
      ss: this[get + 'Seconds']().padZero(2),
      s: this[get + 'Milliseconds']().padZero(3),
      TZD: (toUTC || timezoneOffset === 0) ? 'Z' : (timezoneOffsetSign + timezoneOffsetHours + ':' + timezoneOffsetMinutes)
    };

    var date = format.replace(dateFormatPattern, function(key) {
      return keys[key];
    });
    // IE6 IE7 IE8 对 RegExp 进行操作后，未能立即将其 lastIndex 属性复位。此处手动复位，以免执行 Date.parseExact(new Date().format()) 时出错。
    dateFormatPattern.lastIndex = 0;
    return date;

  };

//--------------------------------------------------[RegExp.escape]
  /**
   * 转义字符串中包含的正则表达式元字符。
   * @name RegExp.escape
   * @function
   * @param {string} string 要转义的字符串。
   * @returns {string} 转义后的字符串。
   * @description
   *   转以后的字符串可以安全的作为正则表达式的一部分使用。
   * @see http://prototypejs.org/
   */
  var regularExpressionMetacharactersPattern = /([.*+?^${}()|\[\]\/\\])/g;
  RegExp.escape = function(string) {
    return String(string).replace(regularExpressionMetacharactersPattern, '\\$1');
  };

})();
/**
 * @fileOverview 浏览器 API 扩展
 * @author sundongguo@gmail.com
 * @version 20111201
 */

(function() {
//==================================================[console 补缺]
  /*
   * 为没有控制台的浏览器补缺常用方法，以供内部打印调试信息使用。
   *
   * 补缺方法：
   *   console.log
   *   console.info
   *   console.warn
   *   console.error
   *
   * 注意：
   *   本实现并未给没有控制台的浏览器提供打印调试信息的方式，只是确保在这些浏览器里调用上述补缺的方法时不会出错。
   */

  /**
   * 控制台对象。
   * @name console
   * @namespace
   */

//--------------------------------------------------[console.*]
  if (!window.console) {
    var consoleObject = window.console = {};
    consoleObject.log = consoleObject.info = consoleObject.warn = consoleObject.error = function() {
    };
  }

//==================================================[navigator 扩展]
  /*
   * 常见浏览器的 navigator.userAgent：
   * IE6      Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)
   * IE7      Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET4.0C)
   * IE8      Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET4.0C)
   * IE9      Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)
   * Firefox7 Mozilla/5.0 (Windows NT 6.1; rv:7.0.1) Gecko/20100101 Firefox/7.0.1
   * Chrome2  Mozilla/5.0 (Windows NT 6.1) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.202 Safari/535.1
   * Safari5  Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.51.22 (KHTML, like Gecko) Version/5.1.1 Safari/534.51.22
   * Opera11  Opera/9.80 (Windows NT 6.1; U; en) Presto/2.9.168 Version/11.52
   *
   * 扩展属性：
   *   navigator.userAgentInfo
   *   navigator.userAgentInfo.engine
   *   navigator.userAgentInfo.name
   *   navigator.userAgentInfo.version
   *   navigator.inStandardsMode
   *   navigator.isIE10
   *   navigator.isIElt10
   *   navigator.isIE9
   *   navigator.isIElt9
   *   navigator.isIE8
   *   navigator.isIElt8
   *   navigator.isIE7
   *   navigator.isIE6
   *   navigator.isFirefox
   *   navigator.isChrome
   *   navigator.isSafari
   *   navigator.isOpera
   */

  /**
   * 扩展 navigator 对象，提供更多关于浏览器的信息。
   * @name navigator
   * @namespace
   */

//--------------------------------------------------[navigator.*]
  /**
   * 从 navigator.userAgent 中提取的常用信息。
   * @name userAgentInfo
   * @memberOf navigator
   * @type Object
   * @description
   *   注意：navigator.userAgentInfo 下的三个属性是根据 navigator.userAgent 得到的，仅供参考，不建议作为逻辑判断的依据。
   */

  /**
   * 浏览器渲染引擎的类型，值为以下之一：Trident|WebKit|Gecko|Presto。
   * @name userAgentInfo.engine
   * @memberOf navigator
   * @type string
   */

  /**
   * 浏览器的名称，值为以下之一：IE|Firefox|Chrome|Safari|Opera。
   * @name userAgentInfo.name
   * @memberOf navigator
   * @type string
   */

  /**
   * 浏览器的版本号。
   * @name userAgentInfo.version
   * @memberOf navigator
   * @type string
   */

  /**
   * 浏览器的语言代码。
   * @name languageCode
   * @memberOf navigator
   * @type string
   */

  /**
   * 浏览器是否工作在标准模式下。
   * @name inStandardsMode
   * @memberOf navigator
   * @type boolean
   */

  /**
   * 浏览器是否为 IE10。
   * @name isIE10
   * @memberOf navigator
   * @type boolean
   */

  /**
   * 浏览器是否为 IE，且版本小于 10。
   * @name isIElt10
   * @memberOf navigator
   * @type boolean
   */

  /**
   * 浏览器是否为 IE9。
   * @name isIE9
   * @memberOf navigator
   * @type boolean
   */

  /**
   * 浏览器是否为 IE，且版本小于 9。
   * @name isIElt9
   * @memberOf navigator
   * @type boolean
   */

  /**
   * 浏览器是否为 IE8。
   * @name isIE8
   * @memberOf navigator
   * @type boolean
   */

  /**
   * 浏览器是否为 IE，且版本小于 8。
   * @name isIElt8
   * @memberOf navigator
   * @type boolean
   */

  /**
   * 浏览器是否为 IE7。
   * @name isIE7
   * @memberOf navigator
   * @type boolean
   */

  /**
   * 浏览器是否为 IE6。
   * @name isIE6
   * @memberOf navigator
   * @type boolean
   */

  /**
   * 浏览器是否为 Firefox。
   * @name isFirefox
   * @memberOf navigator
   * @type boolean
   */

  /**
   * 浏览器是否为 Chrome。
   * @name isChrome
   * @memberOf navigator
   * @type boolean
   */

  /**
   * 浏览器是否为 Safari。
   * @name isSafari
   * @memberOf navigator
   * @type boolean
   */

  /**
   * 浏览器是否为 Opera。
   * @name isOpera
   * @memberOf navigator
   * @type boolean
   */

  Object.mixin(navigator, function() {
    // 从 navigator.userAgent 中分离信息。
    var engine = 'Unknown';
    var name = 'Unknown';
    var version = 0;
    var userAgent = navigator.userAgent;
    if (/Trident|MSIE/.test(userAgent)) {
      engine = 'Trident';
    } else if (/WebKit/.test(userAgent)) {
      engine = 'WebKit';
    } else if (/Gecko/.test(userAgent)) {
      engine = 'Gecko';
    } else if (/Presto/.test(userAgent)) {
      engine = 'Presto';
    }
    if (userAgent.match(/(IE|Firefox|Chrome|Safari|Opera)(?: |\/)(\d+)/)) {
      name = RegExp.$1;
      version = Number.toInteger(RegExp.$2);
      if (userAgent.match(/Version\/(\d+)/)) {
        version = Number.toInteger(RegExp.$1);
      }
    }
    // 获取语言代码。
    var languageCode = (navigator.language || navigator.userLanguage).toLowerCase();
    // 检查工作模式。
    var inStandardsMode = document.compatMode === 'CSS1Compat';
    if (!inStandardsMode) {
      console.warn('OurJS: Browser is working in non-standards mode!');
    }
    // 浏览器特性判断。
    var isIE10 = false;
    var isIElt10 = false;
    var isIE9 = false;
    var isIElt9 = false;
    var isIE8 = false;
    var isIElt8 = false;
    var isIE7 = false;
    var isIE6 = false;
    var isFirefox = false;
    var isChrome = false;
    var isSafari = false;
    var isOpera = false;
    var html = document.documentElement;
    if ('ActiveXObject' in window) {
      if (inStandardsMode) {
        if ('WebSocket' in window) {
          isIE10 = true;
        } else if ('HTMLElement' in window) {
          isIE9 = true;
        } else if ('Element' in window) {
          isIE8 = true;
        } else if ('minWidth' in html.currentStyle) {
          isIE7 = true;
        } else {
          isIE6 = true;
          try {
            document.execCommand('BackgroundImageCache', false, true);
          } catch (e) {
          }
        }
      }
      isIElt8 = isIE7 || isIE6;
      isIElt9 = isIE8 || isIElt8;
      isIElt10 = isIE9 || isIElt9;
    } else if ('uneval' in window) {
      isFirefox = true;
    } else if (getComputedStyle(html, null).getPropertyValue('-webkit-user-select')) {
      if ('chrome' in window) {
        isChrome = true;
      } else {
        isSafari = true;
      }
    } else if ('opera' in window) {
      isOpera = true;
    }
    // 返回扩展对象。
    return {
      userAgentInfo: {
        engine: engine,
        name: name,
        version: version
      },
      languageCode: languageCode,
      inStandardsMode: inStandardsMode,
      isIE10: isIE10,
      isIElt10: isIElt10,
      isIE9: isIE9,
      isIElt9: isIElt9,
      isIE8: isIE8,
      isIElt8: isIElt8,
      isIE7: isIE7,
      isIE6: isIE6,
      isFirefox: isFirefox,
      isChrome: isChrome,
      isSafari: isSafari,
      isOpera: isOpera
    };
  }());

//==================================================[location 扩展]
  /*
   * 页面地址信息扩展。
   *
   * 扩展属性：
   *   location.parameters
   */

  /**
   * 扩展 location 对象。
   * @name location
   * @namespace
   */

//--------------------------------------------------[location.parameters]
  /**
   * 通过此对象可以访问当前页面地址中查询字符串所携带的参数。
   * @name parameters
   * @memberOf location
   * @type Object
   * @description
   *   注意：获取的参数值均为原始值（未经过 decodeURIComponent 解码）。
   * @example
   *   // 设页面地址为 test.html?a=ok&b=100&b=128
   *   location.parameters
   *   // {a:'ok', b:['100', '128']}
   * @see http://w3help.org/zh-cn/causes/HD9001
   */
  location.parameters = Object.fromQueryString(location.search.slice(1), true);

//==================================================[cookie 扩展]
  /*
   * 将 document.cookie 扩展为 cookie 对象。
   *
   * 提供方法：
   *   cookie.getItem
   *   cookie.setItem
   *   cookie.removeItem
   */

  /**
   * 提供操作 cookie 的常用方法。
   * @name cookie
   * @namespace
   */
  var cookie = window.cookie = {};

//--------------------------------------------------[cookie.getItem]
  /**
   * 从 cookie 中读取一条数据。
   * @name cookie.getItem
   * @function
   * @param {string} key 数据名。
   * @returns {string} 数据值。
   *   如果没有对应的值，返回 null。
   */
  cookie.getItem = function(key) {
    var matchs = document.cookie.match(new RegExp('(?:^|;)\\s*' + RegExp.escape(key) + '=([^;]*)'));
    return matchs ? decodeURIComponent(matchs[1]) : null;
  };

//--------------------------------------------------[cookie.setItem]
  /**
   * 在 cookie 中保存一条数据。
   * @name cookie.setItem
   * @function
   * @param {string} key 数据名。
   * @param {string} value 数据值。
   * @param {Object} [options] 可选参数。
   * @param {string} [options.path] 限定生效的路径，默认为当前路径。
   * @param {string} [options.domain] 限定生效的域名，默认为当前域名。
   * @param {boolean} [options.secure] 是否仅通过 SSL 连接 (HTTPS) 传输本条数据，默认为否。
   * @param {string|Date} [options.expires] 过期时间，默认为会话结束。
   *   如果使用字符串类型，其表示时间的格式应为 'YYYY-MM-DD hh:mm:ss'。
   */
  cookie.setItem = function(key, value, options) {
    options = options || {};
    var item = key + '=' + encodeURIComponent(value);
    if (options.path) {
      item += '; path=' + options.path;
    }
    if (options.domain) {
      item += '; domain=' + options.domain;
    }
    if (options.secure) {
      item += '; secure';
    }
    if (options.expires) {
      item += '; expires=' + (typeof options.expires === 'string' ? Date.parseExact(options.expires, 'YYYY-MM-DD hh:mm:ss') : options.expires).toUTCString();
    }
    document.cookie = item;
  };

//--------------------------------------------------[cookie.removeItem]
  /**
   * 从 cookie 中删除一条数据。
   * @name cookie.removeItem
   * @function
   * @param {string} key 数据名。
   * @param {Object} [options] 可选参数。
   * @param {string} [options.path] 限定生效的路径，默认为当前路径。
   * @param {string} [options.domain] 限定生效的域名，默认为当前域名。
   * @param {boolean} [options.secure] 是否仅通过 SSL 连接 (HTTPS) 传输本条数据，默认为否。
   */
  cookie.removeItem = function(key, options) {
    options = options || {};
    options.expires = new Date(0);
    this.setItem(key, '', options);
  };

//==================================================[localStorage 补缺]
  /*
   * 为不支持 localStorage 的浏览器（IE6 IE7）模拟此特性。
   *
   * 补缺方法：
   *   localStorage.getItem
   *   localStorage.setItem
   *   localStorage.removeItem
   *   localStorage.clear
   *
   * 注意：
   *   本实现并未模拟 localStorage.length 和 localStorage.key，因为它们并不常用。
   *   若要进行模拟，需要在每次操作更新一个列表，为严格保证列表的数据不被覆盖，还需要将数据存入另一个 xml 文档。
   *
   * 参考：
   *   https://github.com/marcuswestin/store.js
   *   http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
   */

  if (window.localStorage || !document.documentElement.addBehavior || location.protocol === 'file:') {
    return;
  }

  /**
   * 为不支持 localStorage 的浏览器提供类似的功能。
   * @name localStorage
   * @namespace
   * @description
   *   在不支持 localStorage 的浏览器中，会使用路径 '/favicon.ico' 来创建启用 userData 的元素。应保证上述路径存在，以免出现预料外的异常。
   *   userData 的尺寸限制为每文件 128KB，每域 1024KB；受限站点每文件 64KB，每域 640KB。
   */
  var localStorage = window.localStorage = {};

  // 指定一个固定的 userData 存储文件名。
  var STORE_NAME = 'localStorage';

  // 用来保存 userData 的元素。
  var storeElement;

  // 在当前域的根路径创建一个文档，并在此文档中创建用来保存 userData 的元素。
  try {
    // 使用这种方式（而不是在当前文档内直接插入 IFRAME 元素）可以避免在 IE6 的应用代码中调用 document.write 时出现“已终止操作”的异常。
    var storeContainerDocument = new ActiveXObject('htmlfile');
    storeContainerDocument.open();
    storeContainerDocument.write('<iframe id="store" src="/favicon.ico"></iframe>');
    storeContainerDocument.close();
    // IE6 IE7 IE8 允许在 document 上插入元素，可以确保代码的同步执行。
    var storeDocument = storeContainerDocument.getElementById('store').contentWindow.document;
    storeElement = storeDocument.appendChild(storeDocument.createElement('var'));
  } catch (e) {
    // 若创建失败，则仅实现不能跨路径的 userData 访问。
    storeElement = document.documentElement;
  }
  // 添加行为。
  storeElement.addBehavior('#default#userData');

//--------------------------------------------------[localStorage.getItem]
  /**
   * 从 localStorage 中读取一条数据。
   * @name localStorage.getItem
   * @function
   * @param {string} key 数据名。
   * @returns {string} 数据值。
   *   如果没有对应的值，返回 null。
   */
  localStorage.getItem = function(key) {
    storeElement.load(STORE_NAME);
    return storeElement.getAttribute(key);
  };

//--------------------------------------------------[localStorage.setItem]
  /**
   * 在 localStorage 中保存一条数据。
   * @name localStorage.setItem
   * @function
   * @param {string} key 数据名，不能为空字符串。
   * @param {string} value 数据值。
   * @description
   *   注意：与原生的 localStorage 不同，IE6 IE7 的实现不允许 `~!@#$%^&*() 等符号出现在 key 中，可以使用 . 和 _ 符号，但不能以 . 和数字开头。
   */
  localStorage.setItem = function(key, value) {
    storeElement.load(STORE_NAME);
    storeElement.setAttribute(key, value);
    storeElement.save(STORE_NAME);
  };

//--------------------------------------------------[localStorage.removeItem]
  /**
   * 从 localStorage 中删除一条数据。
   * @name localStorage.removeItem
   * @function
   * @param {string} key 数据名。
   */
  localStorage.removeItem = function(key) {
    storeElement.load(STORE_NAME);
    storeElement.removeAttribute(key);
    storeElement.save(STORE_NAME);
  };

//--------------------------------------------------[localStorage.clear]
  /**
   * 清空 localStorage 中的所有数据。
   * @name localStorage.clear
   * @function
   */
  localStorage.clear = function() {
    var attributes = Array.from(storeElement.XMLDocument.documentElement.attributes);
    storeElement.load(STORE_NAME);
    attributes.forEach(function(attribute) {
      storeElement.removeAttribute(attribute.name);
    });
    storeElement.save(STORE_NAME);
  };

})();
/**
 * @fileOverview DOM 对象补缺及扩展
 * @author sundongguo@gmail.com
 * @version 20130508
 */

(function() {
  // 内部变量。
  var window = this;
  var document = window.document;
  var html = document.documentElement;

  // 参数分隔符。
  var separator = /\s*,\s*/;

//==================================================[DOM 对象补缺及扩展]
  /*
   * 仅针对窗口、文档和元素三种类型的对象进行补缺和扩展（不包括文本节点等其他类型）。
   *
   * 其中窗口和文档对象在页面中只有唯一的实例，可以直接进行补缺和扩展。
   * 而对元素进行补缺和扩展，有以下三种方案：
   * 一、静态方法
   *   方式：
   *     提供一组静态方法，将元素以参数（一般是第一个参数）的形式传入并进行处理。
   *   优点：
   *     可以随意为方法命名。
   *     不修改原生对象，可以跨 frame 操作，可与其他脚本库共存。
   *   缺点：
   *     静态方法的调用从字面上看是以方法为主体（先出现），代码冗长，语法不如以目标对象为主体的 . 操作自然。
   *     有时需要使用静态方法，有时又要使用原生方法，缺乏一致性。
   * 二、包装对象
   *   方式：
   *     创建一个对象包装目标元素，在这个包装对象的原型（链）中添加方法。
   *   优点：
   *     语法以目标对象为主体，可以链式调用，语法自然。
   *     可以随意为方法命名。
   *     不修改原生对象，可以跨 frame 操作，可与其他脚本库共存。
   *   缺点：
   *     访问元素的属性时需要使用 getter 和 setter 方法（包装对象没有“属性”的概念），操作元素未被包装的的一些生僻方法或属性时，需要解包，一致性不够好。
   *     由于对包装对象上方法的调用与对原生对象上方法的调用方式是相同的（使用 . 操作符调用），特殊情况下有将原生对象当作包装对象误用的可能。
   *     必须以约定的方式获取元素以便对其包装。
   * 三、原型扩展
   *   方式：
   *     直接在 Element.prototype 上添加方法。对于没有 Element 构造器的浏览器（IE6 IE7），将对应特性直接附加在元素的实例上。
   *   优点：
   *     不引入新的对象类型或命名空间，只在已有的对象类型上添加方法，一致性最好。
   *     方法调用时操作主体就是目标元素本身，可以链式调用，语法自然。
   *   缺点：
   *     为方法命名时，不能使用当前已有的特性名，并应尽量避免使用将来可能会有的特性名。
   *     修改了原生对象，跨 frame 操作前需要预先修改目标 frame 中的原生对象，不能与其他基于原型扩展的脚本库共存。
   *     必须以约定的方式获取元素以便兼容 IE6 IE7 的扩展方式，另外对 IE6 IE7 的修补方案有性能损耗。
   *
   * 为达到“化繁为简”的目标，这里使用第三种实现方式，以使 API 有最好的一致性和最自然语法。
   * 同时不予提供跨 frame 的操作。实际上跨 frame 操作并不常见，通常也不建议这样做。必须这样做时，应在 frame 内也引入本脚本库。
   * 要处理的元素必须由本脚本库提供的 document.$ 方法来获取，或通过已获取的元素上提供的方法（如 getNextSibling、find 等）来获取。使用其他途径如元素本身的 parentNode 特性来获取的元素，在 IE6 IE7 中将丢失这些附加特性。
   */

//==================================================[window 扩展]
  /*
   * 为 window 扩展新特性。
   * 其中 getScrollSize 与 getPageOffset 方法在 document.body 可访问后方可使用。
   *
   * 扩展方法：
   *   window.$
   *   window.getClientSize
   *   window.getScrollSize
   *   window.getPageOffset
   */

  /**
   * 扩展 DOMWindow 对象。
   * @name window
   * @namespace
   */

  window.uid = 'window';

//--------------------------------------------------[window.$]
  /**
   * 对 document.$ 的引用。
   * @name window.$
   * @function
   * @param {string|Element} e 不同类型的元素表示。
   * @returns {Element} 扩展后的元素。
   * @description
   *   在编写应用代码时，可以使用 $ 来代替 document.$。
   */

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

//==================================================[document 扩展]
  /*
   * 为 document 扩展新特性。
   *
   * 扩展方法：
   *   document.$
   *   document.addStyleRules
   *   document.loadScript
   *   document.preloadImages
   */

  /**
   * 扩展 document 对象。
   * @name document
   * @namespace
   */

  document.uid = 'document';

  // 自动触发 beforedomready、domready 和 afterdomready 事件，其中 beforedomready 和 afterdomready 为内部使用的事件类型。
  var triggerDomReadyEvent;
  if ('addEventListener' in document) {
    triggerDomReadyEvent = function() {
      document.removeEventListener('DOMContentLoaded', triggerDomReadyEvent, false);
      window.removeEventListener('load', triggerDomReadyEvent, false);
      document.fire('beforedomready');
      document.fire('domready');
      document.fire('afterdomready');
    };
    document.addEventListener('DOMContentLoaded', triggerDomReadyEvent, false);
    window.addEventListener('load', triggerDomReadyEvent, false);
  } else {
    var doBodyCheck = function() {
      if (document.body) {
        document.fire('beforedomready');
        document.fire('domready');
        document.fire('afterdomready');
      } else {
        setTimeout(doBodyCheck, 10);
      }
    };
    triggerDomReadyEvent = function(_, domIsReady) {
      // http://bugs.jquery.com/ticket/5443
      if (doBodyCheck && (domIsReady || document.readyState === 'complete')) {
        document.detachEvent('onreadystatechange', triggerDomReadyEvent);
        window.detachEvent('onload', triggerDomReadyEvent);
        doBodyCheck();
        // 避免多次触发。
        doBodyCheck = null;
      }
    };
    document.attachEvent('onreadystatechange', triggerDomReadyEvent);
    window.attachEvent('onload', triggerDomReadyEvent);
    // http://javascript.nwbox.com/IEContentLoaded/
    if (window == top && html.doScroll) {
      var doScrollCheck = function() {
        try {
          html.doScroll('left');
        } catch (e) {
          setTimeout(doScrollCheck, 10);
          return;
        }
        triggerDomReadyEvent(null, true);
      };
      doScrollCheck();
    }
  }

//--------------------------------------------------[document.$]
  /**
   * 根据指定的参数获取/创建一个元素，并对其进行扩展。
   * @name document.$
   * @function
   * @param {string|Element} e 不同类型的元素表示。
   * @returns {Element} 扩展后的元素。
   * @description
   *   <ul>
   *     <li>当参数为一个元素（可以包含后代元素）的序列化之后的字符串时，会返回扩展后的、根据这个字符串反序列化的元素。<br>注意：不要使用本方法创建 SCRIPT 元素，对于动态载入外部脚本文件的需求，应使用 document.loadScript 方法。</li>
   *     <li>当参数为一个 CSS 选择符时，会返回扩展后的、与指定的 CSS 选择符相匹配的<strong>第一个元素</strong>。<br>如果没有找到任何元素，返回 null。</li>
   *     <li>当参数为一个元素时，会返回扩展后的该元素。</li>
   *     <li>当参数为其他值（包括 document 和 window）时，均返回 null。</li>
   *   </ul>
   * @see http://jquery.com/
   * @see http://mootools.net/
   * @see http://w3help.org/zh-cn/causes/SD9003
   */
  var tagNamePattern = /(?!<)\w*/;
  // 为解决“IE 可能会自动添加 TBODY 元素”的问题，在相应的 wrappers 里预置了一个 TBODY。
  var wrappers = {
    area: ['<map>', '</map>'],
    legend: ['<fieldset>', '</fieldset>'],
    optgroup: ['<select>', '</select>'],
    colgroup: ['<table><tbody></tbody>', '</table>'],
    col: ['<table><tbody></tbody><colgroup>', '</colgroup></table>'],
    tr: ['<table><tbody>', '</tbody></table>'],
    th: ['<table><tbody><tr>', '</tr></tbody></table>']
  };
  wrappers.option = wrappers.optgroup;
  wrappers.caption = wrappers.thead = wrappers.tfoot = wrappers.tbody = wrappers.colgroup;
  wrappers.td = wrappers.th;
  if (navigator.isIElt9) {
    // IE6 IE7 IE8 对 LINK STYLE SCRIPT 元素的特殊处理。
    wrappers.link = wrappers.style = wrappers.script = ['#', ''];
  }
  var defaultWrapper = ['', ''];
  // 忽略“IE 丢失源代码前的空格”的问题，通过脚本修复这个问题无实际意义（需要深度遍历）。
  // 忽略“脚本不会在动态创建并插入文档树后自动执行”的问题，因为这个处理需要封装追加元素的相关方法，并且还需要考虑脚本的 defer 属性在各浏览器的差异。
  window.$ = document.$ = function(e) {
    var element = null;
    if (typeof e === 'string') {
      if (e.charAt(0) === '<' && e.charAt(e.length - 1) === '>') {
        var tagName = tagNamePattern.exec(e)[0].toLowerCase();
        var wrapper = wrappers[tagName] || defaultWrapper;
        element = document.createElement('div');
        element.innerHTML = wrapper[0] + e + wrapper[1];
        while ((element = element.lastChild) && element.nodeName.toLowerCase() !== tagName) {
        }
        if (element && element.nodeType !== 1) {
          element = null;
        }
      } else {
        element = Sizzle(e)[0];
      }
    } else if (e && e.nodeType === 1) {
      element = e;
    }
    return $(element);
  };

//--------------------------------------------------[document.addStyleRules]
  /**
   * 添加样式规则。
   * @name document.addStyleRules
   * @function
   * @param {Array} rules 包含样式规则的数组，其中每一项为一条规则。
   */
  var dynamicStyleSheet;
  document.addStyleRules = function(rules) {
    if (!dynamicStyleSheet) {
      document.head.appendChild(document.createElement('style'));
      var styleSheets = document.styleSheets;
      dynamicStyleSheet = styleSheets[styleSheets.length - 1];
    }
    rules.forEach(function(rule) {
      if (dynamicStyleSheet.insertRule) {
        dynamicStyleSheet.insertRule(rule, dynamicStyleSheet.cssRules.length);
      } else {
        var lBraceIndex = rule.indexOf('{');
        var rBraceIndex = rule.indexOf('}');
        var selectors = rule.slice(0, lBraceIndex);
        var declarations = rule.slice(lBraceIndex + 1, rBraceIndex);
        selectors.split(separator).forEach(function(selector) {
          dynamicStyleSheet.addRule(selector, declarations);
        });
      }
    });
  };

//--------------------------------------------------[document.loadScript]
  /**
   * 加载脚本。
   * @name document.loadScript
   * @function
   * @param {string} url 脚本文件的路径。
   * @param {Object} [options] 可选参数。
   * @param {string} [options.charset] 脚本文件的字符集。
   * @param {Function} [options.onLoad] 加载完毕后的回调。
   *   该函数被调用时 this 的值为加载本脚本时创建的 SCRIPT 元素。
   */
  document.loadScript = function(url, options) {
    options = options || {};
    var head = document.head;
    var script = document.createElement('script');
    if (options.charset) {
      script.charset = options.charset;
    }
    script.src = url;
    script.onload = script.onreadystatechange = function() {
      if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
        this.onload = this.onreadystatechange = null;
        head.removeChild(script);
        if (options.onLoad) {
          options.onLoad.call(this);
        }
      }
    };
    // http://bugs.jquery.com/ticket/2709
    head.insertBefore(script, head.firstChild);
  };

//--------------------------------------------------[document.preloadImages]
  /**
   * 预加载图片。
   * @name document.preloadImages
   * @function
   * @param {Array} urlArray 包含需预加载的图片路径的数组。
   * @param {Function} [onLoad] 每个图片加载完毕后的回调。
   *   该函数被调用时 this 的值为已完成加载的 IMG 元素。
   */
  document.preloadImages = function(urlArray, onLoad) {
    urlArray.forEach(function(url) {
      var img = new Image();
      if (onLoad) {
        img.onload = function() {
          img.onload = null;
          onLoad.call(img);
        };
      }
      img.src = url;
    });
  };

//==================================================[Element 补缺 - 解决 IE6 IE7 没有元素构造器的问题]
//--------------------------------------------------[Element]
  /**
   * 确保 Element.prototype 可访问。
   * @name Element
   * @namespace
   */
  var Element = window.Element || (window.Element = {prototype: {}});

//--------------------------------------------------[HTMLFormElement]
  /**
   * 确保 HTMLFormElement.prototype 可访问。
   * @name HTMLFormElement
   * @namespace
   */
  var HTMLFormElement = window.HTMLFormElement || (window.HTMLFormElement = {prototype: {}});

//--------------------------------------------------[$ <内部方法>]
  /**
   * 为一个元素扩展新特性，对于没有 Element 构造器的浏览器（IE6 IE7），将对应特性直接附加在该元素的实例上。
   * @name $
   * @function
   * @private
   * @param {Element} element 要扩展的元素。
   *   内部调用时，只可能传入 Element、document（事件对象的 target 属性）或 null。
   * @returns {Element} 扩展后的元素。
   */
  // 唯一识别码，元素上有 uid 属性表示该元素已被扩展，uid 属性的值将作为该元素的 key 使用。
  var uid = 0;
  var prototypeOfElement = Element.prototype;
  var prototypeOfHTMLFormElement = HTMLFormElement.prototype;
  var $ = navigator.isIElt8 ? function(element) {
    if (element && !element.uid) {
      element.uid = ++uid;
      // Object.mixin(element, prototypeOfElement);
      // 使用以下方式附加新属性以降低开销。此处不必判断 hasOwnProperty，也无需考虑 hasDontEnumBug 的问题。
      var property;
      for (property in prototypeOfElement) {
        element[property] = prototypeOfElement[property];
      }
      switch (element.nodeName) {
        case 'FORM':
          for (property in prototypeOfHTMLFormElement) {
            element[property] = prototypeOfHTMLFormElement[property];
          }
          break;
      }
    }
    return element;
  } : function(element) {
    if (element && !element.uid) {
      element.uid = ++uid;
    }
    return element;
  };

//==================================================[Element 补缺 - 常用属性和方法]
  /*
   * 为不支持某些特性的浏览器添加这些特性。
   *
   * 补缺属性：
   *   document.head
   *   HTMLElement.prototype.outerHTML
   *   HTMLElement.prototype.innerText
   *   HTMLElement.prototype.outerText
   *
   * 补缺方法：
   *   HTMLElement.prototype.insertAdjacentText
   *   HTMLElement.prototype.insertAdjacentElement
   *   Element.prototype.compareDocumentPosition
   *   Element.prototype.contains
   */

//--------------------------------------------------[document.head]
  // 为 IE6 IE7 IE8 添加 document.head 属性。
  /**
   * 获取文档的 HEAD 元素。
   * @name head
   * @memberOf document
   * @type Element
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

//--------------------------------------------------[HTMLElement.prototype.outerHTML]
  // 为 Firefox 添加 HTMLElement.prototype.outerHTML 属性。
  // Firefox 11.0 开始支持 outerHTML 了。
  /*
   * 获取/设置本元素（包含后代节点在内）的序列化字符串。
   * @name Element.prototype.outerHTML
   * @type string
   * @description
   *   注意：getter 在处理空标签及特殊字符时，各浏览器的行为不一致。
   */
//  if (!('outerHTML' in html)) {
//    var emptyElementPattern = /^(area|base|br|col|embed|hr|img|input|link|meta|param|command|keygen|source|track|wbr)$/;
//    var isEmptyElement = function(nodeName) {
//      return emptyElementPattern.test(nodeName);
//    };
//
//    HTMLElement.prototype.__defineGetter__('outerHTML', function() {
//      var nodeName = this.nodeName.toLowerCase();
//      var html = '<' + nodeName;
//      var attributes = this.attributes;
//      var attribute;
//      var i = 0;
//      while (attribute = attributes[i++]) {
//        if (attribute.specified) {
//          html += ' ' + attribute.name + '="' + attribute.value + '"';
//        }
//        i++;
//      }
//      if (isEmptyElement(nodeName)) {
//        html += '>';
//      } else {
//        html += '>' + this.innerHTML + '</' + nodeName + '>';
//      }
//      return html;
//    });
//    HTMLElement.prototype.__defineSetter__('outerHTML', function(html) {
//      var range = document.createRange();
//      range.setStartBefore(this);
//      this.parentNode.replaceChild(range.createContextualFragment(html), this);
//      return html;
//    });
//  }

//--------------------------------------------------[HTMLElement.prototype.innerText]
  // 为 Firefox 添加 HTMLElement.prototype.innerText 属性。
  /**
   * 获取/设置本元素内的文本信息。
   * @name Element.prototype.innerText
   * @type string
   * @description
   *   注意：getter 在处理 BR 元素或换行符时，各浏览器的行为不一致。
   */
  if (!('innerText' in html)) {
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
   *   与 innerText 不同，如果设置一个元素的 outerText，那么设置的字符串将作为文本节点替换本元素在文档树中的位置。
   *   注意：getter 在处理 BR 元素或换行符时，各浏览器的行为不一致。
   */
  if (!('outerText' in html)) {
    HTMLElement.prototype.__defineGetter__('outerText', function() {
      return this.textContent;
    });
    HTMLElement.prototype.__defineSetter__('outerText', function(text) {
      var textNode = document.createTextNode(text);
      this.parentNode.replaceChild(textNode, this);
      return text;
    });
  }

//--------------------------------------------------[HTMLElement.prototype.insertAdjacentText]
  // 为 Firefox 添加 HTMLElement.prototype.insertAdjacentText 属性。
  /**
   * 在本元素的指定位置插入文本。
   * @name Element.prototype.insertAdjacentText
   * @function
   * @param {string} position 要插入的位置，可选值请参考下表。
   *   <table>
   *     <tr><th>可选值</th><th>含义</th></tr>
   *     <tr><td><dfn>beforeBegin</dfn></td><td>将文本插入到本元素之前。</td></tr>
   *     <tr><td><dfn>afterBegin</dfn></td><td>将文本插入到本元素的所有内容之前。</td></tr>
   *     <tr><td><dfn>beforeEnd</dfn></td><td>将文本插入到本元素的所有内容之后。</td></tr>
   *     <tr><td><dfn>afterEnd</dfn></td><td>将文本插入到本元素之后。</td></tr>
   *   </table>
   * @param {Element} text 要插入的文本。
   */
  if (!('insertAdjacentText' in html)) {
    HTMLElement.prototype.insertAdjacentText = function(position, text) {
      switch (position.toLowerCase()) {
        case 'beforebegin':
        case 'afterbegin':
        case 'beforeend':
        case 'afterend':
          this.insertAdjacentElement(position, document.createTextNode(text));
          break;
        default:
          throw new Error('Invalid position "' + position + '"');
      }
    };
  }

//--------------------------------------------------[HTMLElement.prototype.insertAdjacentElement]
  // 为 Firefox 添加 HTMLElement.prototype.insertAdjacentElement 属性。
  /**
   * 在本元素的指定位置插入目标元素。
   * @name Element.prototype.insertAdjacentElement
   * @function
   * @param {string} position 要插入的位置，可选值请参考下表。
   *   <table>
   *     <tr><th>可选值</th><th>含义</th></tr>
   *     <tr><td><dfn>beforeBegin</dfn></td><td>将目标元素插入到本元素之前。</td></tr>
   *     <tr><td><dfn>afterBegin</dfn></td><td>将目标元素插入到本元素的所有内容之前。</td></tr>
   *     <tr><td><dfn>beforeEnd</dfn></td><td>将目标元素插入到本元素的所有内容之后。</td></tr>
   *     <tr><td><dfn>afterEnd</dfn></td><td>将目标元素插入到本元素之后。</td></tr>
   *   </table>
   * @param {Element} target 目标元素。
   * @returns {Element} 目标元素。
   */
  if (!('insertAdjacentElement' in html)) {
    HTMLElement.prototype.insertAdjacentElement = function(position, target) {
      var parent;
      switch (position.toLowerCase()) {
        case 'beforebegin':
          if (parent = this.parentNode) {
            parent.insertBefore(target, this);
          }
          break;
        case 'afterbegin':
          this.insertBefore(target, this.firstChild);
          break;
        case 'beforeend':
          this.appendChild(target);
          break;
        case 'afterend':
          if (parent = this.parentNode) {
            parent.insertBefore(target, this.nextSibling);
          }
          break;
        default:
          throw new Error('Invalid position "' + position + '"');
      }
      return target;
    };
  }

//--------------------------------------------------[Element.prototype.compareDocumentPosition]
  // 为 IE6 IE7 IE8 添加 Element.prototype.compareDocumentPosition 方法。
  /**
   * 比较本元素和目标元素在文档树中的位置关系。
   * @name Element.prototype.compareDocumentPosition
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
  if (!('compareDocumentPosition' in html)) {
    Element.prototype.compareDocumentPosition = function(target) {
      return (this !== target && this.contains(target) && 16) +
          (this !== target && target.contains(this) && 8) +
          (this.sourceIndex >= 0 && target.sourceIndex >= 0 ?
              (this.sourceIndex < target.sourceIndex && 4) + (this.sourceIndex > target.sourceIndex && 2) :
              1) +
          0;
    };
  }

//--------------------------------------------------[Element.prototype.contains]
  // 目前所有浏览器都支持本方法。
  /**
   * 判断本元素是否包含目标元素。
   * @name Element.prototype.contains
   * @function
   * @param {Element} target 目标元素。
   * @returns {boolean} 判断结果。
   * @description
   *   注意，如果本元素和目标元素一致，本方法也将返回 true。
   */
//  if (!('contains' in html)) {
//    Element.prototype.contains = function(target) {
//      return (this === target || !!(this.compareDocumentPosition(target) & 16));
//    };
//  }

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
   * 检查本元素是否有指定的类名。
   * @name Element.prototype.hasClass
   * @function
   * @param {string} className 类名，如果要同时指定多个类名，使用逗号将它们分开即可。
   * @returns {boolean} 检查结果。
   */
  Element.prototype.hasClass = function(className) {
    var elementClassName = ' ' + this.className.clean() + ' ';
    return className.split(separator).every(function(className) {
      return elementClassName.contains(' ' + className.trim() + ' ');
    });
  };

//--------------------------------------------------[Element.prototype.addClass]
  /**
   * 为本元素添加指定的类名。
   * @name Element.prototype.addClass
   * @function
   * @param {string} className 类名，如果要同时指定多个类名，使用逗号将它们分开即可。
   * @returns {Element} 本元素。
   */
  Element.prototype.addClass = function(className) {
    var $element = this;
    className.split(separator).forEach(function(className) {
      if (!$element.hasClass(className)) {
        $element.className = ($element.className + ' ' + className).clean();
      }
    });
    return $element;
  };

//--------------------------------------------------[Element.prototype.removeClass]
  /**
   * 为本元素删除指定的类名。
   * @name Element.prototype.removeClass
   * @function
   * @param {string} className 类名，如果要同时指定多个类名，使用逗号将它们分开即可。
   * @returns {Element} 本元素。
   */
  Element.prototype.removeClass = function(className) {
    var $element = this;
    var elementClassName = ' ' + $element.className.clean() + ' ';
    className.split(separator).forEach(function(className) {
      elementClassName = elementClassName.replace(' ' + className.trim() + ' ', ' ');
    });
    $element.className = elementClassName.trim();
    return $element;
  };

//--------------------------------------------------[Element.prototype.toggleClass]
  /**
   * 如果本元素没有指定的类名，则添加指定的类名，否则删除指定的类名。
   * @name Element.prototype.toggleClass
   * @function
   * @param {string} className 类名，如果要同时指定多个类名，使用逗号将它们分开即可。
   * @returns {Element} 本元素。
   */
  Element.prototype.toggleClass = function(className) {
    var $element = this;
    className.split(separator).forEach(function(className) {
      $element[$element.hasClass(className) ? 'removeClass' : 'addClass'](className);
    });
    return $element;
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

  // 获取特殊 CSS 特性的值，只有 IE6 IE7 IE8 需要。
  var specialCSSPropertyGetter = {
    'float': function($element) {
      return $element.currentStyle.styleFloat;
    },
    'opacity': function($element) {
      return $element.filters.alpha ? String($element.filters.alpha.opacity / 100) : '1';
    }
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

  //修复 IE6 不支持固定定位的问题。
  /*
   * 修复 IE6 不支持 position: fixed 的问题。
   *
   * 注意：
   *   目前仅考虑 direction: ltr 的情况，并且不支持嵌套使用 position: fixed。事实上这两点不会影响现有的绝大部分需求。
   *   目前仅支持在 left right top bottom 上使用像素长度来设置偏移量。修复后，目标元素的样式中有 left 则 right 失效，有 top 则 bottom 失效。
   *   因此要保证兼容，在应用中设置 position: fixed 的元素应有明确的尺寸设定，并只使用（left right top bottom）的（像素长度）来定位，否则在 IE6 中的表现会有差异。
   *
   * 处理流程：
   *   position 的修改 = 启用/禁用修复，如果已启用修复，并且 display 不是 none，则同时启用表达式。
   *   display 的修改 = 如果已启用修复，则启用/禁用表达式。
   *   left/right/top/bottom 的修改 = 如果已启用修复，则调整 specifiedValue。如果已启用表达式，则更新表达式。
   *   由于 IE6 设置为 position: absolute 的元素的 right bottom 定位与 BODY 元素的 position 有关，并且表现怪异，因此设置表达式时仍使用 left top 实现。
   *   这样处理的附加好处是不必在每次更新表达式时启用/禁用设置在 right bottom 上的表达式。
   *
   * 参考：
   *   http://www.qianduan.net/fix-ie6-dont-support-position-fixed-bug.html
   *
   * 实测结果：
   *   X = 页面背景图片固定，背景图直接放在 HTML 上即可，若要放在 BODY 上，还要加上 background-attachment: fixed。
   *   A = 为元素添加 CSS 表达式。
   *   B = 为元素添加事件监听器，在监听器中修改元素的位置。
   *   X + A 可行，X + B 不可行。
   */
  if (navigator.isIE6) {
    // 保存已修复的元素的偏移量及是否启用的数据。
    /*
     * <Object fixedData> {
     *   left: <Object> {
     *     specifiedValue: <string specifiedValue>,
     *     usedValue: <number usedValue>
     *   },
     *   right: <Object> {
     *     specifiedValue: <string specifiedValue>,
     *     usedValue: <number usedValue>
     *   },
     *   top: <Object> {
     *     specifiedValue: <string specifiedValue>,
     *     usedValue: <number usedValue>
     *   },
     *   bottom: <Object> {
     *     specifiedValue: <string specifiedValue>,
     *     usedValue: <number usedValue>
     *   },
     *   enabled: <boolean enabled>
     * }
     */

    // 设置页面背景。
    html.style.backgroundImage = 'url(about:blank)';

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
    };

    // 删除 CSS 表达式。
    var removeExpressions = function($element) {
      $element.style.removeExpression('left');
      $element.style.removeExpression('top');
    };

    // IE6 获取 position 特性时的特殊处理。
    specialCSSPropertyGetter.position = function($element) {
      return $element._fixedData_ ? 'fixed' : $element.currentStyle.position;
    };

    // IE6 设置 position 特性时的特殊处理。
    specialCSSPropertySetter.position = function($element, propertyValue) {
      // 本元素的偏移量数据，如果未启用修复则不存在。
      var fixedData = $element._fixedData_;
      if (propertyValue.toLowerCase() === 'fixed') {
        // 设置固定定位。
        if (!fixedData) {
          // 启用修复。
          fixedData = $element._fixedData_ = {left: {}, right: {}, top: {}, bottom: {}, enabled: false};
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
          if (isNaN(fixedData.left.usedValue) && isNaN(fixedData.right.usedValue)) {
            fixedData.left.usedValue = html.scrollLeft + $element.getClientRect().left - (parseInt($element.currentStyle.marginLeft, 10) || 0);
          }
          if (isNaN(fixedData.top.usedValue) && isNaN(fixedData.bottom.usedValue)) {
            fixedData.top.usedValue = html.scrollTop + $element.getClientRect().top - (parseInt($element.currentStyle.marginTop, 10) || 0);
          }
          // 如果元素已被渲染（暂不考虑祖先级元素未被渲染的情况），启用表达式。
          if ($element.currentStyle.display !== 'none') {
            fixedData.enabled = true;
            setExpressions($element, fixedData);
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
          $element.removeAttribute('_fixedData_');
        }
      }
      // 设置样式。
      $element.style.position = propertyValue;
    };

    // IE6 设置 display 特性时的特殊处理。
    specialCSSPropertySetter.display = function($element, propertyValue) {
      var fixedData = $element._fixedData_;
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

    // IE6 获取 left/right/top/bottom 特性时的特殊处理。
    var getOffset = function($element, propertyName) {
      var fixedData = $element._fixedData_;
      return fixedData ? fixedData[propertyName].specifiedValue : $element.currentStyle[propertyName];
    };

    // IE6 设置 left/right/top/bottom 特性时的特殊处理。
    var setOffset = function($element, propertyName, propertyValue) {
      var fixedData = $element._fixedData_;
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

    ['left', 'right', 'top', 'bottom'].forEach(function(side) {
      specialCSSPropertyGetter[side] = function($element) {
        return getOffset($element, side);
      };
      specialCSSPropertySetter[side] = function($element, propertyValue) {
        setOffset($element, side, propertyValue);
      };
    });

    // 在 IE6 中使用 CSS Expression 自动处理固定定位。
    document.addStyleRules(['* { behavior: expression(document.fixIE6Styles(this)); }']);
//    window.fixCount = 0;
    document.fixIE6Styles = function(element) {
//      window.fixCount++;
      if (element.currentStyle.position === 'fixed') {
        element.currentStyleDisplayValue = element.currentStyle.display;
        element.style.display = 'none';
        setTimeout(function() {
          element.style.display = element.currentStyleDisplayValue;
          if (element.currentStyle.position === 'fixed') {
            $(element).setStyle('position', 'fixed');
          }
        }, 0);
      }
      element.style.behavior = 'none';
    };

  }

//--------------------------------------------------[Element.prototype.getStyle]
  /**
   * 获取本元素的“计算后的样式”中某个特性的值。
   * @name Element.prototype.getStyle
   * @function
   * @param {string} propertyName 特性名（不支持复合特性），应使用 camel case 格式。
   * @returns {string} 对应的特性值，如果获取的是长度值，其单位未必是 px，可能是其定义时的单位。
   * @description
   *   注意：不要尝试获取未插入文档树的元素的“计算后的样式”，它们存在兼容性问题。
   */
  Element.prototype.getStyle = 'getComputedStyle' in window ? function(propertyName) {
    return window.getComputedStyle(this, null).getPropertyValue(propertyName.dasherize()) || '';
  } : function(propertyName) {
    var getSpecialCSSProperty = specialCSSPropertyGetter[propertyName];
    return (getSpecialCSSProperty ? getSpecialCSSProperty(this) : this.currentStyle[propertyName]) || '';
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
    var element = this;
    var styles = {};
    propertyNames.forEach(function(propertyName) {
      styles[propertyName] = element.getStyle(propertyName);
    });
    return styles;
  };

//--------------------------------------------------[Element.prototype.setStyle]
  /**
   * 为本元素设置一条行内样式声明。
   * @name Element.prototype.setStyle
   * @function
   * @param {string} propertyName 特性名（支持复合特性），应使用 camel case 格式。
   * @param {number|string} propertyValue 特性值，若为数字，则为期望长度单位的特性值自动添加长度单位 'px'。
   * @returns {Element} 本元素。
   * @description
   *   注意：如果设置的是长度值，若长度单位不是 'px' 则不能省略长度单位。
   */
  Element.prototype.setStyle = function(propertyName, propertyValue) {
    if (Number.isFinite(propertyValue) && !numericValues[propertyName]) {
      propertyValue = Math.floor(propertyValue) + 'px';
    }
    var setSpecialCSSProperty = specialCSSPropertySetter[propertyName];
    if (setSpecialCSSProperty) {
      setSpecialCSSProperty(this, propertyValue);
    } else {
      this.style[propertyName] = propertyValue;
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

//==================================================[Element 扩展 - 处理自定义数据]
  /*
   * 获取/添加/删除元素的自定义数据。
   *
   * 扩展方法：
   *   Element.prototype.getData
   *   Element.prototype.setData
   *   Element.prototype.removeData
   */

  var validNamePattern = /^[a-z][a-zA-Z]*$/;
  var parseDataKey = function(key) {
    return validNamePattern.test(key) ? 'data-' + key.dasherize() : '';
  };

//--------------------------------------------------[Element.prototype.getData]
  /**
   * 从本元素中读取一条自定义数据。
   * @name Element.prototype.getData
   * @function
   * @param {string} key 数据名。
   * @returns {string} 数据值。
   *   如果指定的数据名不存在，返回 undefined。
   * @see http://www.w3.org/TR/html5/global-attributes.html#embedding-custom-non-visible-data-with-the-data-attributes
   */
  Element.prototype.getData = 'dataset' in html ? function(key) {
    return this.dataset[key];
  } : function(key) {
    key = parseDataKey(key);
    var value = this.getAttribute(key);
    return typeof value === 'string' ? value : undefined;
  };

//--------------------------------------------------[Element.prototype.setData]
  /**
   * 向本元素中保存一条自定义数据。
   * @name Element.prototype.setData
   * @function
   * @param {string} key 数据名，必须为 camel case 形式，并且只能包含英文字母。
   * @param {string} value 数据值，必须为字符串。
   * @returns {Element} 本元素。
   */
  Element.prototype.setData = function(key, value) {
    key = parseDataKey(key);
    if (key) {
      this.setAttribute(key, String(value));
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
   *   注意：IE6 IE7 在 removeAttribute 时，key 参数是大小写敏感的。
   */
  Element.prototype.removeData = function(key) {
    key = parseDataKey(key);
    if (key) {
      this.removeAttribute(key);
    }
    return this;
  };

//==================================================[Element 扩展 - 获取坐标信息]
  /*
   * 获取元素在视口中的坐标信息。
   *
   * 扩展方法：
   *   Element.prototype.getClientRect
   */

//--------------------------------------------------[Element.prototype.getClientRect]
  /*
   * [2009 年的测试结果 (body's direction = ltr)]
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
   * body.clientLeft 的值取决于 BODY 的 border 属性，如果未设置 BODY 的 border 属性，则 BODY 会继承 HTML 的 border 属性。如果 HTML 的 border 也未设置，则 HTML 的 border 默认值为 medium，计算出来是 2px。
   * 标准模式下，IE6 IE7 减去 html.clientLeft 的值即可得到准确结果。
   * html.clientLeft 在 IE6 中取决于 HTML 的 border 属性，而在 IE7 中的值则始终为 2px。
   *
   * [特殊情况]
   * IE7(IE9 模拟) 的 BODY 的计算样式 direction: rtl 时，如果 HTML 设置了边框，则横向坐标获取仍不准确。由于极少出现这种情况，此处未作处理。
   */
  /**
   * 获取本元素的 border-box 在视口中的坐标信息。
   * @name Element.prototype.getClientRect
   * @function
   * @returns {Object} 包含位置（left、right、top、bottom）及尺寸（width、height）的对象，所有属性值均为 number 类型，单位为像素。
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

//==================================================[Element 扩展 - 遍历文档树]
  /*
   * 获取文档树中的元素或一个元素与文档树相关的信息。
   *
   * 扩展方法：
   *   Element.prototype.getParent
   *   Element.prototype.getPreviousSibling
   *   Element.prototype.getNextSibling
   *   Element.prototype.getFirstChild
   *   Element.prototype.getLastChild
   *   Element.prototype.getChildren
   *   Element.prototype.getChildCount
   *   Element.prototype.find
   *   Element.prototype.findAll
   *   Element.prototype.matchesSelector
   *
   * 参考：
   *   http://www.w3.org/TR/ElementTraversal/#interface-elementTraversal
   *   http://www.w3.org/TR/selectors-api2/
   *   http://www.quirksmode.org/dom/w3c_core.html
   *   https://github.com/jquery/sizzle/wiki/Sizzle-Home
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
    if (element.nodeType !== 1) {
      element = null;
    }
    return $(element);
  };

//--------------------------------------------------[Element.prototype.getPreviousSibling]
  /**
   * 获取与本元素相邻的上一个元素。
   * @name Element.prototype.getPreviousSibling
   * @function
   * @returns {Element} 与本元素相邻的上一个元素。
   */
  Element.prototype.getPreviousSibling = 'previousElementSibling' in html ? function() {
    return $(this.previousElementSibling);
  } : function() {
    var element = this;
    while ((element = element.previousSibling) && element.nodeType !== 1) {
    }
    return $(element);
  };

//--------------------------------------------------[Element.prototype.getNextSibling]
  /**
   * 获取与本元素相邻的下一个元素。
   * @name Element.prototype.getNextSibling
   * @function
   * @returns {Element} 与本元素相邻的下一个元素。
   */
  Element.prototype.getNextSibling = 'nextElementSibling' in html ? function() {
    return $(this.nextElementSibling);
  } : function() {
    var element = this;
    while ((element = element.nextSibling) && element.nodeType !== 1) {
    }
    return $(element);
  };

//--------------------------------------------------[Element.prototype.getFirstChild]
  /**
   * 获取本元素的第一个子元素。
   * @name Element.prototype.getFirstChild
   * @function
   * @returns {Element} 本元素的第一个子元素。
   */
  Element.prototype.getFirstChild = 'firstElementChild' in html ? function() {
    return $(this.firstElementChild);
  } : function() {
    var element = this.firstChild;
    while (element && element.nodeType !== 1 && (element = element.nextSibling)) {
    }
    return $(element);
  };

//--------------------------------------------------[Element.prototype.getLastChild]
  /**
   * 获取本元素的最后一个子元素。
   * @name Element.prototype.getLastChild
   * @function
   * @returns {Element} 本元素的最后一个子元素。
   */
  Element.prototype.getLastChild = 'lastElementChild' in html ? function() {
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
   * @returns {Array} 包含本元素的所有子元素的数组，数组内各元素的顺序为调用本方法时各元素在文档树中的顺序。
   */
  Element.prototype.getChildren = function() {
    var children = [];
    var $element = this.getFirstChild();
    while ($element) {
      children.push($element);
      $element = $element.getNextSibling();
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

//--------------------------------------------------[Element.prototype.find]
  /**
   * 在本元素的后代元素中，根据指定的选择符查找符合条件的第一个元素。
   * @name Element.prototype.find
   * @function
   * @param {string} selector 选择符。
   * @returns {Element} 查找到的元素。
   *   如果没有找到任何元素，返回 null。
   * @see http://www.w3.org/TR/selectors-api2/
   * @see https://github.com/jquery/sizzle/wiki/Sizzle-Home
   */
  Element.prototype.find = function(selector) {
    return $(Sizzle(selector, this)[0] || null);
  };

//--------------------------------------------------[Element.prototype.findAll]
  /**
   * 在本元素的后代元素中，根据指定的选择符查找符合条件的所有元素。
   * @name Element.prototype.findAll
   * @function
   * @param {string} selector 选择符。
   * @returns {Array} 包含查找到的元素的数组。
   *   如果没有找到任何元素，返回空数组。
   * @see http://www.w3.org/TR/selectors-api2/
   * @see https://github.com/jquery/sizzle/wiki/Sizzle-Home
   */
  Element.prototype.findAll = function(selector) {
    return Sizzle(selector, this).map(function(element) {
      return $(element);
    });
  };

//--------------------------------------------------[Element.prototype.matchesSelector]
  /**
   * 检查本元素是否能被指定的选择符选中。
   * @name Element.prototype.matchesSelector
   * @function
   * @param {string} selector 选择符。
   * @returns {boolean} 检查结果。
   * @see http://www.w3.org/TR/selectors-api2/
   * @see https://github.com/jquery/sizzle/wiki/Sizzle-Home
   */
  Element.prototype.matchesSelector = function(selector) {
    return Sizzle.matchesSelector(this, selector);
  };

//==================================================[Element 扩展 - 修改文档树]
  /*
   * 修改文档树的结构。
   *
   * 扩展方法：
   *   Element.prototype.clone
   *   Element.prototype.insertTo
   *   Element.prototype.swap
   *   Element.prototype.replace
   *   Element.prototype.remove
   *   Element.prototype.empty
   */

//--------------------------------------------------[Element.prototype.clone]
  /**
   * 克隆本元素。
   * @name Element.prototype.clone
   * @function
   * @param {boolean} [recursively] 是否进行深克隆。
   * @param {boolean} [keepListeners] 是否保留本元素及后代元素上的所有事件监听器。
   * @returns {Element} 克隆后的元素。
   * @description
   *   如果本元素有 id 属性，需注意克隆元素的 id 属性将与之有相同的值，必要时应进一步处理。
   *   不要克隆包含脚本的元素，以免出现兼容性问题。
   *   不要克隆包含样式表的元素，以免最终样式不符合预期。
   * @see http://jquery.com/
   * @see http://mootools.net/
   * @see http://w3help.org/zh-cn/causes/SD9029
   */
  Element.prototype.clone = function(recursively, keepListeners) {
    var clonedElement = this.cloneNode(recursively);
    var originalElements = [this];
    var clonedElements = [clonedElement];
    if (recursively) {
      originalElements = originalElements.concat(Array.from(this.getElementsByTagName('*')));
      clonedElements = clonedElements.concat(Array.from(clonedElement.getElementsByTagName('*')));
    }
    originalElements.forEach(function(original, index) {
      var cloned = clonedElements[index];
      // http://bugs.jquery.com/ticket/9587
      if (cloned) {
        // 在 IE6 IE7 IE8 中使用 cloneNode 克隆的节点，会将本元素上使用 attachEvent 添加的事件监听器也一并克隆。
        // 并且在克隆元素上调用 detachEvent 删除这些监听器时，本元素上的监听器也将被一并删除。
        // 使用以下方法为 IE6 IE7 IE8 清除已添加的事件监听器，并清除可能存在的 uid 属性。
        if (navigator.isIElt9) {
          cloned.clearAttributes();
          cloned.mergeAttributes(original);
          cloned.removeAttribute('uid');
        }
        // 针对特定元素的处理。
        switch (cloned.nodeName) {
          case 'OBJECT':
            // IE6 IE7 IE8 无法克隆使用 classid 来标识内容类型的 OBJECT 元素的子元素。IE9 还有另外的问题：
            // http://bugs.jquery.com/ticket/10324
            cloned.outerHTML = original.outerHTML;
            break;
          case 'INPUT':
          case 'TEXTAREA':
            // 一些表单元素的状态可能未被正确克隆，克隆的表单元素将以这些元素的默认状态为当前状态。
            if (cloned.type === 'radio' || cloned.type === 'checkbox') {
              cloned.checked = cloned.defaultChecked = original.defaultChecked;
            }
            cloned.value = cloned.defaultValue = original.defaultValue;
            break;
          case 'OPTION':
            cloned.selected = cloned.defaultSelected = original.defaultSelected;
            break;
        }
        // 处理事件。
        if (keepListeners) {
          var item = eventHandlers[original.uid];
          if (item) {
            var $cloned = $(cloned);
            Object.forEach(item, function(handlers) {
              handlers.forEach(function(handler) {
                $cloned.on(handler.name, handler.listener);
              });
            });
          }
        }
      }
    });
    return $(clonedElement);
  };

//--------------------------------------------------[Element.prototype.insertTo]
  /**
   * 将本元素插入到目标元素的指定位置。
   * @name Element.prototype.insertTo
   * @function
   * @param {Element} target 目标元素。
   * @param {string} [position] 要插入的位置，可选值请参考下表。
   *   <table>
   *     <tr><th>可选值</th><th>含义</th></tr>
   *     <tr><td><dfn>beforeBegin</dfn></td><td>将本元素插入到目标元素之前。</td></tr>
   *     <tr><td><dfn>afterBegin</dfn></td><td>将本元素插入到目标元素的所有内容之前。</td></tr>
   *     <tr><td><dfn>beforeEnd</dfn></td><td>将本元素插入到目标元素的所有内容之后。</td></tr>
   *     <tr><td><dfn>afterEnd</dfn></td><td>将本元素插入到目标元素之后。</td></tr>
   *   </table>
   *   如果该参数被省略，则使用 <dfn>beforeEnd</dfn> 作为默认值。
   * @returns {Element} 本元素。
   */
  Element.prototype.insertTo = function(target, position) {
    position = position || 'beforeEnd';
    return target.insertAdjacentElement(position, this);
  };

//--------------------------------------------------[Element.prototype.swap]
  /**
   * 交换本元素和目标元素的位置。
   * @name Element.prototype.swap
   * @function
   * @param {Element} target 目标元素。
   * @returns {Element} 本元素。
   */
  Element.prototype.swap = 'swapNode' in html ? function(target) {
    return this.swapNode(target);
  } : function(target) {
    var targetParent = target.parentNode;
    var thisParent = this.parentNode;
    var thisNextSibling = this.nextSibling;
    if (targetParent) {
      targetParent.replaceChild(this, target);
    } else {
      this.remove(true);
    }
    if (thisParent) {
      thisParent.insertBefore(target, thisNextSibling);
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.replace]
  /**
   * 使用本元素替换目标元素。
   * @name Element.prototype.replace
   * @function
   * @param {Element} target 目标元素。
   * @param {boolean} [keepListeners] 是否保留目标元素及后代元素上的所有事件监听器。
   * @returns {Element} 本元素。
   */
  Element.prototype.replace = function(target, keepListeners) {
    var $target = $(target);
    var $parent = $target.getParent();
    if ($parent) {
      if (!keepListeners) {
        Array.from(removeAllListeners($target).getElementsByTagName('*')).forEach(removeAllListeners);
      }
      $parent.replaceChild(this, $target);
    }
    return this;
  };

//--------------------------------------------------[Element.prototype.remove]
  /**
   * 将本元素从文档树中删除。
   * @name Element.prototype.remove
   * @function
   * @param {boolean} [keepListeners] 是否保留本元素及后代元素上的所有事件监听器。
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

//--------------------------------------------------[Element.prototype.empty]
  /**
   * 将本元素的内容清空，并删除本元素及后代元素上的所有事件监听器。
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

//==================================================[Element 扩展 - 表单]
  /*
   * 为表单元素扩展新特性。
   *
   * 扩展方法：
   *   HTMLFormElement.prototype.getFieldValue
   *   HTMLFormElement.prototype.serialize  // TODO
   */

//--------------------------------------------------[HTMLFormElement.prototype.getFieldValue]
  /*
   * 获取一个或一组控件的当前值，并对下列不一致的情况（*）作统一化处理。
   * 如果为 select-one 类型：
   *   取最后一个设置了 selected 的 OPTION 值。
   *   若该 OPTION 设置了 disabled 则认为本控件无有效值（虽然此时可以取到该控件的 selectedIndex 和 value 值）。
   *     * IE6 IE7 不支持 OPTION 和 OPTGROUP 元素的 disabled 属性（http://w3help.org/zh-cn/causes/HF3013）。
   *   若没有设置了 selected 的 OPTION，则取第一个未设置 disabled 的 OPTION 值。
   *     * Safari 5.1.7 在上述情况发生时，其 selectedIndex 为 0，但认为本控件无有效值。
   *     ! IE6 IE7 不支持 OPTION 的 disabled 属性，所以其 selectedIndex 将为 0，但由于 IE6 IE7 不支持 hasAttribute 方法，因此无法修复本差异。
   *   若所有的 OPTION 都设置了 disabled，则其 selectedIndex 为 -1，并且认为本控件无有效值。
   *     * 仅 Firefox 14.0.1 和 Opera 12.02 在上述情况发生时会将其 selectedIndex 设置为 -1，但后者会将第一个 OPTION 元素的 value 作为有效值提交。
   *     * 其他浏览器则将其 selectedIndex 设置为 0，但认为本控件无有效值。
   * 如果为 select-multiple 类型：
   *   若没有设置了 selected 的 OPTION，则认为没有默认选中项，selectedIndex 为 -1，本控件无有效值（多选情况下的 selectedIndex 和 value 无实际意义）。
   *   所有设置了 selected 的 OPTION 认为有效。
   *   所有设置了 disabled 的 OPTION 认为无效。
   */
  /**
   * 获取本表单内某个域的当前值。
   * @name HTMLFormElement.prototype.getFieldValue
   * @function
   * @param {string} name 域的名称。
   * @returns {string|Array} 域的当前值。
   * @description
   *   当该域只包含一个非 select-multiple 类型的控件时，如果具备有效值则返回该值，否则返回空字符串（将无效值与空字符串等同处理是为了降低后续处理的复杂度）。
   *   其他情况（该域只包含一个 select-multiple 类型的控件或者多个任意类型的控件时）返回数组，值为空字符串的项不会被加入数组。
   * @see http://www.w3.org/TR/REC-html40/interact/forms.html#successful-controls
   */
  var getCurrentValue = function(control) {
    var value = '';
    if (control.nodeType) {
      switch (control.type) {
        case 'radio':
        case 'checkbox':
          if (control.checked && !control.disabled) {
            value = control.value;
          }
          break;
        case 'select-one':
        case 'select-multiple':
          if (!control.disabled) {
            // 不能使用 Array.from(control.options).forEach(...)，原因见 typeOf 的注释。
            var options = control.options;
            var option;
            var i = 0;
            if (control.type === 'select-one') {
              var selectedIndex = control.selectedIndex;
              if (navigator.isSafari && selectedIndex === 0 && !options[0].hasAttribute('selected')) {
                while (option = options[++i]) {
                  if (!option.disabled && !option.parentNode.disabled) {
                    selectedIndex = i;
                    break;
                  }
                }
              }
              if (selectedIndex >= 0 && !options[selectedIndex].disabled) {
                value = options[selectedIndex].value;
              }
            } else {
              value = [];
              while (option = options[i++]) {
                if (option.selected && !option.disabled && !option.parentNode.disabled) {
                  value.push(option.value);
                }
              }
            }
          }
          break;
        default:
          if (!control.disabled) {
            value = control.value;
          }
      }
    } else {
      value = [];
      Array.from(control).forEach(function(control) {
        var v = getCurrentValue(control);
        if (v) {
          value = value.concat(v);
        }
      });
    }
    return value;
  };

  HTMLFormElement.prototype.getFieldValue = function(name) {
    var control = this.elements[name];
    if (!control) {
      throw new Error('Invalid field name "' + name + '"');
    }
    return getCurrentValue(control);
  };

//==================================================[DOM 事件模型]
  /*
   * 为 DOM 对象提供的事件模型，这套事件模型是基于原生 DOM 事件模型的，解决了常见的兼容性问题，并增加了新的特性。
   *
   * 相关名词的解释如下：
   *   原生事件对象 (e)：
   *     原生的 DOM 事件对象。
   *   事件对象 (event)：
   *     本事件模型提供的事件对象，包含与此事件有关的信息，是 DOMEvent 的实例。
   *     大多数内置事件的 event 都是对 e 的封装（不直接扩展 e 是因为 e 的一些属性是只读的），可以通过访问 event.originalEvent 得到 e。
   *     自定义事件和少数内置事件产生的 event 不是对 e 的封装，也有一些特殊类型的事件并不产生 event。
   *   默认行为：
   *     对于某种 e，在使用原生 DOM 事件模型的传播途径传播到顶端时，浏览器会根据情况执行的某种行为。
   *     只有 e 才可能有默认行为，event 目前都未加入任何默认行为。
   *   传播：
   *     使可以冒泡的 event 可以在文档树中逐级向上传递到每个可以到达的节点，和原生 DOM 事件模型的冒泡部分一样。
   *   分发：
   *     在一个指定的节点上，将 event 作为参数逐个传入该节点相应的监听器。
   *   触发器 (trigger)：
   *     通过一个或多个原生监听器实现，当确定一个内置事件发生时，触发器会自动创建、传播和分发 event。
   *   分发器 (distributor)：
   *     通过一个原生监听器实现，当确定一个内置事件发生时，分发器会自动创建并分发 event（不会传播）。
   *   监听器 (listener)：
   *     添加到一个节点的、监听某种类型的事件的函数，有普通和代理两种类型。
   *     当对应类型的 event 传播到本节点时，对应的监听器会被调用，并传入 event 作为其唯一的参数。
   *     可以通过调用 event 的相应方法来阻止其继续传播，或取消其默认行为。
   *     如果一个监听器返回了 false，则该 event 将自动停止传播并取消默认行为。
   *   监听器名称 (name)：
   *     由要监听的 type、可选的 qualifiers 和 label 组成，其中只有 type 是必选的。
   *   事件类型 (type)：
   *     事件的类型，分为内置和自定义两种。
   *   限定符 (qualifiers)：
   *     用于限定监听器的行为。其中 relay 表示是否为代理监听，once 用于限定监听器是否仅能被调用一次，idle 用于指定监听器的延迟调用时间，throttle 用于指定监听器可被连续调用的最短时间间隔。
   *   标签 (label)：
   *     在 name 的末尾添加 label 可以使相同节点上添加的相同类型、相同行为的监听器具备不同的名称。不同的名称可以确保调用 off 方法时能够精确匹配要删除的监听器。
   *
   * 添加或删除监听器：
   *   通过调用 on 或 off 方法来添加或删除指定的监听器。
   *
   * 触发事件：
   *   内置类型 - 自动触发
   *     * “独立”模式
   *       将触发器作为原生监听器添加到某个节点，当确定事件发生时，触发器会自动在其所属的节点上调用 fire 方法来创建、传播和分发 event。
   *       这种情况下，event 将使用本模型提供的传播机制在文档树中传播（不依赖任何 e），并且 event 会自动分发给相应的监听器。
   *       在本次事件的生命周期内，只会有一个 event 被创建。
   *       不使用原生事件模型是因为 IE6 IE7 IE8 通过 document.createEventObject 方法创建的 e 无法执行默认行为，也不能通过 e 来传递自定义参数属性。另外 window 对象也没有提供 fireEvent 方法。
   *       要避免以上问题，现阶段较好的方式是不使用原生事件模型。
   *     * “协同”模式
   *       将分发器作为原生监听器添加到某个节点，当确定事件发生时，分发器会自动在其所属的节点上根据 e 来创建并分发 event。
   *       这种 event 不会在文档树中传播，真正传播的是 e，但 event 的一些方法中有对 e 的相应方法的引用，因此调用这些方法时也会影响 e 的行为。
   *       在本次事件的生命周期内，可能会有多个 event 被创建，每个 event 只在创建它的节点上被重用。
   *       这样处理是因为 IE6 IE7 IE8 中，原生事件模型分发给每个监听器的 e 都是不同的，因此无法实现一次封装多处调用。
   *       其他浏览器虽然没有上述问题，但为了保持一致并简化代码逻辑，也不做处理。事实上同一事件被不同节点监听的情况相对来说并不常见。
   *     两种模式的应用场景：
   *       对于没有明显兼容性问题（只考虑 e 的冒泡阶段）的内置事件，使用“协同”模式来处理。
   *       对于有兼容性问题的事件，根据解决方案的不同，有以下两种情况：
   *         1. 能够以一个其他原生事件来模拟，并且可以依赖 e 的传播机制的，使用“独立”模式来处理。
   *            如 mousewheel/mouseenter/mouseleave 事件的解决方案。
   *         2. 以一个或多个原生事件来模拟，但是不能依赖 e 的传播机制的（在确认事件发生时 e 可能已经传播到文档树的顶层了），则使用“协同”模式来处理。
   *            如 mousedragstart/mousedrag/mousedragend/focusin/focusout/change 等事件的处理方式。
   *            在一些特殊的情况下，如果 e 被意外的阻止传播，可能会导致结果与预期的不符。
   *   内置类型 - 手动触发
   *     * 通过调用 fire 方法来触发。
   *       这相当于使用了自动触发的“独立”模式，来主动触发一个事件。
   *       此时不会触发任何原生事件，也不会执行此类事件的默认行为。
   *       当只希望调用某类事件的监听器时，应使用这种方式。
   *     * 对于一些内置事件（如 click 和 reset），可以在相应的对象上调用与要触发的事件类型同名的方法（如果有）来触发。
   *       此时同名的原生事件将被触发（产生的 e 可能具备默认行为）并依赖自动触发的“协同”模式来进行后续处理。
   *       当除了要调用某类事件的监听器，还希望该事件的默认行为生效时，应使用这种方式。
   *   自定义类型
   *     * 自定义类型的事件只能通过调用 fire 方法来触发。
   *       fire 方法会自动创建、传播和分发 event。
   *
   * 提供对象：
   *   DOMEvent
   *   DOMEventTarget
   *
   * 提供实例方法：
   *   DOMEventTarget.on
   *   DOMEventTarget.off
   *   DOMEventTarget.fire
   *
   * 参考：
   *   http://jquery.com/
   *   http://www.quirksmode.org/dom/w3c_events.html
   *   http://www.w3.org/TR/DOM-Level-3-Events/#events-module
   */

  // 监听器对象池。
  /*
   * <Object eventHandlers> {
   *   <string uid>: <Object item> {
   *     <string type>: <Array handlers> [
   *       <Object handler> {
   *         name: <string name>,
   *         listener: <Function listener>,
   *         selector: <string selector>,
   *         simpleSelector: <Object simpleSelector> {
   *           tagName: <string tagName>,
   *           className: <string className>
   *         }
   *       }
   *     ]
   *      .distributor: <Function distributor>
   *                                        .type: <string type>
   *      .distributor: null
   *      .delegateCount: <number delegateCount>
   *   }
   * }
   */
  var eventHandlers = {};

  // 供内部调用的标记值。
  var INTERNAL_IDENTIFIER_EVENT = {};

  var EVENT_CODES = {mousedown: 5, mouseup: 5, click: 5, dblclick: 5, contextmenu: 5, mousemove: 5, mouseover: 5, mouseout: 5, mouseenter: 5, mouseleave: 5, mousewheel: 5, mousedragstart: 5, mousedrag: 5, mousedragend: 5, keydown: 6, keypress: 6, keyup: 6, focus: 0, blur: 0, focusin: 4, focusout: 4, input: 4, change: 4, select: 0, submit: 0, reset: 0, scroll: 0, resize: 0, load: 0, unload: 0, error: 0, beforedomready: 0, domready: 0, afterdomready: 0};
  var returnTrue = function() {
    return true;
  };
  var returnFalse = function() {
    return false;
  };

  // 解析监听器名称，取出相关的属性。
  var eventNamePattern = /^([a-zA-Z]+)(?::relay\(([^\)]+)\))?(?::(once)|:idle\((\d+)\)|:throttle\((\d+)\))?(?:\.\w+)?$/;
  var getEventAttributes = function(name) {
    var match = name.match(eventNamePattern);
    if (match === null) {
      throw new SyntaxError('Invalid event name "' + name + '"');
    }
    return {type: match[1], selector: match[2] || '', once: !!match[3], idle: parseInt(match[4], 10), throttle: parseInt(match[5], 10)};
  };

  // 添加和删除原生事件监听器。
  var addEventListener = 'addEventListener' in window ? function($target, eventType, eventListener, useCapture) {
    $target.addEventListener(eventType, eventListener, useCapture);
  } : function($target, eventType, eventListener) {
    $target.attachEvent('on' + eventType, eventListener);
  };
  var removeEventListener = 'removeEventListener' in window ? function($target, eventType, eventListener, useCapture) {
    $target.removeEventListener(eventType, eventListener, useCapture);
  } : function($target, eventType, eventListener) {
    $target.detachEvent('on' + eventType, eventListener);
  };

  // 将事件对象分发给相应的监听器。
  var distributeEvent = function($target, handlers, event, isTriggered) {
    // 分发时对 handlers 的副本（仅复制了 handlers 的数组部分）操作，以避免在监听器内添加或删除该对象的同类型的监听器时会影响本次分发过程。
    var handlersCopy = handlers.slice(0);
    var delegateCount = handlers.delegateCount;
    var $current = delegateCount ? event.target : $target;
    var filters = {};
    var handler;
    var selector;
    var i;
    var total;
    // 开始分发。
    do {
      if ($current === $target) {
        // 普通监听器。
        i = delegateCount;
        total = handlersCopy.length;
      } else {
        // 代理监听器。
        i = 0;
        total = delegateCount;
      }
      while (i < total) {
        handler = handlersCopy[i++];
        selector = handler.selector;
        // 如果是代理事件监听，则过滤出符合条件的元素。
        if (!selector || (filters[selector] || (filters[selector] = function(simpleSelector) {
          if (simpleSelector) {
            return function($target) {
              var tagName = simpleSelector.tagName;
              var className = simpleSelector.className;
              return (tagName ? $target.nodeName === tagName : true) && (className ? $target.hasClass(className) : true);
            };
          } else {
            var elements = $target.findAll(selector);
            return function($target) {
              return elements.contains($target);
            }
          }
        }(handler.simpleSelector)))($current)) {
          if (!isTriggered || isTriggered.call($current, event)) {
            // 监听器被调用时 this 的值为监听到本次事件的对象。
            if (handler.listener.call($current, event) === false) {
              event.stopPropagation();
              event.preventDefault();
            }
            if (event.isImmediatePropagationStopped()) {
              break;
            }
          }
        }
      }
      // 如果正在进行代理监听（当前对象不是监听到本次事件的对象），且事件可以继续传播时，向上一级传播，直到传播到监听到本次事件的对象为止。
    } while (!($current === $target || event.isPropagationStopped()) && ($current = $current.getParent() || $current === html && $target));
  };

  // 触发器。
  var triggers = {};

  // 拖动相关事件，为避免覆盖 HTML5 草案中引入的同名事件，加入前缀 mouse。
  // 只支持鼠标左键的拖拽，拖拽过程中松开左键、按下其他键、或当前窗口失去焦点都将导致拖拽事件结束。
  // 应避免在拖拽进行时删除本组事件的监听器，否则可能导致拖拽动作无法正常完成。
  triggers.mousedragstart = triggers.mousedrag = triggers.mousedragend = function() {
    var dragState;
    var relatedTypes = ['mousedragstart', 'mousedrag', 'mousedragend'];
    // 在 Chrome 25 和 Safari 5.1.7 下，如果一个页面是在 frame 中被载入的，那么在该页面中，一旦有一个传递到 document 的 mousedown 事件被阻止了默认行为，则在 document 上后续发生的 mousemove 事件在鼠标指针离开该文档的区域后无法被自动捕获。因此使用以下监听器来避免在拖动过程中选中页面的内容。
    // http://www.w3help.org/zh-cn/causes/BX2050
    var unselectableForWebKit = function(e) {
      e.preventDefault();
    };
    if ((navigator.isChrome || navigator.isSafari) && window !== top) {
      unselectableForWebKit.enabled = true;
    }
    var mouseDragStartTrigger = function(e) {
      if (!dragState) {
        var event = new DOMEvent('mousedragstart', e);
        if (event.leftButton) {
          event.offsetX = event.offsetY = 0;
          var $target = event.target;
          if ($target.setCapture) {
            $target.setCapture();
          }
          // 避免在拖动过程中选中页面的内容。
          if (unselectableForWebKit.enabled) {
            addEventListener(document, 'selectstart', unselectableForWebKit);
          } else {
            event.preventDefault();
          }
          dragState = {target: $target, startX: event.pageX, startY: event.pageY};
          dragState.lastEvent = event;
          $target.fire(INTERNAL_IDENTIFIER_EVENT, event);
          setTimeout(function() {
            addEventListener(document, 'mousemove', mouseDragTrigger);
            addEventListener(document, 'mousedown', mouseDragEndTrigger);
            addEventListener(document, 'mouseup', mouseDragEndTrigger);
            addEventListener(window, 'blur', mouseDragEndTrigger);
          }, 0);
        }
      }
    };
    var mouseDragTrigger = function(e) {
      var event = new DOMEvent('mousedrag', e);
      event.target = dragState.target;
      event.offsetX = event.pageX - dragState.startX;
      event.offsetY = event.pageY - dragState.startY;
      dragState.lastEvent = event;
      dragState.target.fire(INTERNAL_IDENTIFIER_EVENT, event);
    };
    var mouseDragEndTrigger = function() {
      var $target = dragState.target;
      if ($target.releaseCapture) {
        $target.releaseCapture();
      }
      // 使用上一个拖拽相关事件作为 mousedragend 的事件对象，以确保任何情况下都有鼠标坐标相关信息。
      var event = dragState.lastEvent;
      // 避免上一个拖拽相关事件的传播或默认行为被阻止。
      event.isPropagationStopped = event.isDefaultPrevented = event.isImmediatePropagationStopped = returnFalse;
      event.type = 'mousedragend';
      dragState.target.fire(INTERNAL_IDENTIFIER_EVENT, event);
      dragState = null;
      if (unselectableForWebKit.enabled) {
        removeEventListener(document, 'selectstart', unselectableForWebKit);
      }
      removeEventListener(document, 'mousemove', mouseDragTrigger);
      removeEventListener(document, 'mousedown', mouseDragEndTrigger);
      removeEventListener(document, 'mouseup', mouseDragEndTrigger);
      removeEventListener(window, 'blur', mouseDragEndTrigger);
    };
    return {
      add: function($target) {
        // 向这三个关联事件中添加第一个监听器时，即创建 mousedragstart 触发器，该触发器会动态添加/删除另外两个事件的触发器。
        addEventListener($target, 'mousedown', mouseDragStartTrigger);
        // 创建另外两个事件的处理器组。
        var item = eventHandlers[$target.uid];
        relatedTypes.forEach(function(relatedType) {
          if (!item[relatedType]) {
            var handlers = [];
            handlers.delegateCount = 0;
            item[relatedType] = handlers;
          }
        });
      },
      remove: function($target) {
        // 在这三个关联事件中删除最后一个监听器后，才删除它们的触发器。
        var item = eventHandlers[$target.uid];
        var handlerCount = 0;
        relatedTypes.forEach(function(relatedType) {
          handlerCount += item[relatedType].length;
        });
        if (handlerCount === 0) {
          removeEventListener($target, 'mousedown', mouseDragStartTrigger);
          // 删除三个关联事件的处理器组。
          relatedTypes.forEach(function(type) {
            delete item[type];
          });
        }
        return false;
      }
    };
  }();

  // 使 Firefox 支持 focusin/focusout 事件，使用 focus/blur 事件的捕获阶段模拟。
  if (navigator.isFirefox) {
    Object.forEach({focusin: 'focus', focusout: 'blur'}, function(originalType, type) {
      var count = 0;
      var trigger = function(e) {
        e.target.fire(type);
      };
      triggers[type] = {
        add: function() {
          // 在当前文档内第一次添加本类型事件的监听器时，启用模拟。
          if (++count === 1) {
            addEventListener(document, originalType, trigger, true);
          }
        },
        remove: function() {
          // 在当前文档内添加的本类型事件的监听器全部被删除时，停用模拟。
          if (--count === 0) {
            removeEventListener(document, originalType, trigger, true);
          }
        }
      };
    });
  }

  // 修复 IE6 IE7 IE8 IE9 的 input 和 change 事件，以及 Firefox 的 change 事件。
  if (navigator.isIElt10 || navigator.isFirefox) {
    // 判断传入的值是否为可输入元素。
    var isInputElement = function(target) {
      var nodeName = target.nodeName;
      var controlType = target.type;
      return nodeName === 'TEXTAREA' || nodeName === 'INPUT' && (controlType === 'text' || controlType === 'password');
    };

    if (navigator.isIElt10) {
      // 使 IE6 IE7 IE8 支持 input 事件，并修复 IE9 的 input 事件的 bug。
      // IE6 IE7 IE8 不支持此事件，其他浏览器支持（需使用 addEventListener 添加监听器）。
      // 但 IE9 的可输入元素在删除文本内容时（按键 Backspace 和 Delete、菜单删除/剪切、拖拽内容出去）不触发 input 事件。
      // 为使代码更简洁，此处对上述浏览器使用同一套解决方案来模拟 input 事件，而不为 IE9 单独做修复。
      // 不能使用 propertychange 事件模拟，因为控件值有可能是脚本修改的，而 input 事件仅应在用户进行修改动作时触发。
      // 在本模拟方式依赖的事件中，如果阻止 beforeactivate、beforedeactivate 和 dragend 事件的传播，将导致事件模拟失败。
      // 修复后，唯一与标准 input 事件不同的行为是：当用户的焦点在一个可输入元素中时，该元素的值被脚本更改，之后用户的焦点没有离开本元素，并更改了光标的位置，此时会不正确的触发 input 事件。
      // 如果上述问题出现了，避免的方式是在使用脚本赋值前或赋值后调用控件的 blur 方法。
      // 另外，当使用表单自动完成功能时，IE6 IE7 IE8 IE9 Safari 5.1.7 (自动模式) Opera 12.02 (非第一次) 不触发 input 事件。
      // 考虑到大多数 input 事件是应用到 password 和 textarea 类型的控件，上述自动完成的问题影响并不大，目前未处理。
      // Opera 12.02 拖拽出去后，源控件不触发 input 事件，目标控件如果是 textarea 也不会触发 input 事件，目前未处理。
      triggers.input = function() {
        var count = 0;
        var $active;
        // 触发器。
        var checkValue = function($target) {
          if ($target._valueBeforeInput_ !== $target.value) {
            $target._valueBeforeInput_ = $target.value;
            $target.fire('input');
          }
        };
        // 获取活动的可输入元素。
        var setActiveInputElement = function(e) {
          var target = e.srcElement;
          if (isInputElement(target)) {
            var $target = $(target);
            // 如果是拖拽内容进来，本监听器会被连续调用两次，触发 drop 事件时值仍是原始值，赋新值之后才触发 beforeactivate 事件。
            if (e.type === 'drop') {
              $target._dropForInput_ = true;
            }
            if (e.type === 'beforeactivate' && $target._dropForInput_) {
              $target._dropForInput_ = false;
              checkValue($target);
            } else {
              $target._valueBeforeInput_ = $target.value;
            }
            $active = $target;
          }
        };
        // 清除活动的可输入元素。
        var clearActiveInputElement = function(e) {
          if (e.srcElement === $active) {
            $active = null;
          }
        };
        // 按键触发器，针对按下按键的情况进行检查。
        var onKeyDown = function(e) {
          if (e.srcElement === $active) {
            var $target = $active;
            setTimeout(function() {
              checkValue($target);
            }, 0);
          }
        };
        // 拖拽触发器，针对拖拽内容出去的情况进行检查。
        var onDragEnd = function(e) {
          var target = e.srcElement;
          if ('_valueBeforeInput_' in target) {
            setTimeout(function() {
              checkValue(target);
            }, 0);
          }
        };
        // 选区改变触发器，针对快捷键和菜单修改内容的情况进行检查。
        var onSelectionChange = function() {
          if ($active) {
            checkValue($active);
          }
        };
        // 发布接口。
        return {
          add: function() {
            // 在当前文档内第一次添加 input 事件的监听器时，对全文档内所有可输入元素进行事件模拟及修复。
            if (++count === 1) {
              addEventListener(html, 'drop', setActiveInputElement);
              addEventListener(document, 'beforeactivate', setActiveInputElement);
              addEventListener(document, 'beforedeactivate', clearActiveInputElement);
              addEventListener(document, 'selectionchange', onSelectionChange);
              addEventListener(document, 'keydown', onKeyDown);
              addEventListener(html, 'dragend', onDragEnd);
            }
          },
          remove: function() {
            // 在当前文档内添加的 input 事件的监听器全部被删除时，停用事件模拟及修复。已添加过触发器的可输入元素不作处理。
            if (--count === 0) {
              removeEventListener(html, 'drop', setActiveInputElement);
              removeEventListener(document, 'beforeactivate', setActiveInputElement);
              removeEventListener(document, 'beforedeactivate', clearActiveInputElement);
              removeEventListener(document, 'selectionchange', onSelectionChange);
              removeEventListener(document, 'keydown', onKeyDown);
              removeEventListener(html, 'dragend', onDragEnd);
            }
          }
        };
      }();

      // 修复 IE6 IE7 IE8 IE9 的 change 事件。
      // IE6 IE7 IE8 的 change 事件不会冒泡，并且 INPUT[type=radio|checkbox] 上的 change 事件在失去焦点后才触发。
      // IE6 IE7 IE8 IE9 的可输入元素使用表单自动完成和拖拽内容出去后不会触发 change 事件。
      // 修复后，唯一与标准 change 事件不同的行为是：当用户的焦点在一个可输入元素中时，该元素的值被脚本更改，之后用户未做任何修改，焦点即离开本元素，此时会不正确的触发 change 事件。
      // 如果上述问题出现了，避免的方式是在使用脚本赋值前或赋值后调用控件的 blur 方法。
      // 另外，当使用表单自动完成功能时，Safari 5.1.7 (自动模式) 不触发 change 事件，目前未处理。
      triggers.change = function() {
        // 修复 IE6 IE7 IE8 的 radio、checkbox 类型的控件上的 change 事件在失去焦点后才触发以及 select-one、select-multiple 类型的控件上的 change 事件不冒泡的问题。
        // 对于 IE9 的这些类型的控件，与 IE6 IE7 IE8 的 select-one、select-multiple 类型的控件的处理方式保持一致。
        // 虽然 IE9 的 change 事件可以冒泡，但为简化代码，不再对其做分支处理。
        var fixChangeEvent = function(e) {
          var target = e.srcElement;
          var nodeName = target.nodeName;
          var type = target.type;
          if (!target._changeEventFixed_ && (nodeName === 'INPUT' && (type === 'radio' || type === 'checkbox') || nodeName === 'SELECT')) {
            var $target = $(target);
            if (navigator.isIElt9 && nodeName === 'INPUT') {
              addEventListener($target, 'propertychange', function(e) {
                if (e.propertyName === 'checked') {
                  e.srcElement._checkedStateChanged_ = true;
                }
              });
              addEventListener($target, 'click', function(e) {
                var $target = e.srcElement;
                if ($target._checkedStateChanged_) {
                  $target._checkedStateChanged_ = false;
                  $target.fire('change');
                }
              });
            } else {
              addEventListener($target, 'change', function(e) {
                e.srcElement.fire('change');
              });
            }
            $target._changeEventFixed_ = true;
          }
        };
        // 修复 IE6 IE7 IE8 IE9 的 text、password、textarea 类型的控件使用表单自动完成和拖拽内容出去后不会触发 change 事件的问题以及 IE6 IE7 IE8 这些类型的控件上的 change 事件不冒泡的问题。
        // 虽然这些情况下 IE9 的 change 事件可以冒泡，但为简化代码，不再对其做分支处理。
        var count = 0;
        var saveOldValue = function(e) {
          var target = e.srcElement;
          if (isInputElement(target)) {
            // 如果是拖拽内容进来，本监听器会被连续调用两次，触发 drop 事件时值仍是原始值，赋新值之后才触发 beforeactivate 事件。
            if (target._dropForChange_) {
              target._dropForChange_ = false;
            } else {
              target._valueBeforeChange_ = target.value;
            }
            if (e.type === 'drop') {
              target._dropForChange_ = true;
            }
          }
        };
        var checkNewValue = function(e) {
          var target = e.srcElement;
          if (isInputElement(target)) {
            var $target = $(target);
            setTimeout(function() {
              if ($target._valueBeforeChange_ !== $target.value) {
                $target._valueBeforeChange_ = $target.value;
                $target.fire('change');
              }
            }, 0);
          }
        };
        return {
          add: function($target) {
            addEventListener($target, 'beforeactivate', fixChangeEvent);
            // 在当前文档内第一次添加 change 事件的监听器时，对全文档内所有可输入元素进行修复（这种修复不会在该元素上添加新监听器）。
            if (++count === 1) {
              addEventListener(html, 'drop', saveOldValue);
              addEventListener(document, 'beforeactivate', saveOldValue);
              addEventListener(document, 'beforedeactivate', checkNewValue);
            }
          },
          remove: function($target) {
            removeEventListener($target, 'beforeactivate', fixChangeEvent);
            // 在当前文档内添加的 change 事件的监听器全部被删除时，停用可输入元素的修复。
            if (--count === 0) {
              removeEventListener(html, 'drop', saveOldValue);
              removeEventListener(document, 'beforeactivate', saveOldValue);
              removeEventListener(document, 'beforedeactivate', checkNewValue);
            }
          }
        };
      }();

    }

    // 修复 Firefox 拖拽内容到控件内不触发 change 事件的问题。
    // 修复依赖的事件触发并不频繁，因此直接修复，不使用触发器。
    if (navigator.isFirefox) {
      // Firefox 的拖动方式为复制一份而不是移动，并且如果不是控件内拖拽，焦点不会移动到 drop 的控件内，因此可以直接触发 change 事件。
      addEventListener(document, 'drop', function(e) {
        var $target = e.target;
        if (isInputElement($target) && $target !== document.activeElement) {
          setTimeout(function() {
            $target.fire('change');
          }, 0);
        }
      });
    }

  }

  // 删除一个元素上的所有事件监听器。
  var removeAllListeners = function($element) {
    var item = eventHandlers[$element.uid];
    if (item) {
      var types = Object.keys(item);
      var handlers;
      while (types.length) {
        handlers = item[types.shift()];
        while (handlers.length) {
          $element.off(handlers[0].name);
        }
      }
    }
    return $element;
  };

//--------------------------------------------------[DOMEvent]
  /**
   * 事件对象。
   * @name DOMEvent
   * @constructor
   * @param {string} type 事件类型。
   * @param {Object} e 原生事件对象。
   * @param {Object} [data] 附加数据。
   * @description
   *   如果事件对象是通过调用 Element/document/window 的 fire 方法产生的，其除了 originalEvent、type 和 target 之外的其他属性值均可能会被重写。
   */
  function DOMEvent(type, e, data) {
    // 取得原生事件对象。
    if (!e) {
      e = window.event;
    }
    // 事件代码包含三个二进制位，分别是 鼠标事件 键盘事件 可以冒泡。默认为 000 (0)。
    var code = EVENT_CODES.hasOwnProperty(type) ? EVENT_CODES[type] : 0;
    // 保存原生事件对象。
    this.originalEvent = e;
    // 事件类型，这时候的 type 就是调用 on 时使用的事件类型。
    this.type = type;
    // 触发本次事件的对象。
    var target = 'target' in e ? e.target : e.srcElement || document;
    if (target.nodeType === 3) {
      target = target.parentNode;
    }
    this.target = $(target);
    // 发生时间。
    this.timeStamp = e.timeStamp || Date.now();
    // 是否可冒泡。
    this.bubbles = !!(code & 4);
    // 鼠标和键盘事件，由 fire 方法产生的事件对象可能没有以下信息。
    if (code & 3) {
      this.ctrlKey = e.ctrlKey;
      this.altKey = e.altKey;
      this.shiftKey = e.shiftKey;
      this.metaKey = e.metaKey;
      if (code & 1) {
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
        // 按键。非按键类事件（以及 contextmenu 事件）的按键值在各浏览器中有差异。
        if ('which' in e) {
          var which = e.which;
          this.leftButton = which === 1;
          this.middleButton = which === 2;
          this.rightButton = which === 3;
          this.which = which;
        } else {
          var button = e.button;
          this.leftButton = !!(button & 1);
          this.middleButton = !!(button & 4);
          this.rightButton = !!(button & 2);
          this.which = this.leftButton ? 1 : this.middleButton ? 2 : this.rightButton ? 3 : 0;
        }
        // 与本次事件相关的对象。
        this.relatedTarget = $('relatedTarget' in e ? e.relatedTarget : ('fromElement' in e ? (e.fromElement === target ? e.toElement : e.fromElement) : null));
      } else {
        this.which = e.which || e.charCode || e.keyCode || 0;
      }
    }
    // 加入附加数据。
    if (data) {
      Object.mixin(this, data, {blackList: ['originalEvent', 'type', 'target']})
    }
  }

  /**
   * 原生事件对象。
   * @name DOMEvent#originalEvent
   * @type Object
   * @description
   *   使用 fire 方法创建的事件对象的 originalEvent.type 为空字符串。
   */

  /**
   * 事件类型。
   * @name DOMEvent#type
   * @type string
   */

  /**
   * 触发事件的对象。
   * @name DOMEvent#target
   * @type Element
   */

  /**
   * 事件发生的时间。
   * @name DOMEvent#timeStamp
   * @type number
   */

  /**
   * 是否可以冒泡，不冒泡的事件不能使用代理事件监听。
   * @name DOMEvent#bubbles
   * @type boolean
   */

  /**
   * 事件发生时，ctrl 键是否被按下。
   * @name DOMEvent#ctrlKey
   * @type boolean
   */

  /**
   * 事件发生时，alt 键是否被按下。
   * @name DOMEvent#altKey
   * @type boolean
   */

  /**
   * 事件发生时，shift 键是否被按下。
   * @name DOMEvent#shiftKey
   * @type boolean
   */

  /**
   * 事件发生时，meta 键是否被按下。
   * @name DOMEvent#metaKey
   * @type boolean
   */

  /**
   * 事件发生时鼠标在视口中的 X 坐标，仅在鼠标事件对象上有效。
   * @name DOMEvent#clientX
   * @type number
   */

  /**
   * 事件发生时鼠标在视口中的 Y 坐标，仅在鼠标事件对象上有效。
   * @name DOMEvent#clientY
   * @type number
   */

  /**
   * 事件发生时鼠标在屏幕上的 X 坐标，仅在鼠标事件对象上有效。
   * @name DOMEvent#screenX
   * @type number
   */

  /**
   * 事件发生时鼠标在屏幕上的 Y 坐标，仅在鼠标事件对象上有效。
   * @name DOMEvent#screenY
   * @type number
   */

  /**
   * 事件发生时鼠标在页面中的 X 坐标，仅在鼠标事件对象上有效。
   * @name DOMEvent#pageX
   * @type number
   */

  /**
   * 事件发生时鼠标在页面中的 Y 坐标，仅在鼠标事件对象上有效。
   * @name DOMEvent#pageY
   * @type number
   */

  /**
   * 事件发生时鼠标在横向移动的偏移量，仅在 mousedragstart/mousedrag/mousedragend 类型的事件对象上有效。
   * @name DOMEvent#offsetX
   * @type number
   */

  /**
   * 事件发生时鼠标在纵向移动的偏移量，仅在 mousedragstart/mousedrag/mousedragend 类型的事件对象上有效。
   * @name DOMEvent#offsetY
   * @type number
   */

  /**
   * 事件发生时，鼠标左键是否被按下，仅在鼠标事件对象上有效。
   * @name DOMEvent#leftButton
   * @type boolean
   */

  /**
   * 事件发生时，鼠标中键是否被按下，仅在鼠标事件对象上有效。
   * @name DOMEvent#middleButton
   * @type boolean
   */

  /**
   * 事件发生时，鼠标右键是否被按下，仅在鼠标事件对象上有效。
   * @name DOMEvent#rightButton
   * @type boolean
   */

  /**
   * 事件被触发时的相关对象，仅在 mouseover/mouseout 类型的事件对象上有效。
   * @name DOMEvent#relatedTarget
   * @type Element
   */

  /**
   * 事件发生时鼠标滚轮是否正在向上滚动，仅在 mousewheel 类型的事件对象上有效。
   * @name DOMEvent#wheelUp
   * @type boolean
   */

  /**
   * 事件发生时鼠标滚轮是否正在向下滚动，仅在 mousewheel 类型的事件对象上有效。
   * @name DOMEvent#wheelDown
   * @type boolean
   */

  /**
   * 当一个设备触发事件时的相关代码。在键盘事件中为按下的键的代码。
   * @name DOMEvent#which
   * @type number
   */

  Object.mixin(DOMEvent.prototype, {
    /**
     * 阻止事件的传播。
     * @name DOMEvent.prototype.stopPropagation
     * @function
     */
    stopPropagation: function() {
      var e = this.originalEvent;
      if (e) {
        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
      }
      this.isPropagationStopped = returnTrue;
    },

    /**
     * 查询事件的传播是否已被阻止。
     * @name DOMEvent.prototype.isPropagationStopped
     * @function
     * @returns {boolean} 查询结果。
     */
    isPropagationStopped: returnFalse,

    /**
     * 阻止事件的默认行为。
     * @name DOMEvent.prototype.preventDefault
     * @function
     */
    preventDefault: function() {
      var e = this.originalEvent;
      if (e) {
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
      }
      this.isDefaultPrevented = returnTrue;
    },

    /**
     * 查询事件的默认行为是否已被阻止。
     * @name DOMEvent.prototype.isDefaultPrevented
     * @function
     * @returns {boolean} 查询结果。
     */
    isDefaultPrevented: returnFalse,

    /**
     * 立即阻止事件的传播，被立即阻止传播的事件也不会在当前的对象上被分发到其他的监听器。
     * @name DOMEvent.prototype.stopImmediatePropagation
     * @function
     */
    stopImmediatePropagation: function() {
      this.stopPropagation();
      this.isImmediatePropagationStopped = returnTrue;
    },

    /**
     * 查询事件的传播是否已被立即阻止。
     * @name DOMEvent.prototype.isImmediatePropagationStopped
     * @function
     * @returns {boolean} 查询结果。
     */
    isImmediatePropagationStopped: returnFalse

  });

//--------------------------------------------------[DOMEventTarget]
  /**
   * 所有的 DOMEventTarget 对象都自动具备处理事件的能力，window 对象、document 对象和所有的 Element 对象都是 DOMEventTarget 对象。
   * @name DOMEventTarget
   * @constructor
   * @description
   *   DOMEventTarget 对象在处理事件时，是工作在 DOM 事件模型中的。
   */
  var DOMEventTarget = function() {
  };

//--------------------------------------------------[DOMEventTarget.prototype.on]
  /**
   * 为本对象添加事件监听器。
   * @name DOMEventTarget.prototype.on
   * @function
   * @param {string} name 监听器名称。
   *   监听器名称由要监听的事件类型（必选）、限定符（可选）和标签（可选）组成，格式如下：
   *   <p><dfn><var>type</var></dfn>[<dfn>:relay(<var>selector</var>)</dfn>][<dfn>:once</dfn>|<dfn>:idle(<var>n</var>)</dfn>|<dfn>:throttle(<var>n</var>)</dfn>][<dfn>.<var>label</var></dfn>]</p>
   *   详细信息请参考下表：
   *   <table>
   *     <tr><th>组成部分</th><th>详细描述</th></tr>
   *     <tr>
   *       <td><dfn><var>type</var></dfn></td>
   *       <td>本监听器要监听的事件类型。<br><var>type</var> 只能使用大小写英文字母。</td>
   *     </tr>
   *     <tr>
   *       <td><dfn>:relay(<var>selector</var>)</dfn></td>
   *       <td>指定本监听器为代理事件监听器，监听的目标为文档树中（如果本方法在 document 上被调用）或本元素的后代元素中（如果本方法在一个元素上被调用），符合 <var>selector</var> 限定的元素。<br><var>selector</var> 应为合法的 CSS 选择符。</td>
   *     </tr>
   *     <tr>
   *       <td><dfn>:once</dfn></td>
   *       <td>指定本监听器仅能被调用一次，调用后即被自动删除。<br>自动删除时，会使用添加本监听器时使用的监听器名称。</td>
   *     </tr>
   *     <tr>
   *       <td><dfn>:idle(<var>n</var>)</dfn></td>
   *       <td>指定本监听器将在该类型的事件每次被触发 <var>n</var> 毫秒后、且下一次同类型的事件被触发前才能被调用。<br><var>n</var> 应为大于 0 的数字。</td>
   *     </tr>
   *     <tr>
   *       <td><dfn>:throttle(<var>n</var>)</dfn></td>
   *       <td>指定当事件连续发生时，本监听器可被连续调用的最短时间间隔为 <var>n</var> 毫秒。<br><var>n</var> 应为大于 0 的数字。</td>
   *     </tr>
   *     <tr>
   *       <td><dfn>.<var>label</var></dfn></td>
   *       <td>在监听器名称的末尾添加标签可以可以使相同对象上添加的相同类型、相同行为的监听器具备不同的名称。不同的名称可以确保调用 off 方法时能够精确匹配要删除的监听器。<br>添加具有明确含义的标签，可以最大限度的避免监听器被误删。<br><var>label</var> 可以使用英文字母、数字和下划线。</td>
   *     </tr>
   *   </table>
   *   使用逗号分割多个监听器名称，即可以在本对象上使用多个名称将同一个监听器添加多次。
   * @param {Function} listener 监听器。
   *   该函数将在对应的事件发生时被调用，传入事件对象作为参数。如果指定了 idle 或 throttle 限定符，则该事件对象无法被阻止传播或取消默认行为。
   *   该函数被调用时 this 的值为监听到本次事件的对象，即：
   *   <ul>
   *     <li>如果是普通监听器，则 this 的值为本对象。</li>
   *     <li>如果是代理监听器，则 this 的值为被代理的元素。</li>
   *   </ul>
   *   如果该函数返回 false，则相当于调用了传入的事件对象的 stopPropagation 和 preventDefault 方法。
   * @returns {Object} 本对象。
   * @example
   *   document.on('click', onClick);
   *   // 为 document 添加一个 click 事件的监听器。
   * @example
   *   $element.on('click:relay(a)', onClick);
   *   // 为 $element 添加一个代理监听器，为该元素所有的后代 A 元素代理 click 事件的监听。
   * @example
   *   $element.on('click.temp', onClick);
   *   // 为 $element 添加一个 click 事件的监听器，并为其指定一个标签 temp。
   * @example
   *   $element.on('input:idle(200)', onInput);
   *   // 为 $element 添加一个 input 事件的监听器，该监听器将在每次 input 事件被触发 200 毫秒后、且下一次 input 事件被触发前被调用。
   * @example
   *   $element.on('scroll:throttle(200)', onScroll);
   *   // 为 $element 添加一个 scroll 事件的监听器，该监听器可被连续调用的最短时间间隔为 200 毫秒。
   * @see http://mootools.net/
   * @see http://www.quirksmode.org/dom/events/index.html
   */
  var simpleSelectorPattern = /^(\w*)(?:\.([\w\-]+))?$/;
  DOMEventTarget.prototype.on = function(name, listener) {
    // 自动扩展元素，以便于在控制台进行调试。
    var $target = $(this);
    var uid = $target.uid;
    var item = eventHandlers[uid] || (eventHandlers[uid] = {});
    // 使用一个监听器监听该对象上的多个事件。
    name.split(separator).forEach(function(name) {
      // 取出事件名中携带的各种属性。
      var attributes = getEventAttributes(name);
      var type = attributes.type;
      var selector = attributes.selector;
      var once = attributes.once;
      var idle = attributes.idle;
      var throttle = attributes.throttle;
      // 获取对应的处理器组，以添加处理器。
      var handlers = item[type] || (item[type] = []);
      // 首次监听此类型的事件。
      if (!('delegateCount' in handlers)) {
        // 为兼容事件列表中的事件类型添加触发器或分发器。
        if (EVENT_CODES.hasOwnProperty(type)) {
          if (triggers[type]) {
            // 添加触发器。
            triggers[type].add($target);
          } else {
            // 添加分发器。
            var distributor;
            switch (type) {
              case 'mousewheel':
                // 鼠标滚轮事件，Firefox 的事件类型为 DOMMouseScroll。
                distributor = function(e) {
                  var event = new DOMEvent(type, e);
                  var originalEvent = event.originalEvent;
                  var wheel = 'wheelDelta' in originalEvent ? -originalEvent.wheelDelta : originalEvent.detail || 0;
                  event.wheelUp = wheel < 0;
                  event.wheelDown = wheel > 0;
                  distributeEvent($target, handlers, event);
                };
                distributor.type = navigator.isFirefox ? 'DOMMouseScroll' : 'mousewheel';
                break;
              case 'mouseenter':
              case 'mouseleave':
                // 鼠标进入/离开事件，目前仅 IE 支持，但不能冒泡。此处使用 mouseover/mouseout 模拟。
                distributor = function(e) {
                  distributeEvent($target, handlers, new DOMEvent(type, e), function(event) {
                    var $relatedTarget = event.relatedTarget;
                    // 加入 this.contains 的判断，避免 window 和一些浏览器的 document 对象调用出错。
                    return !$relatedTarget || this.contains && !this.contains($relatedTarget);
                  });
                };
                distributor.type = type === 'mouseenter' ? 'mouseover' : 'mouseout';
                break;
              default:
                // 通用分发器。
                distributor = function(e) {
                  distributeEvent($target, handlers, new DOMEvent(type, e));
                };
                distributor.type = type;
            }
            // 将分发器作为指定类型的原生事件的监听器。
            addEventListener($target, distributor.type, distributor);
            handlers.distributor = distributor;
          }
        }
        // 初始化代理计数器。
        handlers.delegateCount = 0;
      }
      // 添加处理器，允许重复添加同一个监听器（W3C 的事件模型不允许）。
      var handler = {name: name};
      // 处理监听器的触发限制，三者最多只可能同时出现一种。
      if (once) {
        // 仅能被调用一次的监听器，调用后即被自动删除（根据添加时的监听器名称）。如果有重名的监听器则这些监听器将全部被删除。
        handler.listener = function(event) {
          var result = listener.call(this, event);
          $target.off(name);
          return result;
        };
      } else if (idle) {
        // 被延后调用的监听器（异步调用）。在此监听器内对事件对象的操作不会影响事件的传播及其默认行为。
        handler.listener = function() {
          var timer;
          return function(event) {
            var thisObject = this;
            if (timer) {
              clearTimeout(timer);
            }
            timer = setTimeout(function() {
              listener.call(thisObject, event);
              timer = undefined;
            }, idle);
          };
        }();
      } else if (throttle) {
        // 有频率限制的监听器（除第一次外均必须为异步调用）。为保持一致，所有调用均为异步调用，在此监听器内对事件对象的操作不会影响事件的传播及其默认行为。
        handler.listener = function() {
          var timer;
          var thisObject;
          var lastEvent;
          var lastCallTime = 0;
          return function(event) {
            thisObject = this;
            lastEvent = event;
            var now = Date.now();
            var timeElapsed = now - lastCallTime;
            if (!timer) {
              timer = setTimeout(function() {
                listener.call(thisObject, lastEvent);
                lastCallTime = Date.now();
                timer = undefined;
              }, timeElapsed < throttle ? throttle - timeElapsed : 0);
            }
          };
        }();
      } else {
        // 无触发限制的监听器。
        handler.listener = listener;
      }
      if (selector) {
        // 代理监听器。
        handler.selector = selector;
        var match;
        if (match = selector.match(simpleSelectorPattern)) {
          // 保存简单选择器以在执行过滤时使用效率更高的方式。
          handler.simpleSelector = {
            // tagName 必为字符串，className 可能为 undefined。
            tagName: match[1].toUpperCase(),
            className: match[2] || ''
          };
        }
        handlers.splice(handlers.delegateCount++, 0, handler);
        // 为不保证所有浏览器均可以冒泡的事件类型指定代理监听时，给出警告信息。
        if (!(EVENT_CODES[type] & 4)) {
          console.warn('OurJS: Incompatible event delegation type "' + name + '".');
        }
      } else {
        // 普通监听器。
        handlers.push(handler);
      }
    });
    return $target;
  };

//--------------------------------------------------[DOMEventTarget.prototype.off]
  /**
   * 删除本对象上已添加的事件监听器。
   * @name DOMEventTarget.prototype.off
   * @function
   * @param {string} name 监听器名称。
   *   本对象上添加的所有名称与 name 匹配的监听器都将被删除。
   *   使用逗号分割多个监听器名称，即可同时删除该对象上的多个监听器。
   * @returns {Object} 本对象。
   * @example
   *   document.off('click');
   *   // 为 document 删除名为 click 的监听器。
   * @example
   *   $element.off('click:relay(a)');
   *   // 为 $element 删除名为 click:relay(a) 的监听器。
   */
  DOMEventTarget.prototype.off = function(name) {
    var $target = this;
    var uid = $target.uid;
    var item = eventHandlers[uid];
    if (!item) {
      return $target;
    }
    // 同时删除该对象上的多个监听器。
    name.split(separator).forEach(function(name) {
      // 取出事件类型。
      var type = getEventAttributes(name).type;
      // 尝试获取对应的处理器组，以删除处理器。
      var handlers = item[type];
      if (!handlers) {
        return;
      }
      // 删除处理器。
      var i = 0;
      var handler;
      while (i < handlers.length) {
        handler = handlers[i];
        if (handler.name === name) {
          handlers.splice(i, 1);
          if (handler.selector) {
            handlers.delegateCount--;
          }
        } else {
          i++;
        }
      }
      // 处理器组为空。
      if (handlers.length === 0) {
        // 为兼容事件列表中的事件类型删除触发器或分发器。
        if (EVENT_CODES.hasOwnProperty(type)) {
          if (triggers[type]) {
            // 删除触发器。
            if (triggers[type].remove($target) === false) {
              // 拖拽的三个关联事件的触发器会自己管理它们的处理器组，返回 false 避免其中某个事件的处理器组被删除。
              return;
            }
          } else {
            // 删除分发器。
            var distributor = handlers.distributor;
            removeEventListener($target, distributor.type, distributor);
          }
        }
        // 删除处理器组。
        delete item[type];
      }
    });
    // 若该项再无其他处理器组，删除该项。
    if (Object.keys(item).length === 0) {
      delete eventHandlers[uid];
    }
    return $target;
  };

//--------------------------------------------------[DOMEventTarget.prototype.fire]
  /**
   * 触发本对象的某类事件。
   * @name DOMEventTarget.prototype.fire
   * @function
   * @param {string} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   *   data 的属性会被追加到事件对象中，但名称为 originalEvent、type、target 的属性除外。
   *   如果指定其 bubbles 属性为 true，则该事件将可以在文档树中传播。
   * @returns {Object} 事件对象。
   * @description
   *   通过调用本方法产生的事件对象不具备默认行为。
   *   如果需要执行此类事件的默认行为，可以直接在本对象上调用对应的方法（如 click、reset 等）。
   */
  DOMEventTarget.prototype.fire = function(type, data) {
    // 内部使用时，type 可能被传入 INTERNAL_IDENTIFIER_EVENT，此时的 data 已经是一个 DOMEvent 对象。
    var event = type === INTERNAL_IDENTIFIER_EVENT ? data : new DOMEvent(type, {type: '', target: this}, data);
    // 传播事件并返回传播后的事件对象。
    var $target = this;
    var item;
    var handlers;
    while ($target) {
      if (handlers = (item = eventHandlers[$target.uid]) && item[event.type]) {
        distributeEvent($target, handlers, event);
      }
      // IE6 中即便 $target 就是 window，表达式 $target == window 也返回 false。
      if (!event.bubbles || event.isPropagationStopped() || $target.uid === 'window') {
        break;
      }
      $target = $target === document ? window : $target.getParent() || $target === html && document || null;
    }
    return event;
  };

//==================================================[DOM 事件模型 - 应用]
  /*
   * 使 window 对象、document 对象和所有的 Element 对象都具备 DOMEventTarget 对象提供的实例方法。
   */

  window.on = document.on = Element.prototype.on = DOMEventTarget.prototype.on;
  window.off = document.off = Element.prototype.off = DOMEventTarget.prototype.off;
  window.fire = document.fire = Element.prototype.fire = DOMEventTarget.prototype.fire;

})();
/**
 * @fileOverview JSEventModule
 * @author sundongguo@gmail.com
 * @version 20130509
 */

(function() {
//==================================================[JS 事件模型]
  /*
   * 为 JS 对象提供的事件模型。
   *
   * 相关名词的解释如下：
   *   事件对象 (event)：
   *     本事件模型提供的事件对象，包含与此事件有关的信息，是 JSEvent 的实例。
   *   分发：
   *     在一个指定的对象上，将 event 作为参数逐个传入该对象相应的监听器。
   *   监听器 (listener)：
   *     添加到一个对象的、监听某种类型的事件的函数。
   *     当此对象上的某种类型的事件被触发时，对应的监听器会被调用，并传入 event 作为其唯一的参数。
   *   监听器名称 (name)：
   *     由要监听的 type 和 label 组成，其中 type 是必选的。
   *   事件类型 (type)：
   *     事件的类型。
   *   标签 (label)：
   *     在 name 的末尾添加 label 可以使相同对象上添加的相同类型、相同行为的监听器具备不同的名称。不同的名称可以确保调用 off 方法时能够精确匹配要删除的监听器。
   *
   * 添加或删除监听器：
   *   通过调用 on 或 off 方法来添加或删除指定的监听器。
   *
   * 触发事件：
   *   通过调用 fire 方法来触发一个事件。
   *   fire 方法会自动创建、传播和分发 event。
   *
   * 提供对象：
   *   JSEvent
   *   JSEventTarget
   *
   * 提供静态方法：
   *   JSEventTarget.create
   *
   * 提供实例属性：
   *   eventHandlers
   *   <Object eventHandlers> {
   *     <string type>: <Array handlers> [
   *       <Object handler>: {
   *         name: <string name>
   *         listener: <Function listener>
   *       }
   *     ]
   *   }
   *
   * 提供实例方法：
   *   JSEventTarget.on
   *   JSEventTarget.off
   *   JSEventTarget.fire
   */

  var separator = /\s*,\s*/;

  var eventNamePattern = /^([a-zA-Z]+)(?:\.\w+)?$/;
  var getEventType = function(name) {
    var match = name.match(eventNamePattern);
    if (match === null) {
      throw new SyntaxError('Invalid event name "' + name + '"');
    }
    return match[1];
  };

//--------------------------------------------------[JSEvent]
  /**
   * 事件对象。
   * @name JSEvent
   * @constructor
   * @param {string} type 事件类型。
   * @param {Object} target 触发本事件的对象。
   * @param {Object} [data] 附加数据。
   */
  var JSEvent = function(type, target, data) {
    this.type = type;
    this.target = target;
    if (data) {
      Object.mixin(this, data, {blackList: ['type', 'target']});
    }
  };

  /**
   * 事件类型。
   * @name JSEvent#type
   * @type string
   */

  /**
   * 触发事件的对象。
   * @name JSEvent#target
   * @type Object
   */

//--------------------------------------------------[JSEventTarget]
  /**
   * 通过调用 new JSEventTarget() 获得的新对象，或经过 JSEventTarget.create(object) 处理后的 object 对象，都将具备处理事件的能力，它们都可以被叫做一个 JSEventTarget 对象。
   * @name JSEventTarget
   * @constructor
   * @description
   *   JSEventTarget 对象在处理事件时，是工作在 JS 事件模型中的。
   *   window、document 和 Element 对象也都具备处理事件的能力，但它们是工作在 DOM 事件模型中的。
   */
  var JSEventTarget = window.JSEventTarget = function() {
    this.eventHandlers = {};
  };

//--------------------------------------------------[JSEventTarget.create]
  /**
   * 让目标对象成为一个 JSEventTarget 对象，以具备处理事件的能力。
   * @name JSEventTarget.create
   * @function
   * @param {Object} target 目标对象。
   *   目标对象不应该是 window、document 或 Element 对象，因为这些对象已经具备处理事件的能力，并且使用的是 DOM 事件模型。
   * @returns {Object} 目标对象。
   * @description
   *   <ul>
   *     <li>目标对象将被添加实例属性 eventHandlers 用于保存处理事件所必需的数据。</li>
   *     <li>目标对象将被添加实例方法 on 用于添加事件监听器。</li>
   *     <li>目标对象将被添加实例方法 off 用于删除事件监听器。</li>
   *     <li>目标对象将被添加实例方法 fire 用于触发某类事件。</li>
   *   </ul>
   */
  JSEventTarget.create = function(target) {
    this.call(target);
    Object.mixin(target, this.prototype);
    return target;
  };

//--------------------------------------------------[JSEventTarget.prototype.on]
  /**
   * 为本对象添加事件监听器。
   * @name JSEventTarget.prototype.on
   * @function
   * @param {string} name 监听器名称。
   *   监听器名称由要监听的事件类型（必选）和标签（可选）组成，格式如下：
   *   <p><dfn><var>type</var></dfn>[<dfn>.<var>label</var></dfn>]</p>
   *   详细信息请参考下表：
   *   <table>
   *     <tr><th>组成部分</th><th>详细描述</th></tr>
   *     <tr>
   *       <td><dfn><var>type</var></dfn></td>
   *       <td>本监听器要监听的事件类型。<br><var>type</var> 只能使用大小写英文字母。</td>
   *     </tr>
   *     <tr>
   *       <td><dfn>.<var>label</var></dfn></td>
   *       <td>在监听器名称的末尾添加标签可以可以使相同对象上添加的相同类型、相同行为的监听器具备不同的名称。不同的名称可以确保调用 off 方法时能够精确匹配要删除的监听器。<br>添加具有明确含义的标签，可以最大限度的避免监听器被误删。<br><var>label</var> 可以使用英文字母、数字和下划线。</td>
   *     </tr>
   *   </table>
   *   使用逗号分割多个监听器名称，即可以在本对象上使用多个名称将同一个监听器添加多次。
   * @param {Function} listener 监听器。
   *   该函数将在对应的事件发生时被调用，传入事件对象作为参数。
   *   该函数被调用时 this 的值为监听到本次事件的对象。
   * @returns {Object} 本对象。
   */
  JSEventTarget.prototype.on = function(name, listener) {
    var eventHandlers = this.eventHandlers;
    name.split(separator).forEach(function(name) {
      var type = getEventType(name);
      var handlers = eventHandlers[type] || (eventHandlers[type] = []);
      handlers.push({name: name, listener: listener});
    });
    return this;
  };

//--------------------------------------------------[JSEventTarget.prototype.off]
  /**
   * 删除本对象上已添加的事件监听器。
   * @name JSEventTarget.prototype.off
   * @function
   * @param {string} name 监听器名称。
   *   本对象上添加的所有名称与 name 匹配的监听器都将被删除。
   *   使用逗号分割多个监听器名称，即可同时删除该对象上的多个监听器。
   * @returns {Object} 本对象。
   */
  JSEventTarget.prototype.off = function(name) {
    var eventHandlers = this.eventHandlers;
    name.split(separator).forEach(function(name) {
      var type = getEventType(name);
      var handlers = eventHandlers[type];
      if (handlers) {
        var i = 0;
        var handler;
        while (i < handlers.length) {
          handler = handlers[i];
          if (handler.name === name) {
            handlers.splice(i, 1);
          } else {
            i++;
          }
        }
        if (handlers.length === 0) {
          delete eventHandlers[type];
        }
      }
    });
    return this;
  };

//--------------------------------------------------[JSEventTarget.prototype.fire]
  /**
   * 触发本对象的某类事件。
   * @name JSEventTarget.prototype.fire
   * @function
   * @param {string} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   * @returns {Object} 事件对象。
   */
  JSEventTarget.prototype.fire = function(type, data) {
    var target = this;
    var event = new JSEvent(type, target, data);
    var handlers = target.eventHandlers[type];
    if (handlers) {
      // 分发时对 handlers 的副本操作，以避免在监听器内添加或删除该对象的同类型的监听器时会影响本次分发过程。
      handlers.slice(0).forEach(function(handler) {
        handler.listener.call(target, event);
      });
    }
    return event;
  };

})();
/**
 * @fileOverview 动画
 * @author sundongguo@gmail.com
 * @version 20120412
 */

(function() {
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
   *   <ul>
   *     <li>向一个动画中添加多个剪辑，并调整每个剪辑的 delay，duration，timingFunction 参数，以实现复杂的动画。</li>
   *     <li>仅应在动画初始化时（播放之前）添加动画剪辑，不要在开始播放后添加或更改动画剪辑。</li>
   *     <li>不要在多个剪辑中变更同一个元素的样式。</li>
   *   </ul>
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

})();

(function() {
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
  var hexColorPattern = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i;
  var shortHexColorPattern = /^#([\da-f])([\da-f])([\da-f])$/i;
  var rgbColorPattern = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
  var extractColorValue = function(value) {
    var extractedValue = [255, 255, 255];
    if (NAMED_COLORS.hasOwnProperty(value)) {
      value = NAMED_COLORS[value];
    }
    var match;
    if (match = value.match(hexColorPattern)) {
      extractedValue = Array.from(match).slice(1).map(function(hexadecimal) {
        return parseInt(hexadecimal, 16);
      });
    } else if (match = value.match(shortHexColorPattern)) {
      extractedValue = Array.from(match).slice(1).map(function(hexadecimal) {
        return parseInt(hexadecimal + hexadecimal, 16);
      });
    } else if (match = value.match(rgbColorPattern)) {
      extractedValue = Array.from(match).slice(1).map(function(decimal) {
        return +decimal;
      });
    }
    return extractedValue;
  };

  // 计算新数字，支持相对数值变化。
  var relativeValuePattern = /^[+\-]=\d+$/;
  var calculateNewValue = function(valueBefore, newValue) {
    return typeof newValue === 'string' && relativeValuePattern.test(newValue) ? valueBefore + (+(newValue.slice(0, 1) + '1') * newValue.slice(2)) : extractNumberValue(newValue);
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

})();

(function() {
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
  var separator = /\s*,\s*/;

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
    var types = type ? type.split(separator) : null;
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

})();
/**
 * @fileOverview 远程请求
 * @author sundongguo@gmail.com
 * @version 20120921
 */

(function() {
//==================================================[远程请求]
  /*
   * W3C 的 XMLHttpRequest Level 2 草案中提及的，不能被 IE6 IE7 IE8 IE9 支持的相关内容暂不予提供。
   * http://www.w3.org/TR/XMLHttpRequest/
   */

  // 请求状态。
  var COMPLETE = 0;
  var ABORT = -498;
  var TIMEOUT = -408;

  // 唯一识别码。
  var uid = Date.now();

  // 空函数。
  var empty = function() {
  };

  // 正在请求中的 XHR 模式的 request 对象。
  // http://bugs.jquery.com/ticket/5280
  var activeXHRModeRequests = [];
  if (window.ActiveXObject) {
    window.on('unload', function() {
      activeXHRModeRequests.forEach(function(request) {
        request.abort();
      });
    });
  }

  // 获取 XHR 对象。
  var getXHRObject = function() {
    try {
      var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    } catch (e) {
      throw new Error('Can not create XHR Object');
    }
    return xhr;
  };

  // 获取响应头信息。
  var headersPattern = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
  var parseXHRHeaders = function(rawHeaders) {
    var headers = {};
    var match;
    while (match = headersPattern.exec(rawHeaders)) {
      headers[match[1]] = match[2];
    }
    return headers;
  };

  // 数据传输已完成，应用最短时间设置。
  var transferComplete = function(request) {
    if (request.async && Number.isFinite(request.minTime)) {
      var delayTime = request.minTime - (Date.now() - request.timestamp);
      if (delayTime > 0) {
        request.minTimeTimer = setTimeout(function() {
          requestComplete(request, COMPLETE);
        }, delayTime);
        return;
      }
    }
    requestComplete(request, COMPLETE);
  };

  // 请求已完成，state 可能是 COMPLETE、ABORT 或 TIMEOUT。
  var requestComplete = function(request, state) {
    // 取消最短时间设置。
    if (request.minTimeTimer) {
      // 本次请求已经完成，但可能在等待过程中调用 abort 方法或设置了更短的 maxTime，导致 state 为 ABORT 或 TIMEOUT，所以要把 state 重置为 COMPLETE。
      state = COMPLETE;
      clearTimeout(request.minTimeTimer);
      delete request.minTimeTimer;
    }
    // 取消超时时间设置。
    if (request.maxTimeTimer) {
      clearTimeout(request.maxTimeTimer);
      delete request.maxTimeTimer;
    }
    // 重置请求状态。
    request.ongoing = false;
    delete request.timestamp;
    // 分析结果。
    var responseData = {
      status: 0,
      statusText: ''
    };
    switch (request.mode) {
      case 'xhr':
        responseData.headers = {};
        responseData.text = '';
        responseData.xml = null;
        // 清理 XHR 请求的状态。
        var xhr = request.xhr;
        delete request.xhr;
        xhr.onreadystatechange = empty;
        if (state === COMPLETE) {
          // 请求已完成，获取数据。
          // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
          try {
            responseData.status = xhr.status;
            // http://bugs.jquery.com/ticket/1450
            if (responseData.status === 1223) {
              responseData.status = 204;
            }
            responseData.statusText = xhr.statusText;
            responseData.headers = parseXHRHeaders(xhr.getAllResponseHeaders());
            responseData.text = xhr.responseText;
            // http://bugs.jquery.com/ticket/4958
            if (xhr.responseXML && xhr.responseXML.documentElement) {
              responseData.xml = xhr.responseXML;
            }
          } catch (e) {
          }
        } else {
          // 请求被取消或超时，取消本次 XHR 请求。
          xhr.abort();
        }
        activeXHRModeRequests.remove(request);
        break;
      case 'jsonp':
        responseData.data = null;
        if (state === COMPLETE) {
          // 请求已完成，获取数据。
          responseData.status = COMPLETE;
          responseData.statusText = 'OK';
          responseData.data = request.receivedData;
        } else {
          // 请求被取消或超时，取消本次 JSONP 回调的响应。
          var requestId = request.id;
          Request[requestId] = function() {
            delete Request[requestId];
          };
        }
        break;
    }
    // 触发事件。
    switch (state) {
      case COMPLETE:
        request.fire('complete', responseData);
        break;
      case ABORT:
        responseData.status = ABORT;
        responseData.statusText = 'Aborted';
        request.fire('abort', responseData);
        break;
      case TIMEOUT:
        responseData.status = TIMEOUT;
        responseData.statusText = 'Timeout';
        request.fire('timeout', responseData);
        break;
    }
    request.fire('finish', responseData);
  };

//--------------------------------------------------[Request]
  /**
   * 对一个指定的资源发起请求，并获取响应数据。
   * @name Request
   * @constructor
   * @param {string} url 请求地址。
   * @param {Object} [options] 可选参数。
   * @param {string} [options.mode] 请求模式，使用 'xhr' 则为 XHR 模式，使用 'jsonp' 则为 JSONP 模式，默认为 'xhr'，大小写不敏感。
   * @param {string} [options.method] 请求方法，在 XHR 模式下可以使用 'get' 和 'post'，默认为 'get'，在 JSONP 模式下永远为 'get'，大小写不敏感。
   *   如果使用 'get' 方式，应将整个 URL 的长度控制在 2048 个字符以内。
   * @param {boolean} [options.useCache] 是否允许浏览器的缓存生效，在 XHR 模式下可以使用 true 和 false，默认为 true，在 JSONP 模式下永远为 false。
   * @param {boolean} [options.async] 是否使用异步方式，在 XHR 模式下可以使用 true 和 false，默认为 true，在 JSONP 模式下永远为 true。
   * @param {number} [options.minTime] 请求最短时间，单位为毫秒，默认为 NaN，即无最短时间限制，async 为 true 时有效。
   * @param {number} [options.maxTime] 请求超时时间，单位为毫秒，默认为 NaN，即无超时时间限制，async 为 true 时有效。
   * @param {string} [options.username] 用户名，仅在 XHR 模式下有效，默认为空字符串，即不指定用户名。
   * @param {string} [options.password] 密码，仅在 XHR 模式下有效，默认为空字符串，即不指定密码。
   * @param {Object} [options.headers] 要设置的 request headers，仅在 XHR 模式下有效，格式为 {key: value, ...} 的对象，默认为 {'X-Requested-With': 'XMLHttpRequest', 'Accept': '*&#47;*'}。
   * @param {string} [options.contentType] 发送数据的内容类型，仅在 XHR 模式下且 method 为 'post' 时有效，默认为 'application/x-www-form-urlencoded'。
   * @param {string} [options.callbackName] 指定服务端获取 JSONP 前缀的参数名，仅在 JSONP 模式下有效，默认为 'callback'，大小写敏感。
   * @fires start
   *   请求开始时触发。
   * @fires abort
   *   请求被取消时触发。
   * @fires timeout
   *   请求超时时触发。
   * @fires complete
   *   请求完成时触发。
   * @fires finish
   *   请求结束时触发。
   *   只要请求已开始，此事件就必然会被触发（跟随在 abort、timeout 或 complete 任一事件之后）。
   *   这样设计的好处是在请求结束时可以统一处理一些状态的设定或恢复，如将 start 事件监听器中呈现到用户界面的提示信息隐藏。
   * @description
   *   所有 Request 的实例也都是一个 JSEventTarget 对象。
   *   每个 Request 的实例都对应一个资源，实例创建后可以重复使用。
   *   创建 Request 时，可以选择使用 XHR 模式（同域请求时）或 JSONP 模式（跨域请求时）。
   *   在 JSONP 模式下，如果服务端返回的响应体不是 JSONP 格式的数据，请求将出现错误，并且这个错误是无法被捕获的。需要注意的是 JSONP 请求会直接执行另一个域内的脚本，因此如果该域遭到攻击，本域也可能会受到影响。
   *   两种模式的请求结果都会被传入 abort、timeout、complete 和 finish 事件监听器中。
   *   XHR 模式的请求结果中包含以下属性：
   *   <ul>
   *     <li>{number} <dfn>status</dfn> 状态码。</li>
   *     <li>{string} <dfn>statusText</dfn> 状态描述。</li>
   *     <li>{Object} <dfn>headers</dfn> 响应头。</li>
   *     <li>{string} <dfn>text</dfn> 响应文本。</li>
   *     <li>{XMLDocument} <dfn>xml</dfn> 响应 XML 文档。</li>
   *   </ul>
   *   JSONP 模式的请求结果中包含以下属性：
   *   <ul>
   *     <li>{number} <dfn>status</dfn> 状态码。</li>
   *     <li>{string} <dfn>statusText</dfn> 状态描述。</li>
   *     <li>{Object} <dfn>data</dfn> 请求结果。</li>
   *   </ul>
   */
  var Request = window.Request = function(url, options) {
    // 保存请求地址。
    this.url = url;
    // 保存选项数据。
    options = Object.mixin(Object.clone(Request.options, true), options || {});
    switch (options.mode = options.mode.toLowerCase()) {
      case 'xhr':
        options.method = options.method.toLowerCase();
        Object.mixin(this, options, {whiteList: ['mode', 'method', 'useCache', 'async', 'minTime', 'maxTime', 'username', 'password', 'headers', 'contentType']});
        break;
      case 'jsonp':
        options.method = 'get';
        options.useCache = false;
        options.async = true;
        Object.mixin(this, options, {whiteList: ['mode', 'method', 'useCache', 'async', 'minTime', 'maxTime', 'callbackName']});
        break;
    }
    /**
     * 请求是否正在进行中。
     * @name Request#ongoing
     * @type boolean
     */
    this.ongoing = false;
    JSEventTarget.create(this);
  };

//--------------------------------------------------[Request.options]
  /**
   * 默认选项。
   * @name Request.options
   * @type Object
   * @description
   *   修改 Request.options 即可更改 Request 的默认选项，新的默认选项仅对后续创建的实例生效。
   */
  Request.options = {
    mode: 'xhr',
    method: 'get',
    useCache: true,
    async: true,
    minTime: NaN,
    maxTime: NaN,
    username: '',
    password: '',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': '*/*'
    },
    contentType: 'application/x-www-form-urlencoded',
    callbackName: 'callback'
  };

//--------------------------------------------------[Request.prototype.send]
  /**
   * 发送请求。
   * @name Request.prototype.send
   * @function
   * @param {Object} [requestData] 要发送的数据。
   *   数据格式为 {key1: value1, key2: [value21, value22, ...], ...}，其中所有 value 都可以为任意基本类型的数据（在发送时它们都将被强制转换为字符串类型），另外 key 和 value 均不必做百分比编码。
   *   本方法的参数不允许使用字符串类型的数据，因为无法判断指定的字符串值是否需要做百分比编码。
   * @returns {boolean} 本方法是否已被成功调用。
   * @description
   *   如果上一次发送的请求尚未完成，则调用本方法无效。
   */
  Request.prototype.send = function(requestData) {
    var request = this;
    // 如果请求正在进行中，则需等待此次请求完成后才能再次发起请求（若设置了 minTime 则请求完成的时间可能比交互完成的时间长）。
    if (!request.ongoing) {
      // 序列化请求数据。如果请求数据为空，则统一使用 null 表示。
      requestData = requestData ? Object.toQueryString(requestData) : null;
      // 触发 start 事件。
      request.fire('start');
      // 请求开始进行。
      request.ongoing = true;
      request.timestamp = Date.now();
      // 发送 XHR 或 JSONP 模式的请求。
      var url = request.url;
      var method = request.method;
      if (method === 'get' && requestData) {
        url += (url.contains('?') ? '&' : '?') + requestData;
        requestData = null;
      }
      var async = request.async;
      switch (request.mode) {
        case 'xhr':
          if (!request.useCache) {
            url += (url.contains('?') ? '&' : '?') + '_=' + (++uid).toString(36);
          }
          var xhr = request.xhr = getXHRObject();
          // 准备请求。
          xhr.open(method, url, async, request.username, request.password);
          // 设置请求头。
          Object.forEach(request.headers, function(value, key) {
            xhr.setRequestHeader(key, value);
          });
          if (method === 'post') {
            xhr.setRequestHeader('Content-Type', request.contentType);
          }
          // 发送请求。
          xhr.send(requestData);
          activeXHRModeRequests.push(request);
          // 检查请求状态。
          if (!async || xhr.readyState === 4) {
            // IE 使用 ActiveXObject 创建的 XHR 对象即便在异步模式下，如果访问地址已被浏览器缓存，将直接改变 readyState 为 4，并且不会触发 onreadystatechange 事件。
            transferComplete(request);
          } else {
            xhr.onreadystatechange = function() {
              if (xhr.readyState === 4) {
                transferComplete(request);
              }
            };
          }
          break;
        case 'jsonp':
          var requestId = '_' + (++uid).toString(36);
          url += (url.contains('?') ? '&' : '?') + request.callbackName + '=Request.' + requestId;
          // 准备回调函数。
          Request[request.id = requestId] = function(data) {
            delete Request[requestId];
            request.receivedData = data;
            transferComplete(request);
          };
          // 发送请求。
          document.loadScript(url);
          break;
      }
      // 超时时间设置。
      if (async && Number.isFinite(request.maxTime)) {
        request.maxTimeTimer = setTimeout(function() {
          requestComplete(request, TIMEOUT);
        }, Math.max(0, request.maxTime));
      }
      return true;
    }
    return false;
  };

//--------------------------------------------------[Request.prototype.abort]
  /**
   * 取消请求。
   * @name Request.prototype.abort
   * @function
   * @returns {boolean} 本方法是否已被成功调用。
   * @description
   *   仅在一次异步模式的请求正在进行时，调用本方法才有效。
   */
  Request.prototype.abort = function() {
    if (this.ongoing) {
      requestComplete(this, ABORT);
      return true;
    }
    return false;
  };

})();
/**
 * @fileOverview Widget
 * @author sundongguo@gmail.com
 * @version 20121008
 */

(function() {
//==================================================[Widget]
  /*
   * 一个 Widget 本身仍是一个元素。当一个元素成为 Widget 时，将具备新的行为，获得新的属性、方法，并能触发新的事件。
   * 这些新增的特性并不妨碍将一个 Widget 视为一个普通元素来对其进行操作（如修改某部分的内容、结构、表现或行为）。
   * 一个 Widget 至少依赖一个已经存在于文档树中的元素，一个元素只能成为一种 Widget。
   *
   * 使一个元素成为 Widget 有以下两种方式：
   *   1. 在编写 HTML 代码时，为该元素添加 widget-<type> 类，并使用 data-<config>="<value>" 来定义 Widget 的配置。
   *   2. 在脚本中创建符合方式 1 的元素，之后调用 Widget.parse(<element>) 方法来解析。
   * 其中 type 为 Widget 的类型，config/value 为 Widget 的配置信息，element 为目标元素。
   *
   * 为了使相同类型的 Widget 必定具备相同的新特性，本实现并未提供直接手段对现有的 Widget 进行扩展。
   * 必须要扩展时，应注册一个新的 Widget，并在其初始化函数中调用现有的解析器 Widget.parsers.<type>.parse($element) 来赋予目标元素 <type> 类 Widget 的新特性，即对已有的 Widget 类型进行包装。
   *
   * 一些 Widget 如果在 beforedomready 事件发生时初始化完毕，但没有在 domready 事件发生时主动调用其重建界面的方法 M，则方法 M 会在 afterdomready 事件发生时自动被调用。
   * 这种处理方式是为了确保在 domready 事件发生时为该 Widget 添加的监听器可以被正常调用。
   * 通常在上述方法 M 被调用前，这些 Widget 会将其默认样式 visibility 预置为 hidden，并在首次调用方法 M 后再将 visibility 修改为 visible，以避免可能出现的内容闪烁。
   *
   * 提供对象：
   *   Widget
   *
   * 提供命名空间：
   *   Widget.parsers
   *
   * 提供静态方法：
   *   Widget.register
   *   Widget.parse
   */

//--------------------------------------------------[Widget]
  /**
   * 提供对 Widget 的支持。
   * @name Widget
   * @namespace
   */
  var Widget = window.Widget = {parsers: {}};

//--------------------------------------------------[Widget.register]
  /**
   * 注册一个 Widget。
   * @name Widget.register
   * @function
   * @param {Object} widget 要注册的 Widget 的相关信息。
   * @param {string} widget.type Widget 的类型。
   * @param {string} widget.selector Widget 的选择符，能被此选择符选中的元素即可被本 Widget 的解析器解析。
   * @param {Array} [widget.styleRules] 包含要应用到此类 Widget 的 CSS 规则集的数组。
   * @param {Object} [widget.config] 包含此类 Widget 的默认配置的对象。
   * @param {Object} [widget.methods] 包含此类 Widget 的实例方法的对象。
   * @param {Function} [widget.initialize] 此类 Widget 的初始化函数。
   */
  Widget.register = function(widget) {
    if (widget.styleRules) {
      document.addStyleRules(widget.styleRules);
    }

    Widget.parsers[widget.type] = {
      selector: widget.selector,
      nodeName: widget.selector.substring(0, widget.selector.indexOf('.')).toUpperCase(),
      parse: function($element) {
        // 从目标元素的 attributes 中解析配置信息并将其添加到目标元素。
        if (widget.config) {
          Object.forEach(widget.config, function(defaultValue, key) {
            var value = defaultValue;
            var specifiedValue = $element.getData(key);
            if (specifiedValue !== undefined) {
              switch (typeof defaultValue) {
                case 'string':
                  value = specifiedValue;
                  break;
                case 'boolean':
                  value = true;
                  break;
                case 'number':
                  value = parseFloat(specifiedValue);
                  break;
                default:
                  throw new Error('Invalid config type "' + key + '"');
              }
            }
            $element[key] = value;
          });
        }
        // 为目标元素添加方法。
        if (widget.methods) {
          Object.mixin($element, widget.methods);
        }
        // 初始化。
        if (widget.initialize) {
          widget.initialize.call($element);
        }
        // 标记 Widget 的类型。
        $element.widgetType = widget.type;
      }
    };

  };

//--------------------------------------------------[Widget.parse]
  /**
   * 将符合条件的元素解析为 Widget。
   * @name Widget.parse
   * @function
   * @param {Element} element 要解析的元素。
   * @param {boolean} [recursively] 是否解析该元素的后代元素。
   * @description
   *   在 DOM 树解析完成后会自动将页面内的全部符合条件的元素解析为 Widget，因此仅应在必要时调用本方法。
   */
  var widgetTypePattern = /\bwidget-([a-z][a-z0-9-]*)\b/;
  Widget.parse = function(element, recursively) {
    var $element = document.$(element);
    if (!$element.widgetType) {
      var match = $element.className.match(widgetTypePattern);
      if (match) {
        var type = match[1];
        var parser = Widget.parsers[type];
        if (parser && parser.parse) {
          if ($element.nodeName === parser.nodeName) {
            parser.parse($element);
          } else {
            console.warn('OurJS: Widget "' + type + '" can not be applied on ' + $element.nodeName + ' elements.');
          }
        } else {
          console.warn('OurJS: Widget parser "' + type + '" is not found.');
        }
      }
    }
    if (recursively) {
      $element.findAll('[class*=widget-]').forEach(function($element) {
        Widget.parse($element);
      });
    }
  };

//--------------------------------------------------[自动解析]
  document.on('beforedomready', function() {
    Widget.parse(document.body, true);
  });

})();
/*!
 * JSON in JavaScript
 *  Douglas Crockford
 *  http://www.JSON.org/json2.js
 *  2011-10-19
 *  Public Domain.
 */

/**
 * @fileOverview JSON 对象补缺
 */

/*
  http://www.JSON.org/json2.js
  2011-10-19

  Public Domain.

  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

  See http://www.JSON.org/js.html


  This code should be minified before deployment.
  See http://javascript.crockford.com/jsmin.html

  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
  NOT CONTROL.


  This file creates a global JSON object containing two methods: stringify
  and parse.

    JSON.stringify(value, replacer, space)
      value     any JavaScript value, usually an object or array.

      replacer  an optional parameter that determines how object
                values are stringified for objects. It can be a
                function or an array of strings.

      space     an optional parameter that specifies the indentation
                of nested structures. If it is omitted, the text will
                be packed without extra whitespace. If it is a number,
                it will specify the number of spaces to indent at each
                level. If it is a string (such as '\t' or '&nbsp;'),
                it contains the characters used to indent at each level.

      This method produces a JSON text from a JavaScript value.

      When an object value is found, if the object contains a toJSON
      method, its toJSON method will be called and the result will be
      stringified. A toJSON method does not serialize: it returns the
      value represented by the name/value pair that should be serialized,
      or undefined if nothing should be serialized. The toJSON method
      will be passed the key associated with the value, and this will be
      bound to the value

      For example, this would serialize Dates as ISO strings.

      Date.prototype.toJSON = function(key) {
        function f(n) {
          // Format integers to have at least two digits.
          return n < 10 ? '0' + n : n;
        }

        return this.getUTCFullYear()   + '-' +
           f(this.getUTCMonth() + 1) + '-' +
           f(this.getUTCDate())    + 'T' +
           f(this.getUTCHours())   + ':' +
           f(this.getUTCMinutes())   + ':' +
           f(this.getUTCSeconds())   + 'Z';
      };

      You can provide an optional replacer method. It will be passed the
      key and value of each member, with this bound to the containing
      object. The value that is returned from your method will be
      serialized. If your method returns undefined, then the member will
      be excluded from the serialization.

      If the replacer parameter is an array of strings, then it will be
      used to select the members to be serialized. It filters the results
      such that only members with keys listed in the replacer array are
      stringified.

      Values that do not have JSON representations, such as undefined or
      functions, will not be serialized. Such values in objects will be
      dropped; in arrays they will be replaced with null. You can use
      a replacer function to replace those with JSON values.
      JSON.stringify(undefined) returns undefined.

      The optional space parameter produces a stringification of the
      value that is filled with line breaks and indentation to make it
      easier to read.

      If the space parameter is a non-empty string, then that string will
      be used for indentation. If the space parameter is a number, then
      the indentation will be that many spaces.

      Example:

      text = JSON.stringify(['e', {pluribus: 'unum'}]);
      // text is '["e",{"pluribus":"unum"}]'


      text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
      // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

      text = JSON.stringify([new Date()], function(key, value) {
        return this[key] instanceof Date ?
          'Date(' + this[key] + ')' : value;
      });
      // text is '["Date(---current time---)"]'


    JSON.parse(text, reviver)
      This method parses a JSON text to produce an object or array.
      It can throw a SyntaxError exception.

      The optional reviver parameter is a function that can filter and
      transform the results. It receives each of the keys and values,
      and its return value is used instead of the original value.
      If it returns what it received, then the structure is not modified.
      If it returns undefined then the member is deleted.

      Example:

      // Parse the text. Values that look like ISO date strings will
      // be converted to Date objects.

      myData = JSON.parse(text, function(key, value) {
        var a;
        if (typeof value === 'string') {
          a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
          if (a) {
            return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
              +a[5], +a[6]));
          }
        }
        return value;
      });

      myData = JSON.parse('["Date(09/09/2001)"]', function(key, value) {
        var d;
        if (typeof value === 'string' &&
            value.slice(0, 5) === 'Date(' &&
            value.slice(-1) === ')') {
          d = new Date(value.slice(5, -1));
          if (d) {
            return d;
          }
        }
        return value;
      });


  This is a reference implementation. You are free to copy, modify, or
  redistribute.
*/

/* jslint evil: true, regexp: true */

/*
  members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
  call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
  getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
  lastIndex, length, parse, prototype, push, replace, slice, stringify,
  test, toJSON, toString, valueOf
*/

(function() {
  'use strict';

//==================================================[JSON 补缺]
  /*
   * 除 json2.js 提供的方法外，还为 JSON 对象添加了 toString 方法，以配合 typeOf 方法返回预期的值。
   *
   * 补缺对象：
   *   JSON
   *
   * 补缺方法：
   *   Date.prototype.toJSON
   *   String.prototype.toJSON
   *   Number.prototype.toJSON
   *   Boolean.prototype.toJSON
   */

  /**
   * JSON 对象。
   * @name JSON
   * @namespace
   */

//--------------------------------------------------[JSON.toString]
  // IE8 的较低子版本中使用内置的 JSON.stringify 方法处理表单控件的空值时有 BUG。
  // http://tech.groups.yahoo.com/group/json/message/1268
  if (!window.JSON || navigator.isIE8) {
    window.JSON = {
      toString: function() {
        return '[object JSON]';
      }
    };
  }

//--------------------------------------------------[String/Boolean/Number/Date.prototype.toJSON]
  /**
   * 将字符串转换为 JSON 格式的字符串。
   * @name String.prototype.toJSON
   * @function
   * @returns {string} 转换后的字符串。
   */

  /**
   * 将布尔值转换为 JSON 格式的字符串。
   * @name Boolean.prototype.toJSON
   * @function
   * @returns {string} 转换后的字符串。
   */

  /**
   * 将数字转换为 JSON 格式的字符串。
   * @name Number.prototype.toJSON
   * @function
   * @returns {string} 转换后的字符串。
   */

  /**
   * 将日期转换为 JSON 格式的字符串。
   * @name Date.prototype.toJSON
   * @function
   * @returns {string} 转换后的字符串。
   */

  function f(n) {
    // Format integers to have at least two digits.
    return n < 10 ? '0' + n : n;
  }

  if (typeof Date.prototype.toJSON !== 'function') {

    Date.prototype.toJSON = function(key) {

      return isFinite(this.valueOf())
          ? this.getUTCFullYear() + '-' +
          f(this.getUTCMonth() + 1) + '-' +
          f(this.getUTCDate()) + 'T' +
          f(this.getUTCHours()) + ':' +
          f(this.getUTCMinutes()) + ':' +
          f(this.getUTCSeconds()) + 'Z'
          : null;
    };

    String.prototype.toJSON = Boolean.prototype.toJSON = Number.prototype.toJSON = function(key) {
      return this.valueOf();
    };
  }

//--------------------------------------------------[JSON.stringify]
  /**
   * 将 ECMAScript 值转换为 JSON 格式的字符串。
   * @name JSON.stringify
   * @function
   * @param {*} value 要转换的 ECMAScript 值，通常是 Object 或 Array 类型，也可以是 String、Boolean、Number、Date 类型或者 null。
   * @param {Function|Array} [replacer] 用来更改/过滤转换结果的函数或数组。
   *   <dl>
   *     <dt>如果是函数，则：</dt>
   *     <dd>
   *       该函数将在解析要转换的 ECMAScript 值中每一个键值对之前被调用，传入两个参数 key 和 value，并使用其返回值代替 value 进行转换。如果返回 undefined，则正在处理的这个键值对将被从转换结果中删除。
   *       该函数第一次被调用（如果要转换的 ECMAScript 值的类型是 String、Boolean、Number、Date 或为 null 时则是唯一一次被调用）时，传入的 key 是空字符串，value 是要转换的 ECMAScript 值。
   *       该函数被调用时 this 的值为当前传入的 key 和 value 所属的 ECMAScript 对象，可能为 Object 或 Array。
   *     </dd>
   *     <dt>如果是数组，则：</dt>
   *     <dd>
   *       该数组只能包含字符串，本方法会仅对 key 出现在数组中的部分进行转换。
   *     </dd>
   *   </dl>
   * @param {string|number} [space] 为使 JSON 字符串更易读而将其换行，并在每行内容之前加入的前缀。
   *   如果是字符串，则直接加入这个字符串作为前缀。若字符串的长度超过 10，则仅保留前 10 个字符。
   *   如果是数字，则加入对应数目的空格符。若数字大于 10，则只使用 10 个空格符。
   *   如果未指定该值，或者该值为 '' 或小于 1 的数字，则 JSON 字符串不会换行。
   * @returns {string} 转换后的字符串。
   */

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {    // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
      },
      rep;

  function quote(string) {

    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.

    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
      var c = meta[a];
      return typeof c === 'string'
          ? c
          : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
  }

  function str(key, holder) {

    // Produce a string from holder[key].

    var i,          // The loop counter.
        k,          // The member key.
        v,          // The member value.
        length,
        mind = gap,
        partial,
        value = holder[key];

    // If the value has a toJSON method, call it to obtain a replacement value.

    if (value && typeof value === 'object' &&
        typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    }

    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.

    if (typeof rep === 'function') {
      value = rep.call(holder, key, value);
    }

    // What happens next depends on the value's type.

    switch (typeof value) {
      case 'string':
        return quote(value);

      case 'number':

        // JSON numbers must be finite. Encode non-finite numbers as null.

        return isFinite(value) ? String(value) : 'null';

      case 'boolean':
      case 'null':

        // If the value is a boolean or null, convert it to a string. Note:
        // typeof null does not produce 'null'. The case is included here in
        // the remote chance that this gets fixed someday.

        return String(value);

      // If the type is 'object', we might be dealing with an object or an array or
      // null.

      case 'object':

        // Due to a specification blunder in ECMAScript, typeof null is 'object',
        // so watch out for that case.

        if (!value) {
          return 'null';
        }

        // Make an array to hold the partial results of stringifying this object value.

        gap += indent;
        partial = [];

        // Is the value an array?

        if (Object.prototype.toString.apply(value) === '[object Array]') {

          // The value is an array. Stringify every element. Use null as a placeholder
          // for non-JSON values.

          length = value.length;
          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || 'null';
          }

          // Join all of the elements together, separated with commas, and wrap them in
          // brackets.

          v = partial.length === 0
              ? '[]'
              : gap
              ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
              : '[' + partial.join(',') + ']';
          gap = mind;
          return v;
        }

        // If the replacer is an array, use it to select the members to be stringified.

        if (rep && typeof rep === 'object') {
          length = rep.length;
          for (i = 0; i < length; i += 1) {
            if (typeof rep[i] === 'string') {
              k = rep[i];
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        } else {

          // Otherwise, iterate through all of the keys in the object.

          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        }

        // Join all of the member texts together, separated with commas,
        // and wrap them in braces.

        v = partial.length === 0
            ? '{}'
            : gap
            ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
            : '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
  }

  // If the JSON object does not yet have a stringify method, give it one.

  if (typeof JSON.stringify !== 'function') {
    JSON.stringify = function(value, replacer, space) {

      // The stringify method takes a value and an optional replacer, and an optional
      // space parameter, and returns a JSON text. The replacer can be a function
      // that can replace values, or an array of strings that will select the keys.
      // A default replacer method can be provided. Use of the space parameter can
      // produce text that is more easily readable.

      var i;
      gap = '';
      indent = '';

      // If the space parameter is a number, make an indent string containing that
      // many spaces.

      if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
          indent += ' ';
        }

      // If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === 'string') {
        indent = space;
      }

      // If there is a replacer, it must be a function or an array.
      // Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
          (typeof replacer !== 'object' ||
              typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
      }

      // Make a fake root object containing our value under the key of ''.
      // Return the result of stringifying the value.

      return str('', {'': value});
    };
  }

//--------------------------------------------------[JSON.parse]
  /**
   * 将 JSON 格式的字符串转换为 ECMAScript 值。
   * @name JSON.parse
   * @function
   * @param {string} text 要转换的 JSON 格式的字符串。
   * @param {Function} [reviver] 用来过滤或更改转换结果的函数。
   *   该函数将在解析 text 中每一个键值对之后被调用，传入两个参数 key 和 value，并使用其返回值代替 value 作为最终值。如果返回 undefined，则正在处理的这个键值对将被从转换结果中删除。
   *   该函数最后一次被调用（如果 text 表示的是一个 String、Boolean、Number 类型的值或 null 时则是唯一一次被调用）时，传入的 key 是空字符串，value 是已从 text 转换到 ECMAScript 值的结果。
   *   该函数被调用时 this 的值为当前传入的 key 和 value 所属的 ECMAScript 对象，可能为 Object 或 Array。
   * @returns {*} 转换后的 ECMAScript 值。
   */

  // If the JSON object does not yet have a parse method, give it one.

  if (typeof JSON.parse !== 'function') {
    JSON.parse = function(text, reviver) {

      // The parse method takes a text and an optional reviver function, and returns
      // a JavaScript value if the text is a valid JSON text.

      var j;

      function walk(holder, key) {

        // The walk method is used to recursively walk the resulting structure so
        // that modifications can be made.

        var k, v, value = holder[key];
        if (value && typeof value === 'object') {
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = walk(value, k);
              if (v !== undefined) {
                value[k] = v;
              } else {
                delete value[k];
              }
            }
          }
        }
        return reviver.call(holder, key, value);
      }

      // Parsing happens in four stages. In the first stage, we replace certain
      // Unicode characters with escape sequences. JavaScript handles many characters
      // incorrectly, either silently deleting them, or treating them as line endings.

      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
        text = text.replace(cx, function(a) {
          return '\\u' +
              ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
      }

      // In the second stage, we run the text against regular expressions that look
      // for non-JSON patterns. We are especially concerned with '()' and 'new'
      // because they can cause invocation, and '=' because it can cause mutation.
      // But just to be safe, we want to reject all unexpected forms.

      // We split the second stage into 4 regexp operations in order to work around
      // crippling inefficiencies in IE's and Safari's regexp engines. First we
      // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
      // replace all simple value tokens with ']' characters. Third, we delete all
      // open brackets that follow a colon or comma or that begin the text. Finally,
      // we look to see that the remaining characters are only whitespace or ']' or
      // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

      if (/^[\],:{}\s]*$/
          .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
          .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
          .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

        // In the third stage we use the eval function to compile the text into a
        // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
        // in JavaScript: it can begin a block or an object literal. We wrap the text
        // in parens to eliminate the ambiguity.

        j = window['eval']('(' + text + ')');

        // In the optional fourth stage, we recursively walk the new structure, passing
        // each name/value pair to a reviver function for possible transformation.

        return typeof reviver === 'function'
            ? walk({'': j}, '')
            : j;
      }

      // If the text is not JSON parseable, then a SyntaxError is thrown.

      throw new SyntaxError('JSON.parse');
    };
  }

})();
/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  http://sizzlejs.com/
 *  jquery-sizzle-1.5.1-175-gaf8206f
 *  Released under the MIT, BSD, and GPL Licenses.
 */

/**
 * @fileOverview CSS 选择器
 */

(function(window, undefined) {
//==================================================[CSS 选择器]
  /*
   * 根据 CSS 选择符查找符合条件的元素。
   *
   * 提供对象：
   *   Sizzle
   */

//--------------------------------------------------[Sizzle]
  var dirruns,
      cachedruns,
      assertGetIdNotName,
      Expr,
      getText,
      isXML,
      contains,
      compile,
      sortOrder,
      hasDuplicate,

      baseHasDuplicate = true,
      strundefined = "undefined",

      expando = ( "sizcache" + Math.random() ).replace(".", ""),

      document = window.document,
      docElem = document.documentElement,
      done = 0,
      slice = [].slice,
      push = [].push,

  // Augment a function for special use by Sizzle
      markFunction = function(fn, value) {
        fn[ expando ] = value || true;
        return fn;
      },

      createCache = function() {
        var cache = {},
            keys = [];

        return markFunction(function(key, value) {
          // Only keep the most recent entries
          if (keys.push(key) > Expr.cacheLength) {
            delete cache[ keys.shift() ];
          }

          return (cache[ key ] = value);
        }, cache);
      },

      classCache = createCache(),
      tokenCache = createCache(),
      compilerCache = createCache(),

  // Regex

  // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
      whitespace = "[\\x20\\t\\r\\n\\f]",
  // http://www.w3.org/TR/css3-syntax/#characters
      characterEncoding = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",

  // Loosely modeled on CSS identifier characters
  // An unquoted value should be a CSS identifier (http://www.w3.org/TR/css3-selectors/#attribute-selectors)
  // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
      identifier = characterEncoding.replace("w", "w#"),

  // Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
      operators = "([*^$|!~]?=)",
      attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
          "*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

  // Prefer arguments not in parens/brackets,
  //   then attribute selectors and non-pseudos (denoted by :),
  //   then anything else
  // These preferences are here to reduce the number of selectors
  //   needing tokenize in the PSEUDO preFilter
      pseudos = ":(" + characterEncoding + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" + attributes + ")|[^:]|\\\\.)*|.*))\\)|)",

  // For matchExpr.POS and matchExpr.needsContext
      pos = ":(nth|eq|gt|lt|first|last|even|odd)(?:\\(((?:-\\d)?\\d*)\\)|)(?=[^-]|$)",

  // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
      rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),

      rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
      rcombinators = new RegExp("^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*"),
      rpseudo = new RegExp(pseudos),

  // Easily-parseable/retrievable ID or TAG or CLASS selectors
      rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,

      rnot = /^:not/,
      rsibling = /[\x20\t\r\n\f]*[+~]/,
      rendsWithNot = /:not\($/,

      rheader = /h\d/i,
      rinputs = /input|select|textarea|button/i,

      rbackslash = /\\(?!\\)/g,

      matchExpr = {
        "ID": new RegExp("^#(" + characterEncoding + ")"),
        "CLASS": new RegExp("^\\.(" + characterEncoding + ")"),
        "NAME": new RegExp("^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]"),
        "TAG": new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
        "ATTR": new RegExp("^" + attributes),
        "PSEUDO": new RegExp("^" + pseudos),
        "CHILD": new RegExp("^:(only|nth|last|first)-child(?:\\(" + whitespace +
            "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
            "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
        "POS": new RegExp(pos, "ig"),
        // For use in libraries implementing .is()
        "needsContext": new RegExp("^" + whitespace + "*[>+~]|" + pos, "i")
      },

  // Support

  // Used for testing something on an element
      assert = function(fn) {
        var div = document.createElement("div");

        try {
          return fn(div);
        } catch (e) {
          return false;
        } finally {
          // release memory in IE
          div = null;
        }
      },

  // Check if getElementsByTagName("*") returns only elements
      assertTagNameNoComments = assert(function(div) {
        div.appendChild(document.createComment(""));
        return !div.getElementsByTagName("*").length;
      }),

  // Check if getAttribute returns normalized href attributes
      assertHrefNotNormalized = assert(function(div) {
        div.innerHTML = "<a href='#'></a>";
        return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
            div.firstChild.getAttribute("href") === "#";
      }),

  // Check if attributes should be retrieved by attribute nodes
      assertAttributes = assert(function(div) {
        div.innerHTML = "<select></select>";
        var type = typeof div.lastChild.getAttribute("multiple");
        // IE8 returns a string for some attributes even when not present
        return type !== "boolean" && type !== "string";
      }),

  // Check if getElementsByClassName can be trusted
      assertUsableClassName = assert(function(div) {
        // Opera can't find a second classname (in 9.6)
        div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
        if (!div.getElementsByClassName || !div.getElementsByClassName("e").length) {
          return false;
        }

        // Safari 3.2 caches class attributes and doesn't catch changes
        div.lastChild.className = "e";
        return div.getElementsByClassName("e").length === 2;
      }),

  // Check if getElementById returns elements by name
  // Check if getElementsByName privileges form controls or returns elements by ID
      assertUsableName = assert(function(div) {
        // Inject content
        div.id = expando + 0;
        div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
        docElem.insertBefore(div, docElem.firstChild);

        // Test
        var pass = document.getElementsByName &&
          // buggy browsers will return fewer than the correct 2
            document.getElementsByName(expando).length === 2 +
              // buggy browsers will return more than the correct 0
                document.getElementsByName(expando + 0).length;
        assertGetIdNotName = !document.getElementById(expando);

        // Cleanup
        docElem.removeChild(div);

        return pass;
      });

  // If slice is not available, provide a backup
  try {
    slice.call(docElem.childNodes, 0)[0].nodeType;
  } catch (e) {
    slice = function(i) {
      var elem, results = [];
      for (; (elem = this[i]); i++) {
        results.push(elem);
      }
      return results;
    };
  }

  function Sizzle(selector, context, results, seed) {
    results = results || [];
    context = context || document;
    var match, elem, xml, m,
        nodeType = context.nodeType;

    if (nodeType !== 1 && nodeType !== 9) {
      return [];
    }

    if (!selector || typeof selector !== "string") {
      return results;
    }

    xml = isXML(context);

    if (!xml && !seed) {
      if ((match = rquickExpr.exec(selector))) {
        // Speed-up: Sizzle("#ID")
        if ((m = match[1])) {
          if (nodeType === 9) {
            elem = context.getElementById(m);
            // Check parentNode to catch when Blackberry 4.6 returns
            // nodes that are no longer in the document #6963
            if (elem && elem.parentNode) {
              // Handle the case where IE, Opera, and Webkit return items
              // by name instead of ID
              if (elem.id === m) {
                results.push(elem);
                return results;
              }
            } else {
              return results;
            }
          } else {
            // Context is not a document
            if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
                contains(context, elem) && elem.id === m) {
              results.push(elem);
              return results;
            }
          }

          // Speed-up: Sizzle("TAG")
        } else if (match[2]) {
          push.apply(results, slice.call(context.getElementsByTagName(selector), 0));
          return results;

          // Speed-up: Sizzle(".CLASS")
        } else if ((m = match[3]) && assertUsableClassName && context.getElementsByClassName) {
          push.apply(results, slice.call(context.getElementsByClassName(m), 0));
          return results;
        }
      }
    }

    // All others
    return select(selector, context, results, seed, xml);
  }

  Sizzle.matches = function(expr, elements) {
    return Sizzle(expr, null, null, elements);
  };

  Sizzle.matchesSelector = function(elem, expr) {
    return Sizzle(expr, null, null, [ elem ]).length > 0;
  };

  // Returns a function to use in pseudos for input types
  function createInputPseudo(type) {
    return function(elem) {
      var name = elem.nodeName.toLowerCase();
      return name === "input" && elem.type === type;
    };
  }

  // Returns a function to use in pseudos for buttons
  function createButtonPseudo(type) {
    return function(elem) {
      var name = elem.nodeName.toLowerCase();
      return (name === "input" || name === "button") && elem.type === type;
    };
  }

  /**
   * Utility function for retrieving the text value of an array of DOM nodes
   * @param {Array|Element} elem
   */
  getText = Sizzle.getText = function(elem) {
    var node,
        ret = "",
        i = 0,
        nodeType = elem.nodeType;

    if (nodeType) {
      if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
        // Use textContent for elements
        // innerText usage removed for consistency of new lines (see #11153)
        if (typeof elem.textContent === "string") {
          return elem.textContent;
        } else {
          // Traverse its children
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            ret += getText(elem);
          }
        }
      } else if (nodeType === 3 || nodeType === 4) {
        return elem.nodeValue;
      }
      // Do not include comment or processing instruction nodes
    } else {

      // If no nodeType, this is expected to be an array
      for (; (node = elem[i]); i++) {
        // Do not traverse comment nodes
        ret += getText(node);
      }
    }
    return ret;
  };

  isXML = Sizzle.isXML = function isXML(elem) {
    // documentElement is verified for cases where it doesn't yet exist
    // (such as loading iframes in IE - #4833)
    var documentElement = elem && (elem.ownerDocument || elem).documentElement;
    return documentElement ? documentElement.nodeName !== "HTML" : false;
  };

  // Element contains another
  contains = Sizzle.contains = docElem.contains ?
      function(a, b) {
        var adown = a.nodeType === 9 ? a.documentElement : a,
            bup = b && b.parentNode;
        return a === bup || !!( bup && bup.nodeType === 1 && adown.contains && adown.contains(bup) );
      } :
      docElem.compareDocumentPosition ?
          function(a, b) {
            return b && !!( a.compareDocumentPosition(b) & 16 );
          } :
          function(a, b) {
            while ((b = b.parentNode)) {
              if (b === a) {
                return true;
              }
            }
            return false;
          };

  Sizzle.attr = function(elem, name) {
    var attr,
        xml = isXML(elem);

    if (!xml) {
      name = name.toLowerCase();
    }
    if (Expr.attrHandle[ name ]) {
      return Expr.attrHandle[ name ](elem);
    }
    if (assertAttributes || xml) {
      return elem.getAttribute(name);
    }
    attr = elem.getAttributeNode(name);
    return attr ?
        typeof elem[ name ] === "boolean" ?
            elem[ name ] ? name : null :
            attr.specified ? attr.value : null :
        null;
  };

  Expr = Sizzle.selectors = {

    // Can be adjusted by the user
    cacheLength: 50,

    createPseudo: markFunction,

    match: matchExpr,

    order: new RegExp("ID|TAG" +
        (assertUsableName ? "|NAME" : "") +
        (assertUsableClassName ? "|CLASS" : "")
    ),

    // IE6/7 return a modified href
    attrHandle: assertHrefNotNormalized ?
    {} :
    {
      "href": function(elem) {
        return elem.getAttribute("href", 2);
      },
      "type": function(elem) {
        return elem.getAttribute("type");
      }
    },

    find: {
      "ID": assertGetIdNotName ?
          function(id, context, xml) {
            if (typeof context.getElementById !== strundefined && !xml) {
              var m = context.getElementById(id);
              // Check parentNode to catch when Blackberry 4.6 returns
              // nodes that are no longer in the document #6963
              return m && m.parentNode ? [m] : [];
            }
          } :
          function(id, context, xml) {
            if (typeof context.getElementById !== strundefined && !xml) {
              var m = context.getElementById(id);

              return m ?
                  m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
                      [m] :
                      undefined :
                  [];
            }
          },

      "TAG": assertTagNameNoComments ?
          function(tag, context) {
            if (typeof context.getElementsByTagName !== strundefined) {
              return context.getElementsByTagName(tag);
            }
          } :
          function(tag, context) {
            var results = context.getElementsByTagName(tag);

            // Filter out possible comments
            if (tag === "*") {
              var elem,
                  tmp = [],
                  i = 0;

              for (; (elem = results[i]); i++) {
                if (elem.nodeType === 1) {
                  tmp.push(elem);
                }
              }

              return tmp;
            }
            return results;
          },

      "NAME": function(tag, context) {
        if (typeof context.getElementsByName !== strundefined) {
          return context.getElementsByName(name);
        }
      },

      "CLASS": function(className, context, xml) {
        if (typeof context.getElementsByClassName !== strundefined && !xml) {
          return context.getElementsByClassName(className);
        }
      }
    },

    relative: {
      ">": { dir: "parentNode", first: true },
      " ": { dir: "parentNode" },
      "+": { dir: "previousSibling", first: true },
      "~": { dir: "previousSibling" }
    },

    preFilter: {
      "ATTR": function(match) {
        match[1] = match[1].replace(rbackslash, "");

        // Move the given value to match[3] whether quoted or unquoted
        match[3] = ( match[4] || match[5] || "" ).replace(rbackslash, "");

        if (match[2] === "~=") {
          match[3] = " " + match[3] + " ";
        }

        return match.slice(0, 4);
      },

      "CHILD": function(match) {
        /* matches from matchExpr.CHILD
         1 type (only|nth|...)
         2 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
         3 xn-component of xn+y argument ([+-]?\d*n|)
         4 sign of xn-component
         5 x of xn-component
         6 sign of y-component
         7 y of y-component
         */
        match[1] = match[1].toLowerCase();

        if (match[1] === "nth") {
          // nth-child requires argument
          if (!match[2]) {
            Sizzle.error(match[0]);
          }

          // numeric x and y parameters for Expr.filter.CHILD
          // remember that false/true cast respectively to 0/1
          match[3] = +( match[3] ? match[4] + (match[5] || 1) : 2 * ( match[2] === "even" || match[2] === "odd" ) );
          match[4] = +( ( match[6] + match[7] ) || match[2] === "odd" );

          // other types prohibit arguments
        } else if (match[2]) {
          Sizzle.error(match[0]);
        }

        return match;
      },

      "PSEUDO": function(match, context, xml) {
        var unquoted, excess;
        if (matchExpr["CHILD"].test(match[0])) {
          return null;
        }

        if (match[3]) {
          match[2] = match[3];
        } else if ((unquoted = match[4])) {
          // Only check arguments that contain a pseudo
          if (rpseudo.test(unquoted) &&
            // Get excess from tokenize (recursively)
              (excess = tokenize(unquoted, context, xml, true)) &&
            // advance to the next closing parenthesis
              (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {

            // excess is a negative index
            unquoted = unquoted.slice(0, excess);
            match[0] = match[0].slice(0, excess);
          }
          match[2] = unquoted;
        }

        // Return only captures needed by the pseudo filter method (type and argument)
        return match.slice(0, 3);
      }
    },

    filter: {
      "ID": assertGetIdNotName ?
          function(id) {
            id = id.replace(rbackslash, "");
            return function(elem) {
              return elem.getAttribute("id") === id;
            };
          } :
          function(id) {
            id = id.replace(rbackslash, "");
            return function(elem) {
              var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
              return node && node.value === id;
            };
          },

      "TAG": function(nodeName) {
        if (nodeName === "*") {
          return function() {
            return true;
          };
        }
        nodeName = nodeName.replace(rbackslash, "").toLowerCase();

        return function(elem) {
          return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
        };
      },

      "CLASS": function(className) {
        var pattern = classCache[ expando ][ className ];
        if (!pattern) {
          pattern = classCache(className, new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)"));
        }
        return function(elem) {
          return pattern.test(elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "");
        };
      },

      "ATTR": function(name, operator, check) {
        if (!operator) {
          return function(elem) {
            return Sizzle.attr(elem, name) != null;
          };
        }

        return function(elem) {
          var result = Sizzle.attr(elem, name),
              value = result + "";

          if (result == null) {
            return operator === "!=";
          }

          switch (operator) {
            case "=":
              return value === check;
            case "!=":
              return value !== check;
            case "^=":
              return check && value.indexOf(check) === 0;
            case "*=":
              return check && value.indexOf(check) > -1;
            case "$=":
              return check && value.substr(value.length - check.length) === check;
            case "~=":
              return ( " " + value + " " ).indexOf(check) > -1;
            case "|=":
              return value === check || value.substr(0, check.length + 1) === check + "-";
          }
        };
      },

      "CHILD": function(type, argument, first, last) {

        if (type === "nth") {
          var doneName = done++;

          return function(elem) {
            var parent, diff,
                count = 0,
                node = elem;

            if (first === 1 && last === 0) {
              return true;
            }

            parent = elem.parentNode;

            if (parent && (parent[ expando ] !== doneName || !elem.sizset)) {
              for (node = parent.firstChild; node; node = node.nextSibling) {
                if (node.nodeType === 1) {
                  node.sizset = ++count;
                  if (node === elem) {
                    break;
                  }
                }
              }

              parent[ expando ] = doneName;
            }

            diff = elem.sizset - last;

            if (first === 0) {
              return diff === 0;

            } else {
              return ( diff % first === 0 && diff / first >= 0 );
            }
          };
        }

        return function(elem) {
          var node = elem;

          switch (type) {
            case "only":
            case "first":
              while ((node = node.previousSibling)) {
                if (node.nodeType === 1) {
                  return false;
                }
              }

              if (type === "first") {
                return true;
              }

              node = elem;

            /* falls through */
            case "last":
              while ((node = node.nextSibling)) {
                if (node.nodeType === 1) {
                  return false;
                }
              }

              return true;
          }
        };
      },

      "PSEUDO": function(pseudo, argument, context, xml) {
        // pseudo-class names are case-insensitive
        // http://www.w3.org/TR/selectors/#pseudo-classes
        // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
        var args,
            fn = Expr.pseudos[ pseudo ] || Expr.pseudos[ pseudo.toLowerCase() ];

        if (!fn) {
          Sizzle.error("unsupported pseudo: " + pseudo);
        }

        // The user may use createPseudo to indicate that
        // arguments are needed to create the filter function
        // just as Sizzle does
        if (!fn[ expando ]) {
          if (fn.length > 1) {
            args = [ pseudo, pseudo, "", argument ];
            return function(elem) {
              return fn(elem, 0, args);
            };
          }
          return fn;
        }

        return fn(argument, context, xml);
      }
    },

    pseudos: {
      "not": markFunction(function(selector, context, xml) {
        // Trim the selector passed to compile
        // to avoid treating leading and trailing
        // spaces as combinators
        var matcher = compile(selector.replace(rtrim, "$1"), context, xml);
        return function(elem) {
          return !matcher(elem);
        };
      }),

      "enabled": function(elem) {
        return elem.disabled === false;
      },

      "disabled": function(elem) {
        return elem.disabled === true;
      },

      "checked": function(elem) {
        // In CSS3, :checked should return both checked and selected elements
        // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
        var nodeName = elem.nodeName.toLowerCase();
        return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
      },

      "selected": function(elem) {
        // Accessing this property makes selected-by-default
        // options in Safari work properly
        if (elem.parentNode) {
          elem.parentNode.selectedIndex;
        }

        return elem.selected === true;
      },

      "parent": function(elem) {
        return !Expr.pseudos["empty"](elem);
      },

      "empty": function(elem) {
        // http://www.w3.org/TR/selectors/#empty-pseudo
        // :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
        //   not comment, processing instructions, or others
        // Thanks to Diego Perini for the nodeName shortcut
        //   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
        var nodeType;
        elem = elem.firstChild;
        while (elem) {
          if (elem.nodeName > "@" || (nodeType = elem.nodeType) === 3 || nodeType === 4) {
            return false;
          }
          elem = elem.nextSibling;
        }
        return true;
      },

      "contains": markFunction(function(text) {
        return function(elem) {
          return ( elem.textContent || elem.innerText || getText(elem) ).indexOf(text) > -1;
        };
      }),

      "has": markFunction(function(selector) {
        return function(elem) {
          return Sizzle(selector, elem).length > 0;
        };
      }),

      "header": function(elem) {
        return rheader.test(elem.nodeName);
      },

      "text": function(elem) {
        var type, attr;
        // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
        // use getAttribute instead to test this case
        return elem.nodeName.toLowerCase() === "input" &&
            (type = elem.type) === "text" &&
            ( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === type );
      },

      // Input types
      "radio": createInputPseudo("radio"),
      "checkbox": createInputPseudo("checkbox"),
      "file": createInputPseudo("file"),
      "password": createInputPseudo("password"),
      "image": createInputPseudo("image"),

      "submit": createButtonPseudo("submit"),
      "reset": createButtonPseudo("reset"),

      "button": function(elem) {
        var name = elem.nodeName.toLowerCase();
        return name === "input" && elem.type === "button" || name === "button";
      },

      "input": function(elem) {
        return rinputs.test(elem.nodeName);
      },

      "focus": function(elem) {
        var doc = elem.ownerDocument;
        return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href);
      },

      "active": function(elem) {
        return elem === elem.ownerDocument.activeElement;
      }
    },

    setFilters: {
      "first": function(elements, argument, not) {
        return not ? elements.slice(1) : [ elements[0] ];
      },

      "last": function(elements, argument, not) {
        var elem = elements.pop();
        return not ? elements : [ elem ];
      },

      "even": function(elements, argument, not) {
        var results = [],
            i = not ? 1 : 0,
            len = elements.length;
        for (; i < len; i = i + 2) {
          results.push(elements[i]);
        }
        return results;
      },

      "odd": function(elements, argument, not) {
        var results = [],
            i = not ? 0 : 1,
            len = elements.length;
        for (; i < len; i = i + 2) {
          results.push(elements[i]);
        }
        return results;
      },

      "lt": function(elements, argument, not) {
        return not ? elements.slice(+argument) : elements.slice(0, +argument);
      },

      "gt": function(elements, argument, not) {
        return not ? elements.slice(0, +argument + 1) : elements.slice(+argument + 1);
      },

      "eq": function(elements, argument, not) {
        var elem = elements.splice(+argument, 1);
        return not ? elements : elem;
      }
    }
  };

  function siblingCheck(a, b, ret) {
    if (a === b) {
      return ret;
    }

    var cur = a.nextSibling;

    while (cur) {
      if (cur === b) {
        return -1;
      }

      cur = cur.nextSibling;
    }

    return 1;
  }

  sortOrder = docElem.compareDocumentPosition ?
      function(a, b) {
        if (a === b) {
          hasDuplicate = true;
          return 0;
        }

        return ( !a.compareDocumentPosition || !b.compareDocumentPosition ?
            a.compareDocumentPosition :
            a.compareDocumentPosition(b) & 4
            ) ? -1 : 1;
      } :
      function(a, b) {
        // The nodes are identical, we can exit early
        if (a === b) {
          hasDuplicate = true;
          return 0;

          // Fallback to using sourceIndex (in IE) if it's available on both nodes
        } else if (a.sourceIndex && b.sourceIndex) {
          return a.sourceIndex - b.sourceIndex;
        }

        var al, bl,
            ap = [],
            bp = [],
            aup = a.parentNode,
            bup = b.parentNode,
            cur = aup;

        // If the nodes are siblings (or identical) we can do a quick check
        if (aup === bup) {
          return siblingCheck(a, b);

          // If no parents were found then the nodes are disconnected
        } else if (!aup) {
          return -1;

        } else if (!bup) {
          return 1;
        }

        // Otherwise they're somewhere else in the tree so we need
        // to build up a full list of the parentNodes for comparison
        while (cur) {
          ap.unshift(cur);
          cur = cur.parentNode;
        }

        cur = bup;

        while (cur) {
          bp.unshift(cur);
          cur = cur.parentNode;
        }

        al = ap.length;
        bl = bp.length;

        // Start walking down the tree looking for a discrepancy
        for (var i = 0; i < al && i < bl; i++) {
          if (ap[i] !== bp[i]) {
            return siblingCheck(ap[i], bp[i]);
          }
        }

        // We ended someplace up the tree so do a sibling check
        return i === al ?
            siblingCheck(a, bp[i], -1) :
            siblingCheck(ap[i], b, 1);
      };

  // Always assume the presence of duplicates if sort doesn't
  // pass them to our comparison function (as in Google Chrome).
  [0, 0].sort(sortOrder);
  baseHasDuplicate = !hasDuplicate;

  // Document sorting and removing duplicates
  Sizzle.uniqueSort = function(results) {
    var elem,
        i = 1;

    hasDuplicate = baseHasDuplicate;
    results.sort(sortOrder);

    if (hasDuplicate) {
      for (; (elem = results[i]); i++) {
        if (elem === results[ i - 1 ]) {
          results.splice(i--, 1);
        }
      }
    }

    return results;
  };

  Sizzle.error = function(msg) {
    throw new Error("Syntax error, unrecognized expression: " + msg);
  };

  function tokenize(selector, context, xml, parseOnly) {
    var matched, match, tokens, type,
        soFar, groups, group, i,
        preFilters, filters,
        checkContext = !xml && context !== document,
    // Token cache should maintain spaces
        key = ( checkContext ? "<s>" : "" ) + selector.replace(rtrim, "$1<s>"),
        cached = tokenCache[ expando ][ key ];

    if (cached) {
      return parseOnly ? 0 : slice.call(cached, 0);
    }

    soFar = selector;
    groups = [];
    i = 0;
    preFilters = Expr.preFilter;
    filters = Expr.filter;

    while (soFar) {

      // Comma and first run
      if (!matched || (match = rcomma.exec(soFar))) {
        if (match) {
          soFar = soFar.slice(match[0].length);
          tokens.selector = group;
        }
        groups.push(tokens = []);
        group = "";

        // Need to make sure we're within a narrower context if necessary
        // Adding a descendant combinator will generate what is needed
        if (checkContext) {
          soFar = " " + soFar;
        }
      }

      matched = false;

      // Combinators
      if ((match = rcombinators.exec(soFar))) {
        group += match[0];
        soFar = soFar.slice(match[0].length);

        // Cast descendant combinators to space
        matched = tokens.push({
          part: match.pop().replace(rtrim, " "),
          string: match[0],
          captures: match
        });
      }

      // Filters
      for (type in filters) {
        if ((match = matchExpr[ type ].exec(soFar)) && (!preFilters[ type ] ||
            ( match = preFilters[ type ](match, context, xml) ))) {

          group += match[0];
          soFar = soFar.slice(match[0].length);
          matched = tokens.push({
            part: type,
            string: match.shift(),
            captures: match
          });
        }
      }

      if (!matched) {
        break;
      }
    }

    // Attach the full group as a selector
    if (group) {
      tokens.selector = group;
    }

    // Return the length of the invalid excess
    // if we're just parsing
    // Otherwise, throw an error or return tokens
    return parseOnly ?
        soFar.length :
        soFar ?
            Sizzle.error(selector) :
          // Cache the tokens
            slice.call(tokenCache(key, groups), 0);
  }

  function addCombinator(matcher, combinator, context, xml) {
    var dir = combinator.dir,
        doneName = done++;

    if (!matcher) {
      // If there is no matcher to check, check against the context
      matcher = function(elem) {
        return elem === context;
      };
    }
    return combinator.first ?
        function(elem) {
          while ((elem = elem[ dir ])) {
            if (elem.nodeType === 1) {
              return matcher(elem) && elem;
            }
          }
        } :
        xml ?
            function(elem) {
              while ((elem = elem[ dir ])) {
                if (elem.nodeType === 1) {
                  if (matcher(elem)) {
                    return elem;
                  }
                }
              }
            } :
            function(elem) {
              var cache,
                  dirkey = doneName + "." + dirruns,
                  cachedkey = dirkey + "." + cachedruns;
              while ((elem = elem[ dir ])) {
                if (elem.nodeType === 1) {
                  if ((cache = elem[ expando ]) === cachedkey) {
                    return elem.sizset;
                  } else if (typeof cache === "string" && cache.indexOf(dirkey) === 0) {
                    if (elem.sizset) {
                      return elem;
                    }
                  } else {
                    elem[ expando ] = cachedkey;
                    if (matcher(elem)) {
                      elem.sizset = true;
                      return elem;
                    }
                    elem.sizset = false;
                  }
                }
              }
            };
  }

  function addMatcher(higher, deeper) {
    return higher ?
        function(elem) {
          var result = deeper(elem);
          return result && higher(result === true ? elem : result);
        } :
        deeper;
  }

  // ["TAG", ">", "ID", " ", "CLASS"]
  function matcherFromTokens(tokens, context, xml) {
    var token, matcher,
        i = 0;

    for (; (token = tokens[i]); i++) {
      if (Expr.relative[ token.part ]) {
        matcher = addCombinator(matcher, Expr.relative[ token.part ], context, xml);
      } else {
        matcher = addMatcher(matcher, Expr.filter[ token.part ].apply(null, token.captures.concat(context, xml)));
      }
    }

    return matcher;
  }

  function matcherFromGroupMatchers(matchers) {
    return function(elem) {
      var matcher,
          j = 0;
      for (; (matcher = matchers[j]); j++) {
        if (matcher(elem)) {
          return true;
        }
      }
      return false;
    };
  }

  compile = Sizzle.compile = function(selector, context, xml) {
    var group, i, len,
        cached = compilerCache[ expando ][ selector ];

    // Return a cached group function if already generated (context dependent)
    if (cached && cached.context === context) {
      return cached;
    }

    // Generate a function of recursive functions that can be used to check each element
    group = tokenize(selector, context, xml);
    for (i = 0, len = group.length; i < len; i++) {
      group[i] = matcherFromTokens(group[i], context, xml);
    }

    // Cache the compiled function
    cached = compilerCache(selector, matcherFromGroupMatchers(group));
    cached.context = context;
    cached.runs = cached.dirruns = 0;
    return cached;
  };

  function multipleContexts(selector, contexts, results, seed) {
    var i = 0,
        len = contexts.length;
    for (; i < len; i++) {
      Sizzle(selector, contexts[i], results, seed);
    }
  }

  function handlePOSGroup(selector, posfilter, argument, contexts, seed, not) {
    var results,
        fn = Expr.setFilters[ posfilter.toLowerCase() ];

    if (!fn) {
      Sizzle.error(posfilter);
    }

    if (selector || !(results = seed)) {
      multipleContexts(selector || "*", contexts, (results = []), seed);
    }

    return results.length > 0 ? fn(results, argument, not) : [];
  }

  function handlePOS(groups, context, results, seed) {
    var group, part, j, groupLen, token, selector,
        anchor, elements, match, matched,
        lastIndex, currentContexts, not,
        i = 0,
        len = groups.length,
        rpos = matchExpr["POS"],
    // This is generated here in case matchExpr["POS"] is extended
        rposgroups = new RegExp("^" + rpos.source + "(?!" + whitespace + ")", "i"),
    // This is for making sure non-participating
    // matching groups are represented cross-browser (IE6-8)
        setUndefined = function() {
          var i = 1,
              len = arguments.length - 2;
          for (; i < len; i++) {
            if (arguments[i] === undefined) {
              match[i] = undefined;
            }
          }
        };

    for (; i < len; i++) {
      group = groups[i];
      part = "";
      elements = seed;
      for (j = 0, groupLen = group.length; j < groupLen; j++) {
        token = group[j];
        selector = token.string;
        if (token.part === "PSEUDO") {
          // Reset regex index to 0
          rpos.exec("");
          anchor = 0;
          while ((match = rpos.exec(selector))) {
            matched = true;
            lastIndex = rpos.lastIndex = match.index + match[0].length;
            if (lastIndex > anchor) {
              part += selector.slice(anchor, match.index);
              anchor = lastIndex;
              currentContexts = [ context ];

              if (rcombinators.test(part)) {
                if (elements) {
                  currentContexts = elements;
                }
                elements = seed;
              }

              if ((not = rendsWithNot.test(part))) {
                part = part.slice(0, -5).replace(rcombinators, "$&*");
                anchor++;
              }

              if (match.length > 1) {
                match[0].replace(rposgroups, setUndefined);
              }
              elements = handlePOSGroup(part, match[1], match[2], currentContexts, elements, not);
            }
            part = "";
          }

        }

        if (!matched) {
          part += selector;
        }
        matched = false;
      }

      if (part) {
        if (rcombinators.test(part)) {
          multipleContexts(part, elements || [ context ], results, seed);
        } else {
          Sizzle(part, context, results, seed ? seed.concat(elements) : elements);
        }
      } else {
        push.apply(results, elements);
      }
    }

    // Do not sort if this is a single filter
    return len === 1 ? results : Sizzle.uniqueSort(results);
  }

  function select(selector, context, results, seed, xml) {
    // Remove excessive whitespace
    selector = selector.replace(rtrim, "$1");
    var elements, matcher, cached, elem,
        i, tokens, token, lastToken, findContext, type,
        match = tokenize(selector, context, xml),
        contextNodeType = context.nodeType;

    // POS handling
    if (matchExpr["POS"].test(selector)) {
      return handlePOS(match, context, results, seed);
    }

    if (seed) {
      elements = slice.call(seed, 0);

      // To maintain document order, only narrow the
      // set if there is one group
    } else if (match.length === 1) {

      // Take a shortcut and set the context if the root selector is an ID
      if ((tokens = slice.call(match[0], 0)).length > 2 &&
          (token = tokens[0]).part === "ID" &&
          contextNodeType === 9 && !xml &&
          Expr.relative[ tokens[1].part ]) {

        context = Expr.find["ID"](token.captures[0].replace(rbackslash, ""), context, xml)[0];
        if (!context) {
          return results;
        }

        selector = selector.slice(tokens.shift().string.length);
      }

      findContext = ( (match = rsibling.exec(tokens[0].string)) && !match.index && context.parentNode ) || context;

      // Reduce the set if possible
      lastToken = "";
      for (i = tokens.length - 1; i >= 0; i--) {
        token = tokens[i];
        type = token.part;
        lastToken = token.string + lastToken;
        if (Expr.relative[ type ]) {
          break;
        }
        if (Expr.order.test(type)) {
          elements = Expr.find[ type ](token.captures[0].replace(rbackslash, ""), findContext, xml);
          if (elements == null) {
            continue;
          } else {
            selector = selector.slice(0, selector.length - lastToken.length) +
                lastToken.replace(matchExpr[ type ], "");

            if (!selector) {
              push.apply(results, slice.call(elements, 0));
            }

            break;
          }
        }
      }
    }

    // Only loop over the given elements once
    if (selector) {
      matcher = compile(selector, context, xml);
      dirruns = matcher.dirruns++;
      if (elements == null) {
        elements = Expr.find["TAG"]("*", (rsibling.test(selector) && context.parentNode) || context);
      }

      for (i = 0; (elem = elements[i]); i++) {
        cachedruns = matcher.runs++;
        if (matcher(elem)) {
          results.push(elem);
        }
      }
    }

    return results;
  }

  if (document.querySelectorAll) {
    (function() {
      var disconnectedMatch,
          oldSelect = select,
          rescape = /'|\\/g,
          rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,
          rbuggyQSA = [],
      // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
      // A support test would require too much code (would include document ready)
      // just skip matchesSelector for :active
          rbuggyMatches = [":active"],
          matches = docElem.matchesSelector ||
              docElem.mozMatchesSelector ||
              docElem.webkitMatchesSelector ||
              docElem.oMatchesSelector ||
              docElem.msMatchesSelector;

      // Build QSA regex
      // Regex strategy adopted from Diego Perini
      assert(function(div) {
        // Select is set to empty string on purpose
        // This is to test IE's treatment of not explictly
        // setting a boolean content attribute,
        // since its presence should be enough
        // http://bugs.jquery.com/ticket/12359
        div.innerHTML = "<select><option selected=''></option></select>";

        // IE8 - Some boolean attributes are not treated correctly
        if (!div.querySelectorAll("[selected]").length) {
          rbuggyQSA.push("\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)");
        }

        // Webkit/Opera - :checked should return selected option elements
        // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
        // IE8 throws error here (do not put tests after this one)
        if (!div.querySelectorAll(":checked").length) {
          rbuggyQSA.push(":checked");
        }
      });

      assert(function(div) {

        // Opera 10-12/IE9 - ^= $= *= and empty values
        // Should not select anything
        div.innerHTML = "<p test=''></p>";
        if (div.querySelectorAll("[test^='']").length) {
          rbuggyQSA.push("[*^$]=" + whitespace + "*(?:\"\"|'')");
        }

        // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
        // IE8 throws error here (do not put tests after this one)
        div.innerHTML = "<input type='hidden'/>";
        if (!div.querySelectorAll(":enabled").length) {
          rbuggyQSA.push(":enabled", ":disabled");
        }
      });

      rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));

      select = function(selector, context, results, seed, xml) {
        // Only use querySelectorAll when not filtering,
        // when this is not xml,
        // and when no QSA bugs apply
        if (!seed && !xml && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
          if (context.nodeType === 9) {
            try {
              push.apply(results, slice.call(context.querySelectorAll(selector), 0));
              return results;
            } catch (qsaError) {
            }
            // qSA works strangely on Element-rooted queries
            // We can work around this by specifying an extra ID on the root
            // and working up from there (Thanks to Andrew Dupont for the technique)
            // IE 8 doesn't work on object elements
          } else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
            var groups, i, len,
                old = context.getAttribute("id"),
                nid = old || expando,
                newContext = rsibling.test(selector) && context.parentNode || context;

            if (old) {
              nid = nid.replace(rescape, "\\$&");
            } else {
              context.setAttribute("id", nid);
            }

            groups = tokenize(selector, context, xml);
            // Trailing space is unnecessary
            // There is always a context check
            nid = "[id='" + nid + "']";
            for (i = 0, len = groups.length; i < len; i++) {
              groups[i] = nid + groups[i].selector;
            }
            try {
              push.apply(results, slice.call(newContext.querySelectorAll(
                  groups.join(",")
              ), 0));
              return results;
            } catch (qsaError) {
            } finally {
              if (!old) {
                context.removeAttribute("id");
              }
            }
          }
        }

        return oldSelect(selector, context, results, seed, xml);
      };

      if (matches) {
        assert(function(div) {
          // Check to see if it's possible to do matchesSelector
          // on a disconnected node (IE 9)
          disconnectedMatch = matches.call(div, "div");

          // This should fail with an exception
          // Gecko does not error, returns false instead
          try {
            matches.call(div, "[test!='']:sizzle");
            rbuggyMatches.push(matchExpr["PSEUDO"].source, matchExpr["POS"].source, "!=");
          } catch (e) {
          }
        });

        // rbuggyMatches always contains :active, so no need for a length check
        rbuggyMatches = /* rbuggyMatches.length && */ new RegExp(rbuggyMatches.join("|"));

        Sizzle.matchesSelector = function(elem, expr) {
          // Make sure that attribute selectors are quoted
          expr = expr.replace(rattributeQuotes, "='$1']");

          // rbuggyMatches always contains :active, so no need for an existence check
          if (!isXML(elem) && !rbuggyMatches.test(expr) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
            try {
              var ret = matches.call(elem, expr);

              // IE 9's matchesSelector returns false on disconnected nodes
              if (ret || disconnectedMatch ||
                // As well, disconnected nodes are said to be in a document
                // fragment in IE 9
                  elem.document && elem.document.nodeType !== 11) {
                return ret;
              }
            } catch (e) {
            }
          }

          return Sizzle(expr, null, null, [ elem ]).length > 0;
        };
      }
    })();
  }

  // Deprecated
  Expr.setFilters["nth"] = Expr.setFilters["eq"];

  // Back-compat
  Expr.filters = Expr.pseudos;

  // EXPOSE
  window.Sizzle = Sizzle;

})(window);

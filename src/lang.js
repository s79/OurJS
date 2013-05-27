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

/*!
 * OurJS
 *  Released under the MIT License.
 *  Version: 2012-06-26
 */
/**
 * @fileOverview 提供 JavaScript 原生对象的补缺及扩展。
 * @version 20111101
 * @author: sundongguo@gmail.com
 */
(function() {
  // 内置对象的原型方法。
  var HAS_OWN_PROPERTY = Object.prototype.hasOwnProperty;
  var TO_STRING = Object.prototype.toString;

  // 空白字符。
  var WHITESPACES = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF';

  // 日期标识符。
  var RE_DATE_KEYS = /YYYY|MM|DD|hh|mm|ss|s|TZD/g;

  // 辅助解决遍历 bug。
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
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

  // 将提供的值转化为整数。
  // http://es5.github.com/#x9.4
  var toInteger = function(value) {
    value = Number(value) || 0;
    value = Math[value < 0 ? 'ceil' : 'floor'](value);
    return value;
  };

  // 将提供的值转化为对象。
  // http://es5.github.com/#x9.9
  var stringIsIndexable = 'x'[0] === 'x';
  var toObject = function(value) {
    if (value == null) {
      throw new TypeError();
    }
    if (!stringIsIndexable && typeof value == 'string') {
      return value.split('');
    }
    return Object(value);
  };

//==================================================[ES5 补缺]
  /*
   * 为旧浏览器添加 ES5 中引入的部分常用方法。
   *
   * 补缺方法：
   *   Object.keys
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
    Object.keys = function(object) {
      if (typeof object != 'object' && typeof object != 'function' || object === null) {
        throw new TypeError('Object.keys called on non-object');
      }
      var keys = [];
      for (var name in object) {
        if (HAS_OWN_PROPERTY.call(object, name)) {
          keys.push(name);
        }
      }
      if (hasDontEnumBug) {
        var i = 0;
        while (i < DONT_ENUM_PROPERTIES_LENGTH) {
          var dontEnumProperty = DONT_ENUM_PROPERTIES[i];
          if (HAS_OWN_PROPERTY.call(object, dontEnumProperty)) {
            keys.push(dontEnumProperty);
          }
          i++;
        }
      }
      return keys;
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
      return TO_STRING.call(value) === '[object Array]';
    };
  }

//--------------------------------------------------[Array.prototype.indexOf]
  /**
   * 返回数组中第一次出现指定的值的索引。
   * @name Array.prototype.indexOf
   * @function
   * @param {*} searchElement 指定的值。
   * @param {number} [fromIndex] 在数组中的指定索引开始查找，默认为 0。
   *   如果指定的值大于等于数组的长度，则仍使用数组的长度。
   *   如果指定一个负数，则表示从数组的末尾开始计算的偏移量，即使用 fromIndex + length（数组的长度）作为查找起始点，如果这个结果仍为负数，则使用 0 作为最终结果。
   * @returns {number} 索引值，如果数组中不包含指定的值，则返回 -1。
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
   * 返回数组中最后一次出现指定的值的索引。
   * @name Array.prototype.lastIndexOf
   * @function
   * @param {*} searchElement 指定的值。
   * @param {number} [fromIndex] 在数组中的指定索引开始查找，默认为数组的长度。
   *   如果指定的值大于等于数组的长度，则仍使用数组的长度。
   *   如果指定一个负数，则表示从数组的末尾开始计算的偏移量，即使用 (fromIndex + 数组的长度) 作为查找起始点，如果这个结果仍为负数，则使用 0 作为最终结果。
   * @returns {number} 索引值，如果数组中不包含指定的值，则返回 -1。
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
   * @param {Object} [thisObject] 执行回调函数时 this 的值，如果省略或指定为 null，则使用全局对象 window。
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
   * @param {Object} [thisObject] 执行回调函数时 this 的值，如果省略或指定为 null，则使用全局对象 window。
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
   * 遍历数组，对数组中的每一个元素都执行一次指定的函数。
   * @name Array.prototype.forEach
   * @function
   * @param {Function} callback 对数组中的每个元素都执行一次的回调函数。
   *   回调函数有三个参数：当前元素，当前元素的索引和调用该方法的数组对象。
   * @param {Object} [thisObject] 执行回调函数时 this 的值，如果省略或指定为 null，则使用全局对象 window。
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
   * 对数组中的每一个元素都执行一次回调函数，并返回一个包含这个回调函数的每次执行后的返回值的新数组。
   * @name Array.prototype.map
   * @function
   * @param {Function} callback 对数组中的每个元素都执行一次的回调函数。
   *   回调函数有三个参数：当前元素，当前元素的索引和调用该方法的数组对象。
   * @param {Object} [thisObject] 执行回调函数时 this 的值，如果省略或指定为 null，则使用全局对象 window。
   * @returns {Array} 包含 callback 的每次执行后的返回值的新数组。
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
   * 对数组中的每一个元素都执行一次回调函数，并且创建一个新的数组，该数组包含所有回调函数执行后返回值为 true 时对应的原数组元素。
   * @name Array.prototype.filter
   * @function
   * @param {Function} callback 对数组中的每个元素都执行一次的回调函数。
   *   回调函数有三个参数：当前元素，当前元素的索引和调用该方法的数组对象。
   * @param {Object} [thisObject] 执行回调函数时 this 的值，如果省略或指定为 null，则使用全局对象 window。
   * @returns {Array} 包含所有回调函数执行后返回值为 true 时对应的原数组元素的新数组。
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
   *   '  hello '.trim();
   *   // 'hello'
   * @see http://blog.stevenlevithan.com/archives/faster-trim-javascript
   * @see http://es5.github.com/#x15.5.4.20
   */
  if (!String.prototype.trim || WHITESPACES.trim()) {
    var RE_START_WHITESPACES = new RegExp('^[' + WHITESPACES + ']+');
    var RE_END_WHITESPACES = new RegExp('[' + WHITESPACES + ']+$');
    String.prototype.trim = function() {
      return String(this).replace(RE_START_WHITESPACES, '').replace(RE_END_WHITESPACES, '');
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
    while (count) {
      result += this;
      count--;
    }
    return result;
  };

//--------------------------------------------------[String.prototype.startsWith]
  /**
   * 检查字符串是否以指定的子串开始。
   * @name String.prototype.startsWith
   * @function
   * @param {string} subString 指定的子串。
   * @returns {boolean} 检查结果。
   * @example
   *   'abcdefg'.startsWith('a');
   *   // true
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   */
  String.prototype.startsWith = function(subString) {
    return this.indexOf(subString) === 0;
  };

//--------------------------------------------------[String.prototype.endsWith]
  /**
   * 检查字符串是否以指定的子串结束。
   * @name String.prototype.endsWith
   * @function
   * @param {string} subString 指定的子串。
   * @returns {boolean} 检查结果。
   * @example
   *   'abcdefg'.endsWith('a');
   *   // false
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   */
  String.prototype.endsWith = function(subString) {
    var lastIndex = this.lastIndexOf(subString);
    return lastIndex >= 0 && lastIndex === this.length - subString.length;
  };

//--------------------------------------------------[String.prototype.contains]
  /**
   * 检查字符串是否包含指定的子串。
   * @name String.prototype.contains
   * @function
   * @param {string} subString 指定的子串。
   * @returns {boolean} 检查结果。
   * @example
   *   'abcdefg'.contains('cd');
   *   // true
   * @see http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
   */
  String.prototype.contains = function(subString) {
    return this.indexOf(subString) !== -1;
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
   * 检查提供的值是否为整数。
   * @name Number.isInteger
   * @function
   * @param {*} value 提供的值。
   * @returns {boolean} 检查结果。
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
   *   Object.forEach
   *   Object.clone
   *   Object.append
   *   Array.from
   *   Array.prototype.contains
   *   Array.prototype.getFirst
   *   Array.prototype.getLast
   *   String.prototype.clean
   *   Number.prototype.padZero
   *   Math.limit
   *   Math.randomRange
   *   Date.from
   *   Date.prototype.format
   *   RegExp.escape
   */

//--------------------------------------------------[Object.forEach]
  /**
   * 遍历一个对象。
   * @name Object.forEach
   * @function
   * @param {Object} object 要遍历的对象。
   * @param {Function} callback 用来遍历的函数，参数为 value，key，object。
   * @param {Object} [thisObj] 遍历函数的 this 值。
   */
  Object.forEach = function(object, callback, thisObj) {
    for (var key in object) {
      if (HAS_OWN_PROPERTY.call(object, key)) {
        callback.call(thisObj, object[key], key, object);
      }
    }
    if (hasDontEnumBug) {
      var i = 0;
      while (i < DONT_ENUM_PROPERTIES_LENGTH) {
        var dontEnumProperty = DONT_ENUM_PROPERTIES[i];
        if (HAS_OWN_PROPERTY.call(object, dontEnumProperty)) {
          callback.call(thisObj, object[dontEnumProperty], dontEnumProperty, object);
        }
        i++;
      }
    }
  };

//--------------------------------------------------[Object.clone]
  /**
   * 克隆一个对象，返回克隆后的新对象。
   * @name Object.clone
   * @function
   * @param {Object} source 原始对象。
   * @param {boolean} [recursive] 是否进行深克隆。
   * @returns {Object} 克隆后的新对象。
   * @description
   *   原型链中的 properties 不会被克隆。
   */
  Object.clone = function(source, recursive) {
    var cloning;
    switch (typeOf(source)) {
      case 'object.Array':
        cloning = [];
        source.forEach(function(item, i) {
          cloning[i] = recursive ? Object.clone(item, true) : item;
        });
        break;
      case 'object.Object':
        cloning = {};
        Object.forEach(source, function(value, key) {
          cloning[key] = recursive ? Object.clone(value, true) : value;
        });
        break;
      default:
        cloning = source;
    }
    return cloning;
  };

//--------------------------------------------------[Object.append]
  /**
   * 为一个对象追加另一个对象自身（不包含原型链）的 properties。
   * @name Object.append
   * @function
   * @param {Object} original 原始对象。
   * @param {Object} appending 追加对象，其 properties 会被复制到 original 中。
   * @param {Object} [filter] 过滤要复制的 appending 的 properties 的名单。
   * @param {Array} filter.whiteList 仅在 appending 中的 key 包含于 whiteList 时，对应的 property 才会被复制到 original 中。
   * @param {Array} filter.blackList 如果 appending 中的 key 包含于 blackList，则对应的 property 不会被复制到 original 中。
   *   如果 blackList 与 whiteList 有重复元素，则 whiteList 中的该元素将被忽略。
   * @returns {Object} 追加后的 original 对象。
   * @description
   *   appending 中的 property 会覆盖 original 中的同名 property。
   *   <table>
   *     <tr><th>original (before)</th><th>appending</th><th>original (after)</th></tr>
   *     <tr><td>a: 'a.0'</td><td></td><td>a: 'a.0'</td></tr>
   *     <tr><td>b: 'b.0'</td><td>b: 'b.1'</td><td>b: 'b.1'</td></tr>
   *     <tr><td></td><td>c: 'c.1'</td><td>c: 'c.1'</td></tr>
   *   </table>
   * @example
   *   var original = {a: 'a.0'};
   *   var appending = {b: 'b.1'};
   *   JSON.stringify(Object.append(original, appending));
   *   // {"a":"a.0","b":"b.1"}
   * @example
   *   var original = {a: 'a.0', b: 'b.0', c: 'c.0'};
   *   var appending = {a: 'a.1', b: 'b.1', c: 'c.1'};
   *   JSON.stringify(Object.append(original, appending, {whiteList: ['a', 'b']}));
   *   // {"a":"a.1","b":"b.1","c":"c.0"}
   *   JSON.stringify(Object.append(original, appending, {whiteList: ['a', 'b'], blackList: ['b', 'c']}));
   *   // {"a":"a.1","b":"b.0","c":"c.0"}
   * */
  Object.append = function(original, appending, filter) {
    var keys = Object.keys(appending);
    if (filter) {
      var whiteList = filter.whiteList;
      var blackList = filter.blackList;
      if (whiteList) {
        keys = whiteList.filter(function(item) {
          return keys.contains(item);
        });
      }
      if (blackList) {
        keys = keys.filter(function(item) {
          return !blackList.contains(item);
        });
      }
    }
    keys.forEach(function(item) {
      original[item] = appending[item];
    });
    return original;
  };

//--------------------------------------------------[Array.from]
  /**
   * 将类数组对象转化为数组，如果该对象不是一个类数组对象，则返回一个仅包含该对象的数组。
   * @name Array.from
   * @function
   * @param {*} arrayish 要转化为数组的对象。
   * @returns {Array} 转化后的数组。
   */
  Array.from = function(arrayish) {
    var result = [];
    var length;
    var type = typeOf(arrayish);
    if (type === 'object.Array') {
      result = arrayish;
    } else if (typeof (length = arrayish.length) !== 'number' || type === 'string' || type === 'function' || type === 'object.RegExp' || type === 'object.Global') {
      result.push(arrayish);
    } else {
      var i = 0;
      while (i < length) {
        result[i] = arrayish[i];
        i++;
      }
    }
    return result;
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
   * 合并本字符串中的空白字符，并去掉首尾的空白字符。
   * @name String.prototype.clean
   * @function
   * @returns {string} 清理后的字符串。
   * @example
   *   ' a b  c   d    e     f      g       '.clean();
   *   // 'a b c d e f g'
   */
  var RE_WHITESPACES = new RegExp('[' + WHITESPACES + ']+', 'g');
  String.prototype.clean = function() {
    return this.replace(RE_WHITESPACES, ' ').trim();
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
    var number = Math.abs(this) + '';
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
   * 将输入数字限制于 min 和 max 之间（包含 min 和 max）。
   * @name Math.limit
   * @function
   * @param {number} number 输入的数字。
   * @param {number} min 允许的数字下限。
   * @param {number} max 允许的数字上限。
   * @returns {number} 输出的数字。
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

//--------------------------------------------------[Date.from]
  /**
   * 将符合某种格式的字符串转换为日期。
   * @name Date.from
   * @function
   * @param {string} string 代表日期的字符串，该字符串应该能够通过 Date.prototype.format 生成。
   *   日期字符串中缺失的部分将使用默认值代替，各部分的默认值如下：
   *   <table>
   *     <tr><th>日期字段</th><th>默认值</th></tr>
   *     <tr><td>年</td><td>2012</td></tr>
   *     <tr><td>月</td><td>1</td></tr>
   *     <tr><td>日</td><td>1</td></tr>
   *     <tr><td>时</td><td>0</td></tr>
   *     <tr><td>分</td><td>0</td></tr>
   *     <tr><td>秒</td><td>0</td></tr>
   *     <tr><td>毫秒</td><td>0</td></tr>
   *     <tr><td>时区</td><td>当地时区</td></tr>
   *   </table>
   *   注意：未检查字符串内包含数据的有效性，若数据异常，将得不到预期的日期值。
   * @param {string} [pattern] 由代表日期字段的标志符和其他字符组成的格式字符串，默认为 'YYYY-MM-DD'。格式请参考 Date.prototype.format 的同名参数。
   * @param {boolean} [isUTC] 字符串是否为世界标准时间。
   *   当 isUTC 与 string 中已存在的 TZD 标识冲突时，isUTC 将被忽略。
   * @returns {Date} 转换后的日期。
   * @example
   *   Date.from('2012-06-25 12:00:00', 'YYYY-MM-DD hh:mm:ss')
   *   // 各浏览器中日期的字符串形式略有差异。
   *   // "Mon Jun 25 2012 12:00:00 GMT+0800"
   *   Date.from('2012-12-21T23:14:35.000+08:00', 'YYYY-MM-DDThh:mm:ss.sTZD', true).format('世界标准时间YYYY年MM月DD日hh点mm分ss秒', true)
   *   // "世界标准时间2012年12月21日15点14分35秒"
   *   Date.from('02-29 16:00', 'MM-DD hh:mm')
   *   // 年份缺失，使用默认值代替。
   *   // "Wed Feb 29 2012 16:00:00 GMT+0800"
   */
  var timeZoneOffset = new Date().getTimezoneOffset() * 60000;
  Date.from = function(string, pattern, isUTC) {
    pattern = pattern || 'YYYY-MM-DD';

    // 从 string 中参考 pattern 解析出日期数据。
    var extractedData = {};
    var match;
    var index;
    var key;
    var value;
    var start;
    var currentCorrectedValue;
    var totalCorrectedValue = 0;
    while (match = RE_DATE_KEYS.exec(pattern)) {
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
    var dateValues = Object.append({YYYY: 2012, MM: 0, DD: 1, hh: 0, mm: 0, ss: 0, s: 0, TZD: isUTC ? 0 : timeZoneOffset}, extractedData);

    // 转换为日期类型。
    return new Date(Date.UTC(dateValues['YYYY'], dateValues['MM'], dateValues['DD'], dateValues['hh'], dateValues['mm'], dateValues['ss'], dateValues['s']) + dateValues['TZD']);
  };

//--------------------------------------------------[Date.prototype.format]
  /**
   * 将日期格式化为字符串。
   * @name Date.prototype.format
   * @function
   * @param {string} [pattern] 由代表日期字段的标志符和其他字符组成的格式字符串，默认为 'YYYY-MM-DD'。
   *   各标志符及其含义：
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
  Date.prototype.format = function(pattern, toUTC) {
    pattern = pattern || 'YYYY-MM-DD';

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

    return pattern.replace(RE_DATE_KEYS, function(key) {
      return keys[key];
    });

  };

//--------------------------------------------------[RegExp.escape]
  /**
   * 为字符串编码，避免创建正则表达式时破坏预期的结构。
   * @name RegExp.escape
   * @function
   * @param {string} string 要编码的字符串。
   * @returns {string} 编码后的字符串。
   * @see http://prototypejs.org/
   */
  var RE_REGULAR_EXPRESSION_METACHARACTERS = /([.*+?^=!:${}()|[\]\/\\])/g;
  RegExp.escape = function(string) {
    return (string + '').replace(RE_REGULAR_EXPRESSION_METACHARACTERS, '\\$1');
  };

})();
/**
 * @fileOverview 浏览器 API 扩展。
 * @author sundongguo@gmail.com
 * @version 20111201
 */
(function() {
//==================================================[全局方法]
  /*
   * 提供全局方法。
   *
   * 扩展方法：
   *   typeOf
   *   execScript
   *   getNamespace
   */

  /**
   * 全局对象。
   * @name Global
   * @namespace
   */

//--------------------------------------------------[typeOf]
  var types = {};
  ['Boolean', 'Number', 'String', 'Array', 'Date', 'RegExp', 'Error', 'Math', 'JSON', 'Arguments'].forEach(function(type) {
    types['[object ' + type + ']'] = 'object.' + type;
  });
  var TO_STRING = Object.prototype.toString;
  var RE_FUNCTION = /^\s+function .+\s+\[native code\]\s+\}\s+$/;

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
   *   注意：
   *   一些特殊的对象，如 IE7 IE8 中的 XMLHttpRequest，是作为构造函数使用的，但使用本方法将得到 'object.Object' 的结果。考虑到需要判断这类对象的情况极为少见，因此未作处理。
   *   IE6 IE7 IE8 中在试图访问某些对象提供的属性/方法时，如 new ActiveXObject('Microsoft.XMLHTTP').abort，将抛出“对象不支持此属性或方法”的异常，因此也无法使用本方法对其进行判断。但可以对其使用 typeof 运算符并得到结果 'unknown'。

   * @example
   *   typeOf(document);
   *   // 'object.Node'
   * @see http://mootools.net/
   * @see http://jquery.com/
   */
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
        type = types[TO_STRING.call(value)] || 'object.Object';
        if (type === 'object.Object') {
          // 转化为字符串判断。
          var string = value + '';
          if (string === '[object Window]' || string === '[object DOMWindow]') {
            type = 'object.Global';
          } else if (string === '[object JSON]') {
            type = 'object.JSON';
          } else if (RE_FUNCTION.test(string)) {
            type = 'function';
          } else {
            // 使用特性判断。
            if ('nodeType' in value && 'nodeName' in value) {
              type = 'object.Node';
            } else if (typeof value.length == 'number') {
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
   */
  if (!window.execScript) {
    window.execScript = function(code) {
      window.eval(code);
    };
  }

//--------------------------------------------------[getNamespace]
  /**
   * 获取一个命名空间，如果该命名空间不存在，将创建并返回这个命名空间。
   * @name getNamespace
   * @memberOf Global
   * @function
   * @param {string} namespace 命名空间的字符串形式。
   * @returns {Object} 命名空间对象。
   * @example
   *   var finale = getNamespace('data.championship.finale');
   *   finale.getRankingList = function() {...};
   */
  window.getNamespace = function(namespace) {
    var o = window;
    namespace.split('.').forEach(function(item) {
      o = item in o ? o[item] : o[item] = {};
    });
    return o;
  };

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

  /**
   * 供内部使用的向用户显示警告信息的方法。
   * @name navigator.warn
   * @function
   * @private
   * @param {string} message 警告信息。
   */
  navigator.warn = function(message) {
    // 使用 typeof 在 IE 中可能得到 "object"。
    if (console && typeOf(console.warn) === 'function') {
      console.warn('OurJS: ' + message);
    }
  };

//--------------------------------------------------[navigator.*]
  /**
   * 从 navigator.userAgent 中提取的常用信息。
   * @name userAgentInfo
   * @memberOf navigator
   * @type Object
   * @description
   *   注意：
   *   navigator.userAgentInfo 下的三个属性是根据 navigator.userAgent 得到的，仅供参考使用，不建议用在代码逻辑判断中。
   */

  /**
   * 浏览器渲染引擎的类型，值为以下之一：Trident|WebKit|Gecko|Presto。
   * @name userAgentInfo.engine
   * @memberOf navigator
   * @type string
   */

  /**
   * 浏览器名称，值为以下之一：IE|Firefox|Chrome|Safari|Opera。
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
   * 是否工作在标准模式下。
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

  Object.append(navigator, function() {
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
    // 检查工作模式。
    var inStandardsMode = document.compatMode === 'CSS1Compat';
    if (!inStandardsMode) {
      navigator.warn('Browser is working in non-standards mode!');
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
   * 获取当前页面的 Query String 中携带的所有参数。
   * @name parameters
   * @memberOf location
   * @type Object
   * @description
   *   注意：
   *   当地址栏的字符有非 ASCII 字符，或有非法的查询字符串时，会有兼容性问题。
   * @example
   *   // 设页面地址为 test.html?a=ok&b=100&b=128
   *   location.parameters
   *   // {a:'ok', b:['100', '128']}
   * @see http://w3help.org/zh-cn/causes/HD9001
   */
  Object.append(location, function() {
    // 查找并保存页面参数。
    var parameters = {};
    var searchString = location.search.slice(1);
    if (searchString) {
      searchString.split('&').forEach(function(item) {
        var valuePair = item.split('=');
        var key = valuePair[0];
        var value = valuePair[1];
        if (key in parameters) {
          typeof parameters[key] === 'string' ? parameters[key] = [parameters[key], value] : parameters[key].push(value);
        } else {
          parameters[key] = value;
        }
      });
    }
    // 返回扩展对象。
    return {parameters: parameters};
  }());

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
  var cookie = {};
  window.cookie = cookie;

//--------------------------------------------------[cookie.getItem]
  /**
   * 从 cookie 中读取一条数据。
   * @name cookie.getItem
   * @function
   * @param {string} key 数据名。
   * @returns {string} 数据值。
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
   * @param {string} options.path 限定生效的路径，默认为当前路径。
   * @param {string} options.domain 限定生效的域名，默认为当前域名。
   * @param {boolean} options.secure 是否仅通过 SSL 连接 (HTTPS) 传输本条数据，默认为否。
   * @param {Date} options.expires 过期时间。
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
      item += '; expires=' + options.expires.toUTCString();
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
   * @param {string} options.path 限定生效的路径，默认为当前路径。
   * @param {string} options.domain 限定生效的域名，默认为当前域名。
   * @param {boolean} options.secure 是否仅通过 SSL 连接 (HTTPS) 传输本条数据，默认为否。
   */
  cookie.removeItem = function(key, options) {
    options = options || {};
    options.expires = new Date(0);
    this.set(key, '', options);
  };

//==================================================[localStorage 补缺]
  /*
   * 为不支持 localStorage 的浏览器（IE6 IE7）模拟此特性。
   *
   * 补缺属性：
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
   *   注意：
   *   在不支持 localStorage 的浏览器中，会使用路径 '/favicon.ico' 来创建启用 userData 的元素。
   *   当上述路径不存在时 (404)，服务端应避免返回包含脚本的页面，以免出现预料外的异常。
   */
  var localStorage = {};
  window.localStorage = localStorage;

  // 用来保存 userData 的元素。
  var userDataElement;
  // 指定存储路径。
  var USER_DATA_PATH = '/favicon.ico';
  // 指定一个固定的 userData 存储文件名。
  var USER_DATA_FILE_NAME = 'localStorage';
  // 尝试使用跨路径的 userData 访问。
  try {
    // 使用同步方式在当前域的指定存储路径创建一个文档，以确保对 userData 操作的代码能够同步执行。
    var hiddenDocument = new ActiveXObject('htmlfile');
    hiddenDocument.open();
    hiddenDocument.write('<iframe id="root_path" src="' + USER_DATA_PATH + '"></frame>');
    hiddenDocument.close();
    // 关键：IE6 IE7 IE8 允许在 document 上插入元素。
    var userDataOwnerDocument = hiddenDocument.getElementById('root_path').contentWindow.document;
    // 创建绑定了 userData 行为的元素。
    userDataElement = userDataOwnerDocument.createElement('var');
    userDataOwnerDocument.appendChild(userDataElement);
  } catch (e) {
    // 若创建失败，则仅实现不能跨路径的 userData 访问。
    userDataElement = document.documentElement;
  }
  // 添加行为。
  userDataElement.addBehavior('#default#userData');

//--------------------------------------------------[localStorage.getItem]
  /**
   * 从 localStorage 中读取一条数据。
   * @name localStorage.getItem
   * @function
   * @param {string} key 数据名。
   * @returns {string} 数据值。
   */
  localStorage.getItem = function(key) {
    userDataElement.load(USER_DATA_FILE_NAME);
    return userDataElement.getAttribute(key);
  };

//--------------------------------------------------[localStorage.setItem]
  /**
   * 在 localStorage 中保存一条数据。
   * @name localStorage.setItem
   * @function
   * @param {string} key 数据名，不能为空字符串。
   * @param {string} value 数据值。
   * @description
   *   注意：
   *   与源生的 localStorage 不同，IE6 IE7 的实现不允许 `~!@#$%^&*() 等符号出现在 key 中，可以使用 . 和 _ 符号，但不能以 . 和数字开头。
   *   可以使用中文 key。
   */
  localStorage.setItem = function(key, value) {
    userDataElement.load(USER_DATA_FILE_NAME);
    userDataElement.setAttribute(key, value);
    userDataElement.save(USER_DATA_FILE_NAME);
  };

//--------------------------------------------------[localStorage.removeItem]
  /**
   * 从 localStorage 中删除一条数据。
   * @name localStorage.removeItem
   * @function
   * @param {string} key 数据名。
   */
  localStorage.removeItem = function(key) {
    userDataElement.load(USER_DATA_FILE_NAME);
    userDataElement.removeAttribute(key);
    userDataElement.save(USER_DATA_FILE_NAME);
  };

//--------------------------------------------------[localStorage.clear]
  /**
   * 清空 localStorage 中的所有数据。
   * @name localStorage.clear
   * @function
   */
  localStorage.clear = function() {
    var attributes = userDataElement.XMLDocument.documentElement.attributes;
    userDataElement.load(USER_DATA_FILE_NAME);
    var index = 0;
    var attribute;
    while (attribute = attributes[index++]) {
      userDataElement.removeAttribute(attribute.name);
    }
    userDataElement.save(USER_DATA_FILE_NAME);
  };

})();
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
   * 仅为 Element 扩展新特性，而不是所有的 Node 类型。
   *
   * 提供屏蔽浏览器差异的，针对元素操作的方法有以下三种方案：
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
   *     由于对包装对象上方法的调用与对原生对象上方法的调用方式是相同的（使用 . 操作符调用），特殊情况下有误把源生对象当作包装对象误用的可能。
   *     必须以约定的方式获取元素以便对其包装。
   * 三、原型扩展
   *   方式：
   *     直接在 Element.prototype 上添加方法。对于不支持 Element 构造函数的浏览器（IE6 IE7），将对应特性直接附加在元素上。
   *   优点：
   *     不引入新的对象类型或命名空间，只在已有的对象类型上添加方法，一致性最好。
   *     调用方法时操作主题就是目标元素本身，可以链式调用，语法自然。
   *   缺点：
   *     为方法命名时，不能使用 DOM 元素已有的和将来可能会有的特性名。
   *     修改了原生对象，跨 frame 操作前需要预先修改目标 frame 中的原生对象，不能与其他基于原型扩展的脚本库共存。
   *     必须以约定的方式获取元素以便兼容 IE6 IE7 的扩展方式，另外对 IE6 IE7 的修补方案有性能损耗。
   *
   * 为达到“易学易用”、“化繁为简”的目标，这里使用第三种实现方式，以使 API 有最好的一致性和最自然语法。
   * 为保持简单，不予提供跨 frame 的操作。实际上跨 frame 操作并不常见，通常也不建议这样做。必须这样做时，应在 frame 内也引入本脚本库，两侧通过事件通信。
   * 要处理的元素必须由本脚本库提供的 document.$ 方法来获取，或通过已获取的元素上提供的方法（如 find、getNext 等）来获取。使用其他途径如元素本身的 parentNode 特性来获取的元素，在 IE6 IE7 中将丢失这些附加特性。
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
          if (isNaN(fixedData.left.usedValue) && isNaN(fixedData.right.usedValue)) {
            fixedData.left.usedValue = document.documentElement.scrollLeft + $element.getClientRect().left - (parseInt($element.currentStyle.marginLeft, 10) || 0);
          }
          if (isNaN(fixedData.top.usedValue) && isNaN(fixedData.bottom.usedValue)) {
            fixedData.top.usedValue = document.documentElement.scrollTop + $element.getClientRect().top - (parseInt($element.currentStyle.marginTop, 10) || 0);
          }
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
  var parseDataKey = function(key) {
    return VALID_NAME.test(key) ? 'data-' + camelCaseToHyphenate(key) : '';
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
    key = parseDataKey(key);
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
    key = parseDataKey(key);
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
    key = parseDataKey(key);
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
   * 比较本元素和目标元素在文档树中的位置关系。
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
   *   Element.prototype.replace
   *   Element.prototype.remove
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
   *   处理器 (handler)：
   *     包含派发器、事件名称、监听器等信息。
   *   派发器 (dispatcher)：
   *     封装事件对象，在条件满足的时候将事件对象派发给相应的监听器。
   *   事件名称 (name)：
   *     由事件的类型、可选的标签和代理元素选择符组成的字符串。
   *   事件类型 (type)：
   *     供用户使用的事件类型可能是普通事件、扩展的事件，或是用户自定义的事件。
   *     内部事件模型使用的事件类型不一定与供用户使用的事件类型完全匹配。
   *   事件标签 (labal)：
   *     标签的意义在于标记一次绑定的行为。
   *     当用户使用 on 添加一个监听器时，可以指定一个标签，这样可以在使用 off 删除监听器时，通过标签来删除某类事件中特定的监听器。
   *   代理元素选择符 (selector)：
   *     通过在事件名称中加入 :relay(selector) 来指定为符合条件的后代元素代理事件监听。
   *   监听器 (listener)：
   *     用户使用 on 添加的普通或代理监听器。在对应的事件触发时，会传入封装后的事件对象。
   *     用户可以调用该事件对象的方法来阻止其传播，或取消其默认行为。
   *     如果用户在一个事件的监听器中返回布尔值 false，该事件将停止传播并取消默认行为。
   *   事件对象 (event)：
   *     供用户使用的事件对象是封装后的，以屏蔽浏览器差异，并为扩展的事件提供必要的信息。
   *     原始事件对象不直接对外暴露，该对象上可能有用的特性已被复制到封装后的对象上。必须访问原始事件对象时，可以通过调用 event.originalEvent 来得到它。
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

  // 已绑定的事件池。
  /*
   * <Object eventPool> {
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
   *      .dispatcher: <Function dispatcher>
   *                                        .type: <string type>
   *                                        .useCapture: <boolean useCapture>
   *      .delegateCount: <number delegateCount>
   *   }
   * };
   */
  var eventPool = {};

  var RE_EVENT_NAME = /^(\w+)(\.\w+)?(?::relay\(([^\)]+)\))?$/;
  var RE_EVENT_NAME_SEPARATOR = /\s*,\s*/;
  var RE_SIMPLE_SELECTOR = /^(\w*)(?:\.([\w\-]+))?$/;
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
   * 是否可以冒泡，不冒泡的事件不能使用代理事件监听。
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

  // 解析事件名称。
  var parseEventName = function(eventName) {
    var result = {};
    var match;
    if (eventName && (match = eventName.match(RE_EVENT_NAME))) {
      result.type = match[1];
      result.label = match[2] || '';
      result.selector = match[3] || '';
    }
    if (result.type + result.label + (result.selector ? ':relay(' + result.selector + ')' : '') !== eventName) {
      throw new Error('Invalid event name "' + eventName + '"');
    }
    return result;
  };

  // 添加和删除事件监听器。
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

  // 特殊事件处理。
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
  // 仅会运行在目标元素上使用 on 绑定的事件监听器，以其他方式绑定的事件监听器不会被运行。
  var dispatchEvent = function($element, handlers, event, isTriggered) {
    var delegateCount = handlers.delegateCount;
    var $target = delegateCount ? event.target : $element;
    var filters = {};
    var needsBubble;
    var handler;
    var selector;
    var from;
    var to;
    while ($target) {
      if ($target !== $element) {
        // 代理监听器。
        needsBubble = true;
        from = 0;
        to = delegateCount;
      } else {
        // 普通监听器。
        needsBubble = false;
        from = delegateCount;
        to = handlers.length;
      }
      while (from < to) {
        handler = handlers[from];
        selector = handler.selector;
        // 如果是代理事件监听，则过滤出符合条件的元素。
        if (!selector || (filters[selector] || (filters[selector] = function(simpleSelector) {
          if (simpleSelector) {
            return function($target) {
              var tagName = simpleSelector.tagName;
              var className = simpleSelector.className;
              return (tagName ? $target.nodeName.toLowerCase() === tagName : true) && (className ? $target.hasClass(className) : true);
            };
          } else {
            var elements = $element.find(selector);
            return function($target) {
              return elements.contains($target);
            }
          }
        }(handler.simpleSelector)))($target)) {
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
      // 如果是在 document 上代理监听的事件，在 html 元素之后就会返回 null，但并不影响处理，这种情况本身就不必检查 document 自身。
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
    // 尝试获取对应的项，以便删除该项中的所有处理器组。
    var item = eventPool[uid];
    if (!item) {
      return element;
    }
    // 遍历并删除每一个处理器。
    var types = Object.keys(item);
    var handlers;
    while (types.length) {
      handlers = item[types.shift()];
      while (handlers.length) {
        element.off(handlers[0].name);
      }
    }
    return element;
  };

//--------------------------------------------------[Element.prototype.on]
  /**
   * 为本元素添加事件监听器。
   * @name Element.prototype.on
   * @function
   * @param {string} name 事件名称，格式为 <dfn><var>type</var>.<var>label</var>:relay(<var>selector</var>)</dfn>，详细信息请参考下表。
   *   使用逗号分割多个事件名称，即可同时为多个事件注册同一个监听器。
   *   对于为不保证所有浏览器均可以冒泡的事件类型指定了代理监听的情况，会给出警告信息。
   *   <table>
   *     <tr><th></th><th>是否必选</th><th>详细描述</th></tr>
   *     <tr><td><dfn><var>type</var></dfn></td><td>必选</td><td>要监听的事件类型</td></tr>
   *     <tr><td><dfn>.<var>label</var></dfn></td><td>可选</td><td>给事件类型加上标签，以便调用 off 方法时精确匹配要删除的事件监听器。<br>不打算删除的事件监听器没有必要指定标签。</td></tr>
   *     <tr><td><dfn>:relay(<var>selector</var>)</dfn></td><td>可选</td><td>用于指定对本元素的后代元素中符合 selector 要求的元素代理事件监听。<br>这种情况下，在事件发生时，将认为事件是由被代理的元素监听到的，而不是本元素。</td></tr>
   *   </table>
   * @param {Function} listener 事件监听器。
   *   监听器中的 this 将指向监听到本次事件的元素。即：
   *   - 如果是普通监听器，则 this 指向本元素。
   *   - 如果是代理监听器，则 this 指向被代理的元素。
   * @returns {Element} 本元素。
   * @example
   *   $('#test').on('click', handler);
   *   // 为 id 为 test 的元素添加 click 事件监听器。
   * @example
   *   $('#test').on('click.temp', handler);
   *   // 为 id 为 test 的元素添加 click 事件监听器，并为其指定一个标签 temp。
   * @example
   *   $('#test').on('click:relay(a)', handler);
   *   // 为 id 为 test 的元素添加一个代理事件监听器，为该元素所有的后代 a 元素代理 click 事件的监听。
   * @see http://mootools.net/
   * @see http://www.quirksmode.org/dom/events/index.html
   */
  Element.prototype.on = function(name, listener) {
    var uid = this.uid;
    // 无法为未经扩展的元素添加监听器。
    if (!uid) {
      return this;
    }
    var $element = this;
    // 同时为多个事件类型添加监听器。
    if (name.contains(',')) {
      name.split(RE_EVENT_NAME_SEPARATOR).forEach(function(name) {
        // 允许 window/document.on 的多次调用。
        Element.prototype.on.call($element, name, listener);
      });
      return $element;
    }
    // 取出事件类型和选择符。
    var info = parseEventName(name);
    var type = info.type;
    var selector = info.selector;
    // 尝试获取对应的项及其处理器组，以添加处理器。
    var item = eventPool[uid] || (eventPool[uid] = {});
    var handlers = item[type] || (item[type] = []);
    // 首次注册此类型的事件。
    if (!handlers.dispatcher) {
      // 普通事件使用默认的派发器。
      var dispatcher = function(e) {
        dispatchEvent($element, handlers, new Event(e || window.event, type));
      };
      dispatcher.type = type;
      dispatcher.useCapture = false;
      // 特殊事件使用定制的派发器。
      switch (type) {
        case 'mousewheel':
          // 鼠标滚轮事件，Firefox 的事件类型为 DOMMouseScroll。
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
          var dragHandlers = {};
          var dragState = null;
          var dragstart = function(e) {
            var event = new Event(e || window.event, 'mousedragstart');
            event.offsetX = event.offsetY = 0;
            if (!event.leftButton || dispatchEvent($element, dragHandlers.mousedragstart, event).isDefaultPrevented()) {
              return;
            }
            var $target = event.target;
            if ($target.setCapture) {
              $target.setCapture();
            }
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
            if ($target.releaseCapture) {
              $target.releaseCapture();
            }
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
          dragHandlers[type] = handlers;
          // HACK：这三个关联事件有相同的派发器和各自的处理器组，此处分别创建另外两个关联事件的项和处理器组。
          eventHelper[type].related.forEach(function(type) {
            var handlers = [];
            handlers.dispatcher = dispatcher;
            handlers.delegateCount = 0;
            dragHandlers[type] = item[type] = handlers;
          });
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
      // 确定管理器组的派发器和代理计数器。
      handlers.dispatcher = dispatcher;
      handlers.delegateCount = 0;
    }
    // 添加处理器（允许重复添加同一个监听器 - W3C 的事件模型不允许多次添加同一个监听器）。
    var handler = {name: name, listener: listener};
    if (selector) {
      // 代理监听器。
      handler.selector = selector;
      var match;
      if (match = selector.match(RE_SIMPLE_SELECTOR)) {
        // 保存简单选择器（tagName 和 className 不可能同时为空）以在执行过滤时使用效率更高的方式。
        handler.simpleSelector = {
          tagName: match[1] || '',
          className: match[2] || ''
        };
      }
      handlers.splice(handlers.delegateCount++, 0, handler);
      // 为不保证所有浏览器均可以冒泡的事件类型指定代理监听时，给出警告信息。
      if (EVENT_CODES[type] & 4) {
        navigator.warn('Incompatible event delegation type "' + name + '".');
      }
    } else {
      // 普通监听器。
      handlers.push(handler);
    }
    return $element;
  };

//--------------------------------------------------[Element.prototype.off]
  /**
   * 删除本元素上已添加的事件监听器。
   * @name Element.prototype.off
   * @function
   * @param {string} name 事件名称。本元素上绑定的所有名称与 name 匹配的监听器都将被删除。使用逗号分割多个事件名称，即可同时删除多种名称的事件监听器。
   * @returns {Element} 本元素。
   * @example
   *   $('#test').off('click');
   *   // 为 id 为 test 的元素删除名为 click 的事件监听器。
   * @example
   *   $('#test').off('click.temp', handler);
   *   // 为 id 为 test 的元素删除名为 click.temp 的事件监听器。
   * @example
   *   $('#test').off('click:relay(a)', handler);
   *   // 为 id 为 test 的元素删除名为 click:relay(a) 的事件监听器。
   */
  Element.prototype.off = function(name) {
    var uid = this.uid;
    // 无法为未经扩展的元素删除监听器。
    if (!uid) {
      return this;
    }
    var $element = this;
    // 同时删除该元素上的多个监听器。
    if (name.contains(',')) {
      name.split(RE_EVENT_NAME_SEPARATOR).forEach(function(name) {
        Element.prototype.off.call($element, name);
      });
      return $element;
    }
    // 取出事件类型。
    var type = parseEventName(name).type;
    // 尝试获取对应的项及其处理器组，以删除处理器。
    var item = eventPool[uid];
    if (!item) {
      return $element;
    }
    var handlers = item[type];
    if (!handlers) {
      return $element;
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
    // 若处理器组为空，则删除派发器的注册并删除处理器组。
    if (handlers.length === 0) {
      var dispatcher = handlers.dispatcher;
      switch (type) {
        case 'mousedragstart':
        case 'mousedrag':
        case 'mousedragend':
          // 必须在这组关联事件的最后一个监听器被删除后才清理派发器。
          var listenersCount = 0;
          eventHelper[type].related.forEach(function(type) {
            listenersCount += item[type].length;
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
    // 若该项再无其他处理器组，删除该项。
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
    var item;
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
      if (handlers = (item = eventPool[$element.uid]) && item[type]) {
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
   * @param {string} name 事件名称，格式请参考 Element.prototype.on 的同名参数。
   * @param {Function} listener 事件监听器，细节请参考 Element.prototype.on 的同名参数。
   * @returns {Object} document 对象。
   * @description
   *   特殊事件：domready
   *   <ul>
   *     <li>在文档可用时触发，只能添加监听器，不能删除监听器，因此不能使用标签。</li>
   *     <li>不会有事件对象作为参数传入监听器。</li>
   *     <li>如果在此事件触发后添加此类型的监听器，这个新添加的监听器将立即运行。</li>
   *   </ul>
   */
  document.on = function(name, listener) {
    var filteredName = name.split(RE_EVENT_NAME_SEPARATOR)
        .filter(function(name) {
          if (name === 'domready') {
            domready.addListener(listener);
            return false;
          }
          return true;
        })
        .join(', ');
    if (filteredName) {
      Element.prototype.on.call(document, filteredName, listener);
    }
    return this;
  };

//--------------------------------------------------[document.off]
  /**
   * 删除 document 上已添加的事件监听器。
   * @name document.off
   * @function
   * @param {string} name 事件名称，格式请参考 Element.prototype.off 的同名参数。
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
   * @param {string} name 事件名称，格式请参考 Element.prototype.on 的同名参数。
   * @param {Function} listener 事件监听器，细节请参考 Element.prototype.on 的同名参数。
   * @returns {Object} window 对象。
   * @description
   *   特殊事件：beforeunload
   *   <ul>
   *     <li>该事件只能存在一个监听器，因此不能使用标签。</li>
   *     <li>不会有事件对象作为参数传入监听器。</li>
   *     <li>如果添加了多个监听器，则只有最后添加的生效。</li>
   *     <li>可以删除当前生效的监听器。</li>
   *   </ul>
   */
  window.on = function(name, listener) {
    var filteredName = name.split(RE_EVENT_NAME_SEPARATOR)
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
        .join(', ');
    if (filteredName) {
      Element.prototype.on.call(window, filteredName, listener);
    }
    return this;
  };

//--------------------------------------------------[window.off]
  /**
   * 删除 window 上已添加的事件监听器。
   * @name window.off
   * @function
   * @param {string} name 事件名称，格式请参考 Element.prototype.off 的同名参数。
   * @returns {Object} window 对象。
   */
  window.off = function(name) {
    var filteredName = name.split(RE_EVENT_NAME_SEPARATOR)
        .filter(function(name) {
          if (name === 'beforeunload') {
            window.onbeforeunload = null;
            return false;
          }
          return true;
        })
        .join(', ');
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
/**
 * @fileOverview 组件。
 * @author sundongguo@gmail.com
 * @version 20120610
 */
(function() {
//==================================================[组件]
  /*
   * 组件的构造器。
   * 为各组件的实例提供 options/events 属性，以及 setOptions/on/off/fire 原型方法。
   * <Object events> {
   *   <string type>: <Array handlers> [
   *     <Object handler>: {
   *       name: <string name>
   *       listener: <Function listener>
   *     }
   *   ]
   * };
   *
   * 构造函数：
   *   Component
   */

  var RE_EVENT_NAME = /^(\w+)(\.\w+)?$/;
  var RE_EVENT_NAME_SEPARATOR = /\s*,\s*/;
  var returnTrue = function() {
    return true;
  };
  var returnFalse = function() {
    return false;
  };

  // 解析事件名称。
  var parseEventName = function(eventName) {
    var result = {};
    var match;
    if (eventName && (match = eventName.match(RE_EVENT_NAME))) {
      result.type = match[1];
      result.label = match[2] || '';
    }
    if (result.type + result.label !== eventName) {
      throw new SyntaxError('Invalid event name "' + eventName + '"');
    }
    return result;
  };

  /**
   * 组件事件。
   * @name ComponentEvent
   * @constructor
   * @private
   * @param {string} type 事件类型。
   * @param {string} target 事件来源。
   * @description
   *   组件事件可以取消默认行为（建议为用户主动触发的事件添加此功能），但不会传递。
   */
  function ComponentEvent(type, target) {
    this.type = type;
    this.target = target;
  }

  /**
   * 阻止事件的默认行为。
   * @name ComponentEvent.prototype.preventDefault
   * @function
   * @private
   */
  ComponentEvent.prototype.preventDefault = function() {
    this.isDefaultPrevented = returnTrue;
  };

  /**
   * 查询事件的默认行为是否已被阻止。
   * @name ComponentEvent.prototype.isDefaultPrevented
   * @function
   * @private
   * @returns {boolean} 查询结果。
   */
  ComponentEvent.prototype.isDefaultPrevented = returnFalse;

//--------------------------------------------------[Component Constructor]
  /**
   * 创建一个组件。
   * @name Component
   * @constructor
   * @param {Function} constructor 组件的构造函数。
   * @param {Object} defaultOptions 组件的默认选项。
   * @param {Object} prototype 组件的原型对象。
   * @description
   *   组件的实例及其原型对象中都不能设置以下属性：
   *   'options'，'events'，'setOptions'，'on'，'off'，'fire'。
   *   修改一个组件的默认选项时，应修改该组件的 options 属性所指向的对象，不要修改 options 属性的指向。
   */
  function Component(constructor, defaultOptions, prototype) {
    // 真正的构造函数。
    var Component = function() {
      this.options = {};
      this.events = {};
      Object.append(this.options, Component.options);
      constructor.apply(this, arguments);
    };
    // 默认选项。
    Component.options = defaultOptions;
    // 扩充原型链。
    Component.prototype = this;
    // 将 prototype 的属性追加到原型中。
    Object.append(Component.prototype, prototype);
    // 重新设定 constructor 属性。
    Component.prototype.constructor = Component;
    // 返回组件。
    return Component;
  }

//--------------------------------------------------[Component.prototype.setOptions]
  /**
   * 为本组件设置选项。
   * @name Component.prototype.setOptions
   * @function
   * @param {Object} options 选项。
   * @returns {Object} 本组件。
   */
  Component.prototype.setOptions = function(options) {
    Object.append(this.options, options || {}, {whiteList: Object.keys(this.options)});
    return this;
  };

//--------------------------------------------------[Component.prototype.on]
  /**
   * 为本组件添加事件监听器。
   * @name Component.prototype.on
   * @function
   * @param {string} name 事件名称，格式为 <dfn><var>type</var>.<var>label</var></dfn>，详细信息请参考下表。
   *   使用逗号分割多个事件名称，即可同时为多个事件注册同一个监听器。
   *   <table>
   *     <tr><th></th><th>是否必选</th><th>详细描述</th></tr>
   *     <tr><td><dfn><var>type</var></dfn></td><td>必选</td><td>要监听的事件类型</td></tr>
   *     <tr><td><dfn>.<var>label</var></dfn></td><td>可选</td><td>给事件类型加上标签，以便调用 off 方法时精确匹配要删除的事件监听器。<br>不打算删除的事件监听器没有必要指定标签。</td></tr>
   *   </table>
   * @param {Function} listener 事件监听器。
   *   监听器中的 this 将指向本组件。
   * @returns {Object} 本组件。
   */
  Component.prototype.on = function(name, listener) {
    var component = this;
    if (name.contains(',')) {
      name.split(RE_EVENT_NAME_SEPARATOR).forEach(function(name) {
        Component.prototype.on.call(component, name, listener);
      });
      return component;
    }
    var events = component.events;
    var type = parseEventName(name).type;
    var handlers = events[type] || (events[type] = []);
    handlers.push({name: name, listener: listener});
    return component;
  };

//--------------------------------------------------[Component.prototype.off]
  /**
   * 删除本组件上已添加的事件监听器。
   * @name Component.prototype.off
   * @function
   * @param {string} name 事件名称。本组件上绑定的所有名称与 name 匹配的监听器都将被删除。使用逗号分割多个事件名称，即可同时删除多种名称的事件监听器。
   * @returns {Object} 本组件。
   */
  Component.prototype.off = function(name) {
    var component = this;
    if (name.contains('，')) {
      name.split(RE_EVENT_NAME_SEPARATOR).forEach(function(name) {
        Component.prototype.off.call(component, name);
      });
      return component;
    }
    var events = component.events;
    var type = parseEventName(name).type;
    var handlers = events[type];
    if (!handlers) {
      return component;
    }
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
      delete events[type];
    }
    return component;
  };

//--------------------------------------------------[Component.prototype.fire]
  /**
   * 触发本组件的某类事件，运行相关的事件监听器。
   * @name Component.prototype.fire
   * @function
   * @param {String} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   * @returns {Object} 本组件。
   * @description
   *   高级应用：第三个隐藏参数 callback 供组件编写时调用，该函数仅在本事件对象从未调用过 preventDefault 方法的情况下才会执行。建议在用户触发的事件上使用 callback。
   */
  Component.prototype.fire = function(type, data, callback) {
    var component = this;
    var handlers = component.events[type];
    if (handlers) {
      var event = Object.append(new ComponentEvent(type, component), data || {});
      handlers.forEach(function(handler) {
        if (handler.listener.call(component, event) === false) {
          event.preventDefault();
        }
      });
      if (event.isDefaultPrevented()) {
        return component;
      }
    }
    if (callback) {
      callback();
    }
    return component;
  };

//--------------------------------------------------[Component]
  window.Component = Component;

})();

(function() {
//==================================================[Switcher]
  /*
   * 使用一个数组创建切换器，在每次切换活动元素时会触发相应的事件。
   * Switcher 是一个基础组件，因此放在本文件中。
   */

//--------------------------------------------------[Switcher Constructor]
  /**
   * 使用一个数组创建切换控制器。在这个数组中，同一时刻最多只有一个元素是“活动”的。
   * @name Switcher
   * @constructor
   * @param {Array} items 指定在本数组中的各元素间切换，本数组包含的元素必须是引用类型的值，且不能有重复。
   * @fires active
   *   {Element} event.activeItem 要标记为“活动”的元素。
   *   {number} event.activeIndex 标记为“活动”的元素在 items 中的索引。
   *   调用 active 方法时触发；可以取消本次动作。
   * @fires change
   *   {Element} event.activeItem 当前的活动元素。
   *   {number} event.activeIndex 当前的活动元素在 items 中的索引。
   *   {Element} event.inactiveItem 上一个活动元素。
   *   {number} event.inactiveIndex 上一个活动元素在 items 中的索引。
   *   在当前的活动元素改变时触发。
   * @description
   *   高级应用：动态修改实例对象的 items 属性的内容，可以随时增加/减少切换控制器的控制范围。
   */
  function Switcher(items) {
    this.items = items;
    this.activeItem = null;
    this.activeIndex = -1;
  }

//--------------------------------------------------[Switcher.options]
  /**
   * 默认选项。
   * @name Switcher.options
   */
  Switcher.options = {};

//--------------------------------------------------[Switcher.prototype.active]
  /**
   * 将一个元素标记为“活动”，并将当前的活动元素（如果有）标记为“非活动”。
   * @name Switcher.prototype.active
   * @function
   * @param {Object|number} i 要标记为“活动”的元素，或者这个元素在 items 中的索引值。
   *   要标记为“活动”的元素不能为当前的活动元素。
   *   如果指定的值为不在 items 中的对象，或为一个不在有效范索引围内的数字，则取消活动元素。
   * @returns {Object} Switcher 对象。
   */
  Switcher.prototype.active = function(i) {
    var switcher = this;
    var item = null;
    var index = -1;
    var x;
    if (typeof i === 'number') {
      x = switcher.items[i];
      if (x) {
        item = x;
        index = i;
      }
    } else {
      x = switcher.items.indexOf(i);
      if (x > -1) {
        item = i;
        index = x;
      }
    }
    var lastActiveItem = switcher.activeItem;
    var lastActiveIndex = switcher.activeIndex;
    if (index !== lastActiveIndex) {
      switcher.fire('active', {
        activeItem: item,
        activeIndex: index
      }, function() {
        switcher.activeItem = item;
        switcher.activeIndex = index;
        switcher.fire('change', {
          activeItem: item,
          activeIndex: index,
          inactiveItem: lastActiveItem,
          inactiveIndex: lastActiveIndex
        });
      });
    }
    return switcher;
  };

//--------------------------------------------------[Switcher]
  window.Switcher = new Component(Switcher, Switcher.options, Switcher.prototype);

})();
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
   *   animation.play()<play><playstart>          -> (x, y) <step> -> ... -> <playfinish>
   *   animation.reverse()<reverse><reversestart> -> (x, y) <step> -> ... -> <reversefinish>
   *                                                               -> animation.pause<pause> -> animation.stop()<stop>
   *                                                                                         -> animation.play()<play>       -> (x, y) <step> ->>>
   *                                                                                         -> animation.reverse()<reverse> -> (x, y) <step> ->>>
   *                                                               -> animation.stop<stop>
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
   *   当需要定制一个可以预期的动画效果时，建议使用 Animation，Animation 对象中的 Clip 会记录动画创建时的状态，而且不仅可以正向播放，还可以随时回退到起点。
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
//    'cubicBezier(0.42, 1.0, 0.75, 1.0)'.match(/^cubicBezier\((0\.\d+|0|1\.0+|1),\s*(0\.\d+|0|1\.0+|1),\s*(0\.\d+|0|1\.0+|1),\s*(0\.\d+|0|1\.0+|1)/)
    return builtInTimingFunctions[name] || (name.startsWith('cubicBezier') ? cubicBezier.apply(null, name.slice(12, -1).split(',').map(function(item) {
      return parseFloat(item);
    })) : builtInTimingFunctions.ease);
  };

  // 播放动画对应某一时间点的某一帧。
  var playAnimation = function(animation, timePoint, isPlayMethod) {
    // 触发事件。
    if (isPlayMethod) {
      if (timePoint === 0) {
        animation.fire('playstart');
      }
    } else {
      if (timePoint === animation.duration) {
        animation.fire('reversestart');
      }
    }
    // 播放当前帧。
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
   *   调用 play 方法时，渲染本次播放的第一帧之前触发；可以取消本次动作。
   * @fires playstart
   *   开始播放时，渲染整个动画的第一帧之前触发。
   * @fires playfinish
   *   播放结束时，渲染整个动画的最后一帧之后触发。
   * @fires reverse
   *   调用 reverse 方法时，渲染本次播放的第一帧之前触发；可以取消本次动作。
   * @fires reversestart
   *   开始反向播放时，渲染整个动画的第一帧之前触发。
   * @fires reversefinish
   *   反向播放结束时，渲染整个动画的最后一帧之后触发。
   * @fires step
   *   渲染每一帧之后触发。
   * @fires pause
   *   调用 pause 方法时触发；可以取消本次动作。
   * @fires stop
   *   调用 stop 方法时触发；可以取消本次动作。
   * @description
   *   高级应用：
   *   向一个动画中添加多个剪辑，并调整每个剪辑的 delay，duration，timingFunction 参数，以实现复杂的动画效果。
   *   仅应在动画初始化时（播放之前）添加影片剪辑，不要在开始播放后添加或更改影片剪辑。
   *   在 step 事件监听器中访问 this.timePoint 可以获得当前帧所处的时间点。
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
   * @param {Function} fxRenderer 使用 Fx.* 创建的特效渲染器。
   *   函数中的 this 指向所属的 Animation 对象。
   * @param {number} delay 延时。
   * @param {number} duration 播放时间。
   * @param {string} timingFunction 控速函数名称或表达式。
   * @returns {Object} Animation 对象。
   */
  Animation.prototype.addClip = function(fxRenderer, delay, duration, timingFunction) {
    // 使用各项配置组合影片剪辑（实际是将渲染器升级为影片剪辑）。
    fxRenderer.delay = delay;
    fxRenderer.duration = duration;
    fxRenderer.timingFunction = getTimingFunction(timingFunction);
    fxRenderer.status = BEFORE_STARTING_POINT;
    this.clips.push(fxRenderer);
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
    if (isPlayMethod && status != PLAYING && status != END_POINT || !isPlayMethod && status != REVERSING && status != STARTING_POINT) {
      // 触发事件。
      animation.fire(isPlayMethod ? 'play' : 'reverse', null, function() {
        animation.status = isPlayMethod ? PLAYING : REVERSING;
        // 未挂载到引擎（执行此方法前为暂停/停止状态）。
        if (!animation.timestamp) {
          var timePoint = animation.timePoint;
          var duration = animation.duration;
          // 每次播放/反向播放时的首帧同步播放。
          playAnimation(animation, timePoint ? timePoint : (isPlayMethod ? 0 : duration), isPlayMethod);
          // 如果动画超出一帧，则将其挂载到动画引擎，异步播放中间帧及末帧。
          if (duration) {
            mountAnimation(animation);
          }
        }
      });
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
    if (animation.timestamp) {
      animation.fire('pause', null, function() {
        animation.status = PASUING;
        unmountAnimation(animation);
      });
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
   */
  Animation.prototype.stop = function() {
    var animation = this;
    if (animation.status !== STARTING_POINT) {
      animation.fire('stop', null, function() {
        animation.timePoint = 0;
        animation.status = STARTING_POINT;
        animation.clips.forEach(function(clip) {
          clip.status = BEFORE_STARTING_POINT;
        });
        if (animation.timestamp) {
          unmountAnimation(animation);
        }
      });
    }
    return animation;
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

  /**
   * 用于创建影片的特效渲染器。
   * @name Fx
   * @namespace
   */
  window.Fx = {};

//--------------------------------------------------[Fx.base]
  /**
   * 基础效果渲染器。
   * @name Fx.base
   * @function
   * @param {Function} renderer 渲染函数，this 指向所属的 Animation 对象，传入两个参数：时间轴和偏移量。
   * @returns {Function} 生成的渲染器。
   */
  Fx.base = function(renderer) {
    renderer.type = 'base';
    return renderer;
  };

//--------------------------------------------------[Fx.morph]
  /**
   * 渐变效果渲染器。
   * @name Fx.morph
   * @function
   * @param {Element} $element 要实施渐变效果的元素。
   * @param {Object} styles 要实施渐变的样式。支持相对长度值和颜色值，其中相对长度值目前仅支持像素单位，颜色值支持 140 个预命名颜色名称、#RRGGBB 格式、#RGB 格式或 rgb(正整数R, 正整数G, 正整数B) 格式。
   * @returns {Function} 生成的渲染器。
   */
  Fx.morph = function($element, styles) {
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
    renderer.type = 'morph';
    return renderer;
  };

//--------------------------------------------------[Fx.highlight]
  /**
   * 高亮效果渲染器。
   * @name Fx.highlight
   * @function
   * @param {Element} $element 要实施渐隐效果的元素。
   * @param {string} [color] 高亮颜色，默认为 'yellow'。
   * @param {number} [times] 高亮次数，默认为 1。
   * @returns {Function} 生成的渲染器。
   */
  Fx.highlight = function($element, color, times) {
    color = color || 'yellow';
    times = times || 1;
    // 内部分多次动画换算后，使用此控速函数。
    var map;
    var nativeSection = 1 / times;
    var renderer = function(x) {
      if (map === undefined) {
        map = getStylesMap($element, {backgroundColor: color});
      }
      var beforeValue = map.before.backgroundColor;
      var afterValue = map.after.backgroundColor;
      if (x === 0 || x === 1) {
        $element.setStyle('backgroundColor', convertToRGBValue(beforeValue));
      } else {
        var nativeX = (x % nativeSection) / nativeSection;
        var nativeY = renderer.timingFunction(nativeX);
        $element.setStyle('backgroundColor', convertToRGBValue([
          Math.floor(afterValue[0] + (beforeValue[0] - afterValue[0]) * nativeY),
          Math.floor(afterValue[1] + (beforeValue[1] - afterValue[1]) * nativeY),
          Math.floor(afterValue[2] + (beforeValue[2] - afterValue[2]) * nativeY)
        ]));
      }
    };
    renderer.type = 'highlight';
    return renderer;
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
  var playQueue = function(queue) {
    queue.currentAnimation = queue.shift()
        .on('playfinish', function() {
          if (queue.length) {
            playQueue(queue);
          } else {
            delete queuePool[queue.id];
          }
        })
        .play();
  };

  // 在指定的队列中添加一个动画。
  var appendToQueue = function(uid, animation) {
    var queue = queuePool[uid];
    if (!queue) {
      queue = queuePool[uid] = [];
      queue.id = uid;
    }
    queue.push(animation);
    if (!queue.currentAnimation) {
      playQueue(queue);
    }
  };

//--------------------------------------------------[Element.prototype.morph]
  /**
   * 在本元素的动画队列中添加一个渐变动画。
   * @name Element.prototype.morph
   * @function
   * @param {Object} styles 目标样式，元素将向指定的目标样式渐变。目标样式包含一条或多条要设置的样式声明，与 setStyles 的参数的差异如下：
   *   1. 不能使用复合属性。  // TODO: 待支持。
   *   2. lineHeight 仅支持 'px' 单位的长度设置，而不支持数字。
   * @param {Object} [options] 动画选项。
   * @param {number} options.delay 延时，默认为 0，即马上开始播放。
   * @param {number} options.duration 播放时间，单位是毫秒，默认为 400。
   * @param {string} options.timingFunction 控速函数名称或表达式，默认为 'ease'。
   * @param {Function} options.onStart 播放开始时的回调。
   * @param {Function} options.onFinish 播放完成时的回调。
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
    options = Object.append({delay: 0, duration: 400, timingFunction: 'ease', onStart: null, onFinish: null}, options || {});
    var animation = new Animation().addClip(Fx.morph($element, styles), options.delay, options.duration, options.timingFunction);
    if (options.onStart) {
      animation.on('playstart', function(e) {
        options.onStart.call($element, e);
      });
    }
    if (options.onFinish) {
      animation.on('playfinish', function(e) {
        options.onFinish.call($element, e);
      });
    }
    appendToQueue($element.uid, animation);
    return $element;
  };

//--------------------------------------------------[Element.prototype.highlight]
  /**
   * 在本元素的动画队列中添加一个高亮动画。
   * @name Element.prototype.highlight
   * @function
   * @param {string} [color] 高亮颜色，默认为 'yellow'。
   * @param {number} [times] 高亮次数，默认为 1。
   * @param {Object} [options] 动画选项。
   * @param {number} options.delay 延时，默认为 0，即马上开始播放。
   * @param {number} options.duration 播放时间，单位是毫秒，默认为 500。
   * @param {string} options.timingFunction 控速函数名称或表达式，默认为 'easeIn'。
   * @param {Function} options.onStart 播放开始时的回调。
   * @param {Function} options.onFinish 播放完成时的回调。
   * @returns {Element} 本元素。
   * @description
   *   如果本元素正在播放一个高亮动画，则丢弃新的高亮动画并重新播放旧的高亮动画。
   *   如果当前队列的前一个动画也是高亮动画，则丢弃新的高亮动画。
   */
  Element.prototype.highlight = function(color, times, options) {
    var queue = queuePool[this.uid];
    if (queue) {
      if (queue.length === 0) {
        if (queue.currentAnimation.clips[0].type === 'highlight') {
          queue.currentAnimation.stop().play();
          return this;
        }
      } else {
        if (queue[queue.length - 1].clips[0].type === 'highlight') {
          return this;
        }
      }
    }

    var $element = this;
    options = Object.append({delay: 0, duration: 500, timingFunction: 'easeIn', onStart: null, onFinish: null}, options || {});
    var animation = new Animation().addClip(Fx.highlight($element, color, times), options.delay, options.duration, options.timingFunction);
    if (options.onStart) {
      animation.on('playstart', function(e) {
        this.off('playstart');
        options.onStart.call($element, e);
      });
    }
    if (options.onFinish) {
      animation.on('playfinish', function(e) {
        options.onFinish.call($element, e);
      });
    }
    appendToQueue($element.uid, animation);
    return $element;

  };

//--------------------------------------------------[Element.prototype.fadeIn]
  /**
   * 在本元素的动画队列中添加一个淡入动画。
   * @name Element.prototype.fadeIn
   * @function
   * @param {Object} [options] 动画选项。
   * @param {number} options.delay 延时，默认为 0，即马上开始播放。
   * @param {number} options.duration 播放时间，单位是毫秒，默认为 200。
   * @param {string} options.timingFunction 控速函数名称或表达式，默认为 'easeIn'。
   * @param {Function} options.onStart 播放开始时的回调。
   * @param {Function} options.onFinish 播放完成时的回调。
   * @returns {Element} 本元素。
   * @description
   *   display 不为 none 的元素不能播放淡入动画。
   */
  Element.prototype.fadeIn = function(options) {
    var $element = this;
    var animation = new Animation()
        .on('play', function(e) {
          if ($element.getStyle('display') === 'none') {
            var originalOpacity = $element.getStyle('opacity');
            options = Object.append({delay: 0, duration: 200, timingFunction: 'easeIn', onStart: null, onFinish: null}, options || {});
            this.addClip(Fx.morph($element, {opacity: originalOpacity}), options.delay, options.duration, options.timingFunction);
            $element.setStyles({'display': 'block', 'opacity': 0});
          } else {
            e.preventDefault();
            this.off('playstart.callback playfinish.callback').fire('playfinish');
          }
        })
        .on('playstart.callback', function(e) {
          if (options.onStart) {
            options.onStart.call($element, e);
          }
        })
        .on('playfinish.callback', function(e) {
          if (options.onFinish) {
            options.onFinish.call($element, e);
          }
        });
    appendToQueue($element.uid, animation);
    return $element;
  };

//--------------------------------------------------[Element.prototype.fadeOut]
  /**
   * 在本元素的动画队列中添加一个淡出动画。
   * @name Element.prototype.fadeOut
   * @function
   * @param {Object} [options] 动画选项。
   * @param {number} options.delay 延时，默认为 0，即马上开始播放。
   * @param {number} options.duration 播放时间，单位是毫秒，默认为 200。
   * @param {string} options.timingFunction 控速函数名称或表达式，默认为 'easeOut'。
   * @param {Function} options.onStart 播放开始时的回调。
   * @param {Function} options.onFinish 播放完成时的回调。
   * @returns {Element} 本元素。
   * @description
   *   display 为 none 的元素不能播放淡出动画。
   */
  Element.prototype.fadeOut = function(options) {
    var $element = this;
    var originalOpacity;
    var animation = new Animation()
        .on('play', function(e) {
          if ($element.getStyle('display') !== 'none') {
            originalOpacity = $element.getStyle('opacity');
            options = Object.append({delay: 0, duration: 200, timingFunction: 'easeOut', onStart: null, onFinish: null}, options || {});
            this.addClip(Fx.morph($element, {opacity: 0}), options.delay, options.duration, options.timingFunction);
          } else {
            e.preventDefault();
            this.off('playstart.callback playfinish.callback').fire('playfinish');
          }
        })
        .on('playstart.callback', function(e) {
          if (options.onStart) {
            options.onStart.call($element, e);
          }
        })
        .on('playfinish.callback', function(e) {
          $element.setStyles({'display': 'none', 'opacity': originalOpacity});
          if (options.onFinish) {
            options.onFinish.call($element, e);
          }
        });
    appendToQueue($element.uid, animation);
    return $element;
  };

})();
/**
 * @fileOverview 对 XMLHttpRequest 的封装。
 * @author sundongguo@gmail.com
 * @version 20120208
 */
// TODO: jQuery - ticket #5280: Internet Explorer will keep connections alive if we don't abort on unload
// TODO: MooTools 在 xhr.abort() 后新建一个 XHR 对象，原因不明。
// TODO: 大多数库并不重用 XHR 对象。
(function() {
//==================================================[Request]
  /*
   * 调用流程：
   *   var request = new Request(url, options);
   *   request.send(data)<send> -> requestParser(data)<request> -> responseParser(response)<response>
   *                                                            -> request.abort()<abort>
   *
   * 说明：
   *   用户使用 send 方法传递的请求数据与服务端返回的响应数据均不可预期，因此可以通过修改选项 requestParser 和 responseParser 这两个函数以对他们进行预处理。
   *
   * 注意：
   *   IE6 IE7 IE8 IE9 均不支持 overrideMimeType，因此本组件不提供此功能。
   *   同样的原因，W3C 的 XMLHttpRequest 草案中提及的，其他不能被上述浏览器支持的相关内容也不提供。
   */

  // 请求状态。
  var DONE = 0;
  var ABORT = -498;
  var TIMEOUT = -408;

  // 唯一识别码。
  var uid = Date.now();

  // 空函数。
  var empty = function() {
  };

  // 获取 XHR 对象。
  var getXHRObject = function() {
    try {
      var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    } catch (e) {
      xhr = null;
    }
    return xhr;
  };

  // 获取响应头信息。
  var RE_HEADERS = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
  var getHeaders = function(rawHeaders) {
    var headers = {};
    var match;
    while (match = RE_HEADERS.exec(rawHeaders)) {
      headers[match[1]] = match[2];
    }
    return headers;
  };

  // 获取响应信息，state 可能是 DONE、ABORT 或 TIMEOUT。
  var getResponse = function(request, state) {
    var options = request.options;
    // 处理请求的最短和最长时间。
    if (options.async) {
      // 由于 getResponse(request, DONE) 在 send 方法中有两个入口，因此在此处对 minTime 进行延时处理。
      if (options.minTime > 0) {
        if (request.minTimeTimer) {
          // 已经限定过请求的最短时间。此时 ABORT 或 TIMEOUT 状态在有意如此操作或设置的情况下，可能比延迟的 DONE 状态来的早。
          // 但因为此时请求已经完成，所以要把本次调用的 state 重置为 DONE。
          state = DONE;
          clearTimeout(request.minTimeTimer);
          delete request.minTimeTimer;
        } else if (state === DONE) {
          // 这种情况需要限定请求的最短时间。
          request.minTimeTimer = setTimeout(function() {
            getResponse(request, DONE);
          }, Math.max(0, Number.toInteger(options.minTime - (Date.now() - request.timestamp))));
          return;
        }
      }
      if (request.maxTimeTimer) {
        clearTimeout(request.maxTimeTimer);
        delete request.maxTimeTimer;
      }
    }
    // 获取 xhr 对象。
    var xhr = request.xhr;
    // 取消 xhr 对象的事件监听。
    xhr.onreadystatechange = empty;
    // 重置请求状态。
    delete request.timestamp;
    // 收集响应信息。
    var status = 0;
    var statusText = '';
    var headers = {};
    var text = '';
    var xml = null;
    switch (state) {
      case DONE:
        // http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
        try {
          status = xhr.status;
          // http://bugs.jquery.com/ticket/1450
          if (status === 1223) {
            status = 204;
          }
          statusText = xhr.statusText;
          headers = getHeaders(xhr.getAllResponseHeaders());
          text = xhr.responseText;
          // http://bugs.jquery.com/ticket/4958
          if (xhr.responseXML && xhr.responseXML.documentElement) {
            xml = xhr.responseXML;
          }
        } catch (e) {
        }
        break;
      case ABORT:
        status = ABORT;
        statusText = 'Abort';
        xhr.abort();
        break;
      case TIMEOUT:
        status = TIMEOUT;
        statusText = 'Timeout';
        xhr.abort();
        break;
    }
    // 触发响应事件。
    request.fire('response', options.responseParser({
      status: status,
      statusText: statusText,
      headers: headers,
      text: text,
      xml: xml
    }));
  };

//--------------------------------------------------[Request Constructor]
  /**
   * 创建一个请求对象，用来对一个指定的资源发起请求，并获取响应数据。
   * @name Request
   * @constructor
   * @param {string} url 请求地址。
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Request.options 中。
   * @param {string} options.username 用户名，默认为空字符串，即不指定用户名。
   * @param {string} options.password 密码，默认为空字符串，即不指定密码。
   * @param {string} options.method 请求方法，默认为 'get'。
   * @param {Object} options.headers 要设置的 request headers，格式为 {key: value, ...} 的对象。
   * @param {string} options.contentType 发送数据的内容类型，默认为 'application/x-www-form-urlencoded'，method 为 'post' 时有效。
   * @param {boolean} options.useCache 是否允许浏览器的缓存生效，默认为 true。
   * @param {boolean} options.async 是否使用异步方式，默认为 true。
   * @param {number} options.minTime 请求最短时间，单位为 ms，默认为 NaN，即无最短时间限制，async 为 true 时有效。
   * @param {number} options.maxTime 请求超时时间，单位为 ms，默认为 NaN，即无超时时间限制，async 为 true 时有效。
   * @param {Function} options.requestParser 请求数据解析器，传入请求数据，该函数应返回解析后的字符串数据，默认将请求数据转换为字符串，若请求数据为空则转换为 null。
   *   原始请求数据无特殊要求。
   *   解析后的请求数据应该是一个字符串，并且该字符串会被赋予 request 事件对象的 data 属性。
   * @param {Function} options.responseParser 响应数据解析器，传入响应数据，该函数应返回解析后的对象数据，默认无特殊处理。
   *   原始响应数据中包含以下属性：
   *   {number} responseData.status 状态码。
   *   {string} responseData.statusText 状态描述。
   *   {Object} responseData.headers 响应头。
   *   {string} responseData.text 响应文本。
   *   {XMLDocument} responseData.xml 响应 XML 文档。
   *   解析后的响应数据无特殊要求，但要注意，解析后的数据对象的属性将被追加到 response 事件对象中。
   *   在调用 abort 方法取消请求，或请求超时的情况下，也会收到响应数据。此时的状态码分别为 -498 和 -408。
   *   换句话说，只要调用了 send 方法发起了请求，就必然会收到响应，虽然上述两种情况的响应并非是真实的来自于服务端的响应数据。
   *   这样设计的好处是在请求结束时可以统一处理一些状态的设定或恢复，如将 request 事件监听器中显示的提示信息隐藏。
   * @fires send
   *   {Object} event.data 要发送的数据。
   *   调用 send 方法时，发送请求之前触发；可以取消本次动作。
   * @fires request
   *   {Object} event.data 解析后的请求数据。
   *   发送请求时触发。
   * @fires response
   *   {*} event.* 解析后的响应数据。
   *   收到响应时触发。
   * @fires abort
   *   调用 abort 方法时触发；可以取消本次动作。
   */
  function Request(url, options) {
    this.xhr = getXHRObject();
    this.url = url;
    this.setOptions(options);
  }

//--------------------------------------------------[Request.options]
  /**
   * 默认选项。
   * @name Request.options
   */
  Request.options = {
    username: '',
    password: '',
    method: 'get',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': '*/*'
    },
    contentType: 'application/x-www-form-urlencoded',
    useCache: true,
    async: true,
    minTime: NaN,
    maxTime: NaN,
    requestParser: function(data) {
      return data ? data + '' : null;
    },
    responseParser: function(response) {
      return response;
    }
  };

//--------------------------------------------------[Request.prototype.send]
  /**
   * 发送请求。
   * @name Request.prototype.send
   * @function
   * @param {Object} [data] 要发送的数据。
   * @returns {Object} request 对象。
   */
  Request.prototype.send = function(data) {
    var request = this;
    var options = request.options;
    var xhr = request.xhr;
    // 只有进行中的请求有 timestamp 属性，需等待此次交互结束（若设置了 minTime 则交互结束的时间可能被延长）才能再次发起请求。若无 xhr 对象，则无法发起请求。
    if (request.timestamp || !xhr) {
      return request;
    }
    request.fire('send', {data: data}, function() {
      // 处理请求数据。
      var parsedData = data = options.requestParser(data);
      // 创建请求。
      var url = request.url;
      var method = options.method.toLowerCase();
      if (method === 'get' && data) {
        url += (url.contains('?') ? '&' : '?') + data;
        data = null;
      }
      if (!options.useCache) {
        url += (url.contains('?') ? '&' : '?') + ++uid;
      }
      // http://bugs.jquery.com/ticket/2865
      if (options.username) {
        xhr.open(method, url, options.async, options.username, options.password);
      } else {
        xhr.open(method, url, options.async);
      }
      // 设置请求头。
      var headers = options.headers;
      if (method === 'post') {
        headers['Content-Type'] = options.contentType;
      }
      for (var name in headers) {
        xhr.setRequestHeader(name, headers[name]);
      }
      // 发送请求。
      xhr.send(data || null);
      request.timestamp = Date.now();
      if (options.async && options.maxTime > 0) {
        request.maxTimeTimer = setTimeout(function() {
          getResponse(request, TIMEOUT);
        }, options.maxTime);
      }
      // 获取响应。
      if (!options.async || xhr.readyState === 4) {
        // IE 使用 ActiveXObject 创建的 XHR 对象即便在异步模式下，如果访问地址已被浏览器缓存，将直接改变 readyState 为 4，并且不会触发 onreadystatechange 事件。
        getResponse(request, DONE);
      } else {
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            getResponse(request, DONE);
          }
        };
      }
      // 触发请求事件。
      request.fire('request', {data: parsedData});
    });
    // 返回实例。
    return request;
  };

//--------------------------------------------------[Request.prototype.abort]
  /**
   * 取消请求，仅在 Request 设置为异步模式时可用。
   * @name Request.prototype.abort
   * @function
   * @returns {Object} request 对象。
   */
  Request.prototype.abort = function() {
    var request = this;
    if (request.timestamp) {
      request.fire('abort', null, function() {
        // 不在此处调用 xhr.abort()，统一在 getResponse 中处理，可以避免依赖 readystatechange，逻辑更清晰。
        getResponse(request, ABORT);
      });
    }
    return request;
  };

//--------------------------------------------------[Request]
  window.Request = new Component(Request, Request.options, Request.prototype);

})();
/**
 * @fileOverview 代码模块化处理。
 * @author sundongguo@gmail.com
 * @version 20120223
 */
(function() {
//==================================================[模块化处理]
  /*
   * 设计思路：
   *   本方案为扁平式（简单）模块管理：将应用划分为多个独立的、并列的模块，然后在应用中将各模块的功能连接起来。
   *   每个模块只需要处理好自己的业务逻辑，不需要考虑其他模块的状态。模块的输入和输出使用消息的接受和发送来完成。
   *   当使用 declareModule 声明模块时，这个模块在外部是无法访问的，这样可以确保模块间完全隔离，避免模块 A 中出现对模块 B 的操作。
   *     - 因此 API 没有设计为 new Module(...) 的形式。
   *
   * 主要概念：
   *   模块 id (id)：
   *     模块的标识符。
   *   消息类型 (type)：
   *     在模块中处理的消息，是以消息类型区分的。
   *   消息名 (name)：
   *     消息名 = 模块 id + '.' + 消息类型，在应用中处理的消息，是以消息名区分的。
   *
   * 调用方式：
   *   declareModule('module1', function(listen, notify) {
   *     ...
   *     listen('foo', function() {
   *       ...
   *     });
   *     ...
   *     notify('bar', data);
   *     ...
   *   });
   *
   *   runApplication(function(listen, notify) {
   *     ...
   *     listen('module1.bar', function(data) {
   *       ...
   *     });
   *     ...
   *     listen('module1.foo, module2.bar', function(data1, data2) {
   *       ...
   *     });
   *     ...
   *     notify('mudule1.check', data);
   *   });
   *
   * 说明：
   *   declareModule 和 runApplication 中使用的 listen 和 notify 方法都是相对于对方的。因此在同一方的函数中，即便 notify 的消息类型/消息名和 listen 的消息类型/消息名一致，消息也不会直接被 listen 获取。
   *   declareModule 和 runApplication 中使用 listen 和 notify 指定的消息不必一一对应，产生的消息如无对应的 listen 接收将被丢弃。
   *   declareModule 声明的模块 id 是唯一的。
   *   runApplication 中的 listen 可以监听“捆绑消息”，而 declareModule 中的 listen 则不能。
   *   如果模块在应用未运行之前即发送了消息，这些消息将在第一次调用 runApplication 之后传递给应用处理（未处理的将丢弃，即此后调用的 runApplication 不会再收到这些消息）。
   */

  var $ = document.$;

  // 保存各模块接收到的消息的处理器。
  /*
   * <Object moduleMessageHandlerPool> {
   *   <string id>: <Object item> {
   *     <string type>: <Array handlers> [
   *       <Function handler>
   *     ]
   *   }
   * };
   */
  var moduleMessageHandlerPool = {};
  // 保存应用接收到的消息的处理器。
  /*
   * <Object applicationMessageHandlerPool> {
   *   <string name>: <Array handlers> [
   *     <Function handler>
   *   ]
   * };
   */
  var applicationMessageHandlerPool = {};
  // 在未启动应用时暂存模块发送过来的消息。
  applicationMessageHandlerPool.cache = {};

//--------------------------------------------------[declareModule]
  var VALID_MODULE_ID = /^\w+$/;

  /**
   * 声明模块。
   * @name declareModule
   * @memberOf Global
   * @function
   * @param {string} id 模块 id。
   * @param {Function} moduleFunction 模块函数。
   * @param {boolean} [waitingForDomReady] 设置为 true 则在 DOM 树加载完成后再执行模块函数，否则立即执行。
   */
  window.declareModule = function(id, moduleFunction, waitingForDomReady) {
    if (!VALID_MODULE_ID.test(id)) {
      throw new Error('[declareModule] 非法 id: ' + id);
    }

    if (moduleMessageHandlerPool[id]) {
      throw new Error('[declareModule] id 已存在: ' + id);
    }

    // 注册模块 id，并获取对应的项。
    var item = moduleMessageHandlerPool[id] = {};

    /**
     * 监听应用发送消息。
     * @name listen
     * @function
     * @private
     * @param {string} type 消息类型。
     * @param {Function} handler 处理函数。
     */
    var listen = function(type, handler) {
      (item[type] || (item[type] = [])).push(handler);
    };

    /**
     * 向应用发送消息。
     * @name notify
     * @function
     * @private
     * @param {string} type 消息类型。
     * @param {Object} [data] 消息数据。
     */
    var notify = function(type, data) {
      var name = id + '.' + type;
      // 如果应用尚未启动，先将消息缓存，否则直接发给应用。
      var cache = applicationMessageHandlerPool.cache;
      if (cache) {
        (cache[name] || (cache[name] = [])).push(data);
      } else {
        var handlers = applicationMessageHandlerPool[name];
        if (handlers) {
          handlers.forEach(function(handler) {
            handler(data);
          });
        }
      }
    };

    // 执行模块函数。
    waitingForDomReady ? document.on('domready', function() {
      moduleFunction(listen, notify, $);
    }) : moduleFunction(listen, notify, $);

  };

//--------------------------------------------------[runApplication]
  // TODO: 组合事件触发后清空数据。
  // TODO: 组合事件触发前，每个事件收到数据后的回调。
  /**
   * 运行应用。
   * @name runApplication
   * @memberOf Global
   * @function
   * @param {Function} applicationFunction 应用函数。
   * @param {boolean} [waitingForDomReady] 设置为 true 则在 DOM 树加载完成后再执行应用函数，否则立即执行。
   */
  window.runApplication = function(applicationFunction, waitingForDomReady) {
    /**
     * 监听模块发送的消息。
     * @name listen
     * @function
     * @private
     * @param {string} name 消息名。
     * @param {Function} handler 处理函数。
     */
    var listen = function(name, handler) {
      if (name.contains(',')) {
        var names = name.split(/,\s*/);
        var dataReceived = [];
        names.forEach(function(name, index, names) {
          listen(name, function(data) {
            dataReceived[index] = data;
            var count = names.length;
            while (dataReceived.hasOwnProperty(--count)) {
            }
            if (count === -1) {
              handler.apply(null, dataReceived);
//              dataReceived.length = 0;
            }
          });
        });
      } else {
        (applicationMessageHandlerPool[name] || (applicationMessageHandlerPool[name] = [])).push(handler);
        // 处理在应用尚未启动时收到的消息缓存。
        if (applicationMessageHandlerPool.cache) {
          var cachedData = applicationMessageHandlerPool.cache[name];
          if (cachedData) {
            cachedData.forEach(function(data) {
              handler(data);
            });
          }
        }
      }
    };

    /**
     * 向模块发消息（执行模块的消息处理函数）。
     * @name notify
     * @function
     * @private
     * @param {string} name 消息名。
     * @param {Object} data 消息数据。
     */
    var notify = function(name, data) {
      var idAndType = name.split('.');
      var item = moduleMessageHandlerPool[idAndType[0]];
      if (item) {
        var handlers = item[idAndType[1]];
        if (handlers) {
          handlers.forEach(function(handler) {
            handler(data);
          });
        }
      }
    };

    // 执行应用函数。
    waitingForDomReady ? document.on('domready', function() {
      applicationFunction(listen, notify, $);
    }) : applicationFunction(listen, notify, $);

    // 清除应用尚未启动时收到的消息缓存（丢弃未处理的消息）。
    delete applicationMessageHandlerPool.cache;

  };

})();
/**
 * @fileOverview 执行代码块的便捷方法。
 * @author sundongguo@gmail.com
 * @version 20120405
 */
(function() {
//==================================================[执行代码块]
  /*
   * 设计思路：
   *   本方案主要为解决标识符 $ 与其他类库冲突的问题，顺便加入“在 DOM 树加载完成后执行”的功能。
   */

  var $ = document.$;

//--------------------------------------------------[execute]
  /**
   * 执行代码块。
   * @name execute
   * @memberOf Global
   * @function
   * @param {Function} codeBlock 包含要执行的代码块的匿名函数。
   * @param {boolean} [waitingForDomReady] 设置为 true 则在 DOM 树加载完成后再执行代码块，否则立即执行。
   * @description
   *   通常，为了减少全局变量的数量和避免不同代码块之间的变量名有冲突，会使用一个匿名函数来执行一个相对独立的代码块：
   *   <pre>(function() {...})();</pre>
   *   使用本方法可以达到相同目的，除此之外还有以下好处：
   *   <ul>
   *     <li>原匿名函数的第一个参数将被传入 document.$，因此可以通过在该匿名函数的形参中写上一个 $，以便在函数内直接使用 $ 而不必担心与其他脚本库的 $ 冲突。</li>
   *     <li>的可选参数 waitingForDomReady 可以控制这个匿名函数的执行时机（如何设置这个参数取决于代码块内是否有依赖 DOM 元素的操作）。</li>
   *   </ul>
   * @example
   *   execute(function($){...});
   *   // 在匿名函数中可以使用 $ 代替 document.$。
   * @example
   *   execute(function($){...}, true);
   *   // 匿名函数将在 DOM 树加载完成后执行。
   */
  window.execute = function(codeBlock, waitingForDomReady) {
    waitingForDomReady ? document.on('domready', function() {
      codeBlock($);
    }) : codeBlock($);
  };

})();
/*!
 * JSON in JavaScript
 *  Douglas Crockford
 *  http://www.JSON.org/json2.js
 *  2011-10-19
 *  Public Domain.
 */

/**
 * @fileOverview 插件 - JSON 补缺 - json2
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
  if (!window.JSON) {
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
   * @param {*} value 要转换的 ECMAScript 值，通常是 Object 或 Array 类型的数据，也可以是 String、Boolean、Number、Date 类型的数据或者 null。
   * @param {Function|Array} [replacer] 用来过滤的函数或数组。
   *   如果是函数，则传入 key 和 value，并使用其返回值替换 value，若返回 undefined，则忽略该 key。
   *   如果是数组，则该数组只能包含字符串，本方法会仅对 key 出现在数组中的部分进行转换。
   * @param {string|number} [space] 为使 JSON 字符串更易读而在每行内容之前加入的前缀。
   *   如果是字符串，则直接加入这个字符串作为前缀。若字符串的长度超过 10，则仅保留前 10 个字符。
   *   如果是数字，则加入对应数目的空格符。若数字大于 10，则只使用 10 个空格符。
   *   如果未指定该值，或者该值为 '' 或 0，则 JSON 字符串不会换行（全部内容在一行内）。
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
   * @param {Function} [reviver] 用来过滤的函数。传入 key 和 value，将使用其返回值替换 value。
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

        j = eval('(' + text + ')');

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
 *  Released under the MIT, BSD, and GPL Licenses.
 *  Version: jquery-sizzle-1.5.1-86-g3136f48
 *  More information: http://sizzlejs.com/
 */

/**
 * @fileOverview 插件 - CSS 选择器 - Sizzle
 */

(function(window, undefined) {
//==================================================[CSS 选择器]
  /*
   * 通过一个处理过的元素的 find 方法调用，返回的结果为一个数组，包含所有符合条件的、处理后的元素。
   *
   * 扩展方法：
   *   Element.prototype.find
   *
   * 或提供对象：
   *   Sizzle
   */

//--------------------------------------------------[Sizzle]
  var document = window.document,
      docElem = document.documentElement,

      expando = "sizcache" + (Math.random() + "").replace(".", ""),
      done = 0,

      toString = Object.prototype.toString,
      concat = Array.prototype.concat,
      strundefined = "undefined",

      hasDuplicate = false,
      baseHasDuplicate = true,

  // Regex
      rquickExpr = /^#([\w\-]+$)|^(\w+$)|^\.([\w\-]+$)/,
      rquickMatch = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
      chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,

      rsibling = /^[+~]$/,
      rbackslash = /\\(?!\\)/g,
      rnonWord = /\W/,
      rstartsWithWord = /^\w/,
      rnonDigit = /\D/,
      rnth = /(-?)(\d*)(?:n([+\-]?\d*))?/,
      radjacent = /^\+|\s*/g,
      rheader = /h\d/i,
      rinputs = /input|select|textarea|button/i,
      rtnfr = /[\t\n\f\r]/g,

      characterEncoding = "(?:[-\\w]|[^\\x00-\\xa0]|\\\\.)",
      matchExpr = {
        ID: new RegExp("#(" + characterEncoding + "+)"),
        CLASS: new RegExp("\\.(" + characterEncoding + "+)"),
        NAME: new RegExp("\\[name=['\"]*(" + characterEncoding + "+)['\"]*\\]"),
        TAG: new RegExp("^(" + characterEncoding.replace("[-", "[-\\*") + "+)"),
        ATTR: new RegExp("\\[\\s*(" + characterEncoding + "+)\\s*(?:(\\S?=)\\s*(?:(['\"])(.*?)\\3|(#?" + characterEncoding + "*)|)|)\\s*\\]"),
        PSEUDO: new RegExp(":(" + characterEncoding + "+)(?:\\((['\"]?)((?:\\([^\\)]+\\)|[^\\(\\)]*)+)\\2\\))?"),
        CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
        POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/
      },

      origPOS = matchExpr.POS,

      leftMatchExpr = (function() {
        var type,
        // Increments parenthetical references
        // for leftMatch creation
            fescape = function(all, num) {
              return "\\" + ( num - 0 + 1 );
            },
            leftMatch = {};

        for (type in matchExpr) {
          // Modify the regexes ensuring the matches do not end in brackets/parens
          matchExpr[ type ] = new RegExp(matchExpr[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source));
          // Adds a capture group for characters left of the match
          leftMatch[ type ] = new RegExp(/(^(?:.|\r|\n)*?)/.source + matchExpr[ type ].source.replace(/\\(\d+)/g, fescape));
        }

        // Expose origPOS
        // "global" as in regardless of relation to brackets/parens
        matchExpr.globalPOS = origPOS;

        return leftMatch;
      })(),

  // Cache for chunking through parts
      partsCache = {},
      extraCache = {},
  // Cache for quick matching
      filterCache = {},

  // Used for testing something on an element
      assert = function(fn) {
        var pass = false,
            div = document.createElement("div");
        try {
          pass = fn(div);
        } catch (e) {
        }
        // release memory in IE
        div = null;
        return pass;
      },

  // Check if attributes should be retrieved by attribute nodes
      assertAttributes = assert(function(div) {
        div.innerHTML = "<select></select>";
        var type = typeof div.lastChild.getAttribute("multiple");
        // IE8 returns a string for some attributes even when not present
        return type !== "boolean" && type !== "string";
      }),

  // Check to see if the browser returns elements by name when
  // querying by getElementById (and provide a workaround)
      assertGetIdNotName = assert(function(div) {
        var pass = true,
            id = "script" + (new Date()).getTime();
        div.innerHTML = "<a name ='" + id + "'/>";

        // Inject it into the root element, check its status, and remove it quickly
        docElem.insertBefore(div, docElem.firstChild);

        if (document.getElementById(id)) {
          pass = false;
        }
        docElem.removeChild(div);
        return pass;
      }),

  // Check to see if the browser returns only elements
  // when doing getElementsByTagName("*")
      assertTagNameNoComments = assert(function(div) {
        div.appendChild(document.createComment(""));
        return div.getElementsByTagName("*").length === 0;
      }),

  // Check to see if an attribute returns normalized href attributes
      assertHrefNotNormalized = assert(function(div) {
        div.innerHTML = "<a href='#'></a>";
        return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
            div.firstChild.getAttribute("href") === "#";
      }),

  // Determines a buggy getElementsByClassName
      assertUsableClassName = assert(function(div) {
        // Opera can't find a second classname (in 9.6)
        div.innerHTML = "<div class='test e'></div><div class='test'></div>";
        if (!div.getElementsByClassName || div.getElementsByClassName("e").length === 0) {
          return false;
        }

        // Safari caches class attributes, doesn't catch changes (in 3.2)
        div.lastChild.className = "e";
        return div.getElementsByClassName("e").length !== 1;
      });

  var Sizzle = function(selector, context, results, seed) {
    results = results || [];
    context = context || document;
    var match, elem, contextXML, m,
        nodeType = context.nodeType;

    if (nodeType !== 1 && nodeType !== 9) {
      return [];
    }

    if (!selector || typeof selector !== "string") {
      return results;
    }

    contextXML = isXML(context);

    if (!contextXML && !seed) {
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
                return makeArray([ elem ], results);
              }
            } else {
              return makeArray([], results);
            }
          } else {
            // Context is not a document
            if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
                contains(context, elem) && elem.id === m) {
              return makeArray([ elem ], results);
            }
          }

          // Speed-up: Sizzle("TAG")
        } else if (match[2]) {
          return makeArray(context.getElementsByTagName(selector), results);

          // Speed-up: Sizzle(".CLASS")
        } else if (assertUsableClassName && (m = match[3]) && context.getElementsByClassName) {
          return makeArray(context.getElementsByClassName(m), results);
        }
      }
    }

    // All others
    return select(selector, context, results, seed, contextXML);
  };

  var select = function(selector, context, results, seed, contextXML) {
    var m, set, checkSet, extra, ret, cur, pop, parts,
        i, len, elem, contextNodeType, checkIndexes, setIndex,
        origContext = context,
        prune = true,
        soFar = selector;

    // Split the selector into parts
    if ((parts = partsCache[ selector ]) === undefined) {
      parts = [];
      do {
        // Reset the position of the chunker regexp (start from head)
        chunker.exec("");
        m = chunker.exec(soFar);

        if (m) {
          soFar = m[3];

          parts.push(m[1]);

          if (m[2]) {
            extra = m[3];
            break;
          }
        }
      } while (m);

      partsCache[ selector ] = parts && parts.slice(0);
      extraCache[ selector ] = extra;
    } else {
      parts = parts.slice(0);
      extra = extraCache[ selector ];
    }

    if (parts.length > 1 && origPOS.exec(selector)) {

      if (parts.length === 2 && Expr.relative[ parts[0] ]) {
        set = posProcess(parts[0] + parts[1], context, seed, contextXML);

      } else {
        set = Expr.relative[ parts[0] ] ?
            [ context ] :
            Sizzle(parts.shift(), context);

        while (parts.length) {
          selector = parts.shift();

          if (Expr.relative[ selector ]) {
            selector += parts.shift();
          }

          set = posProcess(selector, set, seed, contextXML);
        }
      }

    } else {
      // Take a shortcut and set the context if the root selector is an ID
      // (but not if it'll be faster if the inner selector is an ID)
      if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
          matchExpr.ID.test(parts[0]) && !matchExpr.ID.test(parts[parts.length - 1])) {

        ret = Sizzle.find(parts.shift(), context, contextXML);
        context = ret.expr ?
            Sizzle.filter(ret.expr, ret.set)[0] :
            ret.set[0];
      }

      if (context) {
        ret = seed ?
        { expr: parts.pop(), set: makeArray(seed) } :
            Sizzle.find(parts.pop(), (parts.length >= 1 && rsibling.test(parts[0]) && context.parentNode) || context, contextXML);

        set = ret.expr ?
            Sizzle.filter(ret.expr, ret.set) :
            ret.set;

        if (parts.length > 0) {
          checkSet = makeArray(set);
          i = 0;
          len = checkSet.length;
          checkIndexes = [];
          for (; i < len; i++) {
            checkIndexes[i] = i;
          }

        } else {
          prune = false;
        }

        while (parts.length) {
          cur = parts.pop();

          if (Expr.relative[ cur ]) {
            pop = parts.pop();
          } else {
            pop = cur;
            cur = "";
          }

          if (pop == null) {
            pop = context;
          }

          Expr.relative[ cur ](checkSet, checkIndexes, pop, contextXML);
          checkSet = concat.apply([], checkSet);
          checkIndexes = concat.apply([], checkIndexes);
        }

      } else {
        checkSet = parts = [];
      }
    }

    if (!checkSet) {
      checkSet = set;
    }

    if (!checkSet) {
      Sizzle.error(cur || selector);
    }

    if (toString.call(checkSet) === "[object Array]") {
      if (!prune) {
        results.push.apply(results, checkSet);

      } else {
        contextNodeType = context && context.nodeType === 1;
        set = makeArray(set);
        for (i = 0; (elem = checkSet[i]) != null; i++) {
          if (elem === true || (elem.nodeType === 1 && ( !contextNodeType || contains(context, elem) ))) {
            setIndex = checkIndexes ? checkIndexes[i] : i;
            if (set[ setIndex ]) {
              results.push(set[ setIndex ]);
              set[ setIndex ] = false;
            }
          }
        }
      }

    } else {
      makeArray(checkSet, results);
    }

    if (extra) {
      select(extra, origContext, results, seed, contextXML);
      uniqueSort(results);
    }

    return results;
  };

  Sizzle.matches = function(expr, set) {
    return Sizzle(expr, null, null, set);
  };

  Sizzle.matchesSelector = function(elem, expr) {
    return Sizzle(expr, null, null, [ elem ]).length > 0;
  };

  Sizzle.find = function(expr, context, contextXML) {
    var set, i, len, match, type, left;

    if (!expr) {
      return [];
    }

    for (i = 0, len = Expr.order.length; i < len; i++) {
      type = Expr.order[i];

      if ((match = leftMatchExpr[ type ].exec(expr))) {
        left = match[1];
        match.splice(1, 1);

        if (left.substr(left.length - 1) !== "\\") {
          match[1] = (match[1] || "").replace(rbackslash, "");
          set = Expr.find[ type ](match, context, contextXML);

          if (set != null) {
            expr = expr.replace(matchExpr[ type ], "");
            break;
          }
        }
      }
    }

    if (!set) {
      set = Expr.find.TAG([ 0, "*" ], context);
    }

    return { set: set, expr: expr };
  };

  Sizzle.filter = function(expr, set, inplace, not) {
    var anyFound,
        type, found, elem, filter, left, attrs,
        i, pass,
        match = filterCache[ expr ],
        old = expr,
        result = [],
        isXMLFilter = set && set[0] && isXML(set[0]);

    // Quick match => tag#id.class
    //   0  1    2   3
    // [ _, tag, id, class ]
    if (!match) {
      match = rquickMatch.exec(expr);
      if (match) {
        match[1] = ( match[1] || "" ).toLowerCase();
        match[3] = match[3] && (" " + match[3] + " ");
        filterCache[ expr ] = match;
      }
    }
    if (match && !isXMLFilter) {
      for (i = 0; (elem = set[i]) != null; i++) {
        if (elem) {
          attrs = elem.attributes || {};
          found = (!match[1] || (elem.nodeName && elem.nodeName.toLowerCase() === match[1])) &&
              (!match[2] || (attrs.id || {}).value === match[2]) &&
              (!match[3] || ~(" " + ((attrs["class"] || {}).value || "").replace(rtnfr, " ") + " ").indexOf(match[3]));
          pass = not ^ found;
          if (inplace && !pass) {
            set[i] = false;
          } else if (pass) {
            result.push(elem);
          }
        }
      }
      if (!inplace) {
        set = result;
      }
      return set;
    }

    // Regular matching
    while (expr && set.length) {
      for (type in Expr.filter) {
        if ((match = leftMatchExpr[ type ].exec(expr)) && match[2]) {
          filter = Expr.filter[ type ];
          left = match[1];

          anyFound = false;

          match.splice(1, 1);

          if (left.substr(left.length - 1) === "\\") {
            continue;
          }

          if (set === result) {
            result = [];
          }

          if (Expr.preFilter[ type ]) {
            match = Expr.preFilter[ type ](match, set, inplace, result, not, isXMLFilter);

            if (!match) {
              anyFound = found = true;

            } else if (match === true) {
              continue;
            }
          }

          if (match) {
            for (i = 0; (elem = set[i]) != null; i++) {
              if (elem) {
                found = filter(elem, match, i, set);
                pass = not ^ found;

                if (inplace && found != null) {
                  if (pass) {
                    anyFound = true;

                  } else {
                    set[i] = false;
                  }

                } else if (pass) {
                  result.push(elem);
                  anyFound = true;
                }
              }
            }
          }

          if (found !== undefined) {
            if (!inplace) {
              set = result;
            }

            expr = expr.replace(matchExpr[ type ], "");

            if (!anyFound) {
              return [];
            }

            break;
          }
        }
      }

      // Improper expression
      if (expr === old) {
        if (anyFound == null) {
          Sizzle.error(expr);

        } else {
          break;
        }
      }

      old = expr;
    }

    return set;
  };

  Sizzle.attr = function(elem, name) {
    if (Expr.attrHandle[ name ]) {
      return Expr.attrHandle[ name ](elem);
    }
    if (assertAttributes || isXML(elem)) {
      return elem.getAttribute(name);
    }
    var attr = (elem.attributes || {})[ name ];
    return attr && attr.specified ? attr.value : null;
  };

  Sizzle.error = function(msg) {
    throw new Error("Syntax error, unrecognized expression: " + msg);
  };

  if (document.querySelectorAll) {
    (function() {
      var disconnectedMatch,
          oldSelect = select,
          id = "__sizzle__",
          rdivision = /[^\\],/g,
          rrelativeHierarchy = /^\s*[+~]/,
          rapostrophe = /'/g,
          rattributeQuotes = /\=\s*([^'"\]]*)\s*\]/g,
          rbuggyQSA = [],
          rbuggyMatches = [],
          matches = docElem.matchesSelector ||
              docElem.mozMatchesSelector ||
              docElem.webkitMatchesSelector ||
              docElem.oMatchesSelector ||
              docElem.msMatchesSelector;

      // Build QSA regex
      // Regex strategy adopted from Diego Perini
      assert(function(div) {
        div.innerHTML = "<select><option selected></option></select>";

        // IE8 - Some boolean attributes are not treated correctly
        if (!div.querySelectorAll("[selected]").length) {
          rbuggyQSA.push("\\[[\\x20\\t\\n\\r\\f]*(?:checked|disabled|ismap|multiple|readonly|selected|value)");
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
          rbuggyQSA.push("[*^$]=[\\x20\\t\\n\\r\\f]*(?:\"\"|'')");
        }

        // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
        // IE8 throws error here (do not put tests after this one)
        div.innerHTML = "<input type='hidden'>";
        if (!div.querySelectorAll(":enabled").length) {
          rbuggyQSA.push(":enabled", ":disabled");
        }
      });

      rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));

      select = function(selector, context, results, seed, contextXML) {
        // Only use querySelectorAll when not filtering,
        // when this is not xml,
        // and when no QSA bugs apply
        if (!seed && !contextXML && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
          if (context.nodeType === 9) {
            try {
              return makeArray(context.querySelectorAll(selector), results);
            } catch (qsaError) {
            }
            // qSA works strangely on Element-rooted queries
            // We can work around this by specifying an extra ID on the root
            // and working up from there (Thanks to Andrew Dupont for the technique)
            // IE 8 doesn't work on object elements
          } else if (context.nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
            var newSelector,
                oldContext = context,
                old = context.getAttribute("id"),
                nid = old || id,
                parent = context.parentNode,
                relativeHierarchySelector = rrelativeHierarchy.test(selector);

            if (!old) {
              context.setAttribute("id", nid);
            } else {
              nid = nid.replace(rapostrophe, "\\$&");
            }

            if (relativeHierarchySelector && parent) {
              context = parent;
            }

            try {
              if (!relativeHierarchySelector || parent) {
                nid = "[id='" + nid + "'] ";
                newSelector = nid + selector.replace(rdivision, "$&" + nid);
                return makeArray(context.querySelectorAll(newSelector), results);
              }
            } catch (qsaError) {
            } finally {
              if (!old) {
                oldContext.removeAttribute("id");
              }
            }
          }
        }

        return oldSelect(selector, context, results, seed, contextXML);
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
            rbuggyMatches.push(Expr.match.PSEUDO);
          } catch (e) {
          }
        });

        // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
        // A support test would require too much code (would include document ready)
        // just skip matchesSelector for :active
        rbuggyMatches.push(":active");

        rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));

        Sizzle.matchesSelector = function(elem, expr) {
          // Make sure that attribute selectors are quoted
          expr = expr.replace(rattributeQuotes, "='$1']");

          if (!isXML(elem) && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
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

  // Slice is no longer used
  // Results is expected to be an array or undefined
  // typeof len is checked for if array is a form nodelist containing an element with name "length" (wow)
  function makeArray(array, results) {
    results = results || [];
    var i = 0,
        len = array.length;
    if (typeof len === "number") {
      for (; i < len; i++) {
        results.push(array[i]);
      }
    } else {
      for (; array[i]; i++) {
        results.push(array[i]);
      }
    }
    return results;
  }

  var isXML = Sizzle.isXML = function(elem) {
    // documentElement is verified for cases where it doesn't yet exist
    // (such as loading iframes in IE - #4833)
    var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
    return documentElement ? documentElement.nodeName !== "HTML" : false;
  };

  // Element contains another
  var contains = Sizzle.contains = docElem.compareDocumentPosition ?
      function(a, b) {
        return !!(a.compareDocumentPosition(b) & 16);
      } :
      docElem.contains ?
          function(a, b) {
            return a !== b && ( a.contains ? a.contains(b) : false );
          } :
          function(a, b) {
            while ((b = b.parentNode)) {
              if (b === a) {
                return true;
              }
            }
            return false;
          };

  /**
   * Utility function for retreiving the text value of an array of DOM nodes
   * @param {Array|Element} elem
   */
  var getText = Sizzle.getText = function(elem) {
    var i, node,
        nodeType = elem.nodeType,
        ret = "";

    if (nodeType) {
      if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
        // Use textContent for elements
        // innerText usage removed for consistency of new lines (see #11153)
        if (typeof elem.textContent === "string") {
          return elem.textContent;
        } else {
          // Traverse it's children
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            ret += getText(elem);
          }
        }
      } else if (nodeType === 3 || nodeType === 4) {
        return elem.nodeValue;
      }
    } else {

      // If no nodeType, this is expected to be an array
      for (i = 0; (node = elem[i]); i++) {
        // Do not traverse comment nodes
        if (node.nodeType !== 8) {
          ret += getText(node);
        }
      }
    }
    return ret;
  };

  function dirCheck(dir, checkSet, checkIndexes, part, xml) {
    var elem, nodeCheck, isElem, match, levelIndex, cached,
        j, matchLen,
        i = 0,
        len = checkSet.length,
        isPartStr = typeof part === "string",
        doneName = ++done;

    if (isPartStr && !rnonWord.test(part)) {
      part = part.toLowerCase();
      nodeCheck = true;
    }

    for (; i < len; i++) {
      if ((elem = checkSet[i])) {
        match = [];
        levelIndex = 0;

        elem = elem[ dir ];

        while (elem) {
          if (elem[ expando ] === doneName && elem.sizLevelIndex === levelIndex) {
            cached = checkSet[ elem.sizset ];
            match = match.length ? cached.length ? match.concat(cached) : match : cached;
            break;
          }

          isElem = elem.nodeType === 1;
          if (isElem && !xml) {
            elem[ expando ] = doneName;
            elem.sizset = i;
            elem.sizLevelIndex = levelIndex;
          }

          if (nodeCheck) {
            if (elem.nodeName.toLowerCase() === part) {
              match.push(elem);
            }
          } else if (isElem) {
            if (!isPartStr) {
              if (elem === part) {
                // We can stop here
                match = true;
                break;
              }

            } else if (Sizzle.filter(part, [elem]).length > 0) {
              match.push(elem);
            }
          }

          elem = elem[ dir ];
          levelIndex++;
        }

        if ((matchLen = match.length)) {
          checkSet[i] = match;
          if (matchLen > 1) {
            checkIndexes[i] = [];
            j = 0;
            for (; j < matchLen; j++) {
              checkIndexes[i].push(i);
            }
          }
        } else {
          checkSet[i] = typeof match === "boolean" ? match : false;
        }
      }
    }
  }

  function posProcess(selector, context, seed, contextXML) {
    var match,
        tmpSet = [],
        later = "",
        root = context.nodeType ? [ context ] : context,
        i = 0,
        len = root.length;

    // Position selectors must be done after the filter
    // And so must :not(positional) so we move all PSEUDOs to the end
    while ((match = matchExpr.PSEUDO.exec(selector))) {
      later += match[0];
      selector = selector.replace(matchExpr.PSEUDO, "");
    }

    if (Expr.relative[ selector ]) {
      selector += "*";
    }

    for (; i < len; i++) {
      select(selector, root[i], tmpSet, seed, contextXML);
    }

    return Sizzle.filter(later, tmpSet);
  }

  var Expr = Sizzle.selectors = {

    match: matchExpr,
    leftMatch: leftMatchExpr,

    order: [ "ID", "NAME", "TAG" ],

    attrHandle: {},

    relative: {
      "+": function(checkSet, checkIndexes, part) {
        var elem,
            i = 0,
            len = checkSet.length,
            isPartStr = typeof part === "string",
            isTag = isPartStr && !rnonWord.test(part),
            isPartStrNotTag = isPartStr && !isTag;

        if (isTag) {
          part = part.toLowerCase();
        }

        for (; i < len; i++) {
          if ((elem = checkSet[i])) {
            while ((elem = elem.previousSibling) && elem.nodeType !== 1) {
            }
            checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
                elem || false :
                elem === part;
          }
        }

        if (isPartStrNotTag) {
          Sizzle.filter(part, checkSet, true);
        }
      },

      ">": function(checkSet, checkIndexes, part) {
        var elem,
            i = 0,
            len = checkSet.length,
            isPartStr = typeof part === "string";

        if (isPartStr && !rnonWord.test(part)) {
          part = part.toLowerCase();
          for (; i < len; i++) {
            if ((elem = checkSet[i])) {
              var parent = elem.parentNode;
              checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
            }
          }

        } else {
          for (; i < len; i++) {
            if ((elem = checkSet[i])) {
              checkSet[i] = isPartStr ?
                  elem.parentNode :
                  elem.parentNode === part;
            }
          }

          if (isPartStr) {
            Sizzle.filter(part, checkSet, true);
          }
        }
      },

      "": function(checkSet, checkIndexes, part, xml) {
        dirCheck("parentNode", checkSet, checkIndexes, part, xml);
      },

      "~": function(checkSet, checkIndexes, part, xml) {
        dirCheck("previousSibling", checkSet, checkIndexes, part, xml);
      }
    },

    find: {
      ID: assertGetIdNotName ?
          function(match, context, xml) {
            if (typeof context.getElementById !== strundefined && !xml) {
              var m = context.getElementById(match[1]);
              // Check parentNode to catch when Blackberry 4.6 returns
              // nodes that are no longer in the document #6963
              return m && m.parentNode ? [m] : [];
            }
          } :
          function(match, context, xml) {
            if (typeof context.getElementById !== strundefined && !xml) {
              var m = context.getElementById(match[1]);

              return m ?
                  m.id === match[1] || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === match[1] ?
                      [m] :
                      undefined :
                  [];
            }
          },

      NAME: function(match, context) {
        if (typeof context.getElementsByName !== strundefined) {
          var ret = [],
              results = context.getElementsByName(match[1]),
              i = 0,
              len = results.length;

          for (; i < len; i++) {
            if (results[i].getAttribute("name") === match[1]) {
              ret.push(results[i]);
            }
          }

          return ret.length === 0 ? null : ret;
        }
      },

      TAG: assertTagNameNoComments ?
          function(match, context) {
            if (typeof context.getElementsByTagName !== strundefined) {
              return context.getElementsByTagName(match[1]);
            }
          } :
          function(match, context) {
            var results = context.getElementsByTagName(match[1]);

            // Filter out possible comments
            if (match[1] === "*") {
              var tmp = [],
                  i = 0;

              for (; results[i]; i++) {
                if (results[i].nodeType === 1) {
                  tmp.push(results[i]);
                }
              }

              results = tmp;
            }
            return results;
          }
    },

    preFilter: {
      CLASS: function(match, curLoop, inplace, result, not, xml) {
        var elem,
            i = 0;

        match = " " + match[1].replace(rbackslash, "") + " ";

        if (xml) {
          return match;
        }

        for (; (elem = curLoop[i]) != null; i++) {
          if (elem) {
            if (not ^ (elem.className && ~(" " + elem.className + " ").replace(rtnfr, " ").indexOf(match))) {
              if (!inplace) {
                result.push(elem);
              }
            } else if (inplace) {
              curLoop[i] = false;
            }
          }
        }

        return false;
      },

      ID: function(match) {
        return match[1].replace(rbackslash, "");
      },

      TAG: function(match) {
        return match[1].replace(rbackslash, "").toLowerCase();
      },

      CHILD: function(match) {
        if (match[1] === "nth") {
          if (!match[2]) {
            Sizzle.error(match[0]);
          }

          match[2] = match[2].replace(radjacent, "");

          // parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
          var test = rnth.exec(
              match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
                  !rnonDigit.test(match[2]) && "0n+" + match[2] || match[2]);

          // calculate the numbers (first)n+(last) including if they are negative
          match[2] = (test[1] + (test[2] || 1)) - 0;
          match[3] = test[3] - 0;
        } else if (match[2]) {
          Sizzle.error(match[0]);
        }

        // TODO: Move to normal caching system
        match[0] = ++done;

        return match;
      },

      ATTR: function(match) {
        match[1] = match[1].replace(rbackslash, "");

        // Handle if an un-quoted value was used
        match[4] = ( match[4] || match[5] || "" ).replace(rbackslash, "");

        if (match[2] === "~=") {
          match[4] = " " + match[4] + " ";
        }

        return match;
      },

      PSEUDO: function(match, curLoop, inplace, result, not, xml) {
        if (match[1] === "not") {
          // If we're dealing with a complex expression, or a simple one
          if (( chunker.exec(match[3]) || "" ).length > 1 || rstartsWithWord.test(match[3])) {
            match[3] = select(match[3], document, [], curLoop, xml);

          } else {
            var ret = Sizzle.filter(match[3], curLoop, inplace, !not);

            if (!inplace) {
              result.push.apply(result, ret);
            }

            return false;
          }

        } else if (matchExpr.POS.test(match[0]) || matchExpr.CHILD.test(match[0])) {
          return true;
        }

        return match;
      },

      POS: function(match) {
        match.unshift(true);

        return match;
      }
    },

    filters: {
      enabled: function(elem) {
        return elem.disabled === false;
      },

      disabled: function(elem) {
        return elem.disabled === true;
      },

      checked: function(elem) {
        // In CSS3, :checked should return both checked and selected elements
        // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
        var nodeName = elem.nodeName.toLowerCase();
        return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
      },

      selected: function(elem) {
        // Accessing this property makes selected-by-default
        // options in Safari work properly
        if (elem.parentNode) {
          elem.parentNode.selectedIndex;
        }

        return elem.selected === true;
      },

      parent: function(elem) {
        return !!elem.firstChild;
      },

      empty: function(elem) {
        return !elem.firstChild;
      },

      has: function(elem, i, match) {
        return !!Sizzle(match[3], elem).length;
      },

      header: function(elem) {
        return rheader.test(elem.nodeName);
      },

      text: function(elem) {
        var attr = elem.getAttribute("type"), type = elem.type;
        // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
        // use getAttribute instead to test this case
        return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === null || attr.toLowerCase() === type );
      },

      radio: function(elem) {
        return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
      },

      checkbox: function(elem) {
        return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
      },

      file: function(elem) {
        return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
      },

      password: function(elem) {
        return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
      },

      submit: function(elem) {
        var name = elem.nodeName.toLowerCase();
        return (name === "input" || name === "button") && "submit" === elem.type;
      },

      image: function(elem) {
        return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
      },

      reset: function(elem) {
        var name = elem.nodeName.toLowerCase();
        return (name === "input" || name === "button") && "reset" === elem.type;
      },

      button: function(elem) {
        var name = elem.nodeName.toLowerCase();
        return name === "input" && "button" === elem.type || name === "button";
      },

      input: function(elem) {
        return rinputs.test(elem.nodeName);
      },

      focus: function(elem) {
        var doc = elem.ownerDocument;
        return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href);
      },

      active: function(elem) {
        return elem === elem.ownerDocument.activeElement;
      },

      contains: function(elem, i, match) {
        return ~( elem.textContent || elem.innerText || getText(elem) ).indexOf(match[3]);
      }
    },

    setFilters: {
      first: function(elem, i) {
        return i === 0;
      },

      last: function(elem, i, match, array) {
        return i === array.length - 1;
      },

      even: function(elem, i) {
        return i % 2 === 0;
      },

      odd: function(elem, i) {
        return i % 2 === 1;
      },

      lt: function(elem, i, match) {
        return i < match[3] - 0;
      },

      gt: function(elem, i, match) {
        return i > match[3] - 0;
      },

      nth: function(elem, i, match) {
        return match[3] - 0 === i;
      },

      eq: function(elem, i, match) {
        return match[3] - 0 === i;
      }
    },

    filter: {
      PSEUDO: function(elem, match, i, array) {
        var name = match[1],
            filter = Expr.filters[ name ];

        if (filter) {
          return filter(elem, i, match, array);

        } else if (name === "not") {
          var not = match[3],
              j = 0,
              len = not.length;

          for (; j < len; j++) {
            if (not[j] === elem) {
              return false;
            }
          }

          return true;

        } else {
          Sizzle.error(name);
        }
      },

      CHILD: function(elem, match) {
        var first, last,
            doneName, parent,
            count, diff,
            type = match[1],
            node = elem;

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

          case "nth":
            first = match[2];
            last = match[3];

            if (first === 1 && last === 0) {
              return true;
            }

            doneName = match[0];
            parent = elem.parentNode;

            if (parent && (parent[ expando ] !== doneName || !elem.sizset)) {

              count = 0;
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
        }
      },

      ID: assertGetIdNotName ?
          function(elem, match) {
            return elem.nodeType === 1 && elem.getAttribute("id") === match;
          } :
          function(elem, match) {
            var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
            return elem.nodeType === 1 && node && node.value === match;
          },

      TAG: function(elem, match) {
        return ( match === "*" && elem.nodeType === 1 ) || elem.nodeName && elem.nodeName.toLowerCase() === match;
      },

      CLASS: function(elem, match) {
        return ~( " " + ( elem.className || elem.getAttribute("class") ) + " " ).indexOf(match);
      },

      ATTR: function(elem, match) {
        var name = match[1],
            result = Sizzle.attr(elem, name),
            value = result + "",
            type = match[2],
            check = match[4];

        return result == null ?
            type === "!=" :
            !type ?
                result != null :
                type === "=" ?
                    value === check :
                    type === "*=" ?
                        ~value.indexOf(check) :
                        type === "~=" ?
                            ~( " " + value + " " ).indexOf(check) :
                            !check ?
                                value && result !== false :
                                type === "!=" ?
                                    value !== check :
                                    type === "^=" ?
                                        value.indexOf(check) === 0 :
                                        type === "$=" ?
                                            value.substr(value.length - check.length) === check :
                                            type === "|=" ?
                                                value === check || value.substr(0, check.length + 1) === check + "-" :
                                                false;
      },

      POS: function(elem, match, i, array) {
        var name = match[2],
            filter = Expr.setFilters[ name ];

        if (filter) {
          return filter(elem, i, match, array);
        }
      }
    }
  };

  // IE6/7 return a modified href
  if (!assertHrefNotNormalized) {
    Expr.attrHandle = {
      href: function(elem) {
        return elem.getAttribute("href", 2);
      },
      type: function(elem) {
        return elem.getAttribute("type");
      }
    };
  }

  // Add getElementsByClassName if usable
  if (assertUsableClassName) {
    Expr.order.splice(1, 0, "CLASS");
    Expr.find.CLASS = function(match, context, xml) {
      if (typeof context.getElementsByClassName !== strundefined && !xml) {
        return context.getElementsByClassName(match[1]);
      }
    };
  }

  // Check if the JavaScript engine is using some sort of
  // optimization where it does not always call our comparision
  // function. If that is the case, discard the hasDuplicate value.
  //   Thus far that includes Google Chrome.
  [0, 0].sort(function() {
    baseHasDuplicate = false;
    return 0;
  });

  var sortOrder, siblingCheck;
  if (docElem.compareDocumentPosition) {
    sortOrder = function(a, b) {
      if (a === b) {
        hasDuplicate = true;
        return 0;
      }

      if (!a.compareDocumentPosition || !b.compareDocumentPosition) {
        return a.compareDocumentPosition ? -1 : 1;
      }

      return a.compareDocumentPosition(b) & 4 ? -1 : 1;
    };

  } else {
    sortOrder = function(a, b) {
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

    siblingCheck = function(a, b, ret) {
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
    };
  }

  // Document sorting and removing duplicates
  var uniqueSort = Sizzle.uniqueSort = function(results) {
    if (sortOrder) {
      hasDuplicate = baseHasDuplicate;
      results.sort(sortOrder);

      if (hasDuplicate) {
        for (var i = 1; i < results.length; i++) {
          if (results[i] === results[ i - 1 ]) {
            results.splice(i--, 1);
          }
        }
      }
    }

    return results;
  };

  // EXPOSE
  /**
   * 在本元素的后代元素中，根据指定的选择符查找元素。
   * @name Element.prototype.find
   * @function
   * @param {string} selector 选择符。
   * @returns {Array} 包含查找到的元素的数组。
   * @description
   *   本功能使用 Sizzle 实现，关于可以使用的 selector 信息，请参考 Sizzle 的相关说明。
   * @see https://github.com/jquery/sizzle/wiki/Sizzle-Home
   */
  if ('Element' in window) {
    var $ = document.$;
    Element.prototype.find = function(selector) {
      return Sizzle(selector, this).map(function(element) {
        return $(element);
      });
    };
  } else {
    window.Sizzle = Sizzle;
  }

})(window);
/*!
 * DD_belatedPNG: Adds IE6 support: PNG images for CSS background-image and HTML <IMG/>.
 *  Author: Drew Diller
 *  Email: drew.diller@gmail.com
 *  URL: http://www.dillerdesign.com/experiment/DD_belatedPNG/
 *  Version: 0.0.8a
 *  Licensed under the MIT License: http://dillerdesign.com/experiment/DD_belatedPNG/#license
 */
/**
 * @fileOverview 插件 - IE6 PNG alpha 透明修复 & 启用背景图片缓存 - DD_belatedPNG
 */
(function() {
//==================================================[IE6 PNG alpha 透明修复 & 启用背景图片缓存]
  /*
   * 为使用了 alpha 透明的 PNG 图片的元素（包括背景或 img 元素的 src）添加一个 名为 'alpha' 的 class，即可在 IE6 中修复 PNG 的 alpha 透明问题。
   * 修复了在 iframe 中使用导致内容无法正常显示的问题。
   *
   * 局限性：
   *   不能用于修复会改变透明度的元素上，如可能调用 fadeIn/fadeOut 方法的元素。
   *   要修复的元素必须有明确定义的、绝对长度的尺寸，否则可能会出现图片覆盖不全的问题。
   *
   * 提供对象：
   *   DD_belatedPNG
   */

  var html = document.documentElement;
  if (!html.currentStyle || 'minWidth' in html.currentStyle) {
    return;
  }

//--------------------------------------------------[DD_belatedPNG]
  /**
   * DD_belatedPNG: Adds IE6 support: PNG images for CSS background-image and HTML <IMG/>.
   * Author: Drew Diller
   * Email: drew.diller@gmail.com
   * URL: http://www.dillerdesign.com/experiment/DD_belatedPNG/
   * Version: 0.0.8a
   * Licensed under the MIT License: http://dillerdesign.com/experiment/DD_belatedPNG/#license
   *
   * Example usage:
   * DD_belatedPNG.fix('.png_bg'); // argument is a CSS selector
   * DD_belatedPNG.fixPng( someNode ); // argument is an HTMLDomElement
   **/

  /*
   PLEASE READ:
   Absolutely everything in this script is SILLY.  I know this.  IE's rendering of certain pixels doesn't make sense, so neither does this code!
   */

  var DD_belatedPNG = {
    ns: 'DD_belatedPNG',
    imgSize: {},
    delay: 10,
    nodesFixed: 0,
    createVmlNameSpace: function() { /* enable VML */
      if (document.namespaces && !document.namespaces[this.ns]) {
        document.namespaces.add(this.ns, 'urn:schemas-microsoft-com:vml');
      }
    },
    createVmlStyleSheet: function() { /* style VML, enable behaviors */
      /*
       Just in case lots of other developers have added
       lots of other stylesheets using document.createStyleSheet
       and hit the 31-limit mark, let's not use that method!
       further reading: http://msdn.microsoft.com/en-us/library/ms531194(VS.85).aspx
       */
      var screenStyleSheet, printStyleSheet;
      screenStyleSheet = document.createElement('style');
      screenStyleSheet.setAttribute('media', 'screen');
      document.documentElement.firstChild.insertBefore(screenStyleSheet, document.documentElement.firstChild.firstChild);
      if (screenStyleSheet.styleSheet) {
        screenStyleSheet = screenStyleSheet.styleSheet;
        screenStyleSheet.addRule(this.ns + '\\:*', '{behavior:url(#default#VML)}');
        screenStyleSheet.addRule(this.ns + '\\:shape', 'position:absolute;');
        screenStyleSheet.addRule('img.' + this.ns + '_sizeFinder', 'behavior:none; border:none; position:absolute; z-index:-1; top:-10000px; visibility:hidden;');
        /* large negative top value for avoiding vertical scrollbars for large images, suggested by James O'Brien, http://www.thanatopsic.org/hendrik/ */
        this.screenStyleSheet = screenStyleSheet;

        /* Add a print-media stylesheet, for preventing VML artifacts from showing up in print (including preview). */
        /* Thanks to R�mi Pr�vost for automating this! */
        printStyleSheet = document.createElement('style');
        printStyleSheet.setAttribute('media', 'print');
        document.documentElement.firstChild.insertBefore(printStyleSheet, document.documentElement.firstChild.firstChild);
        printStyleSheet = printStyleSheet.styleSheet;
        printStyleSheet.addRule(this.ns + '\\:*', '{display: none !important;}');
        printStyleSheet.addRule('img.' + this.ns + '_sizeFinder', '{display: none !important;}');
      }
    },
    readPropertyChange: function() {
      var el, display, v;
      el = event.srcElement;
      if (!el.vmlInitiated) {
        return;
      }
      if (event.propertyName.search('background') != -1 || event.propertyName.search('border') != -1) {
        DD_belatedPNG.applyVML(el);
      }
      if (event.propertyName == 'style.display') {
        display = (el.currentStyle.display == 'none') ? 'none' : 'block';
        for (v in el.vml) {
          if (el.vml.hasOwnProperty(v)) {
            el.vml[v].shape.style.display = display;
          }
        }
      }
      if (event.propertyName.search('filter') != -1) {
        DD_belatedPNG.vmlOpacity(el);
      }
    },
    vmlOpacity: function(el) {
      if (el.currentStyle.filter.search('lpha') != -1) {
        var trans = el.currentStyle.filter;
        trans = parseInt(trans.substring(trans.lastIndexOf('=') + 1, trans.lastIndexOf(')')), 10) / 100;
        el.vml.color.shape.style.filter = el.currentStyle.filter;
        /* complete guesswork */
        el.vml.image.fill.opacity = trans;
        /* complete guesswork */
      }
    },
    handlePseudoHover: function(el) {
      setTimeout(function() { /* wouldn't work as intended without setTimeout */
        DD_belatedPNG.applyVML(el);
      }, 1);
    },
    /**
     * This is the method to use in a document.
     * @param {String} selector - REQUIRED - a CSS selector, such as '#doc .container'
     **/
    fix: function(selector) {
      if (this.screenStyleSheet) {
        var selectors, i;
        selectors = selector.split(',');
        /* multiple selectors supported, no need for multiple calls to this anymore */
        for (i = 0; i < selectors.length; i++) {
          this.screenStyleSheet.addRule(selectors[i], 'behavior:expression(DD_belatedPNG.fixPng(this))');
          /* seems to execute the function without adding it to the stylesheet - interesting... */
        }
      }
    },
    applyVML: function(el) {
      el.runtimeStyle.cssText = '';
      this.vmlFill(el);
      this.vmlOffsets(el);
      this.vmlOpacity(el);
      if (el.isImg) {
        this.copyImageBorders(el);
      }
    },
    attachHandlers: function(el) {
      var self, handlers, handler, moreForAs, a, h;
      self = this;
      handlers = {resize: 'vmlOffsets', move: 'vmlOffsets'};
      if (el.nodeName == 'A') {
        moreForAs = {mouseleave: 'handlePseudoHover', mouseenter: 'handlePseudoHover', focus: 'handlePseudoHover', blur: 'handlePseudoHover'};
        for (a in moreForAs) {
          if (moreForAs.hasOwnProperty(a)) {
            handlers[a] = moreForAs[a];
          }
        }
      }
      for (h in handlers) {
        if (handlers.hasOwnProperty(h)) {
          handler = function() {
            self[handlers[h]](el);
          };
          el.attachEvent('on' + h, handler);
        }
      }
      el.attachEvent('onpropertychange', this.readPropertyChange);
    },
    giveLayout: function(el) {
      el.style.zoom = 1;
      if (el.currentStyle.position == 'static') {
        var nodeName = el.nodeName;
        if (nodeName !== 'HTML' && nodeName !== 'A' && nodeName !== 'IMG') {
          el.style.position = 'relative';
        }
      }
    },
    copyImageBorders: function(el) {
      var styles, s;
      styles = {'borderStyle': true, 'borderWidth': true, 'borderColor': true};
      for (s in styles) {
        if (styles.hasOwnProperty(s)) {
          el.vml.color.shape.style[s] = el.currentStyle[s];
        }
      }
    },
    vmlFill: function(el) {
      if (!el.currentStyle) {
        return;
      } else {
        var elStyle, noImg, lib, v, img, imgLoaded;
        elStyle = el.currentStyle;
      }
      for (v in el.vml) {
        if (el.vml.hasOwnProperty(v)) {
          el.vml[v].shape.style.zIndex = elStyle.zIndex;
        }
      }
      el.runtimeStyle.backgroundColor = '';
      el.runtimeStyle.backgroundImage = '';
      noImg = true;
      if (elStyle.backgroundImage != 'none' || el.isImg) {
        if (!el.isImg) {
          el.vmlBg = elStyle.backgroundImage;
          el.vmlBg = el.vmlBg.substr(5, el.vmlBg.lastIndexOf('")') - 5);
        }
        else {
          el.vmlBg = el.src;
        }
        lib = this;
        if (!lib.imgSize[el.vmlBg]) { /* determine size of loaded image */
          img = document.createElement('img');
          lib.imgSize[el.vmlBg] = img;
          img.className = lib.ns + '_sizeFinder';
          img.runtimeStyle.cssText = 'behavior:none; position:absolute; left:-10000px; top:-10000px; border:none; margin:0; padding:0;';
          /* make sure to set behavior to none to prevent accidental matching of the helper elements! */
          imgLoaded = function() {
            this.width = this.offsetWidth;
            /* weird cache-busting requirement! */
            this.height = this.offsetHeight;
            lib.vmlOffsets(el);
          };
          img.attachEvent('onload', imgLoaded);
          img.src = el.vmlBg;
          img.removeAttribute('width');
          img.removeAttribute('height');
          document.body.insertBefore(img, document.body.firstChild);
        }
        el.vml.image.fill.src = el.vmlBg;
        noImg = false;
      }
      el.vml.image.fill.on = !noImg;
      el.vml.image.fill.color = 'none';
      el.vml.color.shape.style.backgroundColor = elStyle.backgroundColor;
      el.runtimeStyle.backgroundImage = 'none';
      el.runtimeStyle.backgroundColor = 'transparent';
    },
    /* IE can't figure out what do when the offsetLeft and the clientLeft add up to 1, and the VML ends up getting fuzzy... so we have to push/enlarge things by 1 pixel and then clip off the excess */
    vmlOffsets: function(el) {
      var thisStyle, size, fudge, makeVisible, bg, bgR, dC, altC, b, c, v;
      thisStyle = el.currentStyle;
      size = {'W': el.clientWidth + 1, 'H': el.clientHeight + 1, 'w': this.imgSize[el.vmlBg].width, 'h': this.imgSize[el.vmlBg].height, 'L': el.offsetLeft, 'T': el.offsetTop, 'bLW': el.clientLeft, 'bTW': el.clientTop};
      fudge = (size.L + size.bLW == 1) ? 1 : 0;
      /* vml shape, left, top, width, height, origin */
      makeVisible = function(vml, l, t, w, h, o) {
        vml.coordsize = w + ',' + h;
        vml.coordorigin = o + ',' + o;
        vml.path = 'm0,0l' + w + ',0l' + w + ',' + h + 'l0,' + h + ' xe';
        vml.style.width = w + 'px';
        vml.style.height = h + 'px';
        vml.style.left = l + 'px';
        vml.style.top = t + 'px';
      };
      makeVisible(el.vml.color.shape, (size.L + (el.isImg ? 0 : size.bLW)), (size.T + (el.isImg ? 0 : size.bTW)), (size.W - 1), (size.H - 1), 0);
      makeVisible(el.vml.image.shape, (size.L + size.bLW), (size.T + size.bTW), (size.W), (size.H), 1);
      bg = {'X': 0, 'Y': 0};
      if (el.isImg) {
        bg.X = parseInt(thisStyle.paddingLeft, 10) + 1;
        bg.Y = parseInt(thisStyle.paddingTop, 10) + 1;
      }
      else {
        for (b in bg) {
          if (bg.hasOwnProperty(b)) {
            this.figurePercentage(bg, size, b, thisStyle['backgroundPosition' + b]);
          }
        }
      }
      el.vml.image.fill.position = (bg.X / size.W) + ',' + (bg.Y / size.H);
      bgR = thisStyle.backgroundRepeat;
      dC = {'T': 1, 'R': size.W + fudge, 'B': size.H, 'L': 1 + fudge};
      /* these are defaults for repeat of any kind */
      altC = { 'X': {'b1': 'L', 'b2': 'R', 'd': 'W'}, 'Y': {'b1': 'T', 'b2': 'B', 'd': 'H'} };
      if (bgR != 'repeat' || el.isImg) {
        c = {'T': (bg.Y), 'R': (bg.X + size.w), 'B': (bg.Y + size.h), 'L': (bg.X)};
        /* these are defaults for no-repeat - clips down to the image location */
        if (bgR.search('repeat-') != -1) { /* now let's revert to dC for repeat-x or repeat-y */
          v = bgR.split('repeat-')[1].toUpperCase();
          c[altC[v].b1] = 1;
          c[altC[v].b2] = size[altC[v].d];
        }
        if (c.B > size.H) {
          c.B = size.H;
        }
        el.vml.image.shape.style.clip = 'rect(' + c.T + 'px ' + (c.R + fudge) + 'px ' + c.B + 'px ' + (c.L + fudge) + 'px)';
      }
      else {
        el.vml.image.shape.style.clip = 'rect(' + dC.T + 'px ' + dC.R + 'px ' + dC.B + 'px ' + dC.L + 'px)';
      }
    },
    figurePercentage: function(bg, size, axis, position) {
      var horizontal, fraction;
      fraction = true;
      horizontal = (axis == 'X');
      switch (position) {
        case 'left':
        case 'top':
          bg[axis] = 0;
          break;
        case 'center':
          bg[axis] = 0.5;
          break;
        case 'right':
        case 'bottom':
          bg[axis] = 1;
          break;
        default:
          if (position.search('%') != -1) {
            bg[axis] = parseInt(position, 10) / 100;
          }
          else {
            fraction = false;
          }
      }
      bg[axis] = Math.ceil(fraction ? ( (size[horizontal ? 'W' : 'H'] * bg[axis]) - (size[horizontal ? 'w' : 'h'] * bg[axis]) ) : parseInt(position, 10));
      if (bg[axis] % 2 === 0) {
        bg[axis]++;
      }
      return bg[axis];
    },
    fixPng: function(el) {
      el.style.behavior = 'none';
      var lib, els, nodeStr, v, e;
      if (el.nodeName == 'BODY' || el.nodeName == 'TD' || el.nodeName == 'TR') { /* elements not supported yet */
        return;
      }
      el.isImg = false;
      if (el.nodeName == 'IMG') {
        if (el.src.toLowerCase().search(/\.png$/) != -1) {
          el.isImg = true;
          el.style.visibility = 'hidden';
        }
        else {
          return;
        }
      }
      else if (el.currentStyle.backgroundImage.toLowerCase().search('.png') == -1) {
        return;
      }
      lib = DD_belatedPNG;
      el.vml = {color: {}, image: {}};
      els = {shape: {}, fill: {}};
      for (v in el.vml) {
        if (el.vml.hasOwnProperty(v)) {
          for (e in els) {
            if (els.hasOwnProperty(e)) {
              nodeStr = lib.ns + ':' + e;
              el.vml[v][e] = document.createElement(nodeStr);
            }
          }
          el.vml[v].shape.stroked = false;
          el.vml[v].shape.appendChild(el.vml[v].fill);
          el.parentNode.insertBefore(el.vml[v].shape, el);
        }
      }
      el.vml.image.shape.fillcolor = 'none';
      /* Don't show blank white shapeangle when waiting for image to load. */
      el.vml.image.fill.type = 'tile';
      /* Makes image show up. */
      el.vml.color.fill.on = false;
      /* Actually going to apply vml element's style.backgroundColor, so hide the whiteness. */
      lib.attachHandlers(el);
      lib.giveLayout(el);
      lib.giveLayout(el.offsetParent);
      el.vmlInitiated = true;
      lib.applyVML(el);
      /* Render! */
    }
  };
  try {
    document.execCommand("BackgroundImageCache", false, true);
    /* TredoSoft Multiple IE doesn't like this, so try{} it */
  } catch (r) {
  }
  DD_belatedPNG.createVmlNameSpace();
  DD_belatedPNG.createVmlStyleSheet();

  window.DD_belatedPNG = DD_belatedPNG;
  DD_belatedPNG.fix('.alpha');

})();

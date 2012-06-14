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
    !inStandardsMode && console && console.warn('[OurJS] Browser is working in non-standards mode.');
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

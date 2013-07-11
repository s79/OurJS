/**
 * @fileOverview 浏览器 API 扩展
 * @author sundongguo@gmail.com
 * @version 20111201
 */

(function(window) {
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
   * 浏览器渲染引擎的类型，值为以下之一：Trident|WebKit|Gecko|Presto|Unknown。
   * @name userAgentInfo.engine
   * @memberOf navigator
   * @type string
   */

  /**
   * 浏览器的名称，值为以下之一：IE|Firefox|Chrome|Safari|Opera|Unknown。
   * @name userAgentInfo.name
   * @memberOf navigator
   * @type string
   */

  /**
   * 浏览器的版本号，如果取不到版本号，则为 NaN。
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
    var version = NaN;
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
   * @returns {?string} 数据值。
   *   如果指定的数据名不存在或无法访问，返回 null。
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
   * @returns {?string} 数据值。
   *   如果指定的数据名不存在，返回 null。
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

})(window);

/**
 * @fileOverview 多种数据存储方式。
 * @author sundongguo@gmail.com
 * @version 20120228
 */
(function() {
//==================================================[cookie]
  /*
   * 使用 cookie 存储数据。
   *
   * 提供方法：
   *   cookie.set
   *   cookie.get
   *   cookie.remove
   */

  /**
   * 提供操作 cookie 的常用方法。
   * @name cookie
   * @namespace
   */
  var cookie = {};
  window.cookie = cookie;

//--------------------------------------------------[cookie.set]
  /**
   * 设置 cookie。
   * @name cookie.set
   * @function
   * @param {string} name 要设置的 cookie 名称。
   * @param {string} value 要设置的 cookie 名称对应的值。
   * @param {Object} [options] 可选参数。
   * @param {string} options.path 限定生效的路径，默认为当前路径。
   * @param {string} options.domain 限定生效的域名，默认为当前域名。
   * @param {boolean} options.secure 是否仅通过 SSL 连接 (HTTPS) 传输 cookie，默认为否。
   * @param {Date} options.expires 过期时间。
   */
  cookie.set = function(name, value, options) {
    options = options || {};
    var cookie = name + '=' + encodeURIComponent(value);
    if (options.path) {
      cookie += '; path=' + options.path;
    }
    if (options.domain) {
      cookie += '; domain=' + options.domain;
    }
    if (options.secure) {
      cookie += '; secure';
    }
    if (options.expires) {
      cookie += '; expires=' + options.expires.toUTCString();
    }
    document.cookie = cookie;
  };

//--------------------------------------------------[cookie.get]
  /**
   * 读取 cookie。
   * @name cookie.get
   * @function
   * @param {string} name 要读取的 cookie 名称。
   * @returns {string} 对应的值。
   */
  cookie.get = function(name) {
    var matchs = document.cookie.match('(?:^|;)\\s*' + RegExp.escape(name) + '=([^;]*)');
    return matchs ? decodeURIComponent(matchs[1]) : null;
  };

//--------------------------------------------------[cookie.remove]
  /**
   * 删除 cookie。
   * @name cookie.remove
   * @function
   * @param {string} name 要删除的 cookie 名称。
   * @param {Object} [options] 可选参数。
   * @param {string} options.path 限定生效的路径，默认为当前路径。
   * @param {string} options.domain 限定生效的域名，默认为当前域名。
   * @param {boolean} options.secure 是否仅通过 SSL 连接 (HTTPS) 传输 cookie，默认为否。
   */
  cookie.remove = function(name, options) {
    options = options || {};
    options.expires = new Date(0);
    this.set(name, '', options);
  };

//==================================================[localStorage 补缺]
  /*
   * 为不支持 localStorage 的浏览器（IE6 IE7）模拟此特性。
   *
   * 补缺属性：
   *   localStorage.setItem
   *   localStorage.getItem
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

  if (window.localStorage || !document.documentElement.addBehavior) {
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

//--------------------------------------------------[localStorage.setItem]
  /**
   * 保存数据。
   * @name localStorage.setItem
   * @function
   * @param {string} key 要保存的数据名，不能为空字符串。
   * @param {string} value 要保存的数据值。
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

//--------------------------------------------------[localStorage.getItem]
  /**
   * 读取数据。
   * @name localStorage.getItem
   * @function
   * @param {string} key 要读取的数据名，不能为空字符串。
   * @returns {string} 对应的值。
   */
  localStorage.getItem = function(key) {
    userDataElement.load(USER_DATA_FILE_NAME);
    return userDataElement.getAttribute(key);
  };

//--------------------------------------------------[localStorage.removeItem]
  /**
   * 删除数据。
   * @name localStorage.removeItem
   * @function
   * @param {string} key 要删除的数据名，不能为空字符串。
   */
  localStorage.removeItem = function(key) {
    userDataElement.load(USER_DATA_FILE_NAME);
    userDataElement.removeAttribute(key);
    userDataElement.save(USER_DATA_FILE_NAME);
  };

//--------------------------------------------------[localStorage.clear]
  /**
   * 清空所有数据。
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

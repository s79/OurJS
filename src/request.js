/**
 * @fileOverview 对 XMLHttpRequest 的封装。
 * @author sundongguo@gmail.com
 * @version 20120208
 */
// TODO: jQuery - ticket #5280: Internet Explorer will keep connections alive if we don't abort on unload
// TODO: MooTools 在 xhr.abort() 后新建一个 XHR 对象，原因不明。
// TODO: 也可以像大多数库那样，不重用 XHR 对象。
(function() {
//==================================================[Request]
  /*
   * 调用流程：
   *   var request = new Request(url, options);
   *   request.send(data) -> request.onBeforeRequest(data) -> [request.abort()] -> request.onBeforeResponse(response) -> request.onResponse(response)
   *
   * 说明：
   *   上述 data/response 均为不可预期的数据，因此可以通过修改选项 onBeforeRequest 和 onBeforeResponse 这两个函数，来对他们进行进一步操作。
   *
   * 注意：
   *   IE6 IE7 IE8 IE9 均不支持 overrideMimeType，因此本组件不提供此功能。
   *   同样的原因，W3C 的 XMLHttpRequest 草案中提及的，其他不能被上述浏览器支持的相关内容也不提供。
   */

  // 请求状态。
  var DONE = 0;
  var ABORT = -1;
  var TIMEOUT = -2;

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
    if (request.timer) {
      clearTimeout(request.timer);
      delete request.timer;
    }
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
    // 发送响应信息。
    var sendResponse = function() {
      request.onResponse(request.onBeforeResponse({
        status: status,
        statusText: statusText,
        headers: headers,
        text: text,
        xml: xml
      }));
    };
    request.async ? setTimeout(sendResponse, Math.max(0, Number.toInteger(request.minTime - (Date.now() - request.timestamp)))) : sendResponse();
  };

//--------------------------------------------------[Request Constructor]
  /**
   * 创建一个请求对象，用来对一个指定的资源发起请求，并在获取响应后进行处理。
   * @name Request
   * @constructor
   * @param {string} url 请求地址。
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Request.options 中。
   * @param {string} options.username 用户名。
   * @param {string} options.password 密码。
   * @param {string} options.method 请求方法，默认为 'post'。
   * @param {Object} options.headers 要设置的 request headers，格式为 {key: value, ...} 的对象。
   * @param {string} options.contentType 发送数据的内容类型，默认为 'application/x-www-form-urlencoded'，method 为 'post' 时有效。
   * @param {boolean} options.useCache 是否允许浏览器的缓存生效，默认为 true。
   * @param {boolean} options.async 是否使用异步方式，默认为 true。
   * @param {number} options.minTime 请求最短时间，单位为 ms，默认为 NaN，即无最短时间限制，async 为 true 时有效。
   * @param {number} options.maxTime 请求超时时间，单位为 ms，默认为 NaN，即无超时时间限制，async 为 true 时有效。
   * @param {Function} options.onBeforeRequest 发送请求前触发，传入请求数据，需要返回处理后的字符串数据，当返回 false 时则取消本次请求。
   * @param {Function} options.onBeforeResponse 收到响应前触发，传入响应数据，需要返回处理后的响应数据。
   * @param {Function} options.onResponse 收到响应时触发，参数为包含响应信息的一个对象。
   */
  function Request(url, options) {
    this.xhr = getXHRObject();
    this.url = url;
    Object.append(this, Object.append(Object.clone(Request.options, true), options));
  }

  window.Request = Request;

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
    var xhr = request.xhr;
    // 只有进行中的请求有 timestamp 属性，需等待此次交互结束才能再次发起请求。若无 xhr 对象，则无法发起请求。
    if (request.timestamp || !xhr) {
      return request;
    }
    // 如果 onBeforeRequest 返回 false，则停止发送请求。
    data = request.onBeforeRequest(data);
    if (data === false) {
      return request;
    }
    // 创建请求。
    var url = request.url;
    var method = request.method.toLowerCase();
    if (method === 'get' && data) {
      url += (url.contains('?') ? '&' : '?') + data;
      data = null;
    }
    if (!request.useCache) {
      url += (url.contains('?') ? '&' : '?') + ++uid;
    }
    // http://bugs.jquery.com/ticket/2865
    if (request.username) {
      xhr.open(method, url, request.async, request.username, request.password);
    } else {
      xhr.open(method, url, request.async);
    }
    // 设置请求头。
    var headers = request.headers;
    if (method === 'post') {
      headers['Content-Type'] = this.contentType;
    }
    for (var name in headers) {
      xhr.setRequestHeader(name, headers[name]);
    }
    // 发送请求。
    xhr.send(data || null);
    request.timestamp = Date.now();
    if (request.async && request.maxTime > 0) {
      request.timer = setTimeout(function() {
        getResponse(request, TIMEOUT);
      }, request.maxTime);
    }
    // 获取响应。
    if (!request.async || xhr.readyState === 4) {
      // IE 使用 ActiveXObject 创建的 XHR 对象即便在异步模式下，如果访问地址已被浏览器缓存，将直接改变 readyState 为 4，并且不会触发 onreadystatechange 事件。
      getResponse(request, DONE);
    } else {
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          getResponse(request, DONE);
        }
      };
    }
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
    if (this.timestamp) {
      // 不在此处调用 xhr.abort()，统一在 getResponse 中处理，可以避免依赖 readystatechange，逻辑更清晰。
      getResponse(this, ABORT);
    }
    return this;
  };

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
    minTime: 0,
    maxTime: 0,
    onBeforeRequest: function(data) {
      return data ? data + '' : null;
    },
    onBeforeResponse: function(response) {
      return response;
    },
    onResponse: empty
  };

})();

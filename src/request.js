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
   * 对一个指定的资源发起请求，并获取响应数据。
   * @name Request
   * @constructor
   * @param {string} url 请求地址。
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Request.options 中。
   * @param {string} options.username 用户名，默认为空字符串，即不指定用户名。
   * @param {string} options.password 密码，默认为空字符串，即不指定密码。
   * @param {string} options.method 请求方法，默认为 'get'。
   * @param {Object} options.headers 要设置的 request headers，格式为 {key: value, ...} 的对象，默认为 {'X-Requested-With': 'XMLHttpRequest', 'Accept': '*&#47;*'}。
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
   *   成功调用 send 方法后，发送请求前触发。
   * @fires request
   *   {Object} event.data 解析后的请求数据。
   *   发送请求前触发。
   * @fires response
   *   {*} event.* 解析后的响应数据。
   *   收到响应后触发。
   * @fires abort
   *   成功调用 abort 方法后触发。
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
   * @returns {Object} Request 对象。
   */
  Request.prototype.send = function(data) {
    var request = this;
    var options = request.options;
    var xhr = request.xhr;
    // 只有进行中的请求有 timestamp 属性，需等待此次交互结束（若设置了 minTime 则交互结束的时间可能被延长）才能再次发起请求。若无 xhr 对象，则无法发起请求。
    if (request.timestamp || !xhr) {
      return request;
    }
    // 触发 send 事件。
    request.fire('send', {data: data});
    // 处理请求数据。
    data = options.requestParser(data);
    // 触发请求事件。
    request.fire('request', {data: data});
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
    // 返回实例。
    return request;
  };

//--------------------------------------------------[Request.prototype.abort]
  /**
   * 取消请求，仅在 Request 设置为异步模式时可用。
   * @name Request.prototype.abort
   * @function
   * @returns {Object} Request 对象。
   */
  Request.prototype.abort = function() {
    var request = this;
    if (request.timestamp) {
      // 不在此处调用 xhr.abort()，统一在 getResponse 中处理，可以避免依赖 readystatechange，逻辑更清晰。
      getResponse(request, ABORT);
      request.fire('abort', null);
    }
    return request;
  };

//--------------------------------------------------[Request]
  window.Request = new Component(Request, Request.options, Request.prototype);

})();

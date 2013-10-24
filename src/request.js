/**
 * @fileOverview 远程请求
 * @author sundongguo@gmail.com
 * @version 20120921
 */

(function(window) {
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
  var reHeaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
  var parseXHRHeaders = function(rawHeaders) {
    var headers = {};
    var match;
    while (match = reHeaders.exec(rawHeaders)) {
      headers[match[1]] = match[2];
    }
    return headers;
  };

  // 数据传输已完成，应用最短时间设置。
  var transferComplete = function(request) {
    if (!request.sync && Number.isFinite(request.minTime)) {
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
   * @param {string} [options.mode] 请求模式，可选值为 'xhr'（启用 XHR 模式）和 'jsonp'（启用 JSONP 模式），大小写不敏感，默认为 'xhr'。
   * @param {string} [options.method] 请求方法，仅在 XHR 模式下有效，可以使用 'get' 和 'post'，大小写不敏感，默认为 'get'。
   *   在 JSONP 模式下，永远使用 'get' 方法进行请求。
   *   当使用 'get' 方法进行请求时，应将整个 URL 的长度控制在 2048 个字符以内。
   * @param {boolean} [options.noCache] 是否禁用浏览器的缓存，仅在 XHR 模式下有效，默认启用浏览器的缓存。
   *   在 JSONP 模式下，永远禁用浏览器的缓存。
   * @param {boolean} [options.sync] 是否使用同步方式进行请求，仅在 XHR 模式下有效，默认使用异步方式进行请求。
   *   在 JSONP 模式下，永远使用异步方式进行请求。
   * @param {number} [options.minTime] 请求最短时间，仅在使用异步方式进行请求时有效，单位为毫秒，默认为 NaN，即无最短时间限制。
   * @param {number} [options.maxTime] 请求超时时间，仅在使用异步方式进行请求时有效，单位为毫秒，默认为 NaN，即无超时时间限制。
   * @param {string} [options.username] 用户名，仅在 XHR 模式下有效，默认为空字符串，即不指定用户名。
   * @param {string} [options.password] 密码，仅在 XHR 模式下有效，默认为空字符串，即不指定密码。
   * @param {Object} [options.headers] 请求头的内容，仅在 XHR 模式下有效，格式为 {key: value, ...}，默认为 {'X-Requested-With': 'XMLHttpRequest', 'Accept': '*&#47;*'}。
   * @param {string} [options.contentType] 发送的数据类型，仅在 XHR 模式下且 method 为 'post' 时有效，默认为 'application/x-www-form-urlencoded'。
   * @param {string} [options.callbackName] 保存 JSONP 前缀的参数名，服务端应将该参数的值作为输出 JSONP 时的前缀使用，仅在 JSONP 模式下有效，大小写敏感，默认为 'callback'。
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
   *     <li>{?XMLDocument} <dfn>xml</dfn> 响应 XML 文档。</li>
   *   </ul>
   *   JSONP 模式的请求结果中包含以下属性：
   *   <ul>
   *     <li>{number} <dfn>status</dfn> 状态码。</li>
   *     <li>{string} <dfn>statusText</dfn> 状态描述。</li>
   *     <li>{*} <dfn>data</dfn> 请求结果。</li>
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
        Object.mixin(this, options, {whiteList: ['mode', 'method', 'noCache', 'sync', 'minTime', 'maxTime', 'username', 'password', 'headers', 'contentType']});
        break;
      case 'jsonp':
        options.method = 'get';
        options.noCache = true;
        options.sync = false;
        Object.mixin(this, options, {whiteList: ['mode', 'method', 'noCache', 'sync', 'minTime', 'maxTime', 'callbackName']});
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
    noCache: false,
    sync: false,
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
      // 请求开始进行。
      request.ongoing = true;
      request.timestamp = Date.now();
      // 触发 start 事件。
      request.fire('start');
      // 序列化请求数据。如果请求数据为空，则统一使用 null 表示。
      requestData = requestData ? Object.toQueryString(requestData) : null;
      // 发送 XHR 或 JSONP 模式的请求。
      var url = request.url;
      var method = request.method;
      if (method === 'get' && requestData) {
        url += (url.contains('?') ? '&' : '?') + requestData;
        requestData = null;
      }
      var inSync = request.sync;
      switch (request.mode) {
        case 'xhr':
          if (request.noCache) {
            url += (url.contains('?') ? '&' : '?') + '_=' + (++uid).toString(36);
          }
          var xhr = request.xhr = getXHRObject();
          // 准备请求。
          xhr.open(method, url, !inSync, request.username, request.password);
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
          if (inSync || xhr.readyState === 4) {
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
      if (!inSync && Number.isFinite(request.maxTime)) {
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

})(window);

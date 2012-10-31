/**
 * @fileOverview 从指定的资源获取数据。
 * @author sundongguo@gmail.com
 * @version 20120921
 */

(function() {
//==================================================[同域请求]
  /*
   * 调用流程：
   *   var request = new Request(url, options);
   *   request.send(requestData)<send> -> requestParser(requestData)<start> -> responseParser(responseData)<finish>
   *                                                                        -> request.abort()<abort>
   *
   * 说明：
   *   用户使用 send 方法传递的请求数据与服务端返回的响应数据均不可预期，因此可以通过修改选项中的 requestParser 和 responseParser 这两个函数以对它们进行预处理。
   *
   * 更新记录：
   *   版本 20120208 的实现是每个 request 仅创建一个 XHR 对象，多次发送请求则重复使用。
   *   考虑到同一 request 的不同请求调用 setRequestHeader 时传入的值可能不同，版本 20120921 修改为不重用 XHR 对象，以免出现预料外的问题。
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

  // 正在请求中的 request 对象。
  var activeRequests = [];
  // http://bugs.jquery.com/ticket/5280
  if (window.ActiveXObject) {
    window.on('unload', function() {
      activeRequests.forEach(function(request) {
        request.abort();
      });
    });
  }

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
  var headersPattern = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
  var getHeaders = function(rawHeaders) {
    var headers = {};
    var match;
    while (match = headersPattern.exec(rawHeaders)) {
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
      if (Number.isFinite(options.minTime)) {
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
          }, Math.max(0, options.minTime - (Date.now() - request.timestamp)));
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
    // 请求完毕。
    request.ongoing = false;
    // 重置请求状态。
    delete request.timestamp;
    delete request.xhr;
    activeRequests.remove(request);
    // 触发 finish 事件。
    request.fire('finish', options.responseParser.call(request, {
      status: status,
      statusText: statusText,
      headers: headers,
      text: text,
      xml: xml
    }));
  };

//--------------------------------------------------[Request]
  /**
   * 对本域内的一个指定的资源发起请求，并获取响应数据。
   * @name Request
   * @constructor
   * @param {string} url 请求地址。
   * @param {Object} [options] 可选项。
   * @param {string} options.username 用户名，默认为空字符串，即不指定用户名。
   * @param {string} options.password 密码，默认为空字符串，即不指定密码。
   * @param {string} options.method 请求方法，默认为 'get'。
   * @param {Object} options.headers 要设置的 request headers，格式为 {key: value, ...} 的对象，默认为 {'X-Requested-With': 'XMLHttpRequest', 'Accept': '*&#47;*'}。
   * @param {string} options.contentType 发送数据的内容类型，默认为 'application/x-www-form-urlencoded'，method 为 'post' 时有效。
   * @param {boolean} options.useCache 是否允许浏览器的缓存生效，默认为 true。
   * @param {boolean} options.async 是否使用异步方式，默认为 true。
   * @param {number} options.minTime 请求最短时间，单位为 ms，默认为 NaN，即无最短时间限制，async 为 true 时有效。
   * @param {number} options.maxTime 请求超时时间，单位为 ms，默认为 NaN，即无超时时间限制，async 为 true 时有效。
   * @param {Function} options.requestParser 请求数据解析器，传入请求数据，该函数应返回解析后的字符串，默认将请求数据转换为字符串，若请求数据为空则转换为空字符串。
   *   原始请求数据无特殊要求。
   *   解析后的请求数据应该是一个字符串，并且该字符串会被赋予 start 事件对象的 data 属性。
   *   该函数被调用时 this 的值为本组件的实例对象。
   * @param {Function} options.responseParser 响应数据解析器，传入响应数据，该函数应返回解析后的对象，默认无特殊处理。
   *   原始响应数据中包含以下属性：
   *   {number} responseData.status 状态码。
   *   {string} responseData.statusText 状态描述。
   *   {Object} responseData.headers 响应头。
   *   {string} responseData.text 响应文本。
   *   {XMLDocument} responseData.xml 响应 XML 文档。
   *   解析后的响应数据无特殊要求，但要注意，解析后的数据对象的属性将被追加到 finish 事件对象中。
   *   该函数被调用时 this 的值为本组件的实例对象。
   * @fires send
   *   {Object} event.data 要发送的数据。
   *   成功调用 send 方法后，解析请求数据前触发。
   * @fires start
   *   {Object} event.data 解析后的请求数据。
   *   解析请求数据后，开始发送请求前触发。
   * @fires finish
   *   {*} event.* 解析后的响应数据。
   *   请求结束并解析响应数据后触发。
   *   只要调用了 send 方法就必然会触发此事件。在调用 abort 方法取消请求，或请求超时的情况下，也会收到模拟的响应数据并传入 responseParser（此时的状态码分别为 -498 和 -408）。
   *   这样设计的好处是在请求结束时可以统一处理一些状态的设定或恢复，如将 start 事件监听器中呈现到用户界面的提示信息隐藏。
   * @fires abort
   *   成功调用 abort 方法后触发。
   * @description
   *   所有 Request 的实例都具备 Observable 特性。
   *   每个 Request 的实例都对应一个资源，实例创建后可以重复使用。
   */
  var Request = window.Request = function(url, options) {
    this.url = url;
    this.options = Object.mixin(Object.clone(Request.options), options || {}, {whiteList: Object.keys(Request.options)});
    /**
     * 请求是否正在进行中。
     * @name Request#ongoing
     * @type boolean
     */
    this.ongoing = false;
    Observable.applyTo(this);
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
    requestParser: function(requestData) {
      return requestData ? requestData + '' : '';
    },
    responseParser: function(responseData) {
      return responseData;
    }
  };

//--------------------------------------------------[Request.prototype.send]
  /**
   * 发送请求。
   * @name Request.prototype.send
   * @function
   * @param {*} [requestData] 要发送的数据。
   * @returns {Object} Request 对象。
   * @description
   *   如果上一次发送的请求尚未完成，则调用此方法无效。
   */
  Request.prototype.send = function(requestData) {
    var request = this;
    // 如果请求正在进行中，则需等待此次交互结束（若设置了 minTime 则交互结束的时间可能被延长）才能再次发起请求。
    if (!request.ongoing) {
      var xhr = request.xhr = getXHRObject();
      // 若无 xhr 对象，则无法发起请求。
      if (xhr) {
        var options = request.options;
        // 触发 send 事件。
        request.fire('send', {data: requestData});
        // 处理请求数据。
        requestData = options.requestParser.call(request, requestData);
        // 请求开始进行。
        request.ongoing = true;
        // 触发 start 事件。
        request.fire('start', {data: requestData});
        // 创建请求。
        var url = request.url;
        var method = options.method.toLowerCase();
        var async = options.async;
        if (method === 'get' && requestData) {
          url += (url.contains('?') ? '&' : '?') + requestData;
          requestData = '';
        }
        if (!options.useCache) {
          url += (url.contains('?') ? '&' : '?') + '_=' + (++uid).toString(36);
        }
        // http://bugs.jquery.com/ticket/2865
        if (options.username) {
          xhr.open(method, url, async, options.username, options.password);
        } else {
          xhr.open(method, url, async);
        }
        // 设置请求头。
        if (method === 'post') {
          xhr.setRequestHeader('Content-Type', options.contentType);
        }
        Object.forEach(options.headers, function(value, key) {
          xhr.setRequestHeader(key, value);
        });
        // 发送请求。
        xhr.send(requestData || null);
        request.timestamp = Date.now();
        if (async && Number.isFinite(options.maxTime)) {
          request.maxTimeTimer = setTimeout(function() {
            getResponse(request, TIMEOUT);
          }, Math.max(0, options.maxTime));
        }
        activeRequests.push(request);
        // 获取响应。
        if (!async || xhr.readyState === 4) {
          // IE 使用 ActiveXObject 创建的 XHR 对象即便在异步模式下，如果访问地址已被浏览器缓存，将直接改变 readyState 为 4，并且不会触发 onreadystatechange 事件。
          getResponse(request, DONE);
        } else {
          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
              getResponse(request, DONE);
            }
          };
        }
      }
    }
    // 返回实例。
    return request;
  };

//--------------------------------------------------[Request.prototype.abort]
  /**
   * 取消请求。
   * @name Request.prototype.abort
   * @function
   * @returns {Object} Request 对象。
   * @description
   *   仅在一次异步模式的请求正在进行时，调用此方法才有效。
   */
  Request.prototype.abort = function() {
    var request = this;
    if (request.ongoing) {
      // 不在此处调用 xhr.abort()，统一在 getResponse 中处理，可以避免依赖 readystatechange，逻辑更清晰。
      getResponse(request, ABORT);
      request.fire('abort');
    }
    return request;
  };

})();

(function() {
//==================================================[跨域请求]
  /*
   * 调用流程：
   *   var jsonpRequest = new JSONPRequest(url, options);
   *   jsonpRequest.send(requestData)<send> -> requestParser(requestData)<start> -> responseParser(responseData)<finish>
   *
   * 说明：
   *   用户使用 send 方法传递的请求数据与服务端返回的响应数据均不可预期，因此可以通过修改选项中的 requestParser 和 responseParser 这两个函数以对它们进行预处理。
   *
   * 注意：
   *   JSONPRequest 一旦开始请求即不可取消，因此没有 minTime、maxTime 的设定，也不提供 abort 方法。
   */

  // 唯一识别码。
  var uid = Date.now();

//--------------------------------------------------[JSONPRequest]
  /**
   * 对其他域内一个指定的资源发起异步请求，并获取响应数据。
   * @name JSONPRequest
   * @constructor
   * @param {string} url 请求地址。
   * @param {Object} [options] 可选项。
   * @param {string} options.getPrefixFrom 指定服务端将从哪个参数获取返回的 JSONP 格式数据的前缀，默认为 'callback'。
   * @param {Function} options.requestParser 请求数据解析器，传入请求数据，该函数应返回解析后的字符串，默认将请求数据转换为字符串，若请求数据为空则转换为空字符串。
   *   原始请求数据无特殊要求。
   *   解析后的请求数据应该是一个字符串，并且该字符串会被赋予 start 事件对象的 data 属性。
   *   该函数被调用时 this 的值为本组件的实例对象。
   * @param {Function} options.responseParser 响应数据解析器，传入响应数据，该函数应返回解析后的对象，默认无特殊处理。
   *   原始响应数据中包含以下属性：
   *   {*} responseData.data 服务端返回的响应数据。
   *   解析后的响应数据无特殊要求，但要注意，解析后的数据对象的属性将被追加到 finish 事件对象中。
   *   该函数被调用时 this 的值为本组件的实例对象。
   * @fires send
   *   {Object} event.data 要发送的数据。
   *   成功调用 send 方法后，解析请求数据前触发。
   * @fires start
   *   {Object} event.data 解析后的请求数据。
   *   解析请求数据后，开始发送请求前触发。
   * @fires finish
   *   {*} event.* 解析后的响应数据。
   *   请求结束并解析响应数据后触发。
   * @description
   *   所有 JSONPRequest 的实例都具备 Observable 特性。
   *   每个 JSONPRequest 的实例都对应一个资源，实例创建后可以重复使用。
   *   服务端在设计对应的接口时，应以 JSONP 的格式返回数据。如果服务端没有返回任何文本数据（如仅返回状态码），JSONP 请求将出现错误。
   *   由于 JSONP 请求的原理是直接执行另一个域内的脚本，因此它并不安全。如果通过 JSONP 请求的域遭到攻击，本域也可能会受到影响。
   */
  var JSONPRequest = window.JSONPRequest = function(url, options) {
    this.url = url;
    this.options = Object.mixin(Object.clone(JSONPRequest.options), options || {}, {whiteList: Object.keys(JSONPRequest.options)});
    /**
     * 请求是否正在进行中。
     * @name JSONPRequest#ongoing
     * @type boolean
     */
    this.ongoing = false;
    Observable.applyTo(this);
  };

//--------------------------------------------------[JSONPRequest.options]
  /**
   * 默认选项。
   * @name JSONPRequest.options
   * @type Object
   * @description
   *   修改 JSONPRequest.options 即可更改 JSONPRequest 的默认选项，新的默认选项仅对后续创建的实例生效。
   */
  JSONPRequest.options = {
    getPrefixFrom: 'callback',
    requestParser: function(requestData) {
      return requestData ? requestData + '' : '';
    },
    responseParser: function(responseData) {
      return responseData;
    }
  };

//--------------------------------------------------[JSONPRequest.prototype.send]
  /**
   * 发送请求。
   * @name JSONPRequest.prototype.send
   * @function
   * @param {*} [requestData] 要发送的数据。
   * @returns {Object} JSONPRequest 对象。
   * @description
   *   如果上一次发送的请求尚未完成，则调用此方法无效。
   */
  JSONPRequest.prototype.send = function(requestData) {
    var jsonpRequest = this;
    // 如果请求正在进行中，则需等待此次交互结束才能再次发起请求。
    if (!jsonpRequest.ongoing) {
      var options = jsonpRequest.options;
      // 触发 send 事件。
      jsonpRequest.fire('send', {data: requestData});
      // 处理请求数据。
      requestData = options.requestParser.call(jsonpRequest, requestData);
      // 请求开始进行。
      jsonpRequest.ongoing = true;
      // 触发 start 事件。
      jsonpRequest.fire('start', {data: requestData});
      // 准备请求。
      var url = jsonpRequest.url;
      var requestId = 'x' + (++uid).toString(36);
      if (requestData) {
        url += (url.contains('?') ? '&' : '?') + requestData;
      }
      url += (url.contains('?') ? '&' : '?') + options.getPrefixFrom + '=JSONPRequest.' + requestId;
      // 准备回调函数，获取响应。
      JSONPRequest[requestId] = function(data) {
        // 请求完毕。
        jsonpRequest.ongoing = false;
        // 触发 finish 事件。
        jsonpRequest.fire('finish', {data: options.responseParser.call(jsonpRequest, data)});
        delete JSONPRequest[requestId];
      };
      // 发送请求。
      document.loadScript(url);
    }
    // 返回实例。
    return jsonpRequest;
  };

})();

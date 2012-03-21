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
   */
  window.declareModule = function(id, moduleFunction) {
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
        handlers && handlers.forEach(function(handler) {
          handler(data);
        });
      }
    };

    // 运行模块函数。
    moduleFunction(listen, notify);
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
   */
  window.runApplication = function(applicationFunction) {
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
          cachedData && cachedData.forEach(function(data) {
            handler(data);
          });
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
        handlers && handlers.forEach(function(handler) {
          handler(data);
        });
      }
    };

    // 运行应用函数。
    applicationFunction(listen, notify);

    // 清除应用尚未启动时收到的消息缓存（丢弃未处理的消息）。
    delete applicationMessageHandlerPool.cache;

  };

})();

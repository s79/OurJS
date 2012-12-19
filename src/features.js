/**
 * @fileOverview 特性。
 * @author sundongguo@gmail.com
 * @version 20120820
 */

(function() {
//==================================================[特性 - 可观察的]
  /*
   * 特性 - 可观察的。
   *
   * 提供实例属性：
   *   events
   *   <Object events> {
   *     <string type>: <Array handlers> [
   *       <Object handler>: {
   *         name: <string name>
   *         listener: <Function listener>
   *       }
   *     ]
   *   }
   *
   * 提供静态方法：
   *   applyTo
   *
   * 提供实例方法：
   *   on
   *   off
   *   fire
   */

  var separator = /\s*,\s*/;

  var eventNamePattern = /^(\w+)(\.\w+)?$/;
  var parseEventName = function(eventName) {
    var result = {};
    var match;
    if (eventName && (match = eventName.match(eventNamePattern))) {
      result.type = match[1];
      result.label = match[2] || '';
    }
    if (result.type + result.label !== eventName) {
      throw new SyntaxError('Invalid event name "' + eventName + '"');
    }
    return result;
  };

//--------------------------------------------------[Observable]
  /**
   * 可观察的特性。
   * @name Observable
   * @constructor
   * @description
   *   具备此特性的对象即具备处理事件的能力。
   */
  var Observable = window.Observable = function() {
    this.events = {};
  };

//--------------------------------------------------[Observable.applyTo]
  /**
   * 将可观察的特性应用到目标对象。
   * @name Observable.applyTo
   * @function
   * @param {Object} target 目标对象。
   * @returns {Object} 目标对象。
   */
  Observable.applyTo = function(target) {
    this.call(target);
    Object.mixin(target, this.prototype);
    return target;
  };

//--------------------------------------------------[Observable.prototype.on]
  /**
   * 为本对象添加事件监听器。
   * @name Observable.prototype.on
   * @function
   * @param {string} name 事件名称，格式为 <dfn><var>type</var>.<var>label</var></dfn>，详细信息请参考下表。
   *   使用逗号分割多个事件名称，即可同时为多个事件注册同一个监听器。
   *   <table>
   *     <tr><th></th><th>是否必选</th><th>详细描述</th></tr>
   *     <tr><td><dfn><var>type</var></dfn></td><td>必选</td><td>要监听的事件类型</td></tr>
   *     <tr><td><dfn>.<var>label</var></dfn></td><td>可选</td><td>给事件类型加上标签，以便调用 off 方法时精确匹配要删除的事件监听器。<br>不打算删除的事件监听器没有必要指定标签。</td></tr>
   *   </table>
   * @param {Function} listener 事件监听器。
   *   该函数被调用时 this 的值为本对象。
   * @returns {Object} 本对象。
   */
  Observable.prototype.on = function(name, listener) {
    var events = this.events;
    name.split(separator).forEach(function(name) {
      var type = parseEventName(name).type;
      var handlers = events[type] || (events[type] = []);
      handlers.push({name: name, listener: listener});
    });
    return this;
  };

//--------------------------------------------------[Observable.prototype.off]
  /**
   * 删除本对象上已添加的事件监听器。
   * @name Observable.prototype.off
   * @function
   * @param {string} name 事件名称。本对象上添加的所有名称与 name 匹配的监听器都将被删除。
   *   使用逗号分割多个事件名称，即可同时删除多种名称的事件监听器。
   * @returns {Object} 本对象。
   */
  Observable.prototype.off = function(name) {
    var events = this.events;
    name.split(separator).forEach(function(name) {
      var type = parseEventName(name).type;
      var handlers = events[type];
      if (handlers) {
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
      }
    });
    return this;
  };

//--------------------------------------------------[Observable.prototype.fire]
  /**
   * 触发本对象的某类事件，运行相关的事件监听器。
   * @name Observable.prototype.fire
   * @function
   * @param {string} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   * @returns {Object} 事件对象。
   */
  Observable.prototype.fire = function(type, data) {
    var target = this;
    var event = Object.mixin({type: type, target: target}, data || {});
    var handlers = target.events[type];
    if (handlers) {
      handlers.forEach(function(handler) {
        handler.listener.call(target, event);
      });
    }
    return event;
  };

})();

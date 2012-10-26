/**
 * @fileOverview 特性。
 * @author sundongguo@gmail.com
 * @version 20120820
 */

(function() {
//==================================================[特性 - 可配置的]
  /*
   * 特性 - 可配置的。
   *
   * 提供实例属性：
   *   config
   *   <Object config> {
   *     key: value
   *   }
   *
   * 提供静态方法：
   *   applyTo
   *
   * 提供原型方法：
   *   setConfig
   */

//--------------------------------------------------[Configurable]
  /**
   * 创建一个对象，该对象将具备可配置的特性。
   * @name Configurable
   * @constructor
   * @param {Object} defaultConfig 默认配置。
   * @description
   *   具备此特性的对象即具备更改配置的能力。
   *   本特性只能在更改配置时保证配置信息的有效性（无法在配置数据中增加默认配置中不存在的项），开发者应设计可以使更改后的配置能够即时生效的逻辑。
   */
  var Configurable = window.Configurable = function(defaultConfig) {
    this.config = defaultConfig;
  };

//--------------------------------------------------[Configurable.applyTo]
  /**
   * 将可配置的特性应用到目标对象。
   * @name Configurable.applyTo
   * @function
   * @param {Object} target 目标对象。
   * @returns {Object} 目标对象。
   */
  Configurable.applyTo = function(target, defaultConfig) {
    this.call(target, defaultConfig);
    Object.mixin(target, this.prototype);
    return target;
  };

//--------------------------------------------------[Configurable.prototype.setConfig]
  /**
   * 为本对象更改配置。
   * @name Configurable.prototype.setConfig
   * @function
   * @param {Object} config 新配置，用于覆盖旧配置，因此旧配置中原本不存在的属性不会被添加。
   * @returns {Object} 本对象的当前配置。
   */
  Configurable.prototype.setConfig = function(config) {
    Object.mixin(this.config, config || {}, {whiteList: Object.keys(this.config)});
    return this.config;
  };

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
   *   };
   *
   * 提供静态方法：
   *   applyTo
   *
   * 提供原型方法：
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
   * 创建一个对象，该对象将具备可观察的特性。
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

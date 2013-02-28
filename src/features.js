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
   *   eventHandlers
   *   <Object eventHandlers> {
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

  var eventNamePattern = /^([a-zA-Z]+)|\[([a-zA-Z]+(?:&[a-zA-Z]+)+)\](?:\.\w+)?$/;
  var combinedSeparator = /&/;
  var getEventType = function(name) {
    var match = name.match(eventNamePattern);
    if (match === null) {
      throw new SyntaxError('Invalid event name "' + name + '"');
    }
    return match[1] || match[2].split(combinedSeparator);
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
    this.eventHandlers = {};
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
   * @param {string} name 事件名称，格式为 <dfn><var>type</var>.<var>label</var></dfn> 或 <dfn>[<var>type1</var>&<var>type2</var>&<var>…</var>].<var>label</var></dfn>，详细信息请参考下表：
   *   <table>
   *     <tr><th></th><th>是否必选</th><th>详细描述</th></tr>
   *     <tr><td><dfn><var>type</var></dfn></td><td>独立监听器必选</td><td>要监听的事件类型。</td></tr>
   *     <tr><td><dfn>[<var>type1</var>&<var>type2</var>&<var>…</var>]</dfn></td><td>组合监听器必选</td><td>要监听的事件类型的组合，应至少指定两种类型。<br>仅当指定的所有类型的事件都已发生过时，对应的监听器才会被调用。</td></tr>
   *     <tr><td><dfn>.<var>label</var></dfn></td><td>可选</td><td>指定事件应用场景的标签，以便在调用 off 方法时能够精确匹配要删除的监听器。<br>不打算删除的监听器没有必要指定标签。</td></tr>
   *   </table>
   *   其中 <var>type</var> 只能使用英文字母，<var>label</var> 可以使用英文字母、数字和下划线。
   *   使用逗号分割多个事件名称，即可为多种类型的事件注册同一个监听器。
   * @param {Function} listener 监听器。
   *   该函数将在对应的事件发生时被调用，传入事件对象作为参数。
   *   <ul>
   *     <li>如果是独立监听器，则只传入本次监听到的事件对象。</li>
   *     <li>如果是组合监听器，则以注册时的次序，逐个传入对应事件类型发生时产生的事件对象。</li>
   *   </ul>
   *   该函数被调用时 this 的值为本对象。
   * @returns {Object} 本对象。
   */
  var addListener = function(target, type, name, listener) {
    var eventHandlers = target.eventHandlers;
    var handlers = eventHandlers[type] || (eventHandlers[type] = []);
    handlers.push({name: name, listener: listener});
  };
  Observable.prototype.on = function(name, listener) {
    var target = this;
    name.split(separator).forEach(function(name) {
      var type = getEventType(name);
      if (typeof type === 'string') {
        // 独立监听器。
        addListener(target, type, name, listener);
      } else {
        // 组合监听器。
        var firedEvents = [];
        type.forEach(function(type, index, types) {
          addListener(target, type, name, function(event) {
            firedEvents[index] = event;
            var current = types.length;
            while (firedEvents.hasOwnProperty(--current)) {
            }
            if (current === -1) {
              listener.apply(target, firedEvents);
            }
          });
        });
      }
    });
    return this;
  };

//--------------------------------------------------[Observable.prototype.off]
  /**
   * 删除本对象上已添加的事件监听器。
   * @name Observable.prototype.off
   * @function
   * @param {string} name 事件名称。本对象上添加的所有名称与 name 匹配的监听器都将被删除。
   *   使用逗号分割多个事件名称，即可同时删除该对象上的多个监听器。
   * @returns {Object} 本对象。
   */
  var removeListener = function(target, type, name) {
    var eventHandlers = target.eventHandlers;
    var handlers = eventHandlers[type];
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
        delete eventHandlers[type];
      }
    }
  };
  Observable.prototype.off = function(name) {
    var target = this;
    name.split(separator).forEach(function(name) {
      var type = getEventType(name);
      if (typeof type === 'string') {
        // 独立监听器。
        removeListener(target, type, name);
      } else {
        // 组合监听器。
        type.forEach(function(type) {
          removeListener(target, type, name);
        });
      }
    });
    return this;
  };

//--------------------------------------------------[Observable.prototype.fire]
  /**
   * 触发本对象的某类事件。
   * @name Observable.prototype.fire
   * @function
   * @param {string} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   * @returns {Object} 事件对象。
   */
  Observable.prototype.fire = function(type, data) {
    var target = this;
    var event = Object.mixin({type: type, target: target}, data || {});
    var handlers = target.eventHandlers[type];
    if (handlers) {
      handlers.forEach(function(handler) {
        handler.listener.call(target, event);
      });
    }
    return event;
  };

})();

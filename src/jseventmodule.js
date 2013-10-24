/**
 * @fileOverview JSEventModule
 * @author sundongguo@gmail.com
 * @version 20130509
 */

(function(window) {
//==================================================[JS 事件模型]
  /*
   * 为 JS 对象提供的事件模型。
   *
   * 相关名词的解释如下：
   *   事件对象 (event)：
   *     本事件模型提供的事件对象，包含与此事件有关的信息，是 JSEvent 的实例。
   *   分发：
   *     在一个指定的对象上，将 event 作为参数逐个传入该对象相应的监听器。
   *   监听器 (listener)：
   *     添加到一个对象的、监听某种类型的事件的函数。
   *     当此对象上的某种类型的事件被触发时，对应的监听器会被调用，并传入 event 作为其唯一的参数。
   *   监听器名称 (name)：
   *     由要监听的 type 和 label 组成，其中 type 是必选的。
   *   事件类型 (type)：
   *     事件的类型。
   *   标签 (label)：
   *     在 name 的末尾添加 label 可以使相同对象上添加的相同类型、相同行为的监听器具备不同的名称。不同的名称可以确保调用 off 方法时能够精确匹配要删除的监听器。
   *
   * 添加或删除监听器：
   *   通过调用 on 或 off 方法来添加或删除指定的监听器。
   *
   * 触发事件：
   *   通过调用 fire 方法来触发一个事件。
   *   fire 方法会自动创建、传播和分发 event。
   *
   * 提供对象：
   *   JSEvent
   *   JSEventTarget
   *
   * 提供静态方法：
   *   JSEventTarget.create
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
   * 提供实例方法：
   *   JSEventTarget.prototype.on
   *   JSEventTarget.prototype.off
   *   JSEventTarget.prototype.fire
   */

  var separator = /\s*,\s*/;

  var reEventName = /^([a-zA-Z]+)(?:\.\w+)?$/;
  var getEventType = function(name) {
    var match = name.match(reEventName);
    if (match === null) {
      throw new SyntaxError('Invalid listener name "' + name + '"');
    }
    return match[1];
  };

//--------------------------------------------------[JSEvent]
  /**
   * 事件对象。
   * @name JSEvent
   * @constructor
   * @param {string} type 事件类型。
   * @param {Object} target 触发本事件的对象。
   * @param {Object} [data] 附加数据。
   */
  var JSEvent = function(type, target, data) {
    this.type = type;
    this.target = target;
    if (data) {
      Object.mixin(this, data, {blackList: ['type', 'target']});
    }
  };

  /**
   * 事件类型。
   * @name JSEvent#type
   * @type string
   */

  /**
   * 触发事件的对象。
   * @name JSEvent#target
   * @type Object
   */

//--------------------------------------------------[JSEventTarget]
  /**
   * 所有的 JSEventTarget 对象都具备处理事件的能力，通过调用 new JSEventTarget() 获得的新对象，或经过 JSEventTarget.create(object) 处理后的 object 对象都是 JSEventTarget 对象。
   * @name JSEventTarget
   * @constructor
   * @description
   *   JSEventTarget 对象在处理事件时，是工作在 JS 事件模型中的。
   */
  var JSEventTarget = window.JSEventTarget = function() {
    this.eventHandlers = {};
  };

//--------------------------------------------------[JSEventTarget.create]
  /**
   * 让目标对象成为一个 JSEventTarget 对象，以具备处理事件的能力。
   * @name JSEventTarget.create
   * @function
   * @param {Object} target 目标对象。
   *   目标对象不应该是 window 对象、document 对象或 Element 的实例对象，因为这些对象是 DOMEventTarget 对象，使用的是 DOM 事件模型。
   * @returns {Object} 目标对象。
   * @description
   * * 目标对象将被添加实例属性 eventHandlers 用于保存处理事件所必需的数据。
   * * 目标对象将被添加实例方法 on 用于添加事件监听器。
   * * 目标对象将被添加实例方法 off 用于删除事件监听器。
   * * 目标对象将被添加实例方法 fire 用于触发某类事件。
   */
  JSEventTarget.create = function(target) {
    this.call(target);
    Object.mixin(target, this.prototype);
    return target;
  };

//--------------------------------------------------[JSEventTarget.prototype.on]
  /**
   * 为本对象添加事件监听器。
   * @name JSEventTarget.prototype.on
   * @function
   * @param {string} name 监听器名称。
   *   监听器名称由要监听的事件类型（必选）和标签（可选）组成，格式如下：
   *   <p><dfn><var>type</var></dfn>[<dfn>.<var>label</var></dfn>]</p>
   *   详细信息请参考下表：
   *   <table>
   *     <tr><th>组成部分</th><th>详细描述</th></tr>
   *     <tr>
   *       <td><dfn><var>type</var></dfn></td>
   *       <td>本监听器要监听的事件类型。<br><var>type</var> 只能使用大小写英文字母。</td>
   *     </tr>
   *     <tr>
   *       <td><dfn>.<var>label</var></dfn></td>
   *       <td>在监听器名称的末尾添加标签可以可以使相同对象上添加的相同类型、相同行为的监听器具备不同的名称。不同的名称可以确保调用 off 方法时能够精确匹配要删除的监听器。<br>添加具有明确含义的标签，可以最大限度的避免监听器被误删。<br><var>label</var> 可以使用英文字母、数字和下划线。</td>
   *     </tr>
   *   </table>
   *   使用逗号分割多个监听器名称，即可以在本对象上使用多个名称将同一个监听器添加多次。
   * @param {Function} listener 监听器。
   *   该函数将在对应的事件发生时被调用，传入事件对象作为参数。
   *   该函数被调用时 this 的值为监听到本次事件的对象。
   * @returns {Object} 本对象。
   */
  JSEventTarget.prototype.on = function(name, listener) {
    var eventHandlers = this.eventHandlers;
    name.split(separator).forEach(function(name) {
      var type = getEventType(name);
      var handlers = eventHandlers[type] || (eventHandlers[type] = []);
      handlers.push({name: name, listener: listener});
    });
    return this;
  };

//--------------------------------------------------[JSEventTarget.prototype.off]
  /**
   * 删除本对象上已添加的事件监听器。
   * @name JSEventTarget.prototype.off
   * @function
   * @param {string} name 监听器名称。
   *   本对象上添加的所有名称与 name 匹配的监听器都将被删除。
   *   使用逗号分割多个监听器名称，即可同时删除该对象上的多个监听器。
   * @returns {Object} 本对象。
   */
  JSEventTarget.prototype.off = function(name) {
    var eventHandlers = this.eventHandlers;
    name.split(separator).forEach(function(name) {
      var type = getEventType(name);
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
    });
    return this;
  };

//--------------------------------------------------[JSEventTarget.prototype.fire]
  /**
   * 触发本对象的某类事件。
   * @name JSEventTarget.prototype.fire
   * @function
   * @param {string} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   * @returns {Object} 事件对象。
   */
  JSEventTarget.prototype.fire = function(type, data) {
    var target = this;
    var event = new JSEvent(type, target, data);
    var handlers = target.eventHandlers[type];
    if (handlers) {
      // 分发时对 handlers 的副本操作，以避免在监听器内添加或删除该对象的同类型的监听器时会影响本次分发过程。
      handlers.slice(0).forEach(function(handler) {
        handler.listener.call(target, event);
      });
    }
    return event;
  };

})(window);

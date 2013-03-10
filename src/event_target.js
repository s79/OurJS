/**
 * @fileOverview 事件目标。
 * @author sundongguo@gmail.com
 * @version 20120820
 */

(function() {
//==================================================[事件目标]
  /*
   * 事件目标是为 JS 对象提供的事件模型中的一个概念。
   * 在 DOM 范畴内，也有 EventTarget 的概念，但这是一个内部接口，并不暴露在脚本环境中。
   * 为避免混淆，当提及 EventTarget 对象时，只应指代通过调用本对象的 create 方法而获得的对象。
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
   *   create
   *
   * 提供实例方法：
   *   on
   *   off
   *   fire
   */

  var separator = /\s*,\s*/;

  var eventNamePattern = /^([a-zA-Z]+)|\[([a-zA-Z]+>[a-zA-Z]+)\](?:\.\w+)?$/;
  var combinedSeparator = />/;
  var getEventType = function(name) {
    var match = name.match(eventNamePattern);
    if (match === null) {
      throw new SyntaxError('Invalid event name "' + name + '"');
    }
    return match[1] || match[2].split(combinedSeparator);
  };

  var addListener = function(target, type, name, listener) {
    var eventHandlers = target.eventHandlers;
    var handlers = eventHandlers[type] || (eventHandlers[type] = []);
    handlers.push({name: name, listener: listener});
  };

  // listener 参数仅供删除组合事件生成的临时监听器使用。
  var removeListener = function(target, type, name, listener) {
    var eventHandlers = target.eventHandlers;
    var handlers = eventHandlers[type];
    if (handlers) {
      var i = 0;
      var handler;
      while (i < handlers.length) {
        handler = handlers[i];
        if (!listener && handler.name === name || listener && listener === handler.listener) {
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

//--------------------------------------------------[EventTarget]
  /**
   * 事件目标。
   * @name EventTarget
   * @constructor
   * @description
   *   通过调用 new EventTarget() 获得的新对象，或经过 EventTarget.create(object) 处理后的 object 对象，都将具备处理事件的能力，它们都可以被叫做一个 EventTarget 对象。
   *   EventTarget 对象在处理事件时，是工作在 JS 事件模型中的。
   *   window、document 和 Element 对象也都具备处理事件的能力，但它们是工作在 DOM 事件模型中的。
   *   这两种事件模型的共同点有：
   *   <ul>
   *     <li>均使用 on 方法添加事件监听器。</li>
   *     <li>均使用 off 方法删除已添加的事件监听器，并且它们的参数的含义也一致。</li>
   *     <li>均使用 fire 方法触发一个事件，并且它们的参数的含义也一致。</li>
   *   </ul>
   *   它们之间的差异：
   *   <table>
   *     <tr>
   *       <th></th>
   *       <th>DOM 事件模型</th>
   *       <th>JS 事件模型</th>
   *     </tr>
   *     <tr>
   *       <th>应用范围</th>
   *       <td>window 对象、document 对象和所有 Element 对象均自动具备 on、off 和 fire 方法来添加、删除事件监听器和触发一个事件。</td>
   *       <td>只有 EventTarget 对象才会具备 on、off 和 fire 方法来添加、删除事件监听器和触发一个事件。</td>
   *     </tr>
   *     <tr>
   *       <th>事件对象的<br>创建方式</th>
   *       <td>可能是在特定的行为发生时由浏览器自动创建的，也可能是由 fire 方法创建的。</td>
   *       <td>只能由 fire 方法创建。</td>
   *     </tr>
   *     <tr>
   *       <th>事件对象的<br>属性和方法</th>
   *       <td>事件对象有多个属性和方法，其中“键盘事件”和“鼠标事件”还有各自的附加属性。也可以在调用 fire 方法时附加其他自定义属性。</td>
   *       <td>事件对象默认只有 type 和 target 两个属性，也可以在调用 fire 方法时附加其他自定义属性。</td>
   *     </tr>
   *     <tr>
   *       <th>事件对象的<br>传播特性</th>
   *       <td>某些类型的事件对象可以在 DOM 树中传播。</td>
   *       <td>无此特性。</td>
   *     </tr>
   *     <tr>
   *       <th>事件对象的<br>默认行为</th>
   *       <td>某些类型的事件对象会有默认行为，并且其中的一部分还可以阻止其默认行为的发生。</td>
   *       <td>事件对象没有默认行为，通常一个事件都是在某种行为明确的发生之后才触发的。事件对象不会传播，也不会导致其他行为的发生。</td>
   *     </tr>
   *     <tr>
   *       <th>代理事件监听</th>
   *       <td>可以在调用 on 方法时，使用 :relay(selector) 对可以冒泡的事件进行代理监听。</td>
   *       <td>不支持。</td>
   *     </tr>
   *     <tr>
   *       <th>组合事件监听</th>
   *       <td>不支持。</td>
   *       <td>可以在调用 on 方法时，使用 [masterType>slaveType] 对两种事件进行组合监听。</td>
   *     </tr>
   *   </table>
   */
  var EventTarget = window.EventTarget = function() {
    this.eventHandlers = {};
  };

//--------------------------------------------------[EventTarget.create]
  /**
   * 让目标对象成为一个 EventTarget 对象，以具备处理事件的能力。
   * @name EventTarget.create
   * @function
   * @param {Object} target 目标对象。
   *   目标对象不应该是 window、document 或 Element 对象，因为这些对象已经具备处理事件的能力，并且使用的是 DOM 事件模型，而通过调用本方法得到的对象在处理事件时，将使用 JS 事件模型。
   * @returns {Object} 目标对象。
   * @description
   *   <ul>
   *     <li>目标对象将被添加实例属性 eventHandlers 用于保存处理事件所必需的数据。</li>
   *     <li>目标对象将被添加实例方法 on 用于添加事件监听器。</li>
   *     <li>目标对象将被添加实例方法 off 用于删除事件监听器。</li>
   *     <li>目标对象将被添加实例方法 fire 用于触发某类事件。</li>
   *   </ul>
   */
  EventTarget.create = function(target) {
    this.call(target);
    Object.mixin(target, this.prototype);
    return target;
  };

//--------------------------------------------------[EventTarget.prototype.on]
  /**
   * 为本对象添加事件监听器。
   * @name EventTarget.prototype.on
   * @function
   * @param {string} name 事件名称，格式为 <dfn><var>type</var>.<var>label</var></dfn> 或 <dfn>[<var>masterType</var>&gt;<var>slaveType</var>].<var>label</var></dfn>，详细信息请参考下表：
   *   <table>
   *     <tr><th></th><th>是否必选</th><th>详细描述</th></tr>
   *     <tr><td><dfn><var>type</var></dfn></td><td>独立监听器必选</td><td>要监听的事件类型。</td></tr>
   *     <tr>
   *       <td><dfn>[<var>masterType</var>&gt;<var>slaveType</var>]</dfn></td>
   *       <td>组合监听器必选</td>
   *       <td>
   *         要监听的事件类型的组合。<br>仅在 masterType 和 slaveType 两种类型的事件均被触发后，监听器才会被调用。
   *         应用场景：slaveType 事件的处理必须在 masterType 事件发生后才能进行。
   *         <ul>
   *           <li>
   *             在一次组合事件监听中，masterType 事件对象永远是“可组合”的，只需要触发一次 masterType 事件，该事件对象即可以和任意多个 slaveType 事件对象进行组合。
   *             如果 masterType 先被触发一次或多次，则只保留最新的 masterType 事件对象用于组合。此后每当 slaveType 被触发时，产生的 slaveType 事件对象都会立即与最新的 masterType 事件对象进行组合。
   *           </li>
   *           <li>
   *             在一次组合事件监听中，slaveType 事件对象只能和 masterType 事件对象组合一次。
   *             如果 slaveType 先被触发一次或多次，则每次触发的 slaveType 事件对象都会自动以队列的形式被保存，并将在 masterType 被触发后按照顺序逐个与最新的 masterType 事件对象进行组合。
   *           </li>
   *         </ul>
   *       </td>
   *     </tr>
   *     <tr><td><dfn>.<var>label</var></dfn></td><td>可选</td><td>指定事件应用场景的标签，以便在调用 off 方法时能够精确匹配要删除的监听器。<br>不打算删除的监听器没有必要指定标签。</td></tr>
   *   </table>
   *   其中 <var>type</var>、<var>masterType</var> 和 <var>slaveType</var> 只能使用英文字母，<var>label</var> 可以使用英文字母、数字和下划线。
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
  EventTarget.prototype.on = function(name, listener) {
    var target = this;
    name.split(separator).forEach(function(name) {
      var type = getEventType(name);
      if (typeof type === 'string') {
        // 独立监听器。
        addListener(target, type, name, listener);
      } else {
        // 组合监听器。
        var masterType = type[0];
        var slaveType = type[1];
        var masterEvent;
        // 主事件监听器。
        addListener(target, masterType, name, function(event) {
          masterEvent = event;
        });
        // 从事件监听器。
        addListener(target, slaveType, name, function(event) {
          if (masterEvent) {
            listener.call(target, masterEvent, event);
          } else {
            var temporaryListener = function() {
              listener.call(target, masterEvent, event);
              removeListener(target, masterType, name, temporaryListener);
            };
            addListener(target, masterType, name, temporaryListener);
          }
        });
      }
    });
    return this;
  };

//--------------------------------------------------[EventTarget.prototype.off]
  /**
   * 删除本对象上已添加的事件监听器。
   * @name EventTarget.prototype.off
   * @function
   * @param {string} name 事件名称。本对象上添加的所有名称与 name 匹配的监听器都将被删除。
   *   使用逗号分割多个事件名称，即可同时删除该对象上的多个监听器。
   * @returns {Object} 本对象。
   */
  EventTarget.prototype.off = function(name) {
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

//--------------------------------------------------[EventTarget.prototype.fire]
  /**
   * 触发本对象的某类事件。
   * @name EventTarget.prototype.fire
   * @function
   * @param {string} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   * @returns {Object} 事件对象。
   */
  EventTarget.prototype.fire = function(type, data) {
    var target = this;
    var event = Object.mixin({type: type, target: target}, data || {});
    var handlers = target.eventHandlers[type];
    if (handlers) {
      // 分发时对 handlers 的副本操作，以避免在监听器内添加或删除监听器时会影响本次分发过程。
      handlers.slice(0).forEach(function(handler) {
        handler.listener.call(target, event);
      });
    }
    return event;
  };

})();

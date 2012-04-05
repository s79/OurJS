/**
 * @fileOverview 组件。
 * @author sundongguo@gmail.com
 * @version 20120402
 */
(function() {
//==================================================[组件]
  /*
   * 提供组件的构造器。
   * 为组件的实例提供 on/off/fire 方法，这些方法依赖组件实例自身的 event 属性。
   * <Object event> {
   *   <string type>: <Array handlers> [
   *     <Object handler>: {
   *       name: <string>
   *       listener: <Function>
   *     }
   *   ]
   * };
   *
   * 构造函数：
   *   Component
   * 命名空间：
   *   components
   */

  var componentInstanceMethods = {};

//--------------------------------------------------[Component Constructor]
  /**
   * 创建一个组件。
   * @name Component
   * @constructor
   * @param {Function} constructor 组件构造函数。
   *   <ul>
   *     <li>声明 constructor 时，其最后一个形参必须是一个可选参数 options。即便一个组件不需要 options，也应将其写入形参内。</li>
   *     <li>不要在 constructor 中访问 options 形参，因为此形参并不会被传入 constructor。要访问 options 形参的属性，直接访问实例的同名属性即可。</li>
   *     <li>必须指定 constructor.options，以代表默认选项。即便一个组件不需要默认选项，也应将 constructor.options 设置为空对象。</li>
   *     <li>constructor、constructor.options、constructor.prototype 内均不能设置实例的 events/on/off/fire 属性。</li>
   *   </ul>
   * @description
   *   本方法本质是包装 constructor，以加入对事件的支持，并能自动处理默认选项和指定选项。
   */
  function Component(constructor) {
    // 组件的包装构造函数，为实例加入 events，并自动处理默认和指定的 options。
    var ComponentConstructor = function() {
      // 追加默认 options 到实例对象。
      Object.append(this, constructor.options);
      // 追加指定的 options 到实例对象。
      var parameters = Array.from(arguments);
      var formalParameterLength = constructor.length;
      var actualParameterLength = arguments.length;
      if (formalParameterLength !== actualParameterLength) {
        parameters.length = formalParameterLength;
      }
      // 移除实参中的 options。
      Object.append(this, parameters.pop() || {});
      // 实例的 events 必须为以下指定的空对象。
      this.events = {};
      constructor.apply(this, parameters);
    };
    // 将 componentInstanceMethods 添加到 ComponentConstructor 的原型链。
    var ComponentPrototype = function() {
    };
    ComponentPrototype.prototype = componentInstanceMethods;
    ComponentConstructor.prototype = new ComponentPrototype();
    ComponentConstructor.prototype.constructor = ComponentConstructor;
    ComponentConstructor.prototype.superPrototype = ComponentPrototype.prototype;
    // 将 constructor 的原型内的属性追加到 Component 的原型中。
    Object.append(ComponentConstructor.prototype, constructor.prototype, {blackList: ['on', 'off', 'fire']});
    // 返回组件。
    return ComponentConstructor;
  }

  window.Component = Component;

//--------------------------------------------------[componentInstanceMethods.on]
  /**
   * 为组件添加监听器。
   * @name Component#on
   * @function
   * @param {string} name 事件名称，包括事件类型和可选的别名，二者间用 . 分割。
   *   使用空格分割要多个事件名称，即可同时为多个事件注册同一个监听器。
   * @param {Function} listener 要添加的事件监听器，传入调用此方法的组件提供的事件对象。
   * @returns {Object} 调用本方法的组件。
   */
  componentInstanceMethods.on = function(name, listener) {
    var self = this;
    if (name.contains(' ')) {
      name.split(' ').forEach(function(name) {
        componentInstanceMethods.on.call(self, name, listener);
      });
      return self;
    }
    var events = self.events;
    var dotIndex = name.indexOf('.');
    var type = dotIndex === -1 ? name : name.slice(0, dotIndex);
    var handlers = events[type] || (events[type] = []);
    handlers.push({name: name, listener: listener});
    return self;
  };

//--------------------------------------------------[componentInstanceMethods.off]
  /**
   * 根据名称删除组件上已添加的监听器。
   * @name Component#off
   * @function
   * @param {string} name 通过 on 添加监听器时使用的事件名称。可以使用空格分割多个事件名称。
   * @returns {Object} 调用本方法的组件。
   */
  componentInstanceMethods.off = function(name) {
    var self = this;
    if (name.contains(' ')) {
      name.split(' ').forEach(function(name) {
        componentInstanceMethods.off.call(self, name);
      });
      return self;
    }
    var events = self.events;
    var dotIndex = name.indexOf('.');
    var type = dotIndex === -1 ? name : name.slice(0, dotIndex);
    var handlers = events[type];
    if (!handlers) {
      return self;
    }
    var i = 0;
    var handler;
    if (name === type) {
      handlers.length = 0;
    } else {
      while (i < handlers.length) {
        handler = handlers[i];
        if (handler.name === name) {
          handlers.splice(i, 1);
        } else {
          i++;
        }
      }
    }
    if (handlers.length === 0) {
      delete events[type];
    }
    return self;
  };

//--------------------------------------------------[componentInstanceMethods.fire]
  /**
   * 触发一个组件的某类事件，运行相关的监听器。
   * @name Component#fire
   * @function
   * @param {String} type 事件类型。
   * @param {Object} [event] 事件对象。
   * @returns {Object} 调用本方法的组件。
   */
  componentInstanceMethods.fire = function(type, event) {
    var self = this;
    var events = self.events;
    var handlers = events[type];
    if (!handlers) {
      return self;
    }
    handlers.forEach(function(handler) {
      handler.listener.call(self, event);
    });
    return self;
  };

//--------------------------------------------------[components]
  /**
   * 为组件提供的命名空间。
   * @name components
   * @namespace
   */
  window.components = {};

})();

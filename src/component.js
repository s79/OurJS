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

  var instanceMethods = {};
  var filter = {blackList: ['on', 'off', 'fire']};

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
    var Component = function() {
      // 追加默认 options 到实例对象。
      Object.append(this, constructor.options, filter);
      // 分析形参和实参的差别。
      var parameters = Array.from(arguments);
      var formalParameterLength = constructor.length;
      var actualParameterLength = arguments.length;
      if (formalParameterLength !== actualParameterLength) {
        parameters.length = formalParameterLength;
      }
      // 移除实参中的 options 对象，并追加这个指定的 options 对象到实例对象。
      Object.append(this, parameters.pop() || {}, filter);  // TODO: 是否添加白名单？
      // 实例的 events 必须为以下指定的空对象。
      this.events = {};
      constructor.apply(this, parameters);
    };
    // 将 instanceMethods 添加到 Component 的原型链。
    var Prototype = function() {
    };
    Prototype.prototype = instanceMethods;
    Component.prototype = new Prototype();
    Component.prototype.constructor = Component;
    Component.prototype.superPrototype = Prototype.prototype;
    // 将 constructor 的原型内的属性追加到 Component 的原型中。
    Object.append(Component.prototype, constructor.prototype, filter);
    // 返回组件。
    return Component;
  }

  window.Component = Component;

//--------------------------------------------------[instanceMethods.on]
  /**
   * 为组件添加监听器。
   * @name Component#on
   * @function
   * @param {string} name 事件名称，包括事件类型和可选的别名，二者间用 . 分割。
   *   使用空格分割要多个事件名称，即可同时为多个事件注册同一个监听器。
   * @param {Function} listener 要添加的事件监听器，传入调用此方法的组件提供的事件对象。
   * @returns {Object} 调用本方法的组件。
   */
  instanceMethods.on = function(name, listener) {
    var self = this;
    if (name.contains(' ')) {
      name.split(' ').forEach(function(name) {
        instanceMethods.on.call(self, name, listener);
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

//--------------------------------------------------[instanceMethods.off]
  /**
   * 根据名称删除组件上已添加的监听器。
   * @name Component#off
   * @function
   * @param {string} name 通过 on 添加监听器时使用的事件名称。可以使用空格分割多个事件名称。
   * @returns {Object} 调用本方法的组件。
   */
  instanceMethods.off = function(name) {
    var self = this;
    if (name.contains(' ')) {
      name.split(' ').forEach(function(name) {
        instanceMethods.off.call(self, name);
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

//--------------------------------------------------[instanceMethods.fire]
  /**
   * 触发一个组件的某类事件，运行相关的监听器。
   * @name Component#fire
   * @function
   * @param {String} type 事件类型。
   * @param {Object} [event] 事件对象。
   * @returns {Object} 调用本方法的组件。
   */
  instanceMethods.fire = function(type, event) {
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

(function() {
//==================================================[Switcher]
  /*
   * 使用一个数组创建切换器，在每次切换活动元素时会触发相应的事件。
   * Switcher 是一个基础组件，因此放在本文件中。
   */

//--------------------------------------------------[Switcher Constructor]
  /**
   * 使用一个数组创建切换控制器。在这个数组中，同一时刻最多只有一个元素是“活动”的。
   * @name Switcher
   * @memberOf components
   * @constructor
   * @param {Array} items 指定在本数组中的各元素间切换，本数组包含的元素必须是引用类型的值，且不能有重复。
   * @fires change
   *   {Element} activeItem 当前的活动元素。
   *   {number} activeIndex 当前的活动元素在 items 中的索引。
   *   {Element} inactiveItem 上一个活动元素。
   *   {number} inactiveIndex 上一个活动元素在 items 中的索引。
   *   在当前的活动元素改变时触发。
   * @description
   *   高级应用：动态修改实例对象的 items 属性的内容，可以随时增加/减少切换控制器的控制范围。
   */
  function Switcher(items, options) {
    this.items = items;
    this.activeItem = null;
    this.activeIndex = NaN;
  }

//--------------------------------------------------[Switcher.options]
  /**
   * 默认选项。
   * @name Switcher.options
   * @memberOf components
   */
  Switcher.options = {};

//--------------------------------------------------[Switcher.prototype.active]
  /**
   * 将一个元素标记为“活动”，并将当前的活动元素（如果有）标记为“非活动”。
   * @name Switcher.prototype.active
   * @memberOf components
   * @function
   * @param {Object|number} i 要标记为“活动”的元素，或者这个元素在 items 中的索引值。
   *   要标记为“活动”的元素不能为当前的活动元素。
   *   如果指定的值为不在 items 中的对象，或为一个不在有效范索引围内的数字，则取消活动元素。
   * @returns {Object} Switcher 对象。
   */
  Switcher.prototype.active = function(i) {
    // 参数 i 可能是 Object 或者 number 类型，从中解出 item 和 index 的值。
    var item = null;
    var index = NaN;
    var x;
    if (typeof i === 'number') {
      x = this.items[i];
      if (x) {
        item = x;
        index = i;
      }
    } else {
      x = this.items.indexOf(i);
      if (x > -1) {
        item = i;
        index = x;
      }
    }
    // 上一个活动元素的索引。
    var lastActiveIndex = this.activeIndex;
    // 尝试更改活动元素。
    if (index !== lastActiveIndex) {
      this.activeItem = item;
      this.activeIndex = index;
      var eventTriggered = false;
      var event = {
        activeItem: null,
        activeIndex: NaN,
        inactiveItem: null,
        inactiveIndex: NaN
      };
      if (!isNaN(index)) {
        eventTriggered = true;
        event.activeItem = item;
        event.activeIndex = index;
      }
      if (!isNaN(lastActiveIndex)) {
        eventTriggered = true;
        event.inactiveItem = this.items[lastActiveIndex];
        event.inactiveIndex = lastActiveIndex;
      }
      eventTriggered && this.fire('change', event);
    }
    return this;
  };

//--------------------------------------------------[Switcher.prototype.getActiveItem]
  /**
   * 获取当前标记为“活动”的元素。
   * @name Switcher.prototype.getActiveItem
   * @memberOf components
   * @function
   * @returns {Object} 当前标记为“活动”的元素，如果为 null，则当前无活动元素。
   */
  Switcher.prototype.getActiveItem = function() {
    return this.activeItem;
  };

//--------------------------------------------------[Switcher.prototype.getActiveIndex]
  /**
   * 获取当前标记为“活动”的元素的索引。
   * @name Switcher.prototype.getActiveIndex
   * @memberOf components
   * @function
   * @returns {number} 当前标记为“活动”的元素的索引，如果为 NaN，则当前无活动元素。
   */
  Switcher.prototype.getActiveIndex = function() {
    return this.activeIndex;
  };

//--------------------------------------------------[components.Switcher]
  components.Switcher = new Component(Switcher);

})();

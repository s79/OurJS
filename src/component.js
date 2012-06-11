/**
 * @fileOverview 组件。
 * @author sundongguo@gmail.com
 * @version 20120610
 */
(function() {
//==================================================[组件]
  /*
   * 组件的构造器。
   * 为各组件的实例提供 options/events 属性，以及 setOptions/on/off/fire 原型方法。
   * <Object events> {
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
   */

//--------------------------------------------------[Component Constructor]
  /**
   * 创建一个组件。
   * @name Component
   * @constructor
   * @param {Function} constructor 组件的构造函数。
   * @param {Object} defaultOptions 组件的默认选项。
   * @param {Object} prototype 组件的原型对象。
   * @description
   *   组件的实例及其原型对象中都不能设置以下属性：
   *   'options'，'events'，'setOptions'，'on'，'off'，'fire'。
   *   修改各组件的默认选项时，不要修改 XXX.options 的指向。
   */
  function Component(constructor, defaultOptions, prototype) {
    // 真正的构造函数。
    var Component = function() {
      this.options = {};
      this.events = {};
      Object.append(this.options, Component.options);
      constructor.apply(this, arguments);
    };
    // 默认选项。
    Component.options = defaultOptions;
    // 扩充原型链。
    Component.prototype = this;
    // 将 prototype 的属性追加到原型中。
    Object.append(Component.prototype, prototype);
    // 重新设定 constructor 属性。
    Component.prototype.constructor = Component;
    // 返回组件。
    return Component;
  }

//--------------------------------------------------[Component.prototype.setOptions]
  /**
   * 为本组件设置选项。
   * @name Component.prototype.setOptions
   * @function
   * @param {Object} options 选项。
   * @returns {Object} 本组件。
   */
  Component.prototype.setOptions = function(options) {
    Object.append(this.options, options || {}, {whiteList: Object.keys(this.options)});
    return this;
  };

//--------------------------------------------------[Component.prototype.on]
  /**
   * 为本组件添加事件监听器。
   * @name Component.prototype.on
   * @function
   * @param {string} name 事件名称，包括事件类型和可选的别名，二者间用 . 分割。
   *   使用空格分割多个事件名称，即可同时为多个事件注册同一个监听器。
   * @param {Function} listener 要添加的事件监听器。
   * @returns {Object} 本组件。
   */
  Component.prototype.on = function(name, listener) {
    var self = this;
    if (name.contains(' ')) {
      name.split(' ').forEach(function(name) {
        Component.prototype.on.call(self, name, listener);
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

//--------------------------------------------------[Component.prototype.off]
  /**
   * 根据名称删除本组件上已添加的事件监听器。
   * @name Component.prototype.off
   * @function
   * @param {string} name 通过 on 添加监听器时使用的事件名称。可以使用空格分割多个事件名称。
   * @returns {Object} 本组件。
   */
  Component.prototype.off = function(name) {
    var self = this;
    if (name.contains(' ')) {
      name.split(' ').forEach(function(name) {
        Component.prototype.off.call(self, name);
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

//--------------------------------------------------[Component.prototype.fire]
  /**
   * 触发本组件的某类事件，运行相关的事件监听器。
   * @name Component.prototype.fire
   * @function
   * @param {String} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   * @returns {Object} 本组件。
   */
  Component.prototype.fire = function(type, data) {
    var self = this;
    var events = self.events;
    var handlers = events[type];
    if (!handlers) {
      return self;
    }
    handlers.forEach(function(handler) {
      handler.listener.call(self, data);
    });
    return self;
  };

//--------------------------------------------------[Component]
  window.Component = Component;

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
  function Switcher(items) {
    this.items = items;
    this.activeItem = null;
    this.activeIndex = NaN;
  }

//--------------------------------------------------[Switcher.options]
  /**
   * 默认选项。
   * @name Switcher.options
   */
  Switcher.options = {};

//--------------------------------------------------[Switcher.prototype.active]
  /**
   * 将一个元素标记为“活动”，并将当前的活动元素（如果有）标记为“非活动”。
   * @name Switcher.prototype.active
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
   * @function
   * @returns {number} 当前标记为“活动”的元素的索引，如果为 NaN，则当前无活动元素。
   */
  Switcher.prototype.getActiveIndex = function() {
    return this.activeIndex;
  };

//--------------------------------------------------[Switcher]
  window.Switcher = new Component(Switcher, Switcher.options, Switcher.prototype);

})();

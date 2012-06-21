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
   *       name: <string name>
   *       listener: <Function listener>
   *     }
   *   ]
   * };
   *
   * 构造函数：
   *   Component
   */

  var returnTrue = function() {
    return true;
  };
  var returnFalse = function() {
    return false;
  };

  /**
   * 组件事件。
   * @name ComponentEvent
   * @constructor
   * @private
   * @param {string} type 事件类型。
   * @param {string} target 事件来源。
   * @description
   *   组件事件可以取消默认行为（建议为用户主动触发的事件添加此功能），但不会传递。
   */
  function ComponentEvent(type, target) {
    this.type = type;
    this.target = target;
  }

  /**
   * 阻止事件的默认行为。
   * @name ComponentEvent.prototype.preventDefault
   * @function
   * @private
   */
  ComponentEvent.prototype.preventDefault = function() {
    this.isDefaultPrevented = returnTrue;
  };

  /**
   * 查询事件的默认行为是否已被阻止。
   * @name ComponentEvent.prototype.isDefaultPrevented
   * @function
   * @private
   * @returns {boolean} 查询结果。
   */
  ComponentEvent.prototype.isDefaultPrevented = returnFalse;

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
   *   修改一个组件的默认选项时，应修改该组件的 options 属性所指向的对象，不要修改 options 属性的指向。
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
    var component = this;
    if (name.contains(' ')) {
      name.split(' ').forEach(function(name) {
        Component.prototype.on.call(component, name, listener);
      });
      return component;
    }
    var events = component.events;
    var dotIndex = name.indexOf('.');
    var type = dotIndex === -1 ? name : name.slice(0, dotIndex);
    var handlers = events[type] || (events[type] = []);
    handlers.push({name: name, listener: listener});
    return component;
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
    var component = this;
    if (name.contains(' ')) {
      name.split(' ').forEach(function(name) {
        Component.prototype.off.call(component, name);
      });
      return component;
    }
    var events = component.events;
    var dotIndex = name.indexOf('.');
    var type = dotIndex === -1 ? name : name.slice(0, dotIndex);
    var handlers = events[type];
    if (!handlers) {
      return component;
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
    return component;
  };

//--------------------------------------------------[Component.prototype.fire]
  /**
   * 触发本组件的某类事件，运行相关的事件监听器。
   * @name Component.prototype.fire
   * @function
   * @param {String} type 事件类型。
   * @param {Object} [data] 在事件对象上附加的数据。
   * @returns {Object} 本组件。
   * @description
   *   高级应用：第三个隐藏参数 callback 供组件编写时调用，该函数仅在本事件对象从未调用过 preventDefault 方法的情况下才会执行。建议在用户触发的事件上使用 callback。
   */
  Component.prototype.fire = function(type, data, callback) {
    var component = this;
    var handlers = component.events[type];
    if (handlers) {
      var event = Object.append(new ComponentEvent(type, component), data || {});
      handlers.forEach(function(handler) {
        if (handler.listener.call(component, event) === false) {
          event.preventDefault();
        }
      });
      if (event.isDefaultPrevented()) {
        return component;
      }
    }
    if (callback) {
      callback();
    }
    return component;
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
   * @fires active
   *   {Element} event.activeItem 要标记为“活动”的元素。
   *   {number} event.activeIndex 标记为“活动”的元素在 items 中的索引。
   *   调用 active 方法时触发；可以取消本次动作。
   * @fires change
   *   {Element} event.activeItem 当前的活动元素。
   *   {number} event.activeIndex 当前的活动元素在 items 中的索引。
   *   {Element} event.inactiveItem 上一个活动元素。
   *   {number} event.inactiveIndex 上一个活动元素在 items 中的索引。
   *   在当前的活动元素改变时触发。
   * @description
   *   高级应用：动态修改实例对象的 items 属性的内容，可以随时增加/减少切换控制器的控制范围。
   */
  function Switcher(items) {
    this.items = items;
    this.activeItem = null;
    this.activeIndex = -1;
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
    var switcher = this;
    var item = null;
    var index = -1;
    var x;
    if (typeof i === 'number') {
      x = switcher.items[i];
      if (x) {
        item = x;
        index = i;
      }
    } else {
      x = switcher.items.indexOf(i);
      if (x > -1) {
        item = i;
        index = x;
      }
    }
    var lastActiveItem = switcher.activeItem;
    var lastActiveIndex = switcher.activeIndex;
    if (index !== lastActiveIndex) {
      switcher.fire('active', {
        activeItem: item,
        activeIndex: index
      }, function() {
        switcher.activeItem = item;
        switcher.activeIndex = index;
        switcher.fire('change', {
          activeItem: item,
          activeIndex: index,
          inactiveItem: lastActiveItem,
          inactiveIndex: lastActiveIndex
        });
      });
    }
    return switcher;
  };

//--------------------------------------------------[Switcher]
  window.Switcher = new Component(Switcher, Switcher.options, Switcher.prototype);

})();

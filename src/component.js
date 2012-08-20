/**
 * @fileOverview 组件。
 * @author sundongguo@gmail.com
 * @version 20120610
 */

(function() {
//==================================================[组件]
  /*
   * 创建组件构造器。
   *
   * 构造函数：
   *   Component
   */

//--------------------------------------------------[Component Constructor]
  /**
   * 创建一个组件构造器。
   * @name Component
   * @constructor
   * @param {Function} initialization 组件的初始化函数。
   * @param {Object} [options] 组件的默认选项。
   *   如果省略，则认为该组件没有默认选项。
   *   可以在创建组件构造器之后再设置其 options 属性以更改其默认选项。
   *   修改一个组件的默认选项时，应修改该组件的 options 属性的属性值，不要为 options 属性重新赋值。
   * @param {Object} [prototype] 组件的原型对象。
   *   可以在创建组件构造器之后再扩充其 prototype 属性以添加其实例方法。
   * @description
   *   组件的实例具备可配置和可观察的特性。
   *   为保证以上两种特性不被破坏，组件的实例及其原型对象中都不应设置以下属性：
   *   'options'，'events'，'setOptions'，'on'，'off'，'fire'。
   */
  function Component(initialization, options, prototype) {
    // 组件构造器，自动为实例启用可配置和可观察的特性。
    var Constructor = function() {
      Configurable.call(this, Object.clone(Constructor.options || {}));
      Observable.call(this);
      initialization.apply(this, Array.from(arguments));
    };
    // 保存默认选项。
    Constructor.options = options || {};
    // 扩充原型链。
    Constructor.prototype = this;
    Constructor.prototype.constructor = Constructor;
    // 扩充原型。
    if (prototype) {
      Object.mixin(Constructor.prototype, prototype);
    }
    // 返回组件构造器。
    return Constructor;
  }

  Object.mixin(Component.prototype, Configurable.prototype);
  Object.mixin(Component.prototype, Observable.prototype);

//--------------------------------------------------[Component]
  window.Component = Component;

})();

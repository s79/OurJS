/**
 * @fileOverview 组件构造器。
 * @author sundongguo@gmail.com
 * @version 20120610
 */

(function() {
//==================================================[组件构造器]
  /*
   * 组件构造器。
   *
   * 构造函数：
   *   Component
   */

//--------------------------------------------------[Component]
  /**
   * 创建一个组件。
   * @name Component
   * @constructor
   * @param {Function} initialize 组件的初始化函数。
   * @param {Object} [config] 组件的默认配置。
   *   如果省略，则认为该组件没有可配置项。
   *   可以在创建组件之后再设置其 config 属性以更改其默认配置。
   *   修改一个组件的默认配置时，应修改该组件的 config 属性下的属性值，不要为 config 属性重新赋值。
   * @param {Object} [prototype] 组件的原型对象。
   *   可以在创建组件之后再扩充其 prototype 属性以添加其实例方法。
   * @description
   *   所有组件的实例都将具备 Configurable 和 Observable 的特性。
   *   为保证以上两种特性不被破坏，组件的原型及其实例对象中都不应设置以下属性：
   *   'config'，'events'，'setConfig'，'on'，'off'，'fire'。
   */
  var Component = window.Component = function(initialize, config, prototype) {
    // 为组件的实例启用可配置和可观察的特性。
    var Constructor = function() {
      Configurable.call(this, Object.clone(Constructor.config || {}));
      Observable.call(this);
      initialize.apply(this, Array.from(arguments));
    };
    // 保存默认配置。
    Constructor.config = config || {};
    // 扩充原型链。
    Constructor.prototype = this;
    Constructor.prototype.constructor = Constructor;
    // 扩充原型。
    if (prototype) {
      Object.mixin(Constructor.prototype, prototype);
    }
    // 返回组件。
    return Constructor;
  };

  Object.mixin(Component.prototype, Configurable.prototype);
  Object.mixin(Component.prototype, Observable.prototype);

})();

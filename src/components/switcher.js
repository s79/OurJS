/**
 * @fileOverview 组件 - 切换器。
 * @author sundongguo@gmail.com
 * @version 20111010
 */
(function() {
//==================================================[Switcher]
  /*
   * 使用一个数组创建切换器，在每次切换时会触发相应的事件。
   */

  // 空函数。
  var empty = function() {
  };

//--------------------------------------------------[Switcher Constructor]
  /**
   * 切换控制器。
   * @name Switcher
   * @memberOf components
   * @constructor
   * @param {Array} items 指定在本数组的各元素间切换，本数组包含的元素必须是引用类型的值。
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Switcher.options 中。
   * @param {*} options.activeItem 默认的活动元素，不设置此项即无默认活动元素。
   *   可以传入指定的元素或该元素在 item 中的索引。
   * @param {Function} options.onActive 当一个元素被标记为“活动”时触发，传入这个元素和该元素在 items 中的索引。
   * @param {Function} options.onInactive 当一个元素被标记为“活动”时触发，传入之前的活动元素和该元素在 items 中的索引。
   */
  function Switcher(items, options) {
    Object.append(this, Object.clone(Switcher.options, true), options);
    this.items = items;
    var activeItem = this.activeItem;
    delete this.activeItem;
    typeof activeItem === 'number' && (activeItem = items[activeItem]);
    activeItem && this.active(activeItem);
  }

  components.Switcher = Switcher;

//--------------------------------------------------[Switcher.prototype.active]
  /**
   * 将一个元素标记为“活动”。
   * @name Switcher.prototype.active
   * @memberOf components
   * @function
   * @param {*} item 要标记为“活动”的元素，必须是 items 的一员，且不能是当前的活动元素。
   * @returns {Object} Switcher 对象。
   */
  Switcher.prototype.active = function(item) {
    if (typeof item === 'number') {
      item = this.items[item];
    }
    var activeIndex = this.items.indexOf(item);
    if (activeIndex > -1) {
      var inactiveItem = this.activeItem;
      if (item !== inactiveItem) {
        this.activeItem = item;
        this.onActive(item, activeIndex);
        inactiveItem && this.onInactive(inactiveItem, this.items.indexOf(inactiveItem));
      }
    }
    return this;
  };

//--------------------------------------------------[Switcher.options]
  /**
   * 默认选项。
   * @name Switcher.options
   * @memberOf components
   */
  Switcher.options = {
    // 可选项 activeItem 不在此设置，它代表一个真实存在于 items 中的元素。这样处理便于随时通过 switcher.activeItem 获取当前活动的元素。
    onActive: empty,
    onInactive: empty
  };

})();

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
   * @param {Array} items 在本数组的各元素间切换。
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Switcher.options 中。
   * @param {*} options.activeItem 默认的活动元素，不设置此项即无默认活动元素。
   * @param {Function} options.onActive 当一个元素被标记为“活动”时触发，传入这个元素。
   * @param {Function} options.onInactive 当一个元素被标记为“活动”时触发，传入之前的活动元素。
   */
  function Switcher(items, options) {
    options = Object.append(Object.clone(Switcher.options), options);
    this.items = items;
    this.onActive = options.onActive;
    this.onInactive = options.onInactive;
    options.hasOwnProperty('activeItem') && this.active(options.activeItem);
  }

  components.Switcher = Switcher;

//--------------------------------------------------[Switcher.prototype.active]
  /**
   * 将一个元素被标记为“活动”。
   * @name Switcher.prototype.active
   * @memberOf components
   * @function
   * @param {*} item 要标记为“活动”的元素，必须是 items 的一员，且不能是当前的活动元素。
   * @returns {Object} Switcher 对象。
   */
  Switcher.prototype.active = function(item) {
    if (this.items.indexOf(item) > -1) {
      if (this.hasOwnProperty('activeItem')) {
        var activeItem = this.activeItem;
        if (item !== activeItem) {
          this.activeItem = item;
          this.onActive(item);
          this.onInactive(activeItem);
        }
      } else {
        this.activeItem = item;
        this.onActive(item);
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
    // 可选项 activeItem 不在此设置，它代表一个真实存在于 items 中的元素，这样处理，就能够随时通过 switcher.activeItem 获取当前活动的元素。
    onActive: empty,
    onInactive: empty
  };

})();

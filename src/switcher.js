/**
 * @fileOverview 切换器。
 * @author sundongguo@gmail.com
 * @version 20120405
 */

(function() {
//==================================================[切换器]
  /*
   * 使用一个数组创建切换器，在每次切换活动元素时会触发相应的事件。
   */

//--------------------------------------------------[Switcher]
  /**
   * 使用一个数组创建切换控制器。在这个数组中，同一时刻最多只有一个元素是“活动”的。
   * @name Switcher
   * @constructor
   * @param {Array} items 指定在本数组中的各元素间切换，本数组包含的元素必须是引用类型的值，且不能有重复（需要开发者自行控制）。
   * @fires change
   *   当 items 发生变化时触发。
   * @fires activate
   *   {Element} event.activeItem 当前的活动元素。
   *   {Element} event.inactiveItem 上一个活动元素。
   *   成功调用 activate 方法后触发。
   */
  var Switcher = window.Switcher = new Component(function(items) {
    this.items = items;
    this.activeItem = null;
  });

//--------------------------------------------------[Switcher.prototype.spliceItems]
  /**
   * 在 items 指定的位置移除 n 个元素，并在此位置插入新的元素。
   * @name Switcher.prototype.spliceItems
   * @function
   * @param {number} startIndex 指定从数组中移除元素的开始位置。
   * @param {number} deleteCount 要移除的元素的个数。
   * @param {Array} [newItems] 要插入的新元素。
   * @returns {Object} 调用本方法的对象。
   */
  Switcher.prototype.spliceItems = function(startIndex, deleteCount, newItems) {
    var switcher = this;
    var items = switcher.items;
    Array.prototype.splice.apply(items, [startIndex, deleteCount].concat(newItems || []));
    if (startIndex || deleteCount || newItems) {
      switcher.activate(items.activeItem);
      switcher.fire('change');
    }
    return switcher;
  };

//--------------------------------------------------[Switcher.prototype.activate]
  /**
   * 将一个元素标记为“活动”，并将当前的活动元素（如果有）标记为“非活动”。
   * @name Switcher.prototype.activate
   * @function
   * @param {Object|number} value 要标记为“活动”的元素，或者这个元素在 items 中的索引值。
   *   如果指定的值为不在 items 中的对象，或为一个不在有效范索引围内的数字，则取消活动元素。
   * @returns {Object} Switcher 对象。
   * @description
   *   如果要标记为“活动”的元素与当前的活动元素相同，则调用此方法无效。
   */
  Switcher.prototype.activate = function(value) {
    var switcher = this;
    var items = switcher.items;
    var activeItem;
    var lastActiveItem = switcher.activeItem;
    if (typeof value === 'number') {
      activeItem = items[value] || null;
    } else {
      activeItem = items.contains(value) ? value : null;
    }
    if (activeItem !== lastActiveItem) {
      switcher.activeItem = activeItem;
      switcher.fire('activate', {
        activeItem: activeItem,
        inactiveItem: lastActiveItem
      });
    }
    return switcher;
  };

})();

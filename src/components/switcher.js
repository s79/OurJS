/**
 * @fileOverview 组件 - 切换器。
 * @author sundongguo@gmail.com
 * @version 20111010
 */
execute(function($) {
//==================================================[Switcher]
  /*
   * 使用一个数组创建切换器，在每次切换活动元素时会触发相应的事件。
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

});

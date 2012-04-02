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

//--------------------------------------------------[Switcher Constructor]
  /**
   * 切换控制器。
   * @name Switcher
   * @memberOf components
   * @constructor
   * @param {Array} items 指定在本数组中的各元素间切换，本数组包含的元素必须是引用类型的值，且不能有重复。
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Switcher.options 中。
   * @param {number} options.activeIndex 默认的活动元素在 items 中的索引值，如果指定的索引值不在有效范围内，则无默认活动元素。
   * @fires active
   *   在一个元素被标记为“活动”时触发。
   *   传入当前的活动元素在 items 中的索引。
   * @fires inactive
   *   在一个元素被标记为“活动”时触发。
   *   传入上一个活动元素在 items 中的索引，在 Switcher 初始化时没有上一个活动元素，因此不会触发。
   */
  function Switcher(items, options) {
    this.items = items;
    var activeIndex = this.activeIndex;
    delete this.activeIndex;
    this.active(activeIndex);
  }

//--------------------------------------------------[Switcher.prototype.active]
  /**
   * 将一个元素标记为“活动”。
   * @name Switcher.prototype.active
   * @memberOf components
   * @function
   * @param {number} index 要标记为“活动”的元素在 items 中的索引值，要标记为“活动”的元素不能是当前的活动元素。
   *   如果指定的索引值不在有效范围内，则取消活动元素。
   * @returns {Object} Switcher 对象。
   */
  Switcher.prototype.active = function(index) {
    index = index >>> 0;
    var currentActiveIndex = isNaN(this.activeIndex) ? NaN : this.activeIndex;
    if (index !== currentActiveIndex) {
      var item = this.items[index];
      if (item) {
        this.activeIndex = index;
        this.activeItem = item;
        this.fire('active', {index: index, item: item});
      } else {
        this.activeIndex = NaN;
        this.activeItem = null;
      }
      if (Number.isInteger(currentActiveIndex)) {
        this.fire('inactive', {index: currentActiveIndex, item: this.items[currentActiveIndex]});
      }
    }
    return this;
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

//--------------------------------------------------[Switcher.options]
  /**
   * 默认选项。
   * @name Switcher.options
   * @memberOf components
   */
  Switcher.options = {
    activeIndex: 0
  };

//--------------------------------------------------[输出组件]
  components.Switcher = new Component('Switcher', Switcher);

})();

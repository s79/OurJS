/**
 * @fileOverview 组件 - 多页标签面板。
 * @author sundongguo@gmail.com
 * @version 20120326
 */
(function() {
//==================================================[TabPanel]
  /*
   * 根据已有的一系列 DOM 元素创建多页标签面板。
   */

  // 空函数。
  var empty = function() {
  };

//--------------------------------------------------[TabPanel Constructor]
  /**
   * 创建多页标签面板。
   * @name TabPanel
   * @memberOf components
   * @constructor
   * @param {Element} $container 标签的父元素，用来绑定代理事件监听器。
   * @param {Array} tabs 包含所有标签的数组。
   * @param {Array} panels 包含所有面板的数组，确保和 tabs 的数量一致。
   * @param {Object} [options] 可选参数。
   * @param {number} options.activeIndex 默认激活第几个选项卡，第一个为 0，默认为第一个。
   * @param {string} options.activeClassName 激活的选项卡标签和面板将要添加的类名，默认为 'active'。
   * @param {number} options.hoverDelay 以毫秒为单位的鼠标悬停激活延时，如果为 0，则由鼠标点击事件激活选项卡。
   * @param {Function} options.onActive 当一个选项卡被标记为“活动”时触发，传入该选项卡的索引。
   * @param {Function} options.onInactive 当一个选项卡被标记为“活动”时触发，传入之前的活动选项卡的索引。
   * @require
   *   components.Switcher
   * @description
   *   <br>注意：
   *   <br>tabs 和 panels 必须有相同数目的元素。
   *   <br>选定的 tab 和 panel 元素将被添加类名 options.activeClassName。
   */
  var TabPanel = function($container, tabs, panels, options) {
    var tabPanel = this;
    Object.append(tabPanel, Object.clone(TabPanel.options, true), options);
    // 保存属性。
    tabPanel.tabs = tabs;
    tabPanel.panels = panels;
    // 使用 Switcher 实现选项卡切换。
    var className = tabPanel.activeClassName;
    var switcher = new components.Switcher(tabs, {
      activeItem: tabPanel.activeIndex,
      onActive: function(item, index) {
        item.addClass(className);
        panels[index].addClass(className);
        tabPanel.onActive(tabPanel.activeIndex = index);
      },
      onInactive: function(item, index) {
        item.removeClass(className);
        panels[index].removeClass(className);
        tabPanel.onInactive(index);
      }
    });
    // 包装 switcher 对象的 active 方法。
    tabPanel.active = function(item) {
      switcher.active(item);
      return this;
    };
    // 绑定激活标签页的事件。
    if (tabPanel.hoverDelay) {
      var timer;
      $container.on('mouseenter', function(e) {
        var $item = this;
        timer = setTimeout(function() {
          switcher.active($item);
        }, tabPanel.hoverDelay);
      }, function() {
        return tabs.contains(this);
      })
          .on('mouseleave', function(e) {
            clearTimeout(timer);
          }, function() {
            return tabs.contains(this);
          });
    } else {
      $container.on('click', function(e) {
        switcher.active(this);
      }, function() {
        return tabs.contains(this);
      });
    }
  };

  components.TabPanel = TabPanel;

//--------------------------------------------------[TabPanel.prototype.active]
  /**
   * 将一个标签页标记为“活动”。
   * @name TabPanel.prototype.active
   * @memberOf components
   * @function
   * @param {Element|number} tab 要标记为“活动”的标签页 tab 元素，或者该标签页的索引。
   * @returns {Object} TabPanel 对象。
   */
  /* 本方法为 switcher.active 方法的包装。 */

//--------------------------------------------------[TabPanel.prototype.activeIndex]
  /**
   * 获取当前标记为“活动”的标签页的索引。
   * @name TabPanel.prototype.activeIndex
   * @memberOf components
   * @type number
   */
  /* 本属性将在创建实例后提供。 */

//--------------------------------------------------[TabPanel.options]
  /**
   * 默认选项。
   * @name TabPanel.options
   * @memberOf components
   */
  TabPanel.options = {
    activeIndex: 0,
    activeClassName: 'active',
    hoverDelay: 0,
    onActive: empty,
    onInactive: empty
  };

})();

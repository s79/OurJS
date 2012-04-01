/**
 * @fileOverview 组件 - 多页标签面板。
 * @author sundongguo@gmail.com
 * @version 20120326
 */
(function() {
//==================================================[TabPanel]
  /*
   * 创建多页标签面板。
   */

  // 避免 $ 被覆盖。
  var $ = document.$;

  // 空函数。
  var empty = function() {
  };

//--------------------------------------------------[TabPanel Constructor]
  /**
   * 根据已有的一系列 DOM 元素创建多页标签面板。
   * @name TabPanel
   * @memberOf components
   * @constructor
   * @param {Array} tabs 包含所有“标签”的数组。
   * @param {Array} panels 包含所有“面板”的数组，应确保 panels 的数量和 tabs 的数量一致。
   * @param {Object} [options] 可选参数。
   * @param {number} options.defaultActiveIndex 从 tabs 和 panels 中计算的，默认激活的某组“标签面板”的索引值。第一组为 0，默认为第一组。如果指定的索引值不在有效范围内，则无默认激活的“标签面板”。
   * @param {string} options.activeClassName 为激活的“标签”和“面板”添加的类名，默认为 'active'。同一时刻最多只有一组“标签面板”被激活。
   * @param {Element} options.tabsContainer 用来绑定各“标签”的代理事件监听器的元素。当所有的“标签”有一个共同的父元素时，可以设置为 undefined，此时使用第一个“标签”的父元素。
   * @param {number} options.hoverDelay 以毫秒为单位的鼠标悬停激活延时，如果为 0，则由鼠标点击事件激活。若要启用鼠标悬停激活，建议设置为 200 - 400 之间的数值。
   * @param {Function} options.onActive 当一组“标签面板”被激活时触发，传入当前被激活的“标签面板”的“标签”元素和该组“标签面板”的索引。
   * @param {Function} options.onInactive 当一组“标签面板”被激活时触发，传入上一个被激活的“标签面板”的“标签”元素和该组“标签面板”的索引，在 TabPanel 初始化时没有上一个被激活的“标签面板”，因此不会触发。
   * @requires components.Switcher
   * @description
   *   注意：
   *   “标签”和“面板”必须是按顺序一一对应，保存在参数 tabs 和 panels 中。
   *   一个“标签”和一个“面板”组成一组“标签面板”。
   *   在创建一个实例后，可以动态修改 tabPanel.tabs 和 tabPanel.panels，动态添加/删除“标签面板”组，但要确保新增加的“标签”与原有“标签”的在 DOM 树的位置层次是相同的。
   */
  var TabPanel = function(tabs, panels, options) {
    var tabPanel = this;
    options = Object.append(Object.clone(TabPanel.options, true), options);
    // 保存属性。
    tabPanel.tabs = tabs;
    tabPanel.panels = panels;
    tabPanel.onActive = options.onActive;
    tabPanel.onInactive = options.onInactive;
    // 使用 Switcher 实现选项卡切换。
    var className = options.activeClassName;
    var switcher = new components.Switcher(tabs, {
      defaultActiveIndex: options.defaultActiveIndex,
      onActive: function(index) {
        tabPanel.tabs[index].addClass(className);
        tabPanel.panels[index].addClass(className);
        tabPanel.onActive(index);
      },
      onInactive: function(index) {
        tabPanel.tabs[index].removeClass(className);
        tabPanel.panels[index].removeClass(className);
        tabPanel.onInactive(index);
      }
    });
    tabPanel.activeIndex = switcher.activeIndex;
    // 提供 active 方法。
    tabPanel.active = function(index) {
      switcher.active(index);
      this.activeIndex = switcher.activeIndex;
      return this;
    };
    // 绑定激活标签页的事件。
    var $container = options.tabsContainer || tabs[0].getParent();
    if (options.hoverDelay) {
      var timer;
      $container.on('mouseenter.tabPanel', function(e) {
        var $item = this;
        timer = setTimeout(function() {
          switcher.active(tabPanel.tabs.indexOf($item));
        }, options.hoverDelay);
      }, function() {
        return tabPanel.tabs.contains(this);
      })
          .on('mouseleave.tabPanel', function(e) {
            clearTimeout(timer);
          }, function() {
            return tabPanel.tabs.contains(this);
          });
    } else {
      $container.on('click.tabPanel', function(e) {
        switcher.active(tabPanel.tabs.indexOf(this));
      }, function() {
        return tabPanel.tabs.contains(this);
      });
    }
  };

  components.TabPanel = TabPanel;

//--------------------------------------------------[TabPanel.prototype.activeIndex]
  /**
   * 获取当前被激活的“标签面板”的索引，如果为 NaN，则当前无激活的“标签面板”。
   * @name TabPanel#activeIndex
   * @memberOf components
   * @type number
   */
  /* 本属性将在创建实例后提供。 */

//--------------------------------------------------[TabPanel.prototype.active]
  /**
   * 激活一组“标签面板”。
   * @name TabPanel#active
   * @memberOf components
   * @function
   * @param {number} index 要激活的“标签面板”的索引。
   *   如果指定的索引值不在有效范围内，则取消激活的“标签面板”。
   * @returns {Object} TabPanel 对象。
   */
  /* 本方法将在创建实例后提供。 */

//--------------------------------------------------[TabPanel.options]
  /**
   * 默认选项。
   * @name TabPanel.options
   * @memberOf components
   * @description
   *   可选参数对象，包含的属性及其默认值为：
   *   <table>
   *     <tr><th>defaultActiveIndex</th><td>0</td></tr>
   *     <tr><th>activeClassName</th><td>'active'</td></tr>
   *     <tr><th>tabsContainer</th><td>undefined</td></tr>
   *     <tr><th>hoverDelay</th><td>0</td></tr>
   *     <tr><th>onActive</th><td>empty</td></tr>
   *     <tr><th>onInactive</th><td>empty</td></tr>
   *   </table>
   */
  TabPanel.options = {
    defaultActiveIndex: 0,
    activeClassName: 'active',
    tabsContainer: undefined,
    hoverDelay: 0,
    onActive: empty,
    onInactive: empty
  };

})();

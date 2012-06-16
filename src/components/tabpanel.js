/**
 * @fileOverview 组件 - 多页标签面板。
 * @author sundongguo@gmail.com
 * @version 20120326
 */
execute(function($) {
//==================================================[TabPanel]
  /*
   * 创建多页标签面板。
   */

//--------------------------------------------------[TabPanel Constructor]
  /**
   * 根据已有的一系列 DOM 元素创建多页标签面板。
   * @name TabPanel
   * @constructor
   * @param {Array} tabs 包含所有“标签”的数组。
   * @param {Array} panels 包含所有“面板”的数组，应确保 panels 的数量和 tabs 的数量一致。
   * @param {Object} [options] 可选参数。
   * @param {string} options.activeClassName 为激活的“标签”和“面板”添加的类名，默认为 'active'。
   * @param {Element} options.tabsContainer 用来绑定各“标签”的代理事件监听器的元素，默认为 undefined，此时使用第一个“标签”的父元素。当所有的“标签”有一个共同的父元素时，可以省略。
   * @param {number} options.hoverDelay 以毫秒为单位的鼠标悬停激活延时，默认为 NaN，此时由鼠标点击事件激活。若要启用鼠标悬停激活，建议设置为 200 - 400 之间的数值。
   * @fires change
   *   {Element} activeTab 当前的激活的“标签”。
   *   {Element} activePanel 当前的激活的“面板”。
   *   {number} activeIndex 当前的激活的“标签”和“面板”在 tabs 和 panels 中的索引。
   *   {Element} inactiveTab 上一个激活的“标签”。
   *   {Element} inactivePanel 上一个激活的“面板”。
   *   {number} inactiveIndex 上一个激活的“标签”和“面板”在 tabs 和 panels 中的索引。
   *   在激活的“标签”和“面板”改变时触发。
   * @requires Switcher
   * @description
   *   “标签”和“面板”必须是按顺序一一对应，保存在参数 tabs 和 panels 中。
   *   一个“标签”和一个“面板”组成一组“标签面板”。
   *   同一时刻最多只有一组“标签面板”被激活。
   *   高级应用：在创建一个实例后，可以动态修改 tabPanel.tabs 和 tabPanel.panels，动态添加/删除“标签面板”组，但要确保新增加的“标签”与原有“标签”的在 DOM 树的位置层次是相同的。
   */
  function TabPanel(tabs, panels, options) {
    var tabPanel = this;
    // 保存属性。
    tabPanel.tabs = tabs;
    tabPanel.panels = panels;
    tabPanel.activeTab = null;
    tabPanel.activePanel = null;
    tabPanel.activeIndex = -1;
    // 保存选项。
    options = tabPanel.setOptions(options).options;
    // 使用 Switcher 实现选项卡切换。
    var className = options.activeClassName;
    var switcher = tabPanel.switcher = new Switcher(tabs)
        .on('active', function(event) {
          var isDefaultPrevented = true;
          tabPanel.fire('active', {
            activeTab: event.activeItem,
            activePanel: tabPanel.panels[event.activeIndex],
            activeIndex: event.activeIndex
          }, function() {
            isDefaultPrevented = false;
          });
          if (isDefaultPrevented) {
            event.preventDefault();
          }
        })
        .on('change', function(event) {
          // 确定状态。
          var activeIndex = event.activeIndex;
          var activeTab = event.activeItem;
          var activePanel = activeIndex > -1 ? tabPanel.panels[activeIndex] : null;
          var inactiveIndex = event.inactiveIndex;
          var inactiveTab = event.inactiveItem;
          var inactivePanel = inactiveIndex > -1 ? tabPanel.panels[inactiveIndex] : null;
          // 保存状态。
          tabPanel.activeTab = activeTab;
          tabPanel.activePanel = activePanel;
          tabPanel.activeIndex = activeIndex;
          // 更改“标签”和“面板”。
          if (activeIndex > -1) {
            activeTab.addClass(className);
            activePanel.addClass(className);
          }
          if (inactiveIndex > -1) {
            inactiveTab.removeClass(className);
            inactivePanel.removeClass(className);
          }
          // 触发事件。
          tabPanel.fire('change', {
            activeTab: activeTab,
            activePanel: activePanel,
            activeIndex: activeIndex,
            inactiveTab: inactiveTab,
            inactivePanel: inactivePanel,
            inactiveIndex: inactiveIndex
          });
        });
    // 绑定激活标签页的事件。
    var $container = options.tabsContainer || tabs[0].getParent();
    var filter = function() {
      return tabPanel.tabs.contains(this);
    };
    if (Number.isFinite(options.hoverDelay)) {
      var timer;
      $container.on('mouseenter.tabPanel', function(e) {
        var $self = this;
        timer = setTimeout(function() {
          switcher.active($self);
        }, options.hoverDelay);
      }, filter);
      $container.on('mouseleave.tabPanel', function(e) {
        clearTimeout(timer);
      }, filter);
    } else {
      $container.on('click.tabPanel', function(e) {
        switcher.active(this);
      }, filter);
    }
  }

//--------------------------------------------------[TabPanel.options]
  /**
   * 默认选项。
   * @name TabPanel.options
   */
  TabPanel.options = {
    activeClassName: 'active',
    tabsContainer: undefined,
    hoverDelay: NaN
  };

//--------------------------------------------------[TabPanel.prototype.active]
  /**
   * 激活一组“标签面板”。
   * @name TabPanel.prototype.active
   * @function
   * @param {Object|number} i 要激活的“标签面板”的“标签”元素，或者该元素在 tabs 中的索引值。
   *   从 tabs 和 panels 中计算的，默认激活的某组“标签面板”的索引值从 0 开始。
   *   如果指定的值为不在 tabs 中的对象，或为一个不在有效范索引围内的数字，则取消激活的“标签面板”。
   * @returns {Object} TabPanel 对象。
   */
  TabPanel.prototype.active = function(i) {
    this.switcher.active(i);
    return this;
  };

//--------------------------------------------------[TabPanel]
  window.TabPanel = new Component(TabPanel, TabPanel.options, TabPanel.prototype);

});

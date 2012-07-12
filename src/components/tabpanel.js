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
   * 多页标签面板。
   * @name TabPanel
   * @constructor
   * @param {Object} elements 相关元素。
   * @param {Array} elements.tabs 包含所有“标签”的数组。组成“标签”的各元素的标签名应该一致，并且有共同的父元素。
   * @param {Array} elements.panels 包含所有“面板”的数组，应确保 panels 的数量和 tabs 的数量一致。
   * @param {Object} [options] 可选参数。
   * @param {string} options.activeClassName 为激活的“标签”和“面板”添加的类名，默认为 'active'。
   * @param {number} options.hoverDelay 以毫秒为单位的“标签”鼠标悬停激活延时，默认为 undefined，此时由鼠标点击事件激活。若要启用鼠标悬停激活，建议设置为 200 - 400 之间的数值。
   * @fires active
   *   {Element} activeTab 当前的激活的“标签”。
   *   {Element} activePanel 当前的激活的“面板”。
   *   {number} activeIndex 当前的激活的“标签”和“面板”在 tabs 和 panels 中的索引。
   *   {Element} inactiveTab 上一个激活的“标签”。
   *   {Element} inactivePanel 上一个激活的“面板”。
   *   {number} inactiveIndex 上一个激活的“标签”和“面板”在 tabs 和 panels 中的索引。
   *   成功调用 active 方法后触发。
   * @requires Switcher
   * @description
   *   “标签”和“面板”必须按顺序一一对应，保存在参数 tabs 和 panels 中。
   *   一个“标签”和一个“面板”组成一组“标签面板”。
   *   同一时刻最多只有一组“标签面板”被激活。
   */
  function TabPanel(elements, options) {
    var tabPanel = this;

    // 保存属性。
    tabPanel.elements = elements;
    tabPanel.activeTab = null;
    tabPanel.activePanel = null;
    tabPanel.activeIndex = -1;

    // 保存选项。
    options = tabPanel.setOptions(options).options;

    // 使用 Switcher 实现选项卡切换。
    var tabs = elements.tabs;
    var panels = elements.panels;
    var switcher = tabPanel.switcher = new Switcher(tabs).on('active', function(event) {
      // 收集数据。
      var activeIndex = event.activeIndex;
      var activeTab = event.activeItem;
      var activePanel = activeIndex > -1 ? panels[activeIndex] : null;
      var inactiveIndex = event.inactiveIndex;
      var inactiveTab = event.inactiveItem;
      var inactivePanel = inactiveIndex > -1 ? panels[inactiveIndex] : null;
      // 保存状态。
      tabPanel.activeTab = activeTab;
      tabPanel.activePanel = activePanel;
      tabPanel.activeIndex = activeIndex;
      // 更改“标签”和“面板”。
      var className = options.activeClassName;
      if (activeIndex > -1) {
        activeTab.addClass(className);
        activePanel.addClass(className);
      }
      if (inactiveIndex > -1) {
        inactiveTab.removeClass(className);
        inactivePanel.removeClass(className);
      }
      // 触发事件。
      tabPanel.fire('active', {
        activeTab: activeTab,
        activePanel: activePanel,
        activeIndex: activeIndex,
        inactiveTab: inactiveTab,
        inactivePanel: inactivePanel,
        inactiveIndex: inactiveIndex
      });
    });

    // 绑定激活标签页的事件。
    var $tabSample = tabs.getFirst();
    var delegate = ':relay(' + $tabSample.nodeName.toLowerCase() + ')';
    var timer;
    $tabSample.getParent()
        .on('click.tabPanel' + delegate, function() {
          if (tabs.contains(this)) {
            switcher.active(this);
          }
        })
        .on('mouseenter.tabPanel' + delegate, function() {
          if (Number.isFinite(options.hoverDelay) && tabs.contains(this)) {
            var $tab = this;
            timer = setTimeout(function() {
              switcher.active($tab);
            }, options.hoverDelay);
          }
        })
        .on('mouseleave.tabPanel' + delegate, function() {
          if (Number.isFinite(options.hoverDelay) && tabs.contains(this)) {
            clearTimeout(timer);
          }
        });

  }

//--------------------------------------------------[TabPanel.options]
  /**
   * 默认选项。
   * @name TabPanel.options
   */
  TabPanel.options = {
    activeClassName: 'active',
    hoverDelay: undefined
  };

//--------------------------------------------------[TabPanel.prototype.active]
  /**
   * 激活一组“标签面板”。
   * @name TabPanel.prototype.active
   * @function
   * @param {Element|number} value 要激活的“标签面板”的“标签”元素、“面板”元素或它们在各自所属的数组（tabs 和 panels）中的索引值。
   *   从 tabs 和 panels 中计算的，默认激活的某组“标签面板”的索引值从 0 开始。
   *   如果指定的值为不在 tabs 或 panels 中的对象，或为一个不在有效范索引围内的数字，则取消激活的“标签面板”。
   * @returns {Object} TabPanel 对象。
   * @description
   *   如果要激活的“标签面板”已在激活状态，则调用此方法无效。
   */
  TabPanel.prototype.active = function(value) {
    var index = -1;
    var x;
    if (typeof value === 'number') {
      index = value;
    } else {
      x = this.elements.tabs.indexOf(value);
      if (x > -1) {
        index = x;
      } else {
        x = this.elements.panels.indexOf(value);
        if (x > -1) {
          index = x;
        }
      }
    }
    this.switcher.active(index);
    return this;
  };

//--------------------------------------------------[TabPanel]
  window.TabPanel = new Component(TabPanel, TabPanel.options, TabPanel.prototype);

});

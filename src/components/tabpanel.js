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
   * @param {Object} [config] 配置信息。
   * @param {string} config.activeClassName 为激活的“标签”和“面板”添加的类名，默认为 'active'。
   * @param {number} config.hoverDelay 以毫秒为单位的“标签”鼠标悬停激活延时，默认为 undefined，此时由鼠标点击事件激活。若要启用鼠标悬停激活，建议设置为 200 - 400 之间的数值。
   * @fires activate
   *   {Element} activeTab 当前的激活的“标签”。
   *   {Element} activePanel 当前的激活的“面板”。
   *   {Element} inactiveTab 上一个激活的“标签”。
   *   {Element} inactivePanel 上一个激活的“面板”。
   *   成功调用 activate 方法后触发。
   * @requires Switcher
   * @description
   *   “标签”和“面板”必须按顺序一一对应，保存在参数 tabs 和 panels 中。
   *   一个“标签”和一个“面板”组成一组“标签面板”。
   *   同一时刻最多只有一组“标签面板”被激活。
   */
  var TabPanel = new Component(function(elements, config) {
    var tabPanel = this;

    // 获取配置信息。
    config = tabPanel.setConfig(config);

    // 保存属性。
    tabPanel.elements = elements;
    tabPanel.activeTab = null;
    tabPanel.activePanel = null;

    // 使用 Switcher 实现选项卡切换。
    var tabs = elements.tabs;
    var panels = elements.panels;
    var switcher = tabPanel.switcher = new Switcher(tabs).on('activate', function(event) {
      var activeTab = tabPanel.activeTab = event.activeItem;
      var activePanel = tabPanel.activePanel = activeTab ? panels[tabs.indexOf(activeTab)] : null;
      var inactiveTab = event.inactiveItem;
      var inactivePanel = inactiveTab ? panels[tabs.indexOf(inactiveTab)] : null;
      var className = config.activeClassName;
      if (activeTab && activePanel) {
        activeTab.addClass(className);
        activePanel.addClass(className);
      }
      if (inactiveTab && inactivePanel) {
        inactiveTab.removeClass(className);
        inactivePanel.removeClass(className);
      }
      tabPanel.fire('activate', {
        activeTab: activeTab,
        activePanel: activePanel,
        inactiveTab: inactiveTab,
        inactivePanel: inactivePanel
      });
    });

    // 绑定激活标签页的事件。
    var $tabSample = tabs.getFirst();
    var $tabContainer = $tabSample;
    tabs.forEach(function($tab) {
      while (!$tabContainer.contains($tab)) {
        $tabContainer = $tabContainer.getParent();
      }
    });
    var delegate = ':relay(' + $tabSample.nodeName.toLowerCase() + ')';
    var timer;
    $tabContainer
        .on('click.tabPanel' + delegate, function() {
          if (tabs.contains(this)) {
            switcher.activate(this);
          }
        })
        .on('mouseenter.tabPanel' + delegate, function() {
          if (Number.isFinite(config.hoverDelay) && tabs.contains(this)) {
            var $tab = this;
            timer = setTimeout(function() {
              switcher.activate($tab);
            }, config.hoverDelay);
          }
        })
        .on('mouseleave.tabPanel' + delegate, function() {
          if (Number.isFinite(config.hoverDelay) && tabs.contains(this)) {
            clearTimeout(timer);
          }
        });

  });

//--------------------------------------------------[TabPanel.config]
  /**
   * 默认配置。
   * @name TabPanel.config
   */
  TabPanel.config = {
    activeClassName: 'active',
    hoverDelay: undefined
  };

//--------------------------------------------------[TabPanel.prototype.activate]
  /**
   * 激活一组“标签面板”。
   * @name TabPanel.prototype.activate
   * @function
   * @param {Element|number} value 要激活的“标签面板”的“标签”元素或其在 tabs 中的索引值。
   *   如果指定的值为不在 tabs 中的对象，或为一个不在有效范索引围内的数字，则取消激活的“标签面板”。
   * @returns {Object} TabPanel 对象。
   * @description
   *   如果要激活的“标签面板”已在激活状态，则调用此方法无效。
   */
  TabPanel.prototype.activate = function(value) {
    this.switcher.activate(typeof value === 'number' ? value : this.elements.tabs.indexOf(value));
    return this;
  };

//--------------------------------------------------[TabPanel]
  window.TabPanel = TabPanel;

});

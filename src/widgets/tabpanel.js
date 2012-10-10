/**
 * @fileOverview 控件 - 多页标签面板。
 * @author sundongguo@gmail.com
 * @version 20121008
 */
//==================================================[控件 - 多页标签面板]
if (navigator.isIElt9) {
  document.createElement('widget-tabpanel');
}

//--------------------------------------------------[Widget.parsers.tabpanel]
/**
 * 多页标签面板。
 * @name Widget.parsers.tabpanel
 * @namespace
 * @description
 *   元素 WIDGET-TABPANEL 表示一个多页标签面板，其子元素中包含类名 'tab' 的为“标签”，包含类名 'panel' 的为“面板”。
 *   “标签”和“面板”必须按顺序一一对应。
 *   一个“标签”和一个“面板”组成一组“标签面板”。
 *   只有被激活的“标签面板”中的“面板”才会显示（对应的“标签”和“面板”会被自动加入 'active' 类），其余的“面板”将被隐藏，同一时刻最多只有一组“标签面板”被激活。
 *   TagName:
 *     WIDGET-TABPANEL
 *   Attributes：
 *     data-default-active-index 指定默认激活第几组“标签面板”，默认为 '0'，即激活第一组。
 *     data-hover-delay 指定以毫秒为单位的“标签”鼠标悬停激活延时，默认为 NaN，此时由鼠标点击事件激活。若要启用鼠标悬停激活，建议设置为 '200' - '400' 之间的数值。
 *   Properties：
 *     activeTab
 *     activePanel
 *     activeIndex
 *   Method:
 *     activate 激活一组“标签面板”。如果要激活的“标签面板”已在激活状态，则调用此方法无效。
 *     参数：
 *       {Element|number} value 要激活的“标签面板”的“标签”元素或“面板”元素，或者它们在所有“标签”和“面板”中的索引值。如果指定的值为不是“标签”或“面板”，或者为一个不在有效范围内的数字，则取消激活的“标签面板”。
 *     返回值：
 *       {Element} 本元素。
 *   Events：
 *     activate 成功调用 activate 方法后触发。
 *       {Element} activeTab 当前的激活的“标签”。
 *       {Element} activePanel 当前的激活的“面板”。
 *       {Element} inactiveTab 上一个激活的“标签”。
 *       {Element} inactivePanel 上一个激活的“面板”。
 */
Widget.parsers.tabpanel = function($element) {
  var tabs = $element.find('.tab');
  var panels = $element.find('.panel');

  var config = Widget.getConfig($element, {
    hoverDelay: NaN,
    defaultActiveIndex: 0
  });
  console.log(config.hoverDelay);

  var tabPanel = new TabPanel({
    tabs: tabs,
    panels: panels
  }, {
    activeClassName: 'active',
    hoverDelay: config.hoverDelay
  }).activate(parseInt($element.getAttribute('defaultActiveIndex'), 10) || 0);
  Object.mixin($element, tabPanel);
  Object.mixin($element, TabPanel.prototype, {blackList: ['constructor']});
};

//--------------------------------------------------[TEST]
document.on('domready', function() {
  var $test = $('#test');
  setTimeout(function() {
    $test.activate(0);
  }, 1000);

  $test.highlight();

});

execute(function($) {
//--------------------------------------------------[TabPanel Constructor]
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
  TabPanel.config = {
    activeClassName: 'active',
    hoverDelay: NaN
  };

//--------------------------------------------------[TabPanel.prototype.activate]
  TabPanel.prototype.activate = function(value) {
    var index;
    if (typeof value === 'number') {
      index = value;
    } else {
      index = this.elements.tabs.indexOf(value);
      if (index === -1) {
        index = this.elements.panels.indexOf(value);
      }
    }
    this.switcher.activate(index);
    return this;
  };

//--------------------------------------------------[TabPanel]
  window.TabPanel = TabPanel;

});

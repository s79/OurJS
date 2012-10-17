/**
 * @fileOverview 控件 - 多页标签面板。
 * @author sundongguo@gmail.com
 * @version 20121008
 */

(function() {
//==================================================[控件 - 多页标签面板]
  /**
   * 多页标签面板。
   * @name TABPANEL
   * @namespace
   * @description
   *   使用 INS[widget=tabpanel] 元素来表示一个多页标签面板，其子元素中包含类名 'tab' 的为“标签”，包含类名 'panel' 的为“面板”。
   *   “标签”和“面板”必须按顺序一一对应。
   *   一个“标签”和一个“面板”组成一组“标签面板”。
   *   同一时刻最多只有一组“标签面板”被激活， 被激活的“标签”和“面板”会被自动加入 'active' 类。
   *   只有被激活的“标签面板”中的“面板”才会显示（display: block），其余的“面板”将被隐藏（display: none）。
   *   Attributes：
   *     data-hover-delay (hoverDelay) 指定以毫秒为单位的“标签”鼠标悬停激活延时，默认为 NaN，此时由鼠标点击事件激活。若要启用鼠标悬停激活，建议设置为 '200' - '400' 之间的数值。
   *   Properties：
   *     tabs
   *     panels
   *     activeTab
   *     activePanel
   *   Method:
   *     activate 激活一组“标签面板”。如果要激活的“标签面板”已在激活状态，则调用此方法无效。
   *     参数：
   *       {Element|number} value 要激活的“标签面板”的“标签”元素或“面板”元素，或者它们在所有“标签”和“面板”中的索引值。如果指定的值为不是“标签”或“面板”，或者为一个不在有效范围内的数字，则取消激活的“标签面板”。
   *     返回值：
   *       {Element} 本元素。
   *   Events：
   *     activate 成功调用 activate 方法后触发。
   *     事件对象的属性：
   *       {Element} activeTab 当前的激活的“标签”。
   *       {Element} activePanel 当前的激活的“面板”。
   *       {Element} inactiveTab 上一个激活的“标签”。
   *       {Element} inactivePanel 上一个激活的“面板”。
   */

//--------------------------------------------------[CSSRules]
  document.addStyleRules([
    'INS[widget=tabpanel] { display: block; }',
    'INS[widget=tabpanel] .panel { display: none; }',
    'INS[widget=tabpanel] .active { display: block; }'
  ]);

//--------------------------------------------------[Widget.parsers.tabpanel]
  Widget.parsers.tabpanel = function($element) {
    // 保存属性。
    var tabs = $element.tabs = $element.find('.tab');
    var panels = $element.panels = $element.find('.panel');
    $element.activeTab = null;
    $element.activePanel = null;

    // 使用 Switcher 实现选项卡切换。
    var switcher = $element.switcher = new Switcher(tabs).on('activate', function(event) {
      var activeTab = event.activeItem;
      var activePanel = activeTab ? panels[tabs.indexOf(activeTab)] : null;
      var inactiveTab = event.inactiveItem;
      var inactivePanel = inactiveTab ? panels[tabs.indexOf(inactiveTab)] : null;
      if (activeTab && activePanel) {
        activeTab.addClass('active');
        activePanel.addClass('active');
        $element.activeTab = activeTab;
        $element.activePanel = activePanel;
      }
      if (inactiveTab && inactivePanel) {
        inactiveTab.removeClass('active');
        inactivePanel.removeClass('active');
      }
      $element.fire('activate', {
        activeTab: activeTab,
        activePanel: activePanel,
        inactiveTab: inactiveTab,
        inactivePanel: inactivePanel
      });
    });

    // 绑定事件。
    var timer;
    $element
        .on('click.tabpanel:relay(.tab)', function(event) {
          if (tabs.contains(this)) {
            switcher.activate(this);
            // 避免在 IE 中触发 beforeunload 事件，以及链接点击成功后可能出现的音效。
            event.preventDefault();
          }
        })
        .on('mouseenter.tabpanel:relay(.tab)', function() {
          if (Number.isFinite($element.hoverDelay)) {
            var $tab = this;
            timer = setTimeout(function() {
              switcher.activate($tab);
            }, $element.hoverDelay);
          }
        })
        .on('mouseleave.tabpanel:relay(.tab)', function() {
          if (timer) {
            clearTimeout(timer);
            timer = undefined;
          }
        });

    // 默认激活第一组。
    $element.activate(0);

  };

//--------------------------------------------------[Widget.parsers.tabpanel.config]
  Widget.parsers.tabpanel.config = {
    hoverDelay: NaN
  };

//--------------------------------------------------[Widget.parsers.tabpanel.methods]
  Widget.parsers.tabpanel.methods = {
    activate: function(value) {
      var index;
      if (typeof value === 'number') {
        index = value;
      } else {
        index = this.tabs.indexOf(value);
        if (index === -1) {
          index = this.panels.indexOf(value);
        }
      }
      this.switcher.activate(index);
      return this;
    }
  };

//--------------------------------------------------[Widget.parsers.tabpanel.events]
  Widget.parsers.tabpanel.events = ['activate'];

})();

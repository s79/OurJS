/**
 * @fileOverview Widget - 演示区
 * @author sundongguo@gmail.com
 * @version 20121210
 */

(function() {
//==================================================[Widget - 演示区]
//--------------------------------------------------[keepDemoAreaIntoView]
  var keepDemoAreaIntoView = function($demoarea, increment) {
    var $body = document.$('body');
    var demoareaClientRect = $demoarea.getClientRect();
    var demoareaClientRectLater = {
      top: demoareaClientRect.top,
      bottom: demoareaClientRect.bottom + increment
    };
    var viewportClientRect = {
      top: 50,
      bottom: window.getClientSize().height
    };
    var topDifference = demoareaClientRectLater.top - viewportClientRect.top;
    var bottomDifference = demoareaClientRectLater.bottom - viewportClientRect.bottom;
    var y = topDifference < 0 ? '-=' + (-topDifference) : (bottomDifference > 0 ? '+=' + Math.min(topDifference, bottomDifference) : undefined);
    if (y) {
      $body.smoothScroll(0, y, {duration: 400, timingFunction: 'ease'});
    }
  };

//--------------------------------------------------[DemoArea]
  /**
   * 演示区。
   * @name DemoArea
   * @constructor
   * @description 启用方式
   *   为一个 DIV 元素添加 'widget-demoarea' 类，即可使该元素成为“演示区”。
   * @description 结构约定
   *   “演示区”的宽度是固定的，高度可以配置。
   * @description 可配置项
   *   data-src
   *     演示文件的路径，必须指定。
   *   data-content-height
   *     “演示区”内容的高度，单位为像素。
   *     如果不指定本属性，则使用 350 作为默认值。
   * @requires TabPanel
   */

  Widget.register({
    type: 'demoarea',
    selector: 'div.widget-demoarea',
    styleRules: [
      'div.widget-demoarea { display: block; }',
      'div.widget-demoarea .panels { border: 2px solid gainsboro; }',
      'div.widget-demoarea iframe { display: none; width: 956px; height: 350px;}',
      'div.widget-demoarea iframe.active { display: block; }',
      'div.widget-demoarea .tabs { height: 33px; }',
      'div.widget-demoarea span { position: relative; z-index: 100; float: right; height: 20px; padding: 5px 10px; border: 2px solid white; border-top: none; line-height: 20px; }',
      'div.widget-demoarea .tab { cursor: default; color: #333; }',
      'div.widget-demoarea .tab:hover { border-color: whitesmoke; background: whitesmoke; color: #396686; }',
      'div.widget-demoarea span.active, div.widget-demoarea span.active:hover { margin-top: -2px; padding-top: 8px; border-color: gainsboro; background: white; color: #333; }'
    ],
    config: {
      src: '',
      contentHeight: 350
    },
    initialize: function() {
      var $demoarea = this;

      var src = $demoarea.src;

      // 创建内部结构。
      $demoarea.insertAdjacentHTML('beforeEnd', '<div class="panels"><iframe src="' + src + '" frameborder="no" allowtransparency="true" class="panel"></iframe><iframe src="" frameborder="no" allowtransparency="true" class="panel"></iframe></div><div class="tabs"><span class="tab">效果预览</span><span class="tab">查看源码</span><span><a href="' + src + '" target="_blank" class="link">在新页面打开</a></span></div>');
      $demoarea.findAll('iframe').forEach(function($iframe) {
        $iframe.setStyle('height', $demoarea.contentHeight);
      });

      // 使用 TabPanel 实现切换功能。
      Widget.parsers.tabpanel.parse($demoarea);

      // “查看源码”功能。
      document.on('afterdomready', function() {
        $demoarea.on('activate', function(e) {
          if (e.activeTab.innerText === '查看源码') {
            var $iframe = e.activePanel;
            if (!$iframe.getData('injected')) {
              var path = location.pathname;
              $iframe.setData('injected', 'true').src = (path.indexOf('OurJS') === 1 ? '/OurJS/' : '/framework/') + 'scripts/widget-demoarea.html?src=' + path.slice(0, path.lastIndexOf('/') + 1) + src;
            }
            var panelHeight = $iframe.offsetHeight;
            if (panelHeight < 500) {
              $demoarea.shrinkingPanelHeight = panelHeight;
              $demoarea.panels.forEach(function($iframe) {
                $iframe.morph({height: 500});
              });
              keepDemoAreaIntoView($demoarea, 500 - $demoarea.shrinkingPanelHeight);
            }
          } else {
            if ($demoarea.shrinkingPanelHeight) {
              $demoarea.panels.forEach(function($iframe) {
                $iframe.morph({height: $demoarea.shrinkingPanelHeight});
              });
              keepDemoAreaIntoView($demoarea, $demoarea.shrinkingPanelHeight - 500);
            }
          }
          if (!$demoarea.shrinkingPanelHeight) {
            keepDemoAreaIntoView($demoarea, 0);
          }
        });
      });
    }
  });

})();

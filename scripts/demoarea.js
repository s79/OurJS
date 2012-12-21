/**
 * @fileOverview Widget - 演示区。
 * @author sundongguo@gmail.com
 * @version 20121210
 */

(function() {
//==================================================[Widget - 演示区]
//--------------------------------------------------[DemoArea]
  /**
   * 演示区。
   * @name DemoArea
   * @constructor
   * @attribute data-src
   *   演示文件的路径，必须指定。
   * @description
   *   为元素添加 'widget-demoarea' 类，即可使该元素成为演示区。
   * @requires TabPanel
   */

  Widget.register('demoarea', {
    css: [
      '.widget-demoarea { display: block; }',
      '.widget-demoarea .panels { border: 1px solid gainsboro; }',
      '.widget-demoarea iframe { display: none; background: whitesmoke; }',
      '.widget-demoarea iframe.active { display: block; }',
      '.widget-demoarea .tabs { height: 31px; }',
      '.widget-demoarea span { position: relative; z-index: 100; float: right; height: 20px; padding: 5px 10px; border: 1px solid white; border-top: none; line-height: 20px; }',
      '.widget-demoarea .tab { cursor: default; color: #333; }',
      '.widget-demoarea .tab:hover { border-color: whitesmoke; background: whitesmoke; color: #396686; }',
      '.widget-demoarea span.active, .widget-demoarea span.active:hover { margin-top: -1px; padding-top: 6px; border-color: gainsboro; background: whitesmoke; color: #333; }'
    ],
    config: {
      src: ''
    },
    initialize: function() {
      var src = this.src;

      // 创建内部结构。
      this.insertAdjacentHTML('beforeEnd', '<div class="panels"><iframe src="" frameborder="no" allowtransparency="true" class="panel"></iframe><iframe src="" frameborder="no" allowtransparency="true" class="panel"></iframe></div><div class="tabs"><span class="tab">效果预览</span><span class="tab">查看源码</span><span><a href="' + src + '" target="_blank" class="link">在新页面打开</a></span></div>');
      this.getFirstChild().getFirstChild().src = src;

      // 使用 TabPanel 实现切换功能。
      Widget.parsers.tabpanel(this);

      // “查看源码”功能。
      this.on('activate', function(e) {
        if (e.activeTab.innerText === '查看源码') {
          var $iframe = e.activePanel;
          if (!$iframe.getData('injected')) {
            var path = location.pathname;
            $iframe.setData('injected', 'true').src = (path.indexOf('OurJS') === 1 ? '/OurJS/' : '/framework/') + 'scripts/demoarea_view_source.html?src=' + path.slice(0, path.lastIndexOf('/') + 1) + src;
          }
        }
      });

    }
  });

})();

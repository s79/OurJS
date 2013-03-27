/**
 * @fileOverview Widget - 滚动框
 * @author sundongguo@gmail.com
 * @version 20130216
 */

(function() {
//==================================================[Widget - 滚动框]
//--------------------------------------------------[getPixelLength]
  var getPixelLength = function($element, style) {
    return parseInt($element.getStyle(style), 10) || 0;
  };

//--------------------------------------------------[getSystemScrollbarWidth]
  var getSystemScrollbarWidth = function() {
    var systemScrollbarWidth;
    return function() {
      if (systemScrollbarWidth) {
        return systemScrollbarWidth;
      }
      var $box = document.$('<div style="position: absolute; top: 0; left: -10000px; width: 100px; height: 100px; overflow: scroll;"><div style="height: 200px;"></div></div>').insertTo(document.body);
      systemScrollbarWidth = 100 - $box.getFirstChild().offsetWidth;
      $box.remove();
      return systemScrollbarWidth;
    };
  }();

//--------------------------------------------------[Scrollbox]
  /**
   * 滚动框。
   * @name Scrollbox
   * @constructor
   * @attribute data-scrollbar-min-height
   *   滚动条的最小高度，单位为像素。
   *   如果不指定本属性，则使用 20 作为默认值。
   * @fires update
   *   调用 update 方法后触发。
   * @description
   *   滚动框可以为其“可滚动”的子元素添加可自定义样式的滚动条及其轨道（仅支持纵向滚动）。
   *   <strong>启用方式：</strong>
   *   为一个元素添加 'widget-scrollbox' 类，即可使该元素成为滚动框。
   *   <strong>结构约定：</strong>
   *   滚动框元素必须包含一个子元素作为“内容区域”，并且该元素应该是“可滚动”的。该元素的可视尺寸将自动调整为与滚动框元素的可视尺寸一致，其 margin-right 的值将被用作滚动内容右侧与滚动条左侧之间的间距，其他方向的 margin 以及所有方向的 padding、border-width 都将被设置为 0；其 overflow-x 将被设置为 'hidden'，overflow-y 将被设置为 'scroll'。
   *   滚动框元素的 position 将被设置为 'relative'，overflow 将被设置为 'hidden'。
   *   当滚动框初始化时，会在其内部自动创建一个新的 DIV 元素作为滚动条及其轨道。
   *   <strong>新增行为：</strong>
   *   当使用鼠标拖动滚动条时，“可滚动”元素的“内容区域”将随之滚动，滚动条元素将被添加类名 'active'，该类名将在拖动结束时被移除。
   *   当使用鼠标点击滚动轨道时，“可滚动”元素的“内容区域”将自动滚动到对应的位置。
   *   当“可滚动”元素的“内容区域”滚动时，滚动条也将随之滚动。
   *   <strong>默认样式：</strong>
   *   <pre class="lang-css">
   *   .widget-scrollbox { position: relative; overflow: hidden; }
   *   .widget-scrollbox .track { position: absolute; right: 0; top: 0; z-index: 100000; width: 10px; background: whitesmoke; cursor: default; }
   *   .widget-scrollbox .track div { width: 10px; overflow: hidden; font-size: 0; }
   *   .widget-scrollbox .track .scrollbar { position: absolute; left: 0; top: 0; background: silver; }
   *   .widget-scrollbox .track .active { background: lightgrey; }
   *   </pre>
   */

  /**
   * 更新滚动条。
   * @name Scrollbox#update
   * @function
   * @returns {Element} 本元素。
   * @description
   *   当滚动框的尺寸、可见性或其“可滚动”的子元素的内容发生变化时，需手动调用本方法，以校正滚动条的位置及尺寸。
   */

  Widget.register('scrollbox', {
    css: [
      '.widget-scrollbox { position: relative; overflow: hidden; }',
      '.widget-scrollbox .track { position: absolute; right: 0; top: 0; z-index: 100000; width: 10px; background: whitesmoke; cursor: default; }',
      '.widget-scrollbox .track div { width: 10px; overflow: hidden; font-size: 0; }',
      '.widget-scrollbox .track .scrollbar { position: absolute; left: 0; top: 0; background: silver; }',
      '.widget-scrollbox .track .active { background: lightgrey; }'
    ],
    config: {
      scrollbarMinHeight: 20
    },
    methods: {
      update: function() {
        var $element = this;
        // 更新滚动条。
        var $content = $element.content;
        var $track = $element.elements.track;
        var $scrollbar = $element.elements.scrollbar;
        // 调整“内容区域”的尺寸。
        var paddingTop = getPixelLength($element, 'paddingTop');
        var paddingRight = getPixelLength($element, 'paddingRight');
        var paddingBottom = getPixelLength($element, 'paddingBottom');
        var paddingLeft = getPixelLength($element, 'paddingLeft');
        var marginRight = getPixelLength($content, 'marginRight');
        var clientWidth = $element.clientWidth - paddingLeft - paddingRight;
        var clientHeight = $element.clientHeight - paddingTop - paddingBottom;
        $content.setStyles({
          visibility: 'visible',
          margin: 0,
          marginRight: marginRight,
          padding: 0,
          // 右侧内部丁设为 100，以将“系统滚动条”溢出隐藏到滚动框的右侧。
          paddingRight: 100,
          border: '0 none',
          width: clientWidth + getSystemScrollbarWidth() - $track.clientWidth - marginRight,
          height: clientHeight,
          overflowX: 'hidden',
          overflowY: 'scroll'
        });
        // 调整滚动轨道的位置及尺寸。
        $track.setStyles({
          top: paddingTop,
          right: paddingRight,
          height: clientHeight
        });
        // 调整滚动条的尺寸。
        // IE7 需要主动触发 reflow 以使滚动条显示正常。
        var reflow = $content.offsetWidth;
        var scrollHeight = $content.scrollHeight;
        if (scrollHeight > clientHeight) {
          $scrollbar.setStyle('display', 'block');
          var scrollbarTopAndBottomHeight = $element.elements.scrollbarTop.clientHeight + $element.elements.scrollbarBottom.clientHeight;
          var avaliableTrackHeight = $element.avaliableTrackHeight = clientHeight - Math.max(scrollbarTopAndBottomHeight, $element.scrollbarMinHeight);
          var scrollRate = $element.scrollRate = scrollHeight / avaliableTrackHeight;
          $element.elements.scrollbarMiddle.setStyle('height', clientHeight - Math.round((scrollHeight - clientHeight) / scrollRate) - scrollbarTopAndBottomHeight);
          $content.fire('scroll', {bubbles: false});
        } else {
          $scrollbar.setStyle('display', 'none');
        }
        $track.setStyle('visibility', 'visible');
        // 触发事件。
        $element.fire('update');
        return $element;
      }
    },
    events: ['update'],
    initialize: function() {
      // 避免一些浏览器横向拖动时造成“内容区域”在滚动框内横向滚动。
      var $element = this.on('scroll', function() {
        this.scrollLeft = 0;
      });
      // 更新滚动条前先隐藏“内容区域”。
      var $content = $element.getFirstChild().setStyle('visibility', 'hidden');

      // 添加滚动条及其轨道，并处理轨道点击事件。
      var $track = document.$('<div class="track"><div class="scrollbar"><div class="top"></div><div class="middle"></div><div class="bottom"></div></div></div>')
          .setStyle('visibility', 'hidden')
          .on('mousedown', function(e) {
            if (e.target === this && $scrollbar.offsetWidth) {
              var trackClientRect = this.getClientRect();
              $content.smoothScroll(0, $content.scrollHeight * (e.clientY - trackClientRect.top) / (trackClientRect.bottom - trackClientRect.top) - $content.clientHeight / 2);
              e.stopPropagation();
            }
          })
          .insertTo($element);
      // 处理滚动条拖拽事件。
      var scrollTopBeforeDrag;
      var $scrollbar = $track.getFirstChild()
          .on('mousedragstart', function() {
            scrollTopBeforeDrag = $content.scrollTop;
            this.addClass('active');
          })
          .on('mousedrag', function(e) {
            $content.scrollTop = scrollTopBeforeDrag + e.offsetY * $element.scrollRate;
          })
          .on('mousedragend', function() {
            this.removeClass('active');
          });

      // 在“内容区域”滚动时更新滚动条的位置。
      $content.on('scroll', function() {
        var top = Math.round(this.scrollTop / this.scrollHeight * $element.avaliableTrackHeight);
        if (isFinite(top)) {
          $scrollbar.setStyle('top', top);
        }
      });

      // 保存属性。
      Object.mixin($element, {
        elements: {
          track: $track,
          scrollbar: $scrollbar,
          scrollbarTop: $scrollbar.getFirstChild(),
          scrollbarMiddle: $scrollbar.getFirstChild().getNextSibling(),
          scrollbarBottom: $scrollbar.getLastChild()
        },
        content: $content,
        scrollRate: 0,
        avaliableTrackHeight: 0
      });

      // 如果滚动框可见则更新滚动条。
      if ($element.offsetWidth) {
        $element.update();
      }

    }
  });

})();

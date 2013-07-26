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

//--------------------------------------------------[ScrollBox]
  /**
   * “滚动框”可以为其“内容区域”添加可自定义样式的“轨道”及“滚动条”（仅支持纵向滚动）。
   * @启用方式
   *   为一个 DIV 元素添加 'widget-scrollbox' 类，即可使该元素成为“滚动框”。
   * @结构约定
   * * “滚动框”必须包含一个子元素作为“内容区域”。该元素必须是块级元素，其 width、height、margin、padding、border-width、overflow 的设置都将被忽略并重置为特定的值。
   * * 当“滚动框”初始化时，会在其内部自动创建“轨道” 'div.track'，并在“轨道”内创建“滚动条” 'div.scrollbar'。
   *   为便于定制“滚动条”的样式，在“滚动条”内还创建了三个元素 'div.top'，'div.middle' 和 'div.bottom'。
   * @默认样式
   *   div.widget-scrollbox { visibility: hidden; position: relative; overflow: hidden; }
   *   div.widget-scrollbox .track { position: absolute; right: 0; top: 0; z-index: 100000; width: 10px; background: whitesmoke; cursor: default; }
   *   div.widget-scrollbox .track div { overflow: hidden; }
   *   div.widget-scrollbox .track .scrollbar { position: absolute; left: 0; top: 0; width: 10px; background: silver; }
   *   div.widget-scrollbox .track .hover { background: darkgray; }
   *   div.widget-scrollbox .track .active { background: gray; }
   * @可配置项
   *   data-content-shrink
   *     “内容区域”右侧与“滚动框”右侧的间距，单位为像素。
   *     如果不指定本属性，则使用“轨道”的宽度作为默认值。
   *   data-scrollbar-min-height
   *     “滚动条”的最小高度，单位为像素。
   *     如果不指定本属性，则使用 20 作为默认值。
   * @新增行为
   * * 点击“轨道”或拖动“滚动条”时，“内容区域”将滚动到相应位置。
   *   通过按下导航键或调用脚本等方式使“内容区域”滚动时，“滚动条”的位置也将随之改变。
   * * 如果“滚动框”在文档可用后即被解析完毕，并且“滚动框”是可见的，则“滚动条”的位置及高度会被自动更新。
   * * 如果“内容区域”不需要滚动即可完全显示，则“滚动条”将被隐藏。
   * * 当鼠标移入“滚动条”时，“滚动条”将被添加类名 'hover'，该类名将在鼠标移出时被移除。
   *   当开始拖动“滚动条”时，“滚动条”将被添加类名 'active'，该类名将在拖动结束时被移除。
   * @新增属性
   * @新增方法
   *   update
   *     更新“滚动条”的位置及高度。
   *     当“滚动框”的尺寸、可见性或其“内容区域”的滚动高度发生变化时，需手动调用本方法对“滚动条”进行校正。
   *     返回值：
   *       {Element} 本元素。
   * @新增事件
   *   update
   *     调用 update 方法后触发。
   */

  Widget.register({
    type: 'scrollbox',
    selector: 'div.widget-scrollbox',
    styleRules: [
      'div.widget-scrollbox { visibility: hidden; position: relative; overflow: hidden; }',
      'div.widget-scrollbox .track { position: absolute; right: 0; top: 0; z-index: 100000; width: 10px; background: whitesmoke; cursor: default; }',
      'div.widget-scrollbox .track div { overflow: hidden; }',
      'div.widget-scrollbox .track .scrollbar { position: absolute; left: 0; top: 0; width: 10px; background: silver; }',
      'div.widget-scrollbox .track .hover { background: darkgray; }',
      'div.widget-scrollbox .track .active { background: gray; }'
    ],
    config: {
      contentShrink: NaN,
      scrollbarMinHeight: 20
    },
    methods: {
      update: function() {
        var $scrollbox = this.setStyle('visibility', 'visible');
        // 更新“滚动条”。
        var $content = $scrollbox.content;
        var $track = $scrollbox.elements.track;
        var $scrollbar = $scrollbox.elements.scrollbar;
        // 调整“内容区域”的尺寸。
        var paddingTop = getPixelLength($scrollbox, 'paddingTop');
        var paddingRight = getPixelLength($scrollbox, 'paddingRight');
        var paddingBottom = getPixelLength($scrollbox, 'paddingBottom');
        var paddingLeft = getPixelLength($scrollbox, 'paddingLeft');
        var clientWidth = $scrollbox.clientWidth - paddingLeft - paddingRight;
        var clientHeight = $scrollbox.clientHeight - paddingTop - paddingBottom;
        var contentShrink = $scrollbox.contentShrink;
        $content.setStyles({
          width: clientWidth + getSystemScrollbarWidth() - (Number.isNaN(contentShrink) ? $track.clientWidth : contentShrink),
          height: clientHeight,
          margin: 0,
          padding: 0,
          // 右侧内部丁设为 100，以将系统滚动条溢出隐藏到“滚动框”的右侧。
          paddingRight: 100,
          border: '0 none',
          overflowX: 'hidden',
          overflowY: 'scroll'
        });
        // 调整“轨道”的位置及尺寸。
        $track.setStyles({
          top: paddingTop,
          right: paddingRight,
          height: clientHeight
        });
        // 调整“滚动条”的高度。
        // IE7 需要主动触发 reflow 以使“滚动条”显示正常。
        var reflow = $content.offsetWidth;
        var scrollHeight = $content.scrollHeight;
        if (scrollHeight > clientHeight) {
          $scrollbar.setStyle('display', 'block');
          var scrollbarTopAndBottomHeight = $scrollbox.elements.scrollbarTop.clientHeight + $scrollbox.elements.scrollbarBottom.clientHeight;
          var avaliableTrackHeight = $scrollbox.avaliableTrackHeight = clientHeight - Math.max(scrollbarTopAndBottomHeight, $scrollbox.scrollbarMinHeight);
          var scrollRate = $scrollbox.scrollRate = scrollHeight / avaliableTrackHeight;
          $scrollbox.elements.scrollbarMiddle.setStyle('height', clientHeight - Math.round((scrollHeight - clientHeight) / scrollRate) - scrollbarTopAndBottomHeight);
          $content.fire('scroll', {bubbles: false});
        } else {
          $scrollbar.setStyle('display', 'none');
        }
        // 触发事件。
        $scrollbox.fire('update');
        return $scrollbox;
      }
    },
    initialize: function() {
      // 避免一些浏览器横向拖动时造成“内容区域”在“滚动框”内横向滚动。
      var $scrollbox = this.on('scroll', function() {
        this.scrollLeft = 0;
      });
      var $content = $scrollbox.getFirstChild();

      // 添加“轨道”及“滚动条”，并处理“轨道”上的点击事件。
      var $track = document.$('<div class="track"><div class="scrollbar"><div class="top"></div><div class="middle"></div><div class="bottom"></div></div></div>')
          .on('mousedown', function(e) {
            if (e.leftButton && e.target === this && $scrollbar.offsetWidth) {
              var trackClientRect = this.getClientRect();
              $content.smoothScroll(0, $content.scrollHeight * (e.clientY - trackClientRect.top) / (trackClientRect.bottom - trackClientRect.top) - $content.clientHeight / 2);
              e.stopPropagation();
            }
          })
          .insertTo($scrollbox);
      // 处理“滚动条”拖拽事件。
      var scrollTopBeforeDrag;
      var $scrollbar = $track.getFirstChild()
          .on('mouseenter', function() {
            this.addClass('hover');
          })
          .on('mouseleave', function() {
            this.removeClass('hover');
          })
          .on('mousedragstart', function() {
            scrollTopBeforeDrag = $content.scrollTop;
            this.addClass('active');
          })
          .on('mousedrag', function(e) {
            $content.scrollTop = scrollTopBeforeDrag + e.offsetY * $scrollbox.scrollRate;
          })
          .on('mousedragend', function() {
            this.removeClass('active');
          });

      // 当“内容区域”滚动时，更新“滚动条”的位置。
      $content.on('scroll', function() {
        var top = Math.round(this.scrollTop / this.scrollHeight * $scrollbox.avaliableTrackHeight);
        if (isFinite(top)) {
          $scrollbar.setStyle('top', top);
        }
      });

      // 保存属性。
      Object.mixin($scrollbox, {
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

      // 如果“滚动框”可见则自动更新“滚动条”。
      if ($scrollbox.offsetWidth) {
        document.on('afterdomready', function() {
          if ($scrollbox.style.visibility !== 'visible') {
            $scrollbox.update();
          }
        });
      }

    }
  });

})();

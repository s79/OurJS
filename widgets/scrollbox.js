/**
 * @fileOverview Widget - 滚动框。
 * @author sundongguo@gmail.com
 * @version 20130216
 */

(function() {
//==================================================[Widget - 滚动框]
//--------------------------------------------------[getPixelLength]
  var getPixelLength = function($element, style) {
    return parseInt($element.getStyle(style), 10) || 0;
  };

//--------------------------------------------------[getScrollbarWidth]
  var getScrollbarWidth = function() {
    var scrollbarWidth;
    return function() {
      if (scrollbarWidth) {
        return scrollbarWidth;
      }
      var $outer = $('<div></div>').setStyles({position: 'absolute', top: 0, left: -10000, width: 100, height: 100, overflow: 'scroll'});
      var $inner = $('<div></div>').setStyles({height: 200});
      $inner.insertTo($outer.insertTo(document.body));
      scrollbarWidth = 100 - $inner.offsetWidth;
      $outer.remove();
      return scrollbarWidth;
    };
  }();

//--------------------------------------------------[Scrollbox]
  /**
   * 滚动框。
   * @name Scrollbox
   * @constructor
   * @fires update
   *   调用 update 方法后触发。
   * @description
   *   滚动框可以为其“可滚动”的子元素添加可自定义样式的滚动条（仅支持纵向滚动）。
   *   <strong>启用方式：</strong>
   *   为一个元素添加 'widget-scrollbox' 类，即可使该元素成为滚动框。
   *   <strong>结构约定：</strong>
   *   滚动框元素必须且只能包含一个子元素，并且该元素应该是“可滚动”的。该元素的可视尺寸将自动调整为与滚动框元素的可视尺寸一致，其 margin-right 的值将被用作滚动内容右侧与滚动条左侧之间的间距，其他方向的 margin 以及所有方向的 padding、border-width 都将被设置为 0；其 overflow-x 将被设置为 'hidden'，overflow-y 将被设置为 'scroll'。
   *   滚动框元素的 position 将被设置为 'relative'，overflow 将被设置为 'hidden'。
   *   当滚动框初始化时，会在其内部自动创建一个新的 DIV 元素作为滚动条。
   *   <strong>新增行为：</strong>
   *   当使用鼠标拖动滚动条时，“可滚动”元素的内容将随之滚动，滚动条活动部分将被添加类名 'active'，该类名将在拖动结束时被移除。
   *   当“可滚动”元素的内容滚动时，滚动条也将随之滚动。
   *   <strong>默认样式：</strong>
   *   <pre class="lang-css">
   *   .widget-scrollbox { position: relative; overflow: hidden; }
   *   .widget-scrollbox .track { position: absolute; right: 0; top: 0; z-index: 100000; width: 10px; background: whitesmoke; cursor: default; }
   *   .widget-scrollbox .track div { width: 10px; overflow: hidden; font-size: 0; }
   *   .widget-scrollbox .track .bar { position: absolute; left: 0; top: 0; background: silver; }
   *   .widget-scrollbox .track .active { background: lightgrey; }
   *   </pre>
   */

  /**
   * 更新滚动条。
   * @name Scrollbox#update
   * @function
   * @returns {Element} 本元素。
   * @description
   *   当滚动框的尺寸、可见性或其“可滚动”的子元素的内容发生变化时，需手动调用本方法，以校正滚动条的位置。
   */

  Widget.register('scrollbox', {
    css: [
      '.widget-scrollbox { position: relative; overflow: hidden; }',
      '.widget-scrollbox .track { position: absolute; right: 0; top: 0; z-index: 100000; width: 10px; background: whitesmoke; cursor: default; }',
      '.widget-scrollbox .track div { width: 10px; overflow: hidden; font-size: 0; }',
      '.widget-scrollbox .track .bar { position: absolute; left: 0; top: 0; background: silver; }',
      '.widget-scrollbox .track .active { background: lightgrey; }'
    ],
    methods: {
      update: function() {
        var $element = this;
        // 更新滚动条。
        var $content = $element.content;
        var $track = $element.elements.track;
        var $bar = $element.elements.bar;
        // 调整内容区域的尺寸。
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
          width: clientWidth + getScrollbarWidth() - $track.clientWidth - marginRight,
          height: clientHeight,
          overflowX: 'hidden',
          overflowY: 'scroll'
        });
        // 调整滚动条区域的尺寸。
        $track.setStyles({
          top: paddingTop,
          right: paddingRight,
          height: clientHeight
        });
        // 调整滚动条按钮的尺寸。
        // IE7 需要手动触发 reflow 以使滚动条显示正常。
        var reflowForIE7 = $content.clientWidth;
        var scrollHeight = $content.scrollHeight;
        if (scrollHeight > clientHeight) {
          $bar.setStyle('display', 'block');
          $element.elements.barMiddle.setStyle('height', Math.round(clientHeight / scrollHeight * ($element.avaliableTrackHeight = clientHeight - $element.elements.barTop.clientHeight - $element.elements.barBottom.clientHeight)));
          $element.scrollRate = scrollHeight / clientHeight;
          $content.fire('scroll', {bubbles: false});
        } else {
          $bar.setStyle('display', 'none');
        }
        $track.setStyle('visibility', 'visible');
        // 触发事件。
        $element.fire('update');
        return $element;
      }
    },
    events: ['update'],
    initialize: function() {
      // 避免一些浏览器横向拖动时造成内容区域在滚动框内横向滚动。
      var $element = this.on('scroll', function() {
        this.scrollLeft = 0;
      });
      // 更新滚动条前先隐藏滚动区域。
      var $content = $element.getFirstChild().setStyle('visibility', 'hidden');

      // 添加滚动区域，并提供点击事件的处理。
      var $track = document.$('<div class="track"><div class="bar"><div class="top"></div><div class="middle"></div><div class="bottom"></div></div></div>')
          .setStyle('visibility', 'hidden')
          .on('mousedown', function(e) {
            if (e.target === this && $bar.offsetWidth) {
              var trackClientRect = this.getClientRect();
              $content.smoothScroll(0, $content.scrollHeight * (e.clientY - trackClientRect.top) / (trackClientRect.bottom - trackClientRect.top) - $content.clientHeight / 2);
            }
            return false;
          })
          .insertTo($element);
      // 使滚动条的按钮部分可拖拽。
      var scrollTopBeforeDrag;
      var $bar = $track.getFirstChild()
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

      // 在内容滚动时更新滚动条。
      $content.on('scroll', function() {
        var top = Math.round(this.scrollTop / this.scrollHeight * $element.avaliableTrackHeight);
        if (isFinite(top)) {
          $bar.setStyle('top', top);
        }
      });

      // 保存属性。
      Object.mixin($element, {
        elements: {
          track: $track,
          bar: $bar,
          barTop: $bar.getFirstChild(),
          barMiddle: $bar.getFirstChild().getNextSibling(),
          barBottom: $bar.getLastChild()
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

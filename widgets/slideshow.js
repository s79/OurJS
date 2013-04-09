/**
 * @fileOverview Widget - 幻灯片播放器
 * @author sundongguo@gmail.com
 * @version 20121108
 */

(function() {
//==================================================[Widget - 幻灯片播放器]
//--------------------------------------------------[Slideshow]
  /**
   * 幻灯片播放器。
   * @name Slideshow
   * @constructor
   * @attribute data-animation
   *   幻灯片切换时使用的动画效果，可选项有 'none'，'fade', 'cover' 和 'slide'。
   *   如果不指定本属性，则使用 'fade'。
   *   当动画效果为 'slide' 时，所有幻灯片将被从左到右浮动排列；其他情况下所有幻灯片将绝对定位在其容器的左上角。
   * @attribute data-hover-delay
   *   以毫秒为单位的“指示器”鼠标悬停播放延时，仅在“指示器”存在时有效。
   *   如果指定本属性，则启用鼠标悬停播放（建议设置为 '200' - '400' 之间的数值）。
   *   如果不指定本属性，则由鼠标点击播放。
   * @attribute data-interval
   *   以毫秒为单位的幻灯片自动播放间隔。
   *   如果不指定本属性，则使用 '5000'，即每 5 秒更换一张幻灯片。
   * @fires show
   *   {Element} activeSlide 当前播放的“幻灯片”。
   *   {Element} activePointer 当前播放的“指示器”。
   *   {Element} inactiveSlide 上一个播放的“幻灯片”。
   *   {Element} inactivePointer 上一个播放的“指示器”。
   *   成功调用 show 方法后触发。
   * @fires showprevious
   *   调用 showPrevious 方法后触发。
   * @fires shownext
   *   调用 showNext 方法后触发。
   * @description
   *   幻灯片播放器用于播放一组“幻灯片”。一个“幻灯片”对应一个可选的“指示器”，它们的内容都是可以定制的。
   *   <strong>启用方式：</strong>
   *   为元素添加 'widget-slideshow' 类，即可使该元素成为幻灯片播放器。
   *   <strong>结构约定：</strong>
   *   幻灯片播放器的后代元素中，类名包含 'slides' 的为“幻灯片”的容器，类名包含 'slide' 的为“幻灯片”，类名包含 'pointers' 的为幻灯片的“指示器”的容器，类名包含 'pointer' 的为幻灯片的“指示器”，类名包含 'prev' 的为“播放上一张”按钮，包含 'next' 的为“播放下一张”按钮。
   *   所有“幻灯片”元素应有共同的父元素，并且它们的渲染尺寸也应该与其父元素的渲染尺寸一致。
   *   所有“指示器”元素应有共同的父元素，并且数量应和“幻灯片”的数量一致。
   *   上述内容中，只有“幻灯片”和“幻灯片”的容器是必选的，其他均可以省略。如果“幻灯片”小于两个，则即便有“指示器”、“播放上一张”和“播放下一张”按钮，它们也将不可见。
   *   <strong>新增行为：</strong>
   *   每隔一定的时间后（取决于 data-interval 的设定值），当前“幻灯片”都会自动更换。当前播放的“幻灯片”和“指示器”会被自动加入 'active' 类。
   *   自动播放的计时器将在鼠标进入本元素的区域后被停止，并在鼠标离开本元素的区域后重新计时。
   *   <strong>默认样式：</strong>
   *   <pre class="lang-css">
   *   .widget-slideshow { display: block; }
   *   .widget-slideshow .slides { display: block; position: relative; }
   *   .widget-slideshow .slide { display: block; position: absolute; left: 0; top: 0; z-index: auto; }
   *   .slideshow-single .pointers, .slideshow-single .prev, .slideshow-single .next { display: none !important; }
   *   </pre>
   */

  /**
   * 包含所有“幻灯片”元素的数组。
   * @name Slideshow#slides
   * @type Array
   */

  /**
   * 包含所有“指示器”元素的数组。
   * @name Slideshow#pointers
   * @type Array
   */

  /**
   * 当前播放的“幻灯片”元素。
   * @name Slideshow#activeSlide
   * @type Element
   */

  /**
   * 当前播放的“指示器”元素。
   * @name Slideshow#activePointer
   * @type Element
   */

  /**
   * 播放指定的“幻灯片”。
   * @name Slideshow#show
   * @function
   * @param {number} index 要播放的“幻灯片”在所有“幻灯片”中的索引值。
   * @returns {Element} 本元素。
   * @description
   *   如果指定的索引值与当前播放的索引值相同，则调用本方法无效。
   */

  /**
   * 播放上一张“幻灯片”。
   * @name Slideshow#showPrevious
   * @function
   * @returns {Element} 本元素。
   * @description
   *   播放完第一张后，将开始播放最后一张。
   */

  /**
   * 播放下一张“幻灯片”。
   * @name Slideshow#showNext
   * @function
   * @returns {Element} 本元素。
   * @description
   *   播放完最后一张后，将开始播放第一张。
   */

  Widget.register('slideshow', {
    css: [
      '.widget-slideshow { display: block; }',
      '.widget-slideshow .slides { display: block; position: relative; }',
      '.widget-slideshow .slide { display: block; position: absolute; left: 0; top: 0; z-index: auto; }',
      '.slideshow-single .pointers, .slideshow-single .prev, .slideshow-single .next { display: none !important; }'
    ],
    config: {
      animation: 'fade',
      hoverDelay: NaN,
      interval: 5000
    },
    methods: {
      show: function(index) {
        if (index !== this.activeIndex && index > -1 && index < this.slides.length) {
          var $inactiveSlide = this.activeSlide;
          var $inactivePointer = this.activePointer;
          var $activeSlide = this.activeSlide = this.slides[index];
          var $activePointer = this.activePointer = this.pointers[index];
          var $slideContainer = $activeSlide.getParent();
          var inactiveIndex = this.activeIndex;
          this.activeIndex = index;
          switch (this.animation) {
            case 'fade':
              $activeSlide.insertTo($slideContainer).setStyle('opacity', 0).morph({opacity: 1});
              break;
            case 'cover':
              $activeSlide.insertTo($slideContainer).setStyle('opacity', 0).setStyles({left: $activeSlide.offsetWidth * (index > inactiveIndex ? 1 : -1)}).morph({left: 0, opacity: 1});
              break;
            case 'slide':
              $slideContainer.morph({left: -$activeSlide.offsetWidth * index});
              break;
            default:
              $activeSlide.insertTo($slideContainer);
          }
          $activeSlide.addClass('active');
          if ($activePointer) {
            $activePointer.addClass('active');
          }
          $inactiveSlide.removeClass('active');
          if ($inactivePointer) {
            $inactivePointer.removeClass('active');
          }
          this.fire('show', {
            activeSlide: $activeSlide,
            activePointer: $activePointer,
            inactiveSlide: $inactiveSlide,
            inactivePointer: $inactivePointer
          });
        }
        return this;
      },
      showPrevious: function() {
        var index = this.activeIndex - 1;
        if (index === -1) {
          index = this.slides.length - 1;
        }
        this.show(index).fire('showprevious');
        return this;
      },
      showNext: function() {
        var index = this.activeIndex + 1;
        if (index === this.slides.length) {
          index = 0;
        }
        this.show(index).fire('shownext');
        return this;
      }
    },
    events: ['show', 'showprevious', 'shownext'],
    initialize: function() {
      var $element = this;

      // 保存属性。
      var slides = $element.find('.slide');
      var pointers = $element.find('.pointer');
      var $activeSlide = slides.getFirst();
      var $activePointer = pointers.getFirst() || null;
      Object.mixin($element, {
        slides: slides,
        pointers: pointers,
        activeIndex: 0,
        activeSlide: $activeSlide,
        activePointer: $activePointer
      });

      // 默认显示第一张。
      if ($element.animation !== 'slide') {
        $activeSlide.insertTo($activeSlide.getParent());
      }
      $activeSlide.addClass('active');
      if ($activePointer) {
        $activePointer.addClass('active');
      }

      // 设置幻灯片样式。
      if (slides.length < 2) {
        $element.addClass('slideshow-single');
      } else {
        if ($element.animation === 'slide') {
          $activeSlide.getParent().setStyles({width: $activeSlide.offsetWidth * slides.length, height: $activeSlide.offsetHeight});
          slides.forEach(function($slide) {
            $slide.setStyles({position: 'static', float: 'left'});
          });
        }

        // 通过点击或指向“指示器”播放对应的“幻灯片”。
        var hoverTimer;
        $element
            .on('click:relay(.pointer).slideshow', function() {
              if (pointers.contains(this)) {
                $element.show(pointers.indexOf(this));
              }
            })
            .on('mouseenter:relay(.pointer).slideshow', function() {
              if (Number.isFinite($element.hoverDelay)) {
                var $pointer = this;
                if (!hoverTimer) {
                  hoverTimer = setTimeout(function() {
                    $pointer.fire('click');
                  }, $element.hoverDelay);
                }
              }
            })
            .on('mouseleave:relay(.pointer).slideshow', function() {
              if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = undefined;
              }
            });

        // 通过点击“播放上一张”和“播放下一张”按钮播放对应的“幻灯片”。
        $element
            .on('click:relay(.prev).slideshow', function() {
              $element.showPrevious();
            })
            .on('click:relay(.next).slideshow', function() {
              $element.showNext();
            });

        // 自动播放下一张。
        var autoPlayTimer;
        $element
            .on('mouseenter.slideshow', function() {
              if (autoPlayTimer) {
                clearInterval(autoPlayTimer);
                autoPlayTimer = undefined;
              }
            })
            .on('mouseleave.slideshow', function() {
              if (!autoPlayTimer) {
                autoPlayTimer = setInterval(function() {
                  $element.showNext();
                }, $element.interval);
              }
            })
            .fire('mouseleave');

      }

    }
  });

})();

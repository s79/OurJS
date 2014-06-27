/**
 * @fileOverview Widget - 幻灯片播放器
 * @author sundongguo@gmail.com
 * @version 20121108
 */

(function() {
//==================================================[Widget - 幻灯片播放器]
//--------------------------------------------------[Slideshow]
  /**
   * “幻灯片播放器”可以自动轮播一组“幻灯片”。
   * @启用方式
   *   为一个 DIV 元素添加 'widget-slideshow' 类，即可使该元素成为“幻灯片播放器”。
   * @结构约定
   *   <div class="widget-slideshow">
   *     <ul class="slides">
   *       <li class="slide">第一张</li>
   *       <li class="slide">第二张</li>
   *     </ul>
   *     <ul class="pointers">
   *       <li class="pointer">1</li>
   *       <li class="pointer">2</li>
   *     </ul>
   *     <div>
   *       <a href="javascript:void('prev');" class="prev">上一张</a>
   *       <a href="javascript:void('next');" class="next">下一张</a>
   *     </div>
   *   </div>
   * * “幻灯片播放器”的后代元素中，类名包含 'slides' 的为“幻灯片”的容器，类名包含 'slide' 的为“幻灯片”，类名包含 'pointers' 的为“指示器”的容器，类名包含 'pointer' 的为“指示器”，类名包含 'prev' 的为“播放上一张”按钮，类名包含 'next' 的为“播放下一张”按钮。
   *   上述内容中，只有“幻灯片”和“幻灯片”的容器是必选的，其他均可以省略。如果“幻灯片”小于两个，则即便有“指示器”、“播放上一张”和“播放下一张”按钮，它们也将不可见。
   * * 所有“幻灯片”都应有共同的父元素，并且它们的渲染尺寸也应与其父元素的渲染尺寸一致。
   * * 如果需要“指示器”，则所有“指示器”也应有共同的父元素，它们的数量也应和“幻灯片”的数量一致。
   * @默认样式
   *   div.widget-slideshow { display: block; }
   *   div.widget-slideshow .slides { display: block; position: relative; }
   *   div.widget-slideshow .slide { display: block; position: absolute; left: 0; top: 0; z-index: auto; }
   *   div.slideshow-single .pointers, div.slideshow-single .prev, div.slideshow-single .next { display: none !important; }
   * @可配置项
   *   data-interval
   *     以毫秒为单位的“幻灯片”自动播放间隔时间。
   *     如果不指定本属性，则自动播放功能将被关闭。
   *   data-hover-delay
   *     以毫秒为单位的“指示器”鼠标悬停播放延时，仅在“指示器”存在时有效（建议设置为 '200' - '400' 之间的数值）。
   *     如果指定本属性，则除点击一个“指示器”外，当鼠标指针在一个“指示器”范围内停留了指定的时间后，这个“指示器”对应的“幻灯片”也将被播放。
   *   data-animation
   *     “幻灯片”切换时使用的动画效果，可选项有 'none'，'fade', 'cover' 和 'slide'。
   *     如果不指定本属性，则使用 'fade'。
   *     当动画效果为 'slide' 时，所有“幻灯片”将被从左到右浮动排列；其他情况下所有“幻灯片”将绝对定位在其容器的左上角。
   * @新增行为
   * * 当前播放的“幻灯片”和“指示器”（如果有）会被添加 'active' 类。
   * * 如果“幻灯片播放器”在文档可用后即被解析完毕，则默认播放第一张“幻灯片”。
   * * 如果指定了 data-interval，还会每隔一定的时间后自动播放下一张“幻灯片”。
   *   如果自动播放正在进行，则当鼠标移入本元素时，自动播放会被暂时禁用；当鼠标移出本元素时，自动播放会被重新启用。
   * * 如果有“指示器”，则通过点击或鼠标指向（如果指定了 data-hover-delay 的值）一个“指示器”即可播放与之对应的“幻灯片”。
   * * 如果有“播放上一张”和“播放下一张”按钮，则通过点击这些按钮即可播放上一张或下一张“幻灯片”。
   *   当“播放上一张”或“播放下一张”按钮的类名中包含 'disabled' 时，点击它们无效。
   * @新增属性
   *   {Array} slides 包含所有“幻灯片”的数组。
   *   {Array} pointers 包含所有“指示器”的数组。
   *   {Element} activeSlide 当前播放的“幻灯片”元素。
   *   {Element} activePointer 当前播放的“指示器”元素。
   * @新增方法
   *   show
   *     播放指定的“幻灯片”。
   *     如果指定的索引值不在有效范围内或与当前播放的索引值相同，则调用本方法无效。
   *     参数：
   *       {number} index 要播放的“幻灯片”在所有“幻灯片”中的索引值。
   *     返回值：
   *       {Element} 本元素。
   *   showPrevious
   *     播放上一张“幻灯片”。
   *     播放完第一张后，将开始播放最后一张。
   *     返回值：
   *       {Element} 本元素。
   *   showNext
   *     播放下一张“幻灯片”。
   *     播放完最后一张后，将开始播放第一张。
   *     返回值：
   *       {Element} 本元素。
   * @新增事件
   *   show
   *     成功调用 show 方法后触发。
   *     属性：
   *       {Element} activeSlide 当前播放的“幻灯片”。
   *       {Element} activePointer 当前播放的“指示器”。
   *       {?Element} inactiveSlide 上一个播放的“幻灯片”。
   *       {?Element} inactivePointer 上一个播放的“指示器”。
   *   showprevious
   *     调用 showPrevious 方法后触发。
   *   showNext
   *     调用 showNext 方法后触发。
   */

  Widget.register({
    type: 'slideshow',
    selector: 'div.widget-slideshow',
    styleRules: [
      'div.widget-slideshow { display: block; }',
      'div.widget-slideshow .slides { display: block; position: relative; }',
      'div.widget-slideshow .slide { display: block; position: absolute; left: 0; top: 0; z-index: auto; }',
      'div.slideshow-single .pointers, div.slideshow-single .prev, div.slideshow-single .next { display: none !important; }'
    ],
    config: {
      interval: NaN,
      hoverDelay: NaN,
      animation: 'fade'
    },
    methods: {
      show: function(index) {
        var isFirstShow = Number.isNaN(this.activeIndex);
        if (index !== this.activeIndex && (isFirstShow || index > -1 && index < this.slides.length)) {
          var $inactiveSlide = this.activeSlide;
          var $inactivePointer = this.activePointer;
          var $activeSlide = this.activeSlide = this.slides[index];
          var $activePointer = this.activePointer = this.pointers[index];
          var $slideContainer = $activeSlide.getParent();
          var inactiveIndex = this.activeIndex;
          this.activeIndex = index;
          if (isFirstShow) {
            switch (this.animation) {
              case 'slide':
                $slideContainer.setStyle('left', -$activeSlide.offsetWidth * index);
                break;
              default:
                $activeSlide.insertTo($slideContainer);
            }
          } else {
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
          }
          $activeSlide.addClass('active');
          if ($activePointer) {
            $activePointer.addClass('active');
          }
          if ($inactiveSlide) {
            $inactiveSlide.removeClass('active');
          }
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
        var index = Number.isNaN(this.activeIndex) ? 0 : this.activeIndex - 1;
        if (index === -1) {
          index = this.slides.length - 1;
        }
        this.show(index).fire('showprevious');
        return this;
      },
      showNext: function() {
        var index = Number.isNaN(this.activeIndex) ? 0 : this.activeIndex + 1;
        if (index === this.slides.length) {
          index = 0;
        }
        this.show(index).fire('shownext');
        return this;
      }
    },
    initialize: function() {
      var $slideshow = this;

      // 保存属性。
      var slides = $slideshow.findAll('.slide');
      var pointers = $slideshow.findAll('.pointer');
      Object.mixin($slideshow, {
        slides: slides,
        pointers: pointers,
        activeIndex: NaN,
        activeSlide: null,
        activePointer: null
      });

      // 设置“幻灯片”样式。
      var $sampleSlide = slides.getFirst();
      if (slides.length < 2) {
        $slideshow.addClass('slideshow-single');
      } else {
        if ($slideshow.animation === 'slide') {
          $sampleSlide.getParent().setStyles({width: $sampleSlide.offsetWidth * slides.length, height: $sampleSlide.offsetHeight});
          slides.forEach(function($slide) {
            $slide.setStyles({position: 'static', float: 'left'});
          });
        }

        // 通过点击或指向“指示器”播放对应的“幻灯片”。
        var hoverTimer;
        $slideshow
            .on('click:relay(.pointer).slideshow', function() {
              if (pointers.contains(this)) {
                $slideshow.show(pointers.indexOf(this));
              }
            })
            .on('mouseenter:relay(.pointer).slideshow', function() {
              if (Number.isFinite($slideshow.hoverDelay)) {
                var $pointer = this;
                if (!hoverTimer) {
                  hoverTimer = setTimeout(function() {
                    $pointer.fire('click');
                  }, $slideshow.hoverDelay);
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
        $slideshow
            .on('click:relay(.prev).slideshow', function() {
              if (!this.hasClass('disabled')) {
                $slideshow.showPrevious();
              }
            })
            .on('click:relay(.next).slideshow', function() {
              if (!this.hasClass('disabled')) {
                $slideshow.showNext();
              }
            });

        // 自动播放下一张。
        if (!isNaN($slideshow.interval)) {
          var autoPlayTimer;
          $slideshow
              .on('mouseenter.slideshow', function() {
                if (autoPlayTimer) {
                  clearInterval(autoPlayTimer);
                  autoPlayTimer = undefined;
                }
              })
              .on('mouseleave.slideshow', function() {
                if (!autoPlayTimer) {
                  autoPlayTimer = setInterval(function() {
                    $slideshow.showNext();
                  }, $slideshow.interval);
                }
              })
              .fire('mouseleave');
        }

        // 默认显示第一张。
        document.on('afterdomready:once.slideshow', function() {
          if (Number.isNaN($slideshow.activeIndex)) {
            $slideshow.show(0);
          }
        });

      }

    }
  });

})();

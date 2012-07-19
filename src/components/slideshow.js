/**
 * @fileOverview 组件 - 幻灯片播放器。
 * @author sundongguo@gmail.com
 * @version 20120709
 */
execute(function($) {
//==================================================[Slideshow]
  /*
   * 创建幻灯片播放器。
   */

//--------------------------------------------------[Slideshow Constructor]
  /**
   * 幻灯片播放器。
   * @name Slideshow
   * @constructor
   * @param {Object} elements 相关元素。
   * @param {Array} elements.slides 包含所有“幻灯片”的数组。组成“幻灯片”的各元素的渲染尺寸应该一致，并且有共同的父元素。
   * @param {Array} elements.pointers 包含所有“指示器”的数组。组成“指示器”的各元素的标签名应该一致，并且有共同的父元素。另外应确保 pointers 的数量和 slides 的数量一致。
   * @param {Element} elements.prev “显示上一张”按钮。
   * @param {Element} elements.next “显示下一张”按钮。
   * @param {Object} [options] 可选参数。
   * @param {string} options.activeClassName 为激活的“幻灯片”和“指示器”添加的类名，默认为 'active'。
   * @param {number} options.hoverDelay 以毫秒为单位的“指示器”鼠标悬停激活延时，默认为 undefined，此时由鼠标点击事件激活。若要启用鼠标悬停激活，建议设置为 200 - 400 之间的数值。
   * @param {string} options.switchMode 幻灯片切换的模式，目前支持 'normal'，'fading' 和 'turning' 三种，默认为 'fading'。
   * @param {number} options.interval 以毫秒为单位的自动播放间隔，默认为 5000。
   * @fires show
   *   {Element} activeSlide 当前的激活的“幻灯片”。
   *   {Element} activePointer 当前的激活的“指示器”。
   *   {number} activeIndex 当前的激活的“指示器”和“幻灯片”在 pointers 和 slides 中的索引。
   *   {Element} inactiveSlide 上一个激活的“幻灯片”。
   *   {Element} inactivePointer 上一个激活的“指示器”。
   *   {number} inactiveIndex 上一个激活的“指示器”和“幻灯片”在 pointers 和 slides 中的索引。
   *   成功调用 show 方法后触发。
   * @requires TabPanel
   */
  var Slideshow = new Component(function(elements) {
    var slideshow = this;

    // 获取选项。
    var options = slideshow.options;

    // 保存属性。
    slideshow.elements = elements;
    slideshow.activeSlide = null;
    slideshow.activePointer = null;
    slideshow.activeIndex = -1;

    // 使用 TabPanel 实现幻灯片播放器。
    var slides = elements.slides;
    var pointers = elements.pointers;
    var $slideSample = slides.getFirst();
    var $slideContainer = $slideSample.getParent();
    var slideWidth = $slideSample.offsetWidth;
    var $clicked = null;
    var currentIndex = -1;
    slideshow.tabPanel = new TabPanel({tabs: pointers, panels: slides}, options)
        .on('active', function(event) {
          var activeSlide = event.activePanel;
          var activePointer = event.activeTab;
          var activeIndex = event.activeIndex;
          var inactiveIndex = event.inactiveIndex;
          // 保存状态。
          slideshow.activeSlide = activeSlide;
          slideshow.activePointer = activePointer;
          slideshow.activeIndex = activeIndex;
          // 切换幻灯片。
          if (activeSlide) {
            switch (options.switchMode) {
              case 'normal':
                $slideContainer.append(activeSlide);
                break;
              case 'fading':
                $slideContainer.append(activeSlide.setStyle('opacity', 0).morph({opacity: 1}));
                break;
              case 'turning':
                $slideContainer.append(activeSlide.setStyle('opacity', 0).setStyles(($clicked ? $clicked === $next : activeIndex > inactiveIndex) ? {left: slideWidth} : {left: -slideWidth}).morph({left: 0, opacity: 1}));
                break;
            }
          }
          $clicked = null;
          currentIndex = this.activeIndex;
          // 触发事件。
          slideshow.fire('show', {
            activeSlide: activeSlide,
            activePointer: activePointer,
            activeIndex: activeIndex,
            inactiveSlide: event.inactivePanel,
            inactivePointer: event.inactiveTab,
            inactiveIndex: inactiveIndex
          });
        })
        .active(0);

    // 播放上一张/下一张。
    var $prev = elements.prev;
    var $next = elements.next;
    var totalSlides = slides.length;
    $prev.on('click', function() {
      $clicked = this;
      --currentIndex;
      if (currentIndex === -1) {
        currentIndex = totalSlides - 1;
      }
      slideshow.show(currentIndex);
    });
    $next.on('click', function() {
      $clicked = this;
      ++currentIndex;
      if (currentIndex === totalSlides) {
        currentIndex = 0;
      }
      slideshow.show(currentIndex);
    });

    // 自动播放下一张。
    var $pointerSample = pointers.getFirst();
    var $container = $slideContainer;
    while ($container && !($container.contains($pointerSample) && $container.contains($prev) && $container.contains($next))) {
      $container = $container.getParent();
    }
    var timer;
    $container
        .on('mouseenter', function() {
          $prev.fadeIn();
          $next.fadeIn();
          clearInterval(timer);
        })
        .on('mouseleave', function() {
          $prev.fadeOut();
          $next.fadeOut();
          timer = setInterval(function() {
            $next.fire('click');
          }, options.interval);
        })
        .fire('mouseleave');

    // 为本组件设置选项的同时，也为 tabPanel 设置选项。
    slideshow.setOptions = function(options) {
      Component.prototype.setOptions.call(this, options);
      this.tabPanel.setOptions(options);
      return this;
    }

  });

//--------------------------------------------------[Slideshow.options]
  /**
   * 默认选项。
   * @name Slideshow.options
   */
  Slideshow.options = {
    activeClassName: 'active',
    hoverDelay: undefined,
    switchMode: 'fading',
    interval: 5000
  };

//--------------------------------------------------[Slideshow.prototype.show]
  /**
   * 显示一张“幻灯片”。
   * @name Slideshow.prototype.show
   * @function
   * @param {Element|number} value 要显示的“幻灯片”元素、“指示器”元素或它们在各自所属的数组（slides 和 pointers）中的索引值。
   * @returns {Object} Slideshow 对象。
   * @description
   *   如果要显示的“幻灯片”与当前显示的“幻灯片”相同，则调用此方法无效。
   */
  Slideshow.prototype.show = function(value) {
    this.tabPanel.active(value);
    return this;
  };

//--------------------------------------------------[Slideshow]
  window.Slideshow = Slideshow;

});

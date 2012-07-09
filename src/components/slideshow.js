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
   * @param {Array} slides 包含所有“幻灯片”的数组。组成“幻灯片”的各元素的标签名应该一致，并且有共同的父元素。
   * @param {Array} pointers 包含所有“指示器”的数组。组成“指示器”的各元素的标签名应该一致，并且有共同的父元素。另外应确保 pointers 的数量和 slides 的数量一致。
   * @param {Element} showPrevBtn “显示上一张”的按钮元素。
   * @param {Element} showNextBtn “显示下一张”的按钮元素。
   * @param {Object} [options] 可选参数。
   * @param {string} options.activeClassName 为激活的“幻灯片”和“指示器”添加的类名，默认为 'active'。
   * @param {number} options.hoverDelay 以毫秒为单位的“指示器”鼠标悬停激活延时，默认为 NaN，此时由鼠标点击事件激活。若要启用鼠标悬停激活，建议设置为 200 - 400 之间的数值。
   * @param {string} options.switchMode 幻灯片切换的模式，目前支持 'fading' 和 'turning' 两种，默认为 'fading'。
   * @param {number} options.interval 以毫秒为单位的自动播放间隔，默认为 5000。
   * @fires show
   *   {Element} activeSlide 当前的激活的“幻灯片”。
   *   {Element} activePointer 当前的激活的“指示器”。
   *   {number} activeIndex 当前的激活的“指示器”和“幻灯片”在 pointers 和 slides 中的索引。
   *   {Element} inactiveSlide 上一个激活的“幻灯片”。
   *   {Element} inactivePointer 上一个激活的“指示器”。
   *   {number} inactiveIndex 上一个激活的“指示器”和“幻灯片”在 pointers 和 slides 中的索引。
   *   成功调用 show 方法后触发。
   * @requires Switcher
   * @requires TabPanel
   */
  function Slideshow(container, slides, pointers, showPrevBtn, showNextBtn, options) {
    var slideshow = this;
    // 保存属性。
    slideshow.slides = slides;
    slideshow.pointers = pointers;
    slideshow.elements = {
      showPrevBtn: $(showPrevBtn),
      showNextBtn: $(showNextBtn)
    };
    slideshow.activeSlide = null;
    slideshow.activePointer = null;
    slideshow.activeIndex = -1;
    // 保存选项。
    options = slideshow.setOptions(options).options;
    // 内部使用的变量。
    var $slideshow = $(container);
    var $slideSample = slides.getFirst();
    var $container = $slideSample.getParent();
    var $prev = slideshow.elements.showPrevBtn;
    var $next = slideshow.elements.showNextBtn;
    var $clicked;
    var slideWidth = $slideSample.offsetWidth;
    var totalSlides = slides.length;
    var currentIndex;
    var timer;
    var switchMode = options.switchMode;
    // 使用 TabPanel 实现幻灯片播放器。
    slideshow.tabPanel = new TabPanel(pointers, slides, {activeClassName: options.activeClassName, hoverDelay: options.hoverDelay})
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
            $container.append(activeSlide.setStyle('opacity', 0));
            switch (switchMode) {
              case 'fading':
                activeSlide.morph({opacity: 1});
                break;
              case 'turning':
                activeSlide.setStyles(($clicked ? $clicked === $next : activeIndex > inactiveIndex) ? {left: slideWidth} : {left: -slideWidth}).morph({left: 0, opacity: 1});
                break;
            }
          }
          currentIndex = this.activeIndex;
          $clicked = null;
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
    // 播放上一张。
    $prev.on('click', function() {
      $clicked = this;
      --currentIndex;
      if (currentIndex === -1) {
        currentIndex = totalSlides - 1;
      }
      slideshow.show(currentIndex);
    });
    // 播放下一张。
    $next.on('click', function() {
      $clicked = this;
      ++currentIndex;
      if (currentIndex === totalSlides) {
        currentIndex = 0;
      }
      slideshow.show(currentIndex);
    });
    // 自动播放下一张。
    var autoPlayStart = function() {
      timer = setInterval(function() {
        $next.fire('click');
      }, options.interval);
    };
    var autoPlayStop = function() {
      clearInterval(timer);
    };
    $slideshow
        .on('mouseenter', function() {
          $prev.fadeIn();
          $next.fadeIn();
          autoPlayStop();
        })
        .on('mouseleave', function() {
          $prev.fadeOut();
          $next.fadeOut();
          autoPlayStart();
        });
    autoPlayStart();
  }

//--------------------------------------------------[Slideshow.options]
  /**
   * 默认选项。
   * @name Slideshow.options
   */
  Slideshow.options = {
    activeClassName: 'active',
    hoverDelay: NaN,
    switchMode: 'fading',
    interval: 5000
  };

//--------------------------------------------------[Slideshow.prototype.show]
  /**
   * 显示一张“幻灯片”。
   * @name Slideshow.prototype.show
   * @function
   * @param {Object|number} i 要显示的“幻灯片”对应的“指示器”元素，或者该元素在 pointers 中的索引值。
   * @returns {Object} Slideshow 对象。
   */
  Slideshow.prototype.show = function(i) {
    this.tabPanel.active(i);
    return this;
  };

//--------------------------------------------------[Slideshow]
  window.Slideshow = new Component(Slideshow, Slideshow.options, Slideshow.prototype);

});

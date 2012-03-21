/**
 * 创建一个在指定元素下的遮掩层，该层之下的元素不可点击，不可用 tab 键遍历。
 * 注意：仅适用于 Standards Mode 的页面。
 * @version sundongguo.20110704 (移植自 v20080828)
 * @requires jQuery
 * @name jQuery.setMaskBehind
 * @param {?Object} target 一个 jQuery 对象。该对象包含的第一个元素为目标元素，该元素的
 *     position 属性必须是 absolute，并设置了z-index属性，遮掩层将在该元素下方创建。
 *     如果没有指定 target，将清除遮掩层。
 * @return {?Object} 如果操作成功，返回目标 jQuery 对象。如果失败（没有遮掩层存在）则返回
 *     null。
 */
//--------------------------------------------------[setMaskBehind]
(function() {
  /**
   获取文档滚动尺寸。
   当内容不足以充满文档可见尺寸时，返回文档可见尺寸值。
   注：jQuery 1.6.1 提供的 $(document).width/height 在 IE6 下将滚动条也包含进来，因此使用此函数代替。
   */
  function getDocumentScrollSize() {
    var width = 0;
    var height = 0;
    if ($.browser.webkit) {
      width = document.body.scrollWidth;
      height = document.body.scrollHeight;
    } else {
      var root = document.documentElement;
      width = Math.max(root.scrollWidth, root.clientWidth);
      height = Math.max(root.scrollHeight, root.clientHeight);
    }
    return {
      width: width,
      height: height
    };
  }

  function resizeMask() {
    mask.css({width: $(window).width(), height: $(window).height()});
    // 加延时以确保 IE6/7/8 的效果正常。
    setTimeout(function() {
      var size = getDocumentScrollSize();
      mask.css({width: size.width, height: size.height});
    }, 0);
  }

  function createMask() {
    mask = $('<div>').css({display: 'none', position: 'absolute', left: '0', top: '0', background: '#000', opacity: 0.25}).appendTo('body');
    resizeMask();
    $(window).bind('resize', resizeMask);
  }

  function destoryMask() {
    mask.remove();
    $(window).unbind('resize', resizeMask);
    mask = null;
  }

  var targetElement = null;
  var elementsHasTabIndex = null;
  var selectElements = null;
  var mask = null;
  var setMaskBehind = function(target) {
    // 没有目标元素，清理遮掩层。
    if (!target) {
      if (targetElement && mask) {
        mask.fadeOut(300, destoryMask);
        elementsHasTabIndex.removeAttr('tabindex');
        if (selectElements) {
          selectElements.css('visibility', 'visible');
        }
        return targetElement;
      } else {
        return null;
      }
    }
    // 有目标元素，建立遮掩层。
    targetElement = $(target);
    // 找到有 tabIndex 属性的元素。
    elementsHasTabIndex = $('a, button, input, select, textarea').filter(function() {
      return target.has(this).length == 0;
    });
    // IE6 的 SELECT 元素无法被遮盖。
    if ($.browser.msie && $.browser.version < 7) {
      selectElements = $('select').filter(function() {
        return target.has(this).length == 0;
      });
    }
    if (!mask) {
      createMask();
    }
    var zIndex = parseInt(targetElement.css('z-index'), 10);
    if (!zIndex) {
      targetElement.css('z-index', zIndex = 100);
    }
    mask.css({zIndex: zIndex - 1}).fadeIn(300);
    if (selectElements) {
      selectElements.css('visibility', 'hidden');
    }
    //屏蔽当前层之外的 tabIndex。
    elementsHasTabIndex.attr('tabIndex', -1);
    return targetElement;
  };

  jQuery.extend({setMaskBehind: setMaskBehind});
})();

/**
 * 创建/隐藏对话框。
 * @version sundongguo.20110808
 * @requires jQuery
 * @requires jQuery.setMaskBehind
 *
 * 显示一个对话框。
 * @name jQuery.fn.showAsDialog
 * @param {Object} target 一个 jQuery 对象。对话框的中心点将于该对象的中心点重合。
 * @param {Object} callback 对话框显示后的回调。
 * @return {Object} 传入的 jQuery 对象。
 *
 * 隐藏对话框。
 * @name jQuery.fn.hideAsDialog
 * @param {Object} callback 对话框隐藏后的回调。
 * @return {Object} 传入的 jQuery 对象。
 */
//--------------------------------------------------[showAsDialog hideAsDialog]
(function() {
  function hasFixedAncestor(el) {
    el = $(el)[0];
    var parent = el;
    while (parent = parent.parentNode) {
      if (parent === document.documentElement) {
        break;
      }
      if ($(parent).css('position') == 'fixed') {
        return true;
      }
    }
    return false;
  }

  function showAsDialog(target, callback) {
    this.css({display: 'block', visibility: 'hidden'});
    var selfWidth = this.outerWidth();
    var selfHeight = this.outerHeight();
    var this_ = this;
    var elementHasFixedAncestor = hasFixedAncestor(this);
    this.dialogOffsetHandler = function() {
      var rect = target.getBoundingClientRect();
      var width = target.clientWidth;
      var height = target.clientHeight;
      this_.css({
        left: Math.max(0, Math.floor((width - selfWidth) / 2 - (elementHasFixedAncestor ? 0 : rect.left))),
        top: Math.max(0, Math.floor((height - selfHeight) / 2 - (elementHasFixedAncestor ? 0 : rect.top)))
      });
      console.log(hasFixedAncestor(this));
    };
    this.dialogOffsetHandler();
    $(window).bind('resize', this.dialogOffsetHandler);
    if (!window.XMLHttpRequest) {
      $(window).bind('scroll', this.dialogOffsetHandler);
    } else {
      this.css('position', elementHasFixedAncestor ? 'absolute' : 'fixed');
    }
    this.css('visibility', 'visible').fadeIn(200, function() {
      if (callback) {
        callback.apply(this_);
      }
    });
    $.setMaskBehind(this);
    return this;
  }

  function hideAsDialog(callback) {
    var this_ = this;
    $(window).unbind('resize', this.dialogOffsetHandler);
    if (!window.XMLHttpRequest) {
      $(window).unbind('scroll', this.dialogOffsetHandler);
    }
    this.fadeOut(200, function() {
      if (callback) {
        callback.apply(this_);
      }
    });
    $.setMaskBehind();
    return this;
  }

  jQuery.fn.extend({
    showAsDialog: showAsDialog,
    hideAsDialog: hideAsDialog
  });
})();

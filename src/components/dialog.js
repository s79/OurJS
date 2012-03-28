/**
 * @fileOverview 组件 - 对话框。
 * @author sundongguo@gmail.com
 * @version 20120310
 */
(function() {
// 避免 $ 被覆盖。
  var $ = document.$;

// 空函数。
  var empty = function() {
  };

//==================================================[freezeFocusArea]
  /*
   * 限定不可聚焦的区域，仅供此组件使用。
   */

//--------------------------------------------------[freezeFocusArea]
  var $before;
  var $after;
  var $enabled;
  var $disabled;
  var focusedByUser = true;

  /**
   * 限定不可聚焦的区域。
   * @name freezeFocusArea
   * @function
   * @private
   * @param {Object} config 配置信息，包含 enable 和 disable 两个元素，如果设置为 null，则取消限定。
   */
  function freezeFocusArea(config) {
    if (config) {
      var $enable = $(config.enable);
      var $disable = $(config.disable);
      // 将两个辅助文本框固定定位，以免在切换焦点时发生滚动。
      $before = $before || $('<input type="text" readonly style="position: fixed; top: 0; left: -10000px; -position: absolute;">')
          .on('focus', function() {
            if (focusedByUser) {
              focusedByUser = false;
              $after.focus();
            } else {
              focusedByUser = true;
            }
          })
          .on('keydown', function(e) {
            if (e.which === 9 && e.shiftKey) {
              this.fire('focus');
              return false;
            }
          });
      $after = $after || $('<input type="text" readonly style="position: fixed; top: 0; left: -10000px; -position: absolute;">')
          .on('focus', function() {
            if (focusedByUser) {
              focusedByUser = false;
              $before.focus();
            } else {
              focusedByUser = true;
            }
          })
          .on('keydown', function(e) {
            if (e.which === 9 && !e.shiftKey) {
              this.fire('focus');
              return false;
            }
          });
      if ($enable !== $enabled) {
        $disabled && $disabled.off('focusin.freezeFocusArea');
        $disable.on('focusin.freezeFocusArea', function(e) {
          if (!$enable.contains(e.target)) {
            $after.focus();
          }
        });
        $enable.prepend($before).append($after);
        $after.fire('focus');
        $enabled = $enable;
        $disabled = $disable;
      }
    } else {
      if ($disabled) {
        $disabled.off('focusin.freezeFocusArea');
        $before && $before.remove(true);
        $after && $after.remove(true);
        $enabled = $disabled = null;
      }
    }
  }

//==================================================[Mask]
  /*
   * 创建一个覆盖指定元素的内容的遮掩层，仅供此组件使用。
   * 遮掩层除视觉遮掩效果外，仅能屏蔽鼠标对被遮掩区域的操作，若要同时限制键盘操作，请参考 freezeFocusArea。
   *
   * 思路：
   *   遮掩层用来配合模态对话框使用。
   *   要在页面上实现 D 元素覆盖 M 元素，即要求 D 元素的 stacking context 与 M 元素的 stacking context 相同，或为其祖先级元素。
   *
   * 已知问题：
   *   IE6 下当 HTML 元素设置了非正常的背景图片（找不到图片或 about:blank）时，IFRAME 无法一直遮盖 SELECT 元素，窗口滚动后 SELECT 即再次显示在最前，但若此时 position: fixed 的表达式启用则无此问题。
   *   这个问题会在页面有设置了 "display: none; position: fixed;" 的元素，且欲覆盖区域不是 BODY，但其中有 SELECT 元素时出现。
   *   上述情况很少见，因此未处理此问题。
   *   如果需要处理，去掉 IE6 fixed positioned 相关代码中的“启用/禁用表达式”部分即可。
   *
   * 参考：
   *   http://w3help.org/zh-cn/causes/RM8015
   */

//--------------------------------------------------[Mask Constructor]
  /**
   * 遮掩层。
   * @name Mask
   * @function
   * @private
   * @param {Element|Object} target 要遮掩的目标元素，当其值为 body 元素时，将覆盖整个页面。
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Mask.options 中。
   * @param {Object} options.attributes 为遮掩层元素附加的属性。
   * @param {Object} options.styles 为遮掩层元素设置的样式。
   * @param {Function} options.onShow 调用 show 方法时触发。
   * @param {Function} options.onHide 调用 hide 方法时触发。
   * @description
   *   在 IE6 下禁用 show/hide 时的渐变效果，以避免和 PNG 透明修复脚本冲突。
   */
  function Mask(target, options) {
    Object.append(this, Object.clone(Mask.options, true), options);
    this.target = $(target);
    this.isShown = false;
  }

  components.Mask = Mask;

//--------------------------------------------------[Mask.prototype.show]
  /**
   * 显示遮掩层。
   * @name Mask.prototype.show
   * @function
   * @private
   * @returns {Object} Mask 对象。
   */
  Mask.prototype.show = function() {
    if (!this.isShown) {
      var mask = this;
      var $container = mask.target;
      // 创建遮掩层元素，需要为 IE6 做特殊处理。
      var attributes = '';
      Object.forEach(mask.attributes, function(attributeValue, attributeName) {
        attributes += ' ' + attributeName + '="' + attributeValue + '"';
      });
      var $mask;
      if (navigator.isIE6) {
        // IE6 使用 IFRAME 元素遮盖 SELECT 元素。
        $mask = $('<div' + attributes + '><iframe scrolling="no" style="width: 100%; height: 100%; filter: alpha(opacity=0);"></iframe></div>').append($('<div></div>').setStyles(mask.styles).setStyles({position: 'absolute', left: 0, top: 0, width: '100%', height: '100%'}));
        // IE6 body 元素的遮掩层在更改视口尺寸时需要调整尺寸。
        if ($container === document.body) {
          var resizeMaskElementForIE6 = function() {
            var clientSize = window.getClientSize();
            // 刷新 display 以避免 IE6 的 $mask 元素内的两个 height 为 100% 的子元素在纵向改变窗口大小时高度不随 $mask 的变化而更新。
            $mask.setStyles({width: clientSize.width, height: clientSize.height, display: 'none'}).setStyle('display', 'block');
          };
          var onShow = mask.onShow;
          mask.onShow = function() {
            window.attachEvent('onresize', resizeMaskElementForIE6);
            onShow();
            mask.onShow = onShow;
          };
          var onHide = mask.onHide;
          mask.onHide = function() {
            window.detachEvent('onresize', resizeMaskElementForIE6);
            onHide();
            mask.onHide = onHide;
          };
        }
      } else {
        $mask = $('<div' + attributes + '></div>').setStyles(mask.styles);
      }
      // 显示遮掩层。
      $container.append($mask.setStyles({display: 'none', position: $container === document.body ? 'fixed' : 'absolute'}));
//      $mask.stopAnimate().fadeIn({transition: 'easeOut', duration: 150});  // TODO: Animation 终止无回调，待改进。
      navigator.isIE6 ? $mask.setStyle('display', 'block') : $mask.fadeIn({transition: 'easeOut', duration: 150});
      mask.element = $mask;
      mask.isShown = true;
      mask.resize();
      mask.onShow();
    }
    return this;
  };

//--------------------------------------------------[Mask.prototype.hide]
  /**
   * 隐藏遮掩层。
   * @name Mask.prototype.hide
   * @function
   * @private
   * @returns {Object} Mask 对象。
   */
  Mask.prototype.hide = function() {
    if (this.isShown) {
      var mask = this;
      var $mask = mask.element;
//      mask.element.stopAnimate().fadeOut({transition: 'easeIn', duration: 150, onFinish: function() {  // TODO: Animation 终止无回调，待改进。
      var onFadeOut = function() {
        delete mask.element;
        $mask.remove();
        mask.isShown = false;
        mask.onHide();
      };
      if (navigator.isIE6) {
        $mask.setStyle('display', 'none');
        onFadeOut();
      } else {
        $mask.fadeOut({transition: 'easeIn', duration: 150, onFinish: onFadeOut});
      }
    }
    return this;
  };

//--------------------------------------------------[Mask.prototype.resize]
  /**
   * 调整遮掩层尺寸。
   * @name Mask.prototype.resize
   * @function
   * @private
   * @returns {Object} Mask 对象。
   */
  Mask.prototype.resize = function() {
    if (this.isShown) {
      var $mask = this.element;
      var $target = this.target;
      if ($target === document.body) {
        // 遮掩 body 的情况。
        if (navigator.isIE6) {
          var clientSize = window.getClientSize();
          $mask.setStyles({left: 0, top: 0, width: clientSize.width, height: clientSize.height});
        } else {
          $mask.setStyles({left: 0, right: 0, top: 0, bottom: 0});
        }
      } else {
        // 其他情况统一处理。
        $mask.setStyles({left: 0, top: 0, width: $target.clientWidth, height: $target.clientHeight});
      }
    }
    return this;
  };

//--------------------------------------------------[Mask.prototype.setZIndex]
  /**
   * 调整遮掩层的 zIndex。
   * @name Mask.prototype.setZIndex
   * @function
   * @private
   * @param {number} zIndex 遮掩层的 zIndex。
   * @returns {Object} Mask 对象。
   */
  Mask.prototype.setZIndex = function(zIndex) {
    if (this.isShown) {
      this.element.setStyle('zIndex', zIndex);
    }
    return this;
  };

//--------------------------------------------------[Mask.options]
  /**
   * 默认选项。
   * @name Mask.options
   * @private
   */
  Mask.options = {
    attributes: {},
    styles: {backgroundColor: '#000', opacity: 0.2},
    onShow: empty,
    onHide: empty
  };

//==================================================[Dialog]
  /*
   * 创建一个模态对话框。
   * 当对话框弹出时，为突出对话框内容，将在对话框之下创建遮掩层，遮掩层配合 freezeFocusArea 可以阻止用户对遮盖部分内容的操作。
   */

  // 对话框分组，将使用同一个遮掩层的对话框分为一组，在这组对话框层叠显示时，遮掩层会自动修改 zIndex 以适应顶层对话框。
  /*
   * <Object groups> {
   *   <string uid>: <Object group> {
   *     stack: <Array dialogs> [
   *       dialog: <Object Dialog>
   *     ],
   *     mask: <Object Mask>
   *   }
   * };
   */
  var groups = {};

//--------------------------------------------------[Dialog Constructor]
  /**
   * 模态对话框。
   * @name Dialog
   * @memberOf components
   * @constructor
   * @param {Element} element 要作为对话框显示的元素。
   *   该元素的 position 将在创建后视情况而被修改为 absolute 或 fixed，另外建议为该元素设置明确的 zIndex。
   *   对话框的默认状态为关闭。因此 element 的 display 将被设置为 none。
   *   对话框元素将以其父元素（父元素应创建 stacking context）为“参考元素”进行定位，将对话框的中心点固定在该元素的中心点，遮掩层也作为其父元素的子元素被创建。
   *   如果 options.pinnedOffsetX 或 options.pinnedOffsetY 被指定，则对话框的中心点在横向或纵向将不再与其父元素的中心点重合。
   *   如果以上两个参数被同时指定，则即便 element 是 body 的子元素，在窗口改变尺寸时也不会自动调用 adjust 方法。
   *   避免让对话框元素的父元素出现滚动条，以免对话框和遮掩层能随其内容滚动。
   *   如果话框元素的父元素未创建 stacking context，将修改其 position 特性为 relative 以使其创建 stacking context。
   *   如果话框元素的父元素为 body 元素时，遮掩层将遮掩整个视口。此时如果 element 的 position 为 fixed，对话框将始终保持显示在视口内。
   *   当多个对话框有相同的父元素时，则视这些对话框为一组，将对话框分组有助于重叠显示这些对话框。
   *   在 IE6 下禁用 open/close 时的渐变效果，以避免和 PNG 透明修复脚本冲突。
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Dialog.options 中。
   * @param {Object} options.maskAttributes 为遮掩层元素附加的属性。
   * @param {Object} options.maskStyles 为遮掩层元素设置的样式。
   * @param {number} options.pinnedOffsetX 对话框的左边与其父元素的左边的横向差值。如果指定，对话框的中心点在横向将不再与其父元素的中心点重合。
   * @param {number} options.pinnedOffsetY 对话框的顶边与其父元素的顶边的纵向差值。如果指定，对话框的中心点在纵向将不再与其父元素的中心点重合。
   * @param {Function} options.onOpen 调用 open 方法时触发。
   * @param {Function} options.onClose 调用 close 方法时触发。
   */
  function Dialog(element, options) {
    Object.append(this, Object.clone(Dialog.options, true), options);
    // 对话框的默认状态为关闭。
    this.isOpen = false;
    // 对话框的初始状态是隐藏的。
    // 调节对话框的位置是通过 element 的 left 和 top 进行的，需要以像素为单位，因此先为其指定一个值，以便稍后计算位置。
    var $dialog = this.element = $(element).setStyles({display: 'none', left: 0, top: 0});
    // 根据 element 的父元素 $container 确定对话框使用的定位方式。
    var $container = $dialog.getParent();
    if ($container === document.body && $dialog.getStyle('position') === 'fixed') {
      $dialog.setStyle('position', 'fixed');
      this.isFixedPositioned = true;
    } else {
      $dialog.setStyle('position', 'absolute');
      this.isFixedPositioned = false;
      // $container 必须创建 stacking context。
      if ($container.getStyle('position') === 'static') {
        $container.setStyle('position', 'relative');
      }
    }
    // 为对话框分组。
    var groupId = $container.uid;
    this.group = groups[groupId] || (groups[groupId] = {stack: [], mask: null});
    // 参照 element 的 zIndex 来调节遮掩层。
    $dialog.setStyle('zIndex', parseInt($dialog.getStyle('zIndex'), 10) || 1000);
    this.group.mask || (this.group.mask = new Mask($container, {attributes: this.maskAttributes, styles: this.maskStyles}));
  }

  components.Dialog = Dialog;

//--------------------------------------------------[Dialog.prototype.open]
  /**
   * 打开对话框。
   * @name Dialog.prototype.open
   * @memberOf components
   * @function
   * @returns {Object} Dialog 对象。
   */
  Dialog.prototype.open = function() {
    if (!this.isOpen) {
      var dialog = this;
      var $dialog = dialog.element;
      var $container = $dialog.getParent();
      dialog.group.stack.push(dialog);
      // 打开对话框。
      navigator.isIE6 ? $dialog.setStyle('display', 'block') : $dialog.fadeIn({transition: 'easeOut', duration: 150});
      dialog.isOpen = true;
      dialog.adjust();
      dialog.onOpen();
      // 根据选项决定是否及如何创建并显示遮掩层。
      var mask = dialog.group.mask;
      mask.isShown || mask.show();
      mask.setZIndex($dialog.getStyle('zIndex') - 1);
      // 启用遮掩区域聚焦锁定。
      freezeFocusArea({enable: $dialog, disable: $container});
      // 仅父元素为 body 的对话框需要在改变窗口尺寸时重新调整位置（假设其他对话框的父元素的尺寸为固定）。
      // 如果 pinnedOffsetX 和 pinnedOffsetY 同时被指定，则不调整位置（没有必要）。
      if ($container === document.body && (isNaN(this.pinnedOffsetX) || isNaN(this.pinnedOffsetX))) {
        window.on('resize.dialog' + $dialog.uid, navigator.isIE6 ? function() {
          // 避免 IE6 的固定定位计算错误。
          setTimeout(function() {
            dialog.adjust();
          }, 0);
        } : function() {
          dialog.adjust();
        });
      }
    }
    return this;
  };

//--------------------------------------------------[Dialog.prototype.close]
  /**
   * 关闭对话框。
   * @name Dialog.prototype.close
   * @memberOf components
   * @function
   * @returns {Object} Dialog 对象。
   */
  Dialog.prototype.close = function() {
    if (this.isOpen) {
      var dialog = this;
      var $dialog = dialog.element;
      var $container = $dialog.getParent();
      var stack = dialog.group.stack;
      var mask = dialog.group.mask;
      stack.pop();
      // 检查本组对话框中是否还有对话框在打开状态。
      if (stack.length) {
        // 如果不是最底层对话框，则锁定上一个对话框的焦点区域。
        var previousDialog = stack[stack.length - 1];
        freezeFocusArea({enable: previousDialog.element, disable: previousDialog.element.getParent()});
      } else {
        // 如果是最底层对话框，且有遮掩层，则隐藏遮掩层。
        mask && mask.hide();
        // 解除焦点区域锁定。
        freezeFocusArea(null);
      }
      // 关闭对话框。
      var onFadeOut = function() {
        if (stack.length) {
          // 如果不是最底层对话框，且有遮掩层，则在对话框消失后再进行调整。
          mask && mask.setZIndex(previousDialog.element.getStyle('zIndex') - 1);
        }
        dialog.isOpen = false;
        dialog.onClose();
      };
      if (navigator.isIE6) {
        $dialog.setStyle('display', 'none');
        onFadeOut();
      } else {
        $dialog.fadeOut({transition: 'easeIn', duration: 150, onFinish: onFadeOut});
      }
      // 删除事件监听器。
      if ($container === document.body && (isNaN(this.pinnedOffsetX) || isNaN(this.pinnedOffsetX))) {
        window.off('resize.dialog' + $dialog.uid);
      }
    }
    return this;
  };

//--------------------------------------------------[Dialog.prototype.adjust]
  /**
   * 调整对话框位置。
   * @name Dialog.prototype.adjust
   * @memberOf components
   * @function
   * @returns {Object} Dialog 对象。
   */
  Dialog.prototype.adjust = function() {
    if (this.isOpen) {
      var $dialog = this.element;
      var $container = $dialog.getParent();
      var isFixedPositioned = this.isFixedPositioned;
      // 获取当前位置。
      var dialogClientRect = $dialog.getClientRect();
      var currentX = dialogClientRect.left;
      var currentY = dialogClientRect.top;
      var currentWidth = dialogClientRect.width;
      var currentHeight = dialogClientRect.height;
      // 计算预期位置。
      var expectedX;
      var expectedY;
      var containerClientRect = {};
      if (isFixedPositioned) {
        var viewportClientSize = window.getClientSize();
        containerClientRect.left = 0;
        containerClientRect.top = 0;
        containerClientRect.width = viewportClientSize.width;
        containerClientRect.height = viewportClientSize.height;
      } else {
        containerClientRect = $container.getClientRect();
      }
      expectedX = containerClientRect.left + (isNaN(this.pinnedOffsetX) ? (containerClientRect.width - currentWidth) / 2 : this.pinnedOffsetX);
      expectedY = containerClientRect.top + (isNaN(this.pinnedOffsetY) ? (containerClientRect.height - currentHeight) / 2 : this.pinnedOffsetY);
      // 确保固定定位的对话框显示在视口内。
      if (isFixedPositioned) {
        var leftLimit = 0;
        var rightLimit = leftLimit + containerClientRect.width;
        var topLimit = 0;
        var bottomLimit = topLimit + containerClientRect.height;
        // 当视口尺寸不足以容纳对话框时，优先显示右上角（对话框一般设计为关闭按钮在右上角）。
        if (expectedX < leftLimit) {
          expectedX = leftLimit;
        }
        if (expectedX + currentWidth > rightLimit) {
          expectedX = rightLimit - currentWidth;
        }
        if (expectedY + currentHeight > bottomLimit) {
          expectedY = bottomLimit - currentHeight;
        }
        if (expectedY < topLimit) {
          expectedY = topLimit;
        }
      }
      // 设置最终位置。
      $dialog.setStyles({left: parseInt($dialog.getStyle('left'), 10) + expectedX - currentX, top: parseInt($dialog.getStyle('top'), 10) + expectedY - currentY});
    }
    return this;
  };

//--------------------------------------------------[Dialog.options]
  /**
   * 默认选项。
   * @name Dialog.options
   * @memberOf components
   * @description
   *   可选参数对象，包含的属性及其默认值为：
   *   <table>
   *     <tr><th>maskAttributes</th><td>{}</td></tr>
   *     <tr><th>maskStyles</th><td>{backgroundColor: '#000', opacity: 0.2}</td></tr>
   *     <tr><th>pinnedOffsetX</th><td>NaN</td></tr>
   *     <tr><th>pinnedOffsetY</th><td>NaN</td></tr>
   *     <tr><th>onOpen</th><td>empty</td></tr>
   *     <tr><th>onClose</th><td>empty</td></tr>
   *   </table>
   */
  Dialog.options = {
    maskAttributes: {},
    maskStyles: {backgroundColor: '#000', opacity: 0.2},
    pinnedOffsetX: NaN,
    pinnedOffsetY: NaN,
    onOpen: empty,
    onClose: empty
  };

})();

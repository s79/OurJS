/**
 * @fileOverview 组件 - 对话框。
 * @author sundongguo@gmail.com
 * @version 20120310
 */
execute(function($) {
//==================================================[freezeFocusArea]
  /*
   * 限定不可聚焦的区域。
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
          // 要判断 $after 此时是否可见，在点击某元素导致对话框关闭时，对话框是先隐藏，然后才执行到这里。
          if (!$enable.contains(e.target) && $after.offsetWidth) {
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
   * 创建一个覆盖指定元素的内容的遮掩层。
   * 遮掩层除视觉遮掩效果外，仅能屏蔽鼠标对被遮掩区域的操作，因此应配合 freezeFocusArea 限制键盘操作。
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
   * @param {Element} target 要遮掩的目标元素，当其值为 body 元素时，将覆盖整个视口。
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Mask.options 中。
   * @param {Object} options.attributes 为遮掩层元素附加的属性。
   * @param {Object} options.styles 为遮掩层元素设置的样式。
   * @param {boolean} options.effect 是否启用动画效果。
   * @description
   *   遮掩层仅供内部使用，且均为被动调用，因此未提供事件支持。
   */
  function Mask(target, options) {
    this.target = $(target);
    this.setOptions(options);
  }

//--------------------------------------------------[Mask.options]
  /**
   * 默认选项。
   * @name Mask.options
   * @private
   */
  Mask.options = {
    attributes: {},
    styles: {backgroundColor: 'black', opacity: 0.2},
    effect: false
  };

//--------------------------------------------------[Mask.prototype.show]
  /**
   * 显示遮掩层。
   * @name Mask.prototype.show
   * @function
   * @private
   * @returns {Object} Mask 对象。
   */
  Mask.prototype.show = function() {
    var mask = this;
    if (!mask.animation) {
      var options = mask.options;
      var $container = mask.target;
      // 创建遮掩层元素。
      var attributes = '';
      Object.forEach(options.attributes, function(attributeValue, attributeName) {
        attributes += ' ' + attributeName + '="' + attributeValue + '"';
      });
      var $mask;
      var resizeMaskElementForIE6;
      if (navigator.isIE6) {
        // IE6 使用 IFRAME 元素遮盖 SELECT 元素。
        $mask = $('<div' + attributes + '><iframe scrolling="no" style="width: 100%; height: 100%; filter: alpha(opacity=0);"></iframe></div>').append($('<div></div>').setStyles(options.styles).setStyles({position: 'absolute', left: 0, top: 0, width: '100%', height: '100%'}));
        // IE6 body 元素的遮掩层在更改视口尺寸时需要调整尺寸。
        if ($container === document.body) {
          resizeMaskElementForIE6 = function() {
            mask.resize();
          };
        }
      } else {
        $mask = $('<div' + attributes + '></div>').setStyles(options.styles);
      }
      // 确定遮掩层元素的样式并插入文档树。
      $container.append($mask.setStyles({display: 'none', position: $container === document.body ? 'fixed' : 'absolute'}));
      mask.element = $mask;
      // 动画效果。
      mask.animation = new Animation()
          .on('playstart', function() {
            $mask.setStyle('display', 'block');
            mask.resize();
            if (resizeMaskElementForIE6) {
              window.attachEvent('onresize', resizeMaskElementForIE6);
            }
          })
          .on('reversefinish', function() {
            $mask.remove();
            delete mask.animation;
            delete mask.element;
            if (resizeMaskElementForIE6) {
              window.detachEvent('onresize', resizeMaskElementForIE6);
            }
          });
      if (options.effect) {
        mask.animation
            .addClip(new Fx.Morph($mask, {opacity: $mask.getStyle('opacity')}), 0, 150, 'easeIn')
            .on('playstart', function() {
              $mask.setStyle('opacity', 0);
            });
      }
      mask.animation.play();
    }
    return mask;
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
    if (this.animation) {
      this.animation.reverse();
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
    if (this.element) {
      var $mask = this.element;
      var $target = this.target;
      if ($target === document.body) {
        // 遮掩 body 的情况。
        if (navigator.isIE6) {
          var clientSize = window.getClientSize();
          // 刷新 display 以避免 IE6 的 $mask 元素内的两个 height 为 100% 的子元素在纵向改变窗口大小时高度不随 $mask 的变化而更新。
          $mask.setStyles({left: 0, top: 0, width: clientSize.width, height: clientSize.height, display: 'none'}).setStyle('display', 'block');
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
    if (this.element) {
      this.element.setStyle('zIndex', zIndex);
    }
    return this;
  };

//--------------------------------------------------[Mask]
  window.Mask = new Component(Mask, Mask.options, Mask.prototype);

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
   * @constructor
   * @param {Element} element 要作为对话框显示的元素。
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Dialog.options 中。
   * @param {Object} options.maskAttributes 为遮掩层元素附加的属性。
   * @param {Object} options.maskStyles 为遮掩层元素设置的样式。
   * @param {number} options.offsetX 对话框的左边与其父元素的左边的横向差值。默认为 NaN，此时对话框的中心点在横向将与其父元素的中心点重合。
   * @param {number} options.offsetY 对话框的顶边与其父元素的顶边的纵向差值。默认为 NaN，此时对话框的中心点在纵向将与其父元素的中心点重合。
   * @param {boolean} options.effect 是否启用动画效果。在 IE6 下将无视此选项，强行禁用动画效果，以避免和 PNG 透明修复脚本冲突。
   * @fires open
   *   调用 open 方法时触发；可以取消本次动作。
   * @fires openstart
   *   在对话框打开时触发。如果启用了动画效果，则在对话框打开动画开始播放后触发。
   * @fires openfinish
   *   在对话框打开后触发。如果启用了动画效果，则在对话框打开动画播放完成后触发。
   * @fires close
   *   调用 close 方法时触发；可以取消本次动作。
   * @fires closestart
   *   在对话框关闭时触发。如果启用了动画效果，则在对话框关闭动画开始播放后触发。
   * @fires closefinish
   *   在对话框关闭后触发。如果启用了动画效果，则在对话框关闭动画播放完成后触发。
   * @description
   *   对话框的弹出位置、遮掩层遮盖的范围都是与对话框的父元素有关的。
   *   对话框元素将以其父元素为“参考元素”进行定位，遮掩层也作为其父元素的子元素被创建。
   *   如果对话框元素的父元素是 body，遮掩层将遮掩整个视口。
   *   当对话框元素的父元素不是 body 时，应避免其父元素出现滚动条，以免对话框和遮掩层能随其内容滚动。
   *   当多个对话框有相同的父元素时，则视这些对话框为一组，一组对话框可以重叠显示。
   *   <ul>
   *     <li>对话框的默认状态为关闭。因此 element 的 display 将被设置为 none。</li>
   *     <li>当对话框元素的父元素为 body 元素时，其 position 才可以选择设置 absolute 或 fixed，其余情况均会被重设为 absolute。</li>
   *     <li>建议为该元素设置明确的 zIndex，如果未设置 zIndex，则自动设置 zIndex 为 1000。</li>
   *     <li>如果对话框元素的父元素的 position 为 static，将修改其 position 为 relative，以使其创建 stacking context。</li>
   *   </ul>
   */
  function Dialog(element, options) {
    var dialog = this;
    // 对话框的默认状态为关闭。
    dialog.isOpen = false;
    // 禁用 IE6 下的动画效果。
    if (navigator.isIE6) {
      options.effect = false;
    }
    // 对话框的初始状态是隐藏的。调节对话框的位置是通过 element 的 left 和 top 进行的，需要以像素为单位，因此先为其指定一个值，以便稍后计算位置。
    // 设置 top 为 -5000 是为了避免在 IE6 中启用 png 修复时出现闪烁现象。
    var $dialog = dialog.element = $(element).setStyles({display: 'none', left: 0, top: -5000});
    // 根据 element 的父元素 $container 确定对话框使用的定位方式。
    var $container = $dialog.getParent();
    if ($container === document.body && $dialog.getStyle('position') === 'fixed') {
      $dialog.setStyle('position', 'fixed');
      dialog.isFixedPositioned = true;
    } else {
      $dialog.setStyle('position', 'absolute');
      dialog.isFixedPositioned = false;
      // $container 必须创建 stacking context。
      if ($container.getStyle('position') === 'static') {
        $container.setStyle('position', 'relative');
      }
    }
    // 确保 element 的 zIndex 已设置，以供遮掩层参照。
    if ($dialog.getStyle('zIndex') === 'auto') {
      $dialog.setStyle('zIndex', 1000);
    }
    // 保存选项。
    options = dialog.setOptions(options).options;
    // 为对话框分组。
    var uid = $container.uid;
    var group = groups[uid] || (groups[uid] = {stack: [], mask: new window.Mask($container, {attributes: options.maskAttributes, styles: options.maskStyles, effect: options.effect})});
    var stack = group.stack;
    var mask = group.mask;
    // 动画效果。
    dialog.animation = new Animation()
        .on('playstart', function() {
          stack.push(dialog);
          // 初始化对话框状态。
          $dialog.setStyle('display', 'block');
          // 显示遮掩层及遮掩区域焦点锁定。
          mask.setZIndex($dialog.getStyle('zIndex') - 1).show();
          freezeFocusArea({enable: $dialog, disable: $container});
          // 仅父元素为 body 的对话框需要在改变窗口尺寸时重新调整位置（假设其他对话框的父元素的尺寸为固定）。
          if ($container === document.body) {
            window.on('resize.dialog' + $dialog.uid, navigator.isIE6 ? function() {
              // 避免 IE6 的固定定位计算错误。
              setTimeout(function() {
                dialog.adjust();
              }, 0);
            } : function() {
              dialog.adjust();
            });
          }
          // 对话框已打开。
          dialog.isOpen = true;
          dialog.adjust();
          dialog.fire('openstart');
        })
        .on('playfinish', function() {
          dialog.fire('openfinish');
        })
        .on('reversestart', function() {
          dialog.fire('closestart');
        })
        .on('reversefinish', function() {
          stack.pop();
          if (stack.length) {
            var previousDialog = stack[stack.length - 1];
            // 如果上一层还有对话框，则调整遮掩层及焦点区域锁定。
            mask.setZIndex(previousDialog.element.getStyle('zIndex') - 1);
            freezeFocusArea({enable: previousDialog.element, disable: $container});
          } else {
            // 如果是最底层对话框，则隐藏遮掩层，并解除焦点区域锁定。
            mask.hide();
            freezeFocusArea(null);
          }
          // 删除事件监听器。
          if ($container === document.body) {
            window.off('resize.dialog' + $dialog.uid);
          }
          // 恢复对话框状态。
          $dialog.setStyle('display', 'none');
          // 对话框已关闭。
          dialog.isOpen = false;
          dialog.fire('closefinish');
        });
    if (options.effect) {
      dialog.animation
          .addClip(new Fx.Morph($dialog, {opacity: $dialog.getStyle('opacity')}), 0, 200, 'easeIn')
          .on('playstart', function() {
            $dialog.setStyle('opacity', 0);
          });
    }
  }

//--------------------------------------------------[Dialog.options]
  /**
   * 默认选项。
   * @name Dialog.options
   */
  Dialog.options = {
    maskAttributes: {},
    maskStyles: {backgroundColor: 'black', opacity: 0.2},
    offsetX: NaN,
    offsetY: NaN,
    effect: false
  };

//--------------------------------------------------[Dialog.prototype.open]
  /**
   * 打开对话框。
   * @name Dialog.prototype.open
   * @function
   * @returns {Object} Dialog 对象。
   */
  Dialog.prototype.open = function() {
    var dialog = this;
    if (!dialog.isOpen) {
      dialog.fire('open', null, function() {
        dialog.animation.play();
      });
    }
    return dialog;
  };

//--------------------------------------------------[Dialog.prototype.close]
  /**
   * 关闭对话框。
   * @name Dialog.prototype.close
   * @function
   * @returns {Object} Dialog 对象。
   */
  Dialog.prototype.close = function() {
    var dialog = this;
    if (dialog.isOpen) {
      dialog.fire('close', null, function() {
        dialog.animation.reverse();
      });
    }
    return dialog;
  };

//--------------------------------------------------[Dialog.prototype.adjust]
  /**
   * 调整对话框位置。
   * @name Dialog.prototype.adjust
   * @function
   * @returns {Object} Dialog 对象。
   */
  Dialog.prototype.adjust = function() {
    if (this.isOpen) {
      var options = this.options;
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
      expectedX = containerClientRect.left + (isNaN(options.offsetX) ? (containerClientRect.width - currentWidth) / 2 : options.offsetX);
      expectedY = containerClientRect.top + (isNaN(options.offsetY) ? (containerClientRect.height - currentHeight) / 2 : options.offsetY);
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

//--------------------------------------------------[Dialog]
  window.Dialog = new Component(Dialog, Dialog.options, Dialog.prototype);

});

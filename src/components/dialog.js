/**
 * @fileOverview 组件 - 模态对话框。
 * @author sundongguo@gmail.com
 * @version 20120310
 */
execute(function($) {
//==================================================[Mask]
  /*
   * 创建一个覆盖指定元素的内容的遮掩层。
   * 遮掩层除视觉遮掩效果外，还能屏蔽鼠标和键盘对被遮掩区域的操作。
   *
   * 说明：
   *   遮掩层用来配合模态对话框使用。
   *   要在页面上实现 L 元素覆盖 M 元素，即要求 L 元素的 stacking context 与 M 元素的 stacking context 相同，或为其祖先级元素。
   *
   * 问题：
   *   IE6 下当 HTML 元素设置了非正常的背景图片（找不到图片或 about:blank）时，IFRAME 无法一直遮盖 SELECT 元素，窗口滚动后 SELECT 即再次显示在最前，但若此时 position: fixed 的表达式启用则无此问题。
   *   这个问题会在页面有设置了 "display: none; position: fixed;" 的元素，且欲覆盖区域不是 BODY，但其中有 SELECT 元素时出现。
   *   上述情况很少见，因此未处理此问题。
   *   如果需要处理，去掉 IE6 fixed positioned 相关代码中的“启用/禁用表达式”部分即可。
   *
   * 参考：
   *   http://w3help.org/zh-cn/causes/RM8015
   */

  // 限定不可聚焦的区域。参数 config 包含 enable 和 disable 两个元素。如果省略此参数，则取消限定。
  var $before;
  var $after;
  var $enabled;
  var $disabled;
  var focusedByUser = true;
  var freezeFocusArea = function(config) {
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
          .on('keydown', function(event) {
            if (event.which === 9 && event.shiftKey) {
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
          .on('keydown', function(event) {
            if (event.which === 9 && !event.shiftKey) {
              this.fire('focus');
              return false;
            }
          });
      if ($enable !== $enabled) {
        if ($disabled) {
          $disabled.off('focusin.freezeFocusArea');
        }
        $disable.on('focusin.freezeFocusArea', function(event) {
          // 要判断 $after 此时是否可见，在点击某元素导致对话框关闭时，对话框是先隐藏，然后才执行到这里。
          if (!$enable.contains(event.target) && $after.offsetWidth) {
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
        if ($before) {
          $before.remove(true);
        }
        if ($after) {
          $after.remove(true);
        }
        $enabled = $disabled = null;
      }
    }
  };

//--------------------------------------------------[Mask Constructor]
  /**
   * 遮掩层。
   * @name Mask
   * @function
   * @private
   * @param {Element} target 要遮掩的目标元素，当其值为 body 元素时，将覆盖整个视口。
   * @param {Object} [options] 可选参数，这些参数的默认值保存在 Mask.options 中。
   * @param {Object} options.maskAttributes 为遮掩层元素附加的属性。
   * @param {Object} options.maskStyles 为遮掩层元素设置的样式。
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
    maskAttributes: {},
    maskStyles: {backgroundColor: 'black', opacity: 0.2},
    effect: false
  };

//--------------------------------------------------[Mask.prototype.behind]
  /**
   * 调整遮掩层的纵向位置，或隐藏遮掩层。
   * @name Mask.prototype.behind
   * @function
   * @private
   * @param {Element} [element] 要将遮掩层置于其后的目标元素。如果省略此参数，则隐藏遮掩层。
   * @returns {Object} Mask 对象。
   */
  Mask.prototype.behind = function(element) {
    var mask = this;
    if (element) {
      if (!mask.animation) {
        var options = mask.options;
        var $container = mask.target;
        // 创建遮掩层元素。
        var attributes = '';
        Object.forEach(options.maskAttributes, function(attributeValue, attributeName) {
          attributes += ' ' + attributeName + '="' + attributeValue + '"';
        });
        var $mask;
        var resizeMaskElementForIE6;
        if (navigator.isIE6) {
          // IE6 使用 IFRAME 元素遮盖 SELECT 元素。
          $mask = $('<div' + attributes + '><iframe scrolling="no" style="width: 100%; height: 100%; filter: alpha(opacity=0);"></iframe></div>').append($('<div></div>').setStyles(options.maskStyles).setStyles({position: 'absolute', left: 0, top: 0, width: '100%', height: '100%'}));
          // IE6 body 元素的遮掩层在更改视口尺寸时需要调整尺寸。
          if ($container === document.body) {
            resizeMaskElementForIE6 = function() {
              mask.resize();
            };
          }
        } else {
          $mask = $('<div' + attributes + '></div>').setStyles(options.maskStyles);
        }
        // 确定遮掩层元素的样式并插入文档树。
        $container.append($mask.setStyles({display: 'none', position: $container === document.body ? 'fixed' : 'absolute'}));
        mask.element = $mask;
        // 动画效果。
        mask.animation = new Animation()
            .on('playstart', function() {
              $mask.setStyle('display', 'block');
              // 如果启用了动画效果则添加动画剪辑。
              if (options.effect) {
                var originalOpacity = $mask.getStyle('opacity');
                $mask.setStyle('opacity', 0);
                this.addClip(Animation.createStyleRenderer($mask, {opacity: originalOpacity}), 0, 1150, 'easeIn');
              }
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
      }
      mask.element.setStyle('zIndex', element.getStyle('zIndex') - 1);
      freezeFocusArea({enable: element, disable: mask.target});
      mask.animation.play();
    } else {
      if (this.animation) {
        this.animation.reverse();
        freezeFocusArea();
      }
    }
    return mask;
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

//--------------------------------------------------[Mask]
  window.Mask = new Component(Mask, Mask.options, Mask.prototype);

});

execute(function($) {
//==================================================[Dialog]
  /*
   * 创建模态对话框。
   * 当对话框弹出时，为突出对话框内容，将在对话框之下创建遮掩层，以阻止用户对遮盖部分内容的操作。
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
   * @param {Object} options.maskAttributes 为遮掩层元素附加的属性，默认为 {}。
   * @param {Object} options.maskStyles 为遮掩层元素设置的样式，默认为 {backgroundColor: 'black', opacity: 0.2}。
   * @param {number} options.offsetX 对话框的左边与其父元素的左边的横向差值。默认为 undefined，此时对话框的中心点在横向将与其父元素的中心点重合。
   * @param {number} options.offsetY 对话框的顶边与其父元素的顶边的纵向差值。默认为 undefined，此时对话框的中心点在纵向将与其父元素的中心点重合。
   * @param {boolean} options.effect 是否启用淡入淡出的动画效果，默认为 false。
   *   在 IE6 IE7 IE8 应关闭，否则动画使用的透明滤镜可能和 PNG 透明修复脚本冲突，或者因透明滤镜重叠而导致显示异常。
   * @fires open
   *   成功调用 open 方法后触发。
   * @fires openstart
   *   在对话框打开时触发。如果启用了动画效果，则在对话框打开动画开始播放后触发。
   * @fires openfinish
   *   在对话框打开后触发。如果启用了动画效果，则在对话框打开动画播放完成后触发。
   * @fires close
   *   成功调用 close 方法后触发。
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

    // 保存属性。
    // 对话框的初始状态为关闭、隐藏状态。
    dialog.isOpen = false;
    // 调节对话框的位置是通过 element 的 left 和 top 进行的，需要以像素为单位，因此先为其指定一个值，以便稍后计算位置。设置 top 为 -5000 是为了避免在 IE6 中启用 png 修复时出现闪烁现象。
    var $dialog = dialog.element = $(element).setStyles({display: 'none', left: 0, top: -5000});
    // 确保 element 的 zIndex 已设置，以供遮掩层参照。
    if ($dialog.getStyle('zIndex') === 'auto') {
      $dialog.setStyle('zIndex', 1000);
    }
    // 确定对话框元素的定位方式。
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

    // 保存选项。
    options = dialog.setOptions(options).options;

    // 为对话框分组。
    var uid = $container.uid;
    var group = groups[uid] || (groups[uid] = {stack: [], mask: new window.Mask($container, options)});
    var stack = group.stack;
    var mask = group.mask;

    // 使用 Animation 建立对话框的操作序列。
    dialog.animation = new Animation()
        .on('play', function() {
          dialog.fire('open');
        })
        .on('playstart', function() {
          stack.push(dialog);
          // 初始化对话框状态。
          $dialog.setStyle('display', 'block');
          // 如果启用了动画效果则添加动画剪辑，否则清理动画剪辑。
          if (options.effect) {
            if (this.clips.length === 0) {
              this.originalOpacity = $dialog.getStyle('opacity');
              $dialog.setStyle('opacity', 0);
              this.addClip(Animation.createStyleRenderer($dialog, {opacity: this.originalOpacity}), 0, 1200, 'easeIn');
            }
          } else {
            if (this.clips.length > 0) {
              delete this.originalOpacity;
              this.clips.length = 0;
              this.duration = 0;
            }
          }
          // 调整遮掩层。
          mask.behind($dialog);
          // 仅父元素为 body 的对话框需要在改变窗口尺寸时重新调整位置（假设其他对话框的父元素的尺寸为固定）。
          if ($container === document.body) {
            window.on('resize.dialog' + $dialog.uid, navigator.isIE6 ? function() {
              // 避免 IE6 的固定定位计算错误。
              setTimeout(function() {
                dialog.reposition();
              }, 0);
            } : function() {
              dialog.reposition();
            });
          }
          // 对话框已打开。
          dialog.isOpen = true;
          dialog.reposition();
          dialog.fire('openstart');
        })
        .on('playfinish', function() {
          dialog.fire('openfinish');
        })
        .on('reverse', function() {
          dialog.fire('close');
        })
        .on('reversestart', function() {
          dialog.fire('closestart');
        })
        .on('reversefinish', function() {
          stack.pop();
          if (stack.length) {
            // 如果上一层还有对话框，则调整遮掩层。
            mask.behind(stack[stack.length - 1].element);
          } else {
            // 如果是最底层对话框，则隐藏遮掩层。
            mask.behind();
          }
          // 删除事件监听器。
          if ($container === document.body) {
            window.off('resize.dialog' + $dialog.uid);
          }
          // 恢复对话框状态。
          $dialog.setStyle('display', 'none');
          // 如果启用了动画效果则恢复原始透明度。
          if (this.hasOwnProperty('originalOpacity')) {
            $dialog.setStyle('opacity', this.originalOpacity);
          }
          // 对话框已关闭。
          dialog.isOpen = false;
          dialog.fire('closefinish');
        });

    // 为本组件设置选项的同时，也为 mask 设置选项。
    dialog.setOptions = function(options) {
      Component.prototype.setOptions.call(this, options);
      mask.setOptions(options);
      return this;
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
    offsetX: undefined,
    offsetY: undefined,
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
    this.animation.play();
    return this;
  };

//--------------------------------------------------[Dialog.prototype.close]
  /**
   * 关闭对话框。
   * @name Dialog.prototype.close
   * @function
   * @returns {Object} Dialog 对象。
   */
  Dialog.prototype.close = function() {
    this.animation.reverse();
    return this;
  };

//--------------------------------------------------[Dialog.prototype.reposition]
  /**
   * 重新定位对话框位置。
   * @name Dialog.prototype.reposition
   * @function
   * @returns {Object} Dialog 对象。
   */
  Dialog.prototype.reposition = function() {
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
      expectedX = containerClientRect.left + (Number.isFinite(options.offsetX) ? options.offsetX : (containerClientRect.width - currentWidth) / 2);
      expectedY = containerClientRect.top + (Number.isFinite(options.offsetY) ? options.offsetY : (containerClientRect.height - currentHeight) / 2);
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

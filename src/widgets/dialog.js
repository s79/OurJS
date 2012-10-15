/**
 * @fileOverview 控件 - 模态对话框。
 * @author sundongguo@gmail.com
 * @version 20120310
 */

(function() {
//==================================================[控件 - 遮盖层]
  /**
   * 遮盖层
   * @name W-OVERLAY
   * @namespace
   * @private
   * @description
   *   使用 W-OVERLAY 元素来表示一个遮盖层。
   *   遮盖层用于遮盖模态对话框下边、其父元素内的其他内容。当其父元素为 BODY 元素时，将覆盖整个视口。
   *   遮掩层在显示/隐藏时是否使用动画取决于调用它的对话框是否启用了动画。
   *   需要定义其他的样式时，可以通过 CSS 进行修改，或者直接修改遮掩层元素的 style 属性。
   *   TagName:
   *     W-OVERLAY
   *   Method:
   *     behind 指定要将遮掩层置于哪个对话框元素之下。
   *     参数：
   *       {Element} [$dialog] 要将遮掩层置于其后的对话框元素。如果省略此参数，则隐藏遮掩层。
   *     返回值：
   *       {Element} 本元素。
   *     resize 调整遮掩层尺寸。
   *     返回值：
   *       {Element} 本元素。
   *
   *   问题：
   *     IE6 下当 HTML 元素设置了非正常的背景图片（找不到图片或 about:blank）时，IFRAME 无法一直遮盖 SELECT 元素，窗口滚动后 SELECT 即再次显示在最前，但若此时 position: fixed 的表达式启用则无此问题。
   *     这个问题会在页面有设置了 "display: none; position: fixed;" 的元素，且欲覆盖区域不是 BODY，但其中有 SELECT 元素时出现。
   *     上述情况很少见，因此未处理此问题。
   *     如果需要处理，去掉 IE6 fixed positioned 相关代码中的“启用/禁用表达式”部分即可。
   *   参考：
   *     http://w3help.org/zh-cn/causes/RM8015
   */
//--------------------------------------------------[W-OVERLAY]
  if (navigator.isIElt9) {
    document.createElement('w-overlay');
  }

//--------------------------------------------------[CSSRules]
  document.addStyleRules([
    'w-overlay { display: none; background-color: black; opacity: 0.2; filter: alpha(opacity=20); }'
  ]);

//--------------------------------------------------[freezeFocusArea]
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
        $before.insertTo($enable, 'top');
        $after.insertTo($enable, 'bottom').fire('focus');
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

//--------------------------------------------------[Widget.parsers.overlay]
  Widget.parsers.overlay = function($element) {
    // 保存属性。
    var context = $element.context = $element.getParent();
    $element.isVisible = false;

    // 设置样式及内部结构。
    var contextIsBody = context === document.body;
    $element.setStyles({position: contextIsBody ? 'fixed' : 'absolute'});
    if (navigator.isIE6) {
      // IE6 使用 IFRAME 元素遮盖 SELECT 元素，在其上覆盖一个 SPAN 元素是为了避免鼠标点击时离开本文档（IE6 HTMLUnknownElement 无法插入非短句式内容）。
      $element.innerHTML = '<iframe scrolling="no" style="display: block; width: 100%; height: 100%; filter: alpha(opacity=0);"></iframe><span style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: white; filter: alpha(opacity=0);"></span>';
      // IE6 BODY 元素的遮掩层在更改视口尺寸时需要调整尺寸。
      if (contextIsBody) {
        $element.resizeInIE6 = function() {
          $element.resize();
        };
      }
    }

    // 绑定事件。
    var dialogs = context.dialogs || (context.dialogs = []);
    $element.on('click.overlay', function() {
      dialogs.getLast().focus();
    });

  };

//--------------------------------------------------[Widget.parsers.overlay.methods]
  Widget.parsers.overlay.methods = {
    reposition: function() {
      var $dialog = this.context.dialogs.getLast();
      if ($dialog) {
        this.setStyle('zIndex', $dialog.getStyle('zIndex') - 1);
        if (!this.isVisible) {
          if (this.resizeInIE6) {
            window.attachEvent('onresize', this.resizeInIE6);
          }
          this.fade('in');
          this.isVisible = true;
          this.resize();
        }
        freezeFocusArea({enable: $dialog, disable: this.context});
      } else {
        if (this.isVisible) {
          if (this.resizeInIE6) {
            window.detachEvent('onresize', this.resizeInIE6);
          }
          this.fade('out');
          this.isVisible = false;
        }
        freezeFocusArea();
      }
      return this;
    },
    resize: function() {
      if (this.isVisible) {
        var context = this.context;
        if (context === document.body) {
          // 遮掩 BODY 的情况。
          if (navigator.isIE6) {
            var clientSize = window.getClientSize();
            // 使本元素 reflow 以避免 IE6 的 this 元素内的两个 height 为 100% 的子元素在纵向改变窗口大小时高度不随 this 的变化而更新。
            this.setStyles({left: 0, top: 0, width: clientSize.width, height: clientSize.height, display: 'none'}).setStyle('display', 'block');
          } else {
            this.setStyles({left: 0, right: 0, top: 0, bottom: 0});
          }
        } else {
          // 其他情况。
          this.setStyles({left: 0, top: 0, width: context.clientWidth, height: context.clientHeight});
        }
      }
      return this;
    }
  };

})();

(function() {
//==================================================[控件 - 模态对话框]
  /**
   * 模态对话框。
   * @name W-DIALOG
   * @namespace
   * @description
   *   使用 W-DIALOG 元素来表示一个模态对话框。
   *   当对话框弹出时，为突出对话框内容，将在对话框之下创建遮掩层，以阻止用户对遮盖部分内容的操作。
   *   对话框的弹出位置、遮掩层遮盖的范围都是与对话框的父元素有关的。
   *   对话框元素将以其父元素为“参考元素(context)”进行定位，遮掩层也作为其父元素的子元素被创建。
   *   如果对话框元素的父元素是 BODY，遮掩层将遮掩整个视口。
   *   当对话框元素的父元素不是 BODY 时，应避免其父元素出现滚动条，以免对话框和遮掩层能随其内容滚动。
   *   当多个对话框有相同的父元素时，则视这些对话框为一组，一组对话框可以重叠显示。
   *   <ul>
   *     <li>对话框的默认状态为关闭。因此 element 的 display 将被设置为 none。</li>
   *     <li>当对话框元素的父元素为 BODY 元素时，其 position 才可以选择设置 absolute 或 fixed，其余情况均会被重设为 absolute。</li>
   *     <li>建议为该元素设置明确的 zIndex，如果未设置 zIndex，则自动设置 zIndex 为 1000。</li>
   *     <li>如果对话框元素的父元素的 position 为 static，将修改其 position 为 relative，以使其创建 stacking context。</li>
   *   </ul>
   *   TagName:
   *     W-DIALOG
   *   Attributes：
   *     data-offset-x (offsetX) 对话框的左边与其父元素的左边的横向差值。默认为 NaN，此时对话框的中心点在横向将与其父元素的中心点重合。
   *     data-offset-y (offsetY) 对话框的顶边与其父元素的顶边的纵向差值。默认为 NaN，此时对话框的中心点在纵向将与其父元素的中心点重合。
   *     data-effect (effect) 是否启用淡入淡出的动画效果，默认为 false。
   *     data-fixed (fixed) 是否启用固定定位，仅在对话框的父元素为 BODY 元素时有效，默认为 false。
   *   Properties：
   *
   *   Method:
   *     open 打开对话框。如果对话框正在打开或已经打开，则调用此方法无效。
   *     返回值：
   *       {Element} 本元素。
   *     close 关闭对话框。如果对话框正在关闭或已经关闭，则调用此方法无效。
   *     返回值：
   *       {Element} 本元素。
   *     reposition 重新定位对话框位置。仅在对话框处于“打开”状态时，调用此方法才有效。
   *     返回值：
   *       {Element} 本元素。
   *   Events：
   *     open 在对话框打开时触发。
   *     close 在对话框关闭后触发。
   *     reposition 成功调用 reposition 方法后触发。
   */

//--------------------------------------------------[W-OVERLAY & W-DIALOG]
  if (navigator.isIElt9) {
    document.createElement('w-dialog');
  }

//--------------------------------------------------[CSSRules]
  document.addStyleRules([
    'w-dialog { display: none; }'
  ]);

  // 对话框分组，将使用同一个遮掩层的对话框分为一组，在这组对话框层叠显示时，遮掩层会自动修改 zIndex 以适应顶层对话框。
  /*
   * <Object groups> {
   *   <string uid>: <Object group> {
   *     stack: <Array dialogs> [
   *       dialog: <Object Dialog>
   *     ],
   *     overlay: <Object Overlay>
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
   * @param {Object} [config] 配置信息。
   * @param {Object} config.overlayStyles 为遮掩层元素设置的样式，默认为 {backgroundColor: 'black', opacity: 0.2}。
   * @param {number} config.offsetX 对话框的左边与其父元素的左边的横向差值。默认为 undefined，此时对话框的中心点在横向将与其父元素的中心点重合。
   * @param {number} config.offsetY 对话框的顶边与其父元素的顶边的纵向差值。默认为 undefined，此时对话框的中心点在纵向将与其父元素的中心点重合。
   * @param {boolean} config.effect 是否启用淡入淡出的动画效果，默认为 false。
   *   在 IE6 IE7 IE8 应关闭，否则动画使用的透明滤镜可能和 PNG 透明修复脚本冲突，或者因透明滤镜重叠而导致显示异常。
   */
  var Dialog = new Component(function(element, config) {
    var dialog = this;

    // 获取配置信息。
    config = dialog.setConfig(config);

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
    var containerIsBody = $container === document.body;
    if (containerIsBody && $dialog.getStyle('position') === 'fixed') {
      $dialog.setStyle('position', 'fixed');
      dialog.isFixedPositioned = true;
    } else {
      $dialog.setStyle('position', 'absolute');
      dialog.isFixedPositioned = false;
      // $container 必须创建 stacking context。
      if (!containerIsBody && $container.getStyle('position') === 'static') {
        $container.setStyle('position', 'relative');
      }
    }

    // 为对话框分组。
    var uid = $container.uid;
    var group = groups[uid] || (groups[uid] = {stack: [], overlay: new window.Overlay($container, config)});
    var stack = group.stack;
    var overlay = dialog.overlay = group.overlay;

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
          if (config.effect) {
            if (this.clips.length === 0) {
              this.originalOpacity = $dialog.getStyle('opacity');
              $dialog.setStyle('opacity', 0);
              this.addClip(Animation.createStyleRenderer($dialog, {opacity: this.originalOpacity}), 0, 200, 'easeIn');
            }
          } else {
            if (this.clips.length > 0) {
              delete this.originalOpacity;
              this.clips.length = 0;
              this.duration = 0;
            }
          }
          // 调整遮掩层。
          overlay.behind($dialog);
          // 仅父元素为 BODY 的对话框需要在改变窗口尺寸时重新调整位置（假设其他对话框的父元素的尺寸为固定）。
          if (containerIsBody) {
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
            overlay.behind(stack[stack.length - 1].element);
          } else {
            // 如果是最底层对话框，则隐藏遮掩层。
            overlay.behind();
          }
          // 删除事件监听器。
          if (containerIsBody) {
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

    // 同时更改 dialog 和 overlay 的配置。
    dialog.setConfig = function(config) {
      Configurable.prototype.setConfig.call(this, config);
      overlay.setConfig(config);
      return this.config;
    }

  });

//--------------------------------------------------[Dialog.config]
  Dialog.config = {
    overlayStyles: {},
    offsetX: undefined,
    offsetY: undefined,
    effect: false
  };

//--------------------------------------------------[Dialog.prototype.open]
  Dialog.prototype.open = function() {
    this.animation.play();
    return this;
  };

//--------------------------------------------------[Dialog.prototype.close]
  Dialog.prototype.close = function() {
    this.animation.reverse();
    return this;
  };

//--------------------------------------------------[Dialog.prototype.reposition]
  Dialog.prototype.reposition = function() {
    if (this.isOpen) {
      var config = this.config;
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
      expectedX = containerClientRect.left + (Number.isFinite(config.offsetX) ? config.offsetX : (containerClientRect.width - currentWidth) / 2);
      expectedY = containerClientRect.top + (Number.isFinite(config.offsetY) ? config.offsetY : (containerClientRect.height - currentHeight) / 2);
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
      // 触发事件。
      this.fire('reposition');
    }
    return this;
  };

//--------------------------------------------------[Dialog]
  window.Dialog = Dialog;

})();

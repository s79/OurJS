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
   *   遮盖层用于遮盖模态对话框下边、其父元素内的其他内容。当其父元素为 BODY 时，将覆盖整个视口。
   *   遮盖层在显示/隐藏时是否使用动画取决于调用它的对话框是否启用了动画。
   *   需要定义其他的样式时，可以通过 CSS 进行修改，或者直接修改遮盖层元素的 style 属性。
   *   TagName:
   *     W-OVERLAY
   *   Method:
   *     behind 指定要将遮盖层置于哪个对话框元素之下。
   *     参数：
   *       {Element} [$dialog] 要将遮盖层置于其后的对话框元素。如果省略此参数，则隐藏遮盖层。
   *     返回值：
   *       {Element} 本元素。
   *     resize 调整遮盖层尺寸。
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
    var $context = $element.context = $element.getParent();
    $element.isVisible = false;

    // 设置样式及内部结构。
    var contextIsBody = $context === document.body;
    $element.setStyles({position: contextIsBody ? 'fixed' : 'absolute'});
    if (navigator.isIE6) {
      // IE6 使用 IFRAME 元素遮盖 SELECT 元素，在其上覆盖一个 DIV 元素是为了避免鼠标在遮盖范围内点击时触发元素在本文档之外。
      $element.innerHTML = '<iframe frameborder="no" scrolling="no" style="display: block; width: 100%; height: 100%; filter: alpha(opacity=0);"></iframe><div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: white; filter: alpha(opacity=0);"></div>';
      // IE6 BODY 的遮盖层在更改视口尺寸时需要调整尺寸。
      if (contextIsBody) {
        $element.resizeInIE6 = function() {
          $element.resize();
        };
      }
    }

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
          this.fade('in', {duration: 100});
          this.isVisible = true;
          this.resize();
        }
        freezeFocusArea({enable: $dialog, disable: this.context});
      } else {
        if (this.isVisible) {
          if (this.resizeInIE6) {
            window.detachEvent('onresize', this.resizeInIE6);
          }
          this.fade('out', {duration: 100});
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
          // 遮盖 BODY 的情况。
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
   *   当对话框弹出时，为突出对话框内容，将在对话框之下创建遮盖层，以阻止用户对遮盖部分内容的操作。
   *   对话框的弹出位置、遮盖层遮盖的范围都是与对话框的父元素有关的。
   *   W-DIALOG 元素将以其父元素为“参考元素(context)”进行定位，遮盖层也作为其父元素的子元素被创建，因此不要修改 W-DIALOG 元素在文档树中的位置！
   *   如果 W-DIALOG 元素的父元素是 BODY，遮盖层将遮盖整个视口。
   *   当 W-DIALOG 元素的父元素不是 BODY 时，应避免其父元素出现滚动条，以免对话框和遮盖层能随其内容滚动。
   *   当多个对话框有相同的父元素时，则视这些对话框为一组，一组对话框可以重叠显示。
   *   <ul>
   *     <li>对话框的默认状态为关闭。因此 W-DIALOG 元素的 display 将被设置为 none。</li>
   *     <li>仅当 W-DIALOG 元素的父元素为 BODY 时，其 position 才可以选择设置 absolute 或 fixed，其余情况均会被重设为 absolute。</li>
   *     <li>W-DIALOG 元素的 zIndex 值会被自动指定。</li>
   *     <li>如果 W-DIALOG 元素的父元素的 position 为 static，将修改其 position 为 relative，以使其创建 stacking context。</li>
   *   </ul>
   *   TagName:
   *     W-DIALOG
   *   Attributes：
   *     data-offset-x (offsetX) 对话框的左边与其父元素的左边的横向差值。默认为 NaN，此时对话框的中心点在横向将与其父元素的中心点重合。
   *     data-offset-y (offsetY) 对话框的顶边与其父元素的顶边的纵向差值。默认为 NaN，此时对话框的中心点在纵向将与其父元素的中心点重合。
   *     data-effect (effect) 打开和关闭对话框时使用的动画效果，默认为 false。
   *     data-fixed (fixed) 是否启用固定定位，仅在对话框的父元素为 BODY 时有效，默认为 false。当 IE6 IE7 IE8 使用了透明滤镜或 PNG 半透明修复脚本时应关闭，以避免显示异常。
   *   Properties：
   *     isOpen
   *   Method:
   *     open 打开对话框。如果对话框已经打开，则调用此方法无效。
   *     返回值：
   *       {Element} 本元素。
   *     close 关闭对话框。如果对话框已经关闭，则调用此方法无效。
   *     返回值：
   *       {Element} 本元素。
   *     reposition 重新定位对话框位置。如果对话框已经关闭，则调用此方法无效。
   *     返回值：
   *       {Element} 本元素。
   *   Events：
   *     open 在对话框打开时触发。
   *     close 在对话框关闭后触发。
   *     reposition 成功调用 reposition 方法后触发。
   */

//--------------------------------------------------[W-DIALOG]
  if (navigator.isIElt9) {
    document.createElement('w-dialog');
  }

//--------------------------------------------------[CSSRules]
  document.addStyleRules([
    'w-dialog { display: none; }'
  ]);

//--------------------------------------------------[Widget.parsers.dialog]
  Widget.parsers.dialog = function($element) {
    // 保存属性。
    var $context = $element.context = $element.getParent();
    var contextIsBody = $context === document.body;
    $element.isFixedPositioned = contextIsBody && $element.fixed;
    $element.isOpen = false;

    // 本对话框是 $context 中的第一个对话框。
    if (!$context.dialogs) {
      // 确保 $context 创建 stacking context。
      if (!contextIsBody && $context.getStyle('position') === 'static') {
        $context.setStyle('position', 'relative');
      }
      // 为 $context 添加 W-OVERLAY 和 W-DIALOG 公用的属性。
      $context.dialogs = [];
      Widget.parse($context.overlay = $(document.createElement('w-overlay')).insertTo($context).on('click.overlay', function() {
        $context.dialogs.getLast().focus();
      }));
    }

    // 使本元素可获得焦点。
    $element.tabIndex = 0;

    // 设置样式。
    // 仅当父元素为 BODY 时，其 position 才可以是 fixed。
    // 调节对话框的位置是通过 $element 的 left 和 top 进行的，需要以像素为单位，因此先为其指定一个值，以便稍后计算位置。设置 left 为 -50000 是为了避免在 IE6 中启用 png 修复时出现闪烁现象。
    // 从 2000000000 开始重置 $element 的 zIndex，以供遮盖层参照。
    $element.setStyles({position: $element.isFixedPositioned ? 'fixed' : 'absolute', left: -50000, top: 0});

  };

//--------------------------------------------------[Widget.parsers.dialog.config]
  Widget.parsers.dialog.config = {
    offsetX: NaN,
    offsetY: NaN,
    effect: 0,
    fixed: false
  };

//--------------------------------------------------[Widget.parsers.dialog.methods]
  Widget.parsers.dialog.methods = {
    open: function() {
      var $dialog = this;
      if (!$dialog.isOpen) {
        $dialog.fade('in', {
          duration: 100,
          onStart: function() {
            var $context = $dialog.context;
            // 更新状态。
            $dialog.isOpen = true;
            // 添加到已打开的对话框组，并修改对话框的位置。
            $dialog.setStyle('zIndex', 2000000000 + $context.dialogs.push($dialog) * 2).reposition();
            // 重新定位遮盖层。
            $context.overlay.reposition();
            // 仅父元素为 BODY 的对话框需要在改变窗口尺寸时重新调整位置（此处假定其他对话框的父元素尺寸不会变化）。
            if ($context === document.body) {
              window.on('resize.dialog_' + $dialog.uid, navigator.isIE6 ? function() {
                // 避免 IE6 的固定定位计算错误。
                setTimeout(function() {
                  $dialog.reposition();
                }, 0);
              } : function() {
                $dialog.reposition();
              });
            }
            // 触发事件。
            $dialog.fire('open');
          }
        });
      }
      return $dialog;
    },
    close: function() {
      var $dialog = this;
      if ($dialog.isOpen) {
        $dialog.fade('out', {
          duration: 100,
          onFinish: function() {
            var $context = $dialog.context;
            // 更新状态。
            $dialog.isOpen = false;
            // 从已打开的对话框组中移除。
            $context.dialogs.pop();
            // 重新定位遮盖层。
            $context.overlay.reposition();
            // 删除事件监听器。
            if ($context === document.body) {
              window.off('resize.dialog_' + $dialog.uid);
            }
            // 触发事件。
            $dialog.fire('close');
          }
        });
      }
      return $dialog;
    },
    reposition: function() {
      var $dialog = this;
      if ($dialog.isOpen) {
        var $context = $dialog.context;
        var isFixedPositioned = $dialog.isFixedPositioned;
        // 获取当前位置。
        var dialogClientRect = $dialog.getClientRect();
        var currentX = dialogClientRect.left;
        var currentY = dialogClientRect.top;
        var currentWidth = dialogClientRect.width;
        var currentHeight = dialogClientRect.height;
        // 计算预期位置。
        var expectedX;
        var expectedY;
        var contextClientRect = {};
        if (isFixedPositioned) {
          var viewportClientSize = window.getClientSize();
          contextClientRect.left = 0;
          contextClientRect.top = 0;
          contextClientRect.width = viewportClientSize.width;
          contextClientRect.height = viewportClientSize.height;
        } else {
          contextClientRect = $context.getClientRect();
        }
        expectedX = contextClientRect.left + (Number.isFinite($dialog.offsetX) ? $dialog.offsetX : (contextClientRect.width - currentWidth) / 2);
        expectedY = contextClientRect.top + (Number.isFinite($dialog.offsetY) ? $dialog.offsetY : (contextClientRect.height - currentHeight) / 2);
        // 确保固定定位的对话框显示在视口内。
        if (isFixedPositioned) {
          var leftLimit = 0;
          var rightLimit = leftLimit + contextClientRect.width;
          var topLimit = 0;
          var bottomLimit = topLimit + contextClientRect.height;
          // 当视口尺寸不足以容纳对话框时，优先显示右上角（对话框的关闭按钮一般在右上角）。
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
        $dialog.fire('reposition');
      }
      return $dialog;
    }
  };

//--------------------------------------------------[Widget.parsers.dialog.events]
  Widget.parsers.dialog.events = ['open', 'close', 'reposition'];

})();

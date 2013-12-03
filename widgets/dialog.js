/**
 * @fileOverview Widget - 模态对话框
 * @author sundongguo@gmail.com
 * @version 20121018
 */

(function() {
//==================================================[Widget - 遮盖层]
//--------------------------------------------------[Overlay]
  /*
   * “遮盖层”用于遮盖“模态对话框”下边、其父元素内的其他内容。
   * @启用方式
   *   为一个 DIV 元素添加 'widget-overlay' 类，即可使该元素成为“遮盖层”。
   * @新增行为
   * * 当其父元素为 BODY 时，将遮盖整个视口。
   * * “遮盖层”可以在显示/隐藏时使用动画，这取决于调用它的“模态对话框”是否启用了动画。
   * @新增方法
   *   reposition
   *     重新定位“遮盖层”的层级，如果当前 context 下不再有其他“模态对话框”，则隐藏“遮盖层”。
   *     返回值：
   *       {Element} 本元素。
   *   resize
   *     调整“遮盖层”的尺寸。
   *     返回值：
   *       {Element} 本元素。
   * @遗留问题
   *   IE6 下当 HTML 元素设置了非正常的背景图片（找不到图片或 about:blank）时，IFRAME 无法一直遮盖 SELECT 元素，窗口滚动后 SELECT 即再次显示在最前，但若此时 position: fixed 的表达式启用则无此问题。
   *   这个问题会在页面有设置了 "display: none; position: fixed;" 的元素，且欲遮盖区域不是 BODY，但其中有 SELECT 元素时出现。
   *   上述情况很少见，因此未处理此问题。
   *   如果需要处理，去掉 IE6 fixed positioned 相关代码中的“启用/禁用表达式”部分即可。
   */

  Widget.register({
    type: 'overlay',
    selector: 'div.widget-overlay',
    styleRules: [
      'div.widget-overlay { display: none; left: 0; top: 0; background-color: black; opacity: 0.2; filter: alpha(opacity=20); }'
    ],
    methods: {
      reposition: function() {
        var $overlay = this;
        var dialogs = $overlay.context.dialogs;
        var $dialog = dialogs.getLast();
        if ($dialog) {
          $overlay.setStyle('zIndex', $dialog.getStyle('zIndex') - 1);
          $dialog.focus();
          if (!$overlay.isVisible) {
            // 显示“遮盖层”。
            if ($overlay.resizeInIE6) {
              window.attachEvent('onresize', $overlay.resizeInIE6);
            }
            $overlay.fade('in', {duration: 100, timingFunction: 'easeOut'});
            $overlay.isVisible = true;
            $overlay.resize();
            // 锁定可交互区域。
            $overlay.context.on('focusin.freezeInteractionArea', function(e) {
              var $target = e.target;
              if ($target !== $overlay) {
                var $activeDialog = dialogs.getLast();
                if (!$activeDialog.contains($target) && $activeDialog.offsetWidth) {
                  $activeDialog.focus();
                }
              }
            });
          }
        } else {
          if ($overlay.isVisible) {
            // 隐藏“遮盖层”。
            if ($overlay.resizeInIE6) {
              window.detachEvent('onresize', $overlay.resizeInIE6);
            }
            $overlay.fade('out', {duration: 100, timingFunction: 'easeIn'});
            $overlay.isVisible = false;
            // 解锁可交互区域。
            $overlay.context.off('focusin.freezeInteractionArea');
          }
        }
        return $overlay;
      },
      resize: function() {
        if (this.isVisible) {
          var context = this.context;
          if (context === document.body) {
            // 遮盖 BODY 的情况。
            if (navigator.isIE6) {
              var clientSize = window.getClientSize();
              // 同时修改三个元素的尺寸，以避免两个子元素在纵向改变窗口大小时高度不随父元素的变化而更新。
              this.setStyles({width: clientSize.width, height: clientSize.height});
              this.elements.iframe.setStyle('height', clientSize.height);
              this.elements.div.setStyle('height', clientSize.height);
            } else {
              this.setStyles({right: 0, bottom: 0});
            }
          } else {
            // 其他情况。
            this.setStyles({width: context.clientWidth, height: context.clientHeight});
          }
        }
        return this;
      }
    },
    initialize: function() {
      var $overlay = this;

      // 保存属性。
      var $context = $overlay.context = $overlay.getParent();
      $overlay.isVisible = false;

      // 设置样式及内部结构。
      var contextIsBody = $context === document.body;
      $overlay.setStyles({position: contextIsBody ? 'fixed' : 'absolute'});
      if (navigator.isIE6) {
        // IE6 使用 IFRAME 元素遮盖 SELECT 元素，在其上覆盖一个 DIV 元素是为了避免鼠标在遮盖范围内点击时触发元素在本文档之外。
        $overlay.innerHTML = '<iframe frameborder="no" scrolling="no" style="display: block; width: 100%; height: 100%; filter: alpha(opacity=0);"></iframe><div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: white; filter: alpha(opacity=0);"></div>';
        $overlay.elements = {
          iframe: $overlay.getFirstChild(),
          div: $overlay.getLastChild()
        };
        // IE6 BODY 的“遮盖层”在更改视口尺寸时需要调整尺寸。
        if (contextIsBody) {
          $overlay.resizeInIE6 = function() {
            $overlay.resize();
          };
        }
      }

    }
  });

})();

(function() {
//==================================================[Widget - 模态对话框]
//--------------------------------------------------[Dialog]
  /**
   * “模态对话框”（以下简称为“对话框”）可以突出显示一部分内容并遮盖其余内容，以强制用户对突出显示的部分进行操作。
   * @启用方式
   *   为一个 DIV 元素添加 'widget-dialog' 类，即可使该元素成为“对话框”。
   * @结构约定
   *   <div class="widget-dialog">
   *     <a href="javascript:void('close');" class="close">关闭</a>
   *   </div>
   * * “对话框”的后代元素中，类名包含 'close' 的为“关闭按钮”。
   *   “关闭按钮”是可选的。
   * * “对话框”的一些数据保存在其父元素中，因此不要在“对话框”被解析后修改其在文档树中的位置。
   *   “对话框”的父元素一定要创建 stacking context，必要时会自动将其父元素的 position 设置为 'relative'。
   *   如果“对话框”的父元素不是 BODY，应避免其父元素出现滚动条，以免“对话框”和“遮盖层”随其父元素的内容一起滚动。
   * * “对话框”的 position 在其“定位参考元素”为 BODY 时将被设置为 'fixed'，其余情况均会被设置为 'absolute'。
   *   “对话框”的 z-index 值会被自动指定。
   * @默认样式
   *   div.widget-overlay { display: none; left: 0; top: 0; background-color: black; opacity: 0.2; filter: alpha(opacity=20); }
   *   div.widget-dialog { display: none; outline: none; }
   * @可配置项
   *   data-pinned-target
   *     “对话框”的“定位参考元素”的 id。
   *     如果不指定本属性，则以父元素作为“定位参考元素”。
   *     “定位参考元素”只能是“对话框”的父元素或其父元素的后代元素，且不能是“对话框”自身。
   *   data-left
   *     “对话框”的左边与其“定位参考元素”的左边的横向差值，单位为像素。
   *   data-right
   *     “对话框”的右边与其“定位参考元素”的右边的横向差值，单位为像素。
   *     如果已指定 data-left， 本属性将被忽略。
   *     如果 data-left 和本属性均未指定，“对话框”的中心点在横向将与其“定位参考元素”的中心点对齐。
   *   data-top
   *     “对话框”的顶边与其“定位参考元素”的顶边的纵向差值，单位为像素。
   *   data-bottom
   *     “对话框”的底边与其“定位参考元素”的底边的纵向差值，单位为像素。
   *     如果已指定 data-top， 本属性将被忽略。
   *     如果 data-top 和本属性均未指定，“对话框”的中心点在纵向将与其“定位参考元素”的中心点对齐。
   *   data-animation
   *     打开和关闭“对话框”时使用的动画效果，可选项有 'none'，'fade' 和 'slide'。
   *     如果不指定本属性或指定为 'none'，则关闭动画效果。
   *     在 IE6 下本属性无效（不能启用动画效果）。
   * @新增行为
   * * “对话框”的默认状态为关闭。
   * * 当“对话框”打开时，会根据其“定位参考元素”及定位偏移量的设置来确定其显示的位置。同时，还将自动生成一个“遮盖层”，“遮盖层”遮盖的范围为“对话框”的父元素的渲染范围，当前打开的“对话框”会在“遮盖层”上方显示，被遮盖的部分将无法使用键盘或鼠标进行操作。
   * * 当多个“对话框”有相同的父元素时，则视这些“对话框”为一组，一组“对话框”可以重叠显示。
   *   当一组“对话框”重叠显示时，“遮盖层”只有一个，只有最后打开的“对话框”才不会被遮盖。
   * * 通过点击“关闭按钮”（如果有）即可关闭“对话框”。在“关闭按钮”上发生的 click 事件的默认行为将被阻止。
   * @新增属性
   *   {boolean} isOpen “对话框”当前是否为打开状态。
   * @新增方法
   *   open
   *     打开“对话框”。
   *     如果“对话框”已经打开，则调用本方法无效。
   *     返回值：
   *       {Element} 本元素。
   *   close
   *     关闭“对话框”。
   *     如果“对话框”已经关闭，则调用本方法无效。
   *     返回值：
   *       {Element} 本元素。
   *   reposition
   *     调整“对话框”的位置。
   *     如果“对话框”已经关闭，则调用本方法无效。
   *     返回值：
   *       {Element} 本元素。
   * @新增事件
   *   open
   *     成功调用 open 方法后触发。
   *   close
   *     成功调用 close 方法后触发。
   *   reposition
   *     成功调用 reposition 方法后触发。
   */

  Widget.register({
    type: 'dialog',
    selector: 'div.widget-dialog',
    styleRules: [
      'div.widget-dialog { display: none; outline: none; }'
    ],
    config: {
      pinnedTarget: '',
      left: NaN,
      right: NaN,
      top: NaN,
      bottom: NaN,
      animation: 'none'
    },
    methods: {
      open: function() {
        var $dialog = this;
        if (!$dialog.isOpen) {
          var open = function() {
            var $context = $dialog.context;
            // 更新状态。
            $dialog.isOpen = true;
            // 添加到已打开的“对话框”组，并修改“对话框”的位置。
            $dialog.setStyle('zIndex', 500000 + $context.dialogs.push($dialog)).reposition();
            // 重新定位“遮盖层”。
            $context.overlay.reposition();
            // 仅父元素为 BODY 的“对话框”需要在改变窗口尺寸时重新调整位置（此处假定其他“对话框”的父元素尺寸不会变化）。
            if ($context === document.body) {
              window.on('resize:throttle(100).dialog_' + $dialog.uid, navigator.isIE6 ? function() {
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
          };
          if ($dialog.animation === 'none') {
            $dialog.setStyle('display', 'block');
            open();
          } else {
            $dialog.fade('in', {
              duration: 100,
              timingFunction: 'easeOut',
              onStart: open
            });
            if ($dialog.animation === 'slide') {
              $dialog.setStyle('marginTop', -20).morph({marginTop: 0}, {duration: 100, timingFunction: 'easeOut'});
            }
          }
        }
        return $dialog;
      },
      close: function() {
        var $dialog = this;
        if ($dialog.isOpen) {
          var close = function() {
            var $context = $dialog.context;
            // 更新状态。
            $dialog.isOpen = false;
            // 从已打开的“对话框”组中移除。
            $context.dialogs.pop();
            // 重新定位“遮盖层”。
            $context.overlay.reposition();
            // 删除事件监听器。
            if ($context === document.body) {
              window.off('resize:throttle(100).dialog_' + $dialog.uid);
            }
            // 触发事件。
            $dialog.fire('close');
          };
          if ($dialog.animation === 'none') {
            $dialog.setStyle('display', 'none');
            close();
          } else {
            $dialog.fade('out', {
              duration: $dialog.animation === 'none' ? 0 : 100,
              timingFunction: 'easeIn',
              onFinish: close
            });
            if ($dialog.animation === 'slide') {
              $dialog.morph({marginTop: -20}, {
                duration: 100,
                timingFunction: 'easeIn',
                onFinish: function() {
                  $dialog.setStyle('marginTop', 0)
                }
              });
            }
          }
        }
        return $dialog;
      },
      reposition: function() {
        if (this.isOpen) {
          // 获取当前位置。
          var dialogClientRect = this.getClientRect();
          var currentX = dialogClientRect.left;
          var currentY = dialogClientRect.top;
          var currentWidth = dialogClientRect.width;
          var currentHeight = dialogClientRect.height;
          // 计算预期位置。
          var expectedX;
          var expectedY;
          var pinnedTargetClientRect = {};
          if (this.isFixedPositioned) {
            var viewportClientSize = window.getClientSize();
            pinnedTargetClientRect.left = 0;
            pinnedTargetClientRect.top = 0;
            pinnedTargetClientRect.width = viewportClientSize.width;
            pinnedTargetClientRect.height = viewportClientSize.height;
          } else {
            pinnedTargetClientRect = this.pinnedTarget.getClientRect();
          }
          expectedX = Math.round(pinnedTargetClientRect.left + (Number.isFinite(this.left) ? this.left : (Number.isFinite(this.right) ? pinnedTargetClientRect.width - currentWidth - this.right : (pinnedTargetClientRect.width - currentWidth) / 2)));
          expectedY = Math.round(pinnedTargetClientRect.top + (Number.isFinite(this.top) ? this.top : (Number.isFinite(this.bottom) ? pinnedTargetClientRect.height - currentHeight - this.bottom : (pinnedTargetClientRect.height - currentHeight) / 2)));
          // 确保固定定位的“对话框”显示在视口内。
          if (this.isFixedPositioned) {
            var leftLimit = 0;
            var rightLimit = leftLimit + pinnedTargetClientRect.width;
            var topLimit = 0;
            var bottomLimit = topLimit + pinnedTargetClientRect.height;
            // 当视口尺寸不足以容纳“对话框”时，优先显示右上角（“对话框”的关闭按钮一般在右上角）。
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
          this.setStyles({left: parseInt(this.getStyle('left'), 10) + expectedX - currentX, top: parseInt(this.getStyle('top'), 10) + expectedY - currentY});
          // 触发事件。
          this.fire('reposition');
        }
        return this;
      }
    },
    initialize: function() {
      var $dialog = this;

      // 保存属性。
      var $context = $dialog.context = $dialog.getParent();
      // pinnedTarget 必须是 context 的后代元素。
      var $pinnedTarget;
      $dialog.pinnedTarget = ($dialog.pinnedTarget && ($pinnedTarget = document.$('#' + $dialog.pinnedTarget)) && ($context.contains($pinnedTarget) && $pinnedTarget !== $dialog)) ? $pinnedTarget : $context;
      // IE6 不使用动画。
      if (navigator.isIE6) {
        $dialog.animation = 'none';
      }
      // 当 pinnedTarget 为 BODY 时使用固定定位。
      $dialog.isFixedPositioned = $dialog.pinnedTarget === document.body;
      // 默认状态为关闭。
      $dialog.isOpen = false;

      // 本“对话框”是 $context 中的第一个“对话框”。
      if (!$context.dialogs) {
        // 确保 $context 创建 stacking context。
        if ($context !== document.body && $context.getStyle('position') === 'static') {
          $context.setStyle('position', 'relative');
        }
        // 为 $context 添加“遮盖层”和“对话框”公用的属性。
        $context.dialogs = [];
        Widget.parse($context.overlay = document.$('<div class="widget-overlay"></div>').insertTo($context));
      }

      // 使本元素可获得焦点。
      $dialog.tabIndex = 0;
      if (navigator.isIElt8) {
        $dialog.hideFocus = true;
      }

      // 设置样式。
      // 调节“对话框”的位置是通过本元素的 left 和 top 进行的，需要以像素为单位，因此先为其指定一个值，以便稍后计算位置。
      // 从 500000 开始重置本元素的 zIndex，以供“遮盖层”参照（如果数字过大 Firefox 12.0 在取值时会有问题）。
      $dialog.setStyles({position: $dialog.isFixedPositioned ? 'fixed' : 'absolute', left: 0, top: 0});

      // 通过点击“关闭按钮”来关闭“对话框”。
      $dialog.on('click:relay(.close).dialog', function(e) {
        $dialog.close();
        e.preventDefault();
      });

    }
  });

})();

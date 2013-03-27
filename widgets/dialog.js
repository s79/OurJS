/**
 * @fileOverview Widget - 模态对话框
 * @author sundongguo@gmail.com
 * @version 20121018
 */

(function() {
//==================================================[Widget - 遮盖层]
//--------------------------------------------------[Overlay]
  /**
   * 遮盖层
   * @name Overlay
   * @constructor
   * @private
   * @description
   *   为元素添加 'widget-overlay' 类，即可使该元素成为遮盖层。
   *   遮盖层用于遮盖模态对话框下边、其父元素内的其他内容。当其父元素为 BODY 时，将覆盖整个视口。
   *   遮盖层在显示/隐藏时是否使用动画取决于调用它的对话框是否启用了动画。
   *   需要定义其他的样式时，可以通过 CSS 进行修改，或者直接修改遮盖层元素的 style 属性。
   *   问题：
   *     IE6 下当 HTML 元素设置了非正常的背景图片（找不到图片或 about:blank）时，IFRAME 无法一直遮盖 SELECT 元素，窗口滚动后 SELECT 即再次显示在最前，但若此时 position: fixed 的表达式启用则无此问题。
   *     这个问题会在页面有设置了 "display: none; position: fixed;" 的元素，且欲覆盖区域不是 BODY，但其中有 SELECT 元素时出现。
   *     上述情况很少见，因此未处理此问题。
   *     如果需要处理，去掉 IE6 fixed positioned 相关代码中的“启用/禁用表达式”部分即可。
   * @see http://w3help.org/zh-cn/causes/RM8015
   */

  /**
   * 重新定位遮盖层的层级，如果当前 context 下不再有其他对话框，则隐藏遮盖层。
   * @name TabPanel#reposition
   * @function
   * @private
   * @returns {Element} 本元素。
   */

  /**
   * 调整遮盖层尺寸。
   * @name TabPanel#resize
   * @function
   * @private
   * @returns {Element} 本元素。
   */

  Widget.register('overlay', {
    css: [
      '.widget-overlay { display: none; left: 0; top: 0; outline: none; background-color: black; opacity: 0.2; filter: alpha(opacity=20); }'
    ],
    methods: {
      reposition: function() {
        var $dialog = this.context.dialogs.getLast();
        if ($dialog) {
          this.setStyle('zIndex', $dialog.getStyle('zIndex') - 1);
          $dialog.focus();
          if (!this.isVisible) {
            // 显示遮盖层。
            if (this.resizeInIE6) {
              window.attachEvent('onresize', this.resizeInIE6);
            }
            this.fade('in', {duration: 100, timingFunction: 'easeOut'});
            this.isVisible = true;
            this.resize();
            // 锁定可交互区域。
            this.context.on('focusin.freezeInteractionArea', function(event) {
              var $activeDialog = this.dialogs.getLast();
              if (!$activeDialog.contains(event.target) && $activeDialog.offsetWidth) {
                $activeDialog.focus();
              }
            });
          }
        } else {
          if (this.isVisible) {
            // 隐藏遮盖层。
            if (this.resizeInIE6) {
              window.detachEvent('onresize', this.resizeInIE6);
            }
            this.fade('out', {duration: 100, timingFunction: 'easeIn'});
            this.isVisible = false;
            // 解锁可交互区域。
            this.context.off('focusin.freezeInteractionArea');
          }
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
        // IE6 BODY 的遮盖层在更改视口尺寸时需要调整尺寸。
        if (contextIsBody) {
          $overlay.resizeInIE6 = function() {
            $overlay.resize();
          };
        }
      }

      // 使本元素可获得焦点。
      $overlay.tabIndex = 0;
      if (navigator.isIElt8) {
        $overlay.hideFocus = true;
      }

    }
  });

})();

(function() {
//==================================================[Widget - 模态对话框]
//--------------------------------------------------[Dialog]
  /**
   * 模态对话框。
   * @name Dialog
   * @constructor
   * @attribute data-pinned-target
   *   对话框的“定位参考元素”的 id。
   *   如果不指定本属性，则以父元素作为“定位参考元素”。
   *   “定位参考元素”只能是对话框的父元素或其父元素的后代元素，且不能是对话框自身。
   * @attribute data-left
   *   对话框的左边与其“定位参考元素”的左边的横向差值，单位为像素。
   * @attribute data-right
   *   对话框的右边与其“定位参考元素”的右边的横向差值，单位为像素。
   *   如果已指定 data-left， 本属性将被忽略。
   *   如果 data-left 和本属性均未指定，对话框的中心点在横向将与其“定位参考元素”的中心点重合。
   * @attribute data-top
   *   对话框的顶边与其“定位参考元素”的顶边的纵向差值，单位为像素。
   * @attribute data-bottom
   *   对话框的底边与其“定位参考元素”的底边的纵向差值，单位为像素。
   *   如果已指定 data-top， 本属性将被忽略。
   *   如果 data-top 和本属性均未指定，对话框的中心点在纵向将与其“定位参考元素”的中心点重合。
   * @attribute data-animation
   *   打开和关闭对话框时使用的动画效果，可选项有 'none'，'fade' 和 'slide'。
   *   如果不指定本属性或指定为 'none'，则关闭动画效果。
   *   IE6 本属性无效，始终关闭动画效果。
   * @fires open
   *   在对话框打开时触发。
   * @fires close
   *   在对话框关闭后触发。
   * @fires reposition
   *   成功调用 reposition 方法后触发。
   * @description
   *   模态对话框可以突出显示一部分内容并遮盖其余内容，强迫用户优先对突出显示的部分进行操作。
   *   <strong>启用方式：</strong>
   *   为元素添加 'widget-dialog' 类，即可使该元素成为模态对话框。
   *   <strong>结构约定：</strong>
   *   对话框的默认状态为关闭。因此对话框元素的 display 将被设置为 'none'。
   *   当对话框元素的“定位参考元素”为 BODY 时，其 position 将被设置为 'fixed'，其余情况均会被设置为 'absolute'。
   *   对话框元素的 z-index 值会被自动指定。
   *   如果对话框元素的父元素不是 BODY 且其 position 为 'static'，将修改其 position 为 'relative'，以使其创建 stacking context。
   *   如果对话框元素的父元素不是 BODY，应避免其父元素出现滚动条，以免对话框和遮盖层能随其内容滚动。
   *   对话框的一些数据保存在其父元素中，因此不要修改对话框元素在文档树中的位置！
   *   <strong>新增行为：</strong>
   *   当对话框打开时，将自动生成一个遮盖层，遮盖层遮盖的范围为对话框父元素的渲染范围。被遮盖的部分将无法使用键盘或鼠标进行操作。<br>“模态”对话框的遮盖层是一定会出现的，不能将其屏蔽。当前打开的对话框会在遮盖层上方显示。
   *   当对话框打开时，会根据其“定位参考元素”来确定其显示的位置。
   *   当多个对话框有相同的父元素时，则视这些对话框为一组，一组对话框可以重叠显示。<br>当一组对话框重叠显示时，遮盖层只有一个，只有最后打开的对话框才不会被遮盖。
   *   <strong>默认样式：</strong>
   *   <pre class="lang-css">
   *   .widget-overlay { display: none; left: 0; top: 0; background-color: black; opacity: 0.2; filter: alpha(opacity=20); }
   *   .widget-dialog { display: none; outline: none; }
   *   </pre>
   * @example
   *   &lt;div id="notice" class="widget-dialog" data-top="100" onopen="alert('open');"&gt;...&lt;/div&gt;
   */

  /**
   * 对话框当前是否为“打开”状态。
   * @name Dialog#isOpen
   * @type boolean
   */

  /**
   * 打开对话框。
   * @name Dialog#open
   * @function
   * @returns {Element} 本元素。
   * @description
   *   如果对话框已经打开，则调用此方法无效。
   */

  /**
   * 关闭对话框。
   * @name Dialog#close
   * @function
   * @returns {Element} 本元素。
   * @description
   *   如果对话框已经关闭，则调用此方法无效。
   */

  /**
   * 调整对话框的位置。
   * @name Dialog#reposition
   * @function
   * @returns {Element} 本元素。
   * @description
   *   如果对话框已经关闭，则调用此方法无效。
   */

  Widget.register('dialog', {
    css: [
      '.widget-dialog { display: none; outline: none; }'
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
          $dialog.fade('in', {
            duration: $dialog.animation === 'none' ? 0 : 100,
            timingFunction: 'easeOut',
            onStart: function() {
              var $context = $dialog.context;
              // 更新状态。
              $dialog.isOpen = true;
              // 添加到已打开的对话框组，并修改对话框的位置。
              $dialog.setStyle('zIndex', 500000 + $context.dialogs.push($dialog)).reposition();
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
          if ($dialog.animation === 'slide') {
            $dialog.setStyle('marginTop', -20).morph({marginTop: 0}, {duration: 100, timingFunction: 'easeOut'});
          }
        }
        return $dialog;
      },
      close: function() {
        var $dialog = this;
        if ($dialog.isOpen) {
          $dialog.fade('out', {
            duration: $dialog.animation === 'none' ? 0 : 100,
            timingFunction: 'easeIn',
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
          if ($dialog.animation === 'slide') {
            $dialog.morph({marginTop: -20}, {
              duration: 100,
              timingFunction: 'easeIn',
              onFinish: function() {
                this.setStyle('marginTop', 0)
              }
            });
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
          // 确保固定定位的对话框显示在视口内。
          if (this.isFixedPositioned) {
            var leftLimit = 0;
            var rightLimit = leftLimit + pinnedTargetClientRect.width;
            var topLimit = 0;
            var bottomLimit = topLimit + pinnedTargetClientRect.height;
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
          this.setStyles({left: parseInt(this.getStyle('left'), 10) + expectedX - currentX, top: parseInt(this.getStyle('top'), 10) + expectedY - currentY});
          // 触发事件。
          this.fire('reposition');
        }
        return this;
      }
    },
    events: ['open', 'close', 'reposition'],
    initialize: function() {
      // 保存属性。
      var $context = this.context = this.getParent();
      // pinnedTarget 必须是 context 的后代元素。
      var $pinnedTarget;
      this.pinnedTarget = (this.pinnedTarget && ($pinnedTarget = document.$('#' + this.pinnedTarget)) && ($context.contains($pinnedTarget) && $pinnedTarget !== this)) ? $pinnedTarget : $context;
      // IE6 不使用动画。
      if (navigator.isIE6) {
        this.animation = 'none';
      }
      // 当 pinnedTarget 为 BODY 时使用固定定位。
      this.isFixedPositioned = this.pinnedTarget === document.body;
      // 默认状态为关闭。
      this.isOpen = false;

      // 本对话框是 $context 中的第一个对话框。
      if (!$context.dialogs) {
        // 确保 $context 创建 stacking context。
        if ($context !== document.body && $context.getStyle('position') === 'static') {
          $context.setStyle('position', 'relative');
        }
        // 为 $context 添加遮盖层和对话框公用的属性。
        $context.dialogs = [];
        Widget.parse($context.overlay = document.$('<div class="widget-overlay"></div>').insertTo($context));
      }

      // 使本元素可获得焦点。
      this.tabIndex = 0;
      if (navigator.isIElt8) {
        this.hideFocus = true;
      }

      // 设置样式。
      // 调节对话框的位置是通过 this 的 left 和 top 进行的，需要以像素为单位，因此先为其指定一个值，以便稍后计算位置。
      // 从 500000 开始重置 this 的 zIndex，以供遮盖层参照（如果数字过大 Firefox 12.0 在取值时会有问题）。
      this.setStyles({position: this.isFixedPositioned ? 'fixed' : 'absolute', left: 0, top: 0});

    }
  });

})();

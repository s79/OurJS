/**
 * @fileOverview Widget - 照片墙
 * @author sundongguo@gmail.com
 * @version 20131122
 */

(function() {
//==================================================[Widget - 照片墙]
//--------------------------------------------------[Photowall]
  /**
   * “照片墙”用于横向展示一组照片，并可以自动或手动滚动，也可以通过启用“活动照片”功能与页面中的其他组件联动。
   * @启用方式
   *   为一个 DIV 元素添加 'widget-photowall' 类，即可使该元素成为“照片墙”。
   * @结构约定
   *   <div class="widget-photowall">
   *     <div class="container">
   *       <ul class="wall">
   *         <li class="photo ">..</li>
   *         <li class="photo ">..</li>
   *         <li class="photo ">..</li>
   *       </ul>
   *     </div>
   *     <div>
   *       <a href="javascript:void('backward');" class="backward">...</a>
   *       <a href="javascript:void('forward');" class="forward">...</a>
   *     </div>
   *   </div>
   * * “照片墙”的后代元素中，类名包含 'container' 的为“照片”的滚动框，类名包含 'wall' 的为“照片”的容器，类名包含 'photo' 的为“照片”，类名包含 'backward' 的为“向左滚动”按钮，类名包含 'forward' 的为“向右滚动”按钮。
   * * 所有“照片”的宽度可以不同，但高度必须一致。
   * @默认样式
   *   div.widget-photowall, div.widget-photowall .container, div.widget-photowall .items { display: block; position: relative; overflow: hidden; }
   *   div.widget-photowall .item { float: left; }
   * @可配置项
   *   data-item-spacing
   *     各“照片”之间的纵向间距，单位为像素。
   *     如果不指定本属性，则使用 '0'。
   *   data-active-index
   *     “活动照片”的索引，索引从 0 开始。如果指定，则需要确保“照片”的滚动框中至少能完全显示两张照片(只需要显示一张照片时应使用“幻灯片”来实现）。
   *   data-interval
   *     以毫秒为单位的自动播放间隔时间。
   *     如果不指定本属性，则自动轮播功能将被关闭。
   *   data-duration
   *     每次滚动使用的时间，单位为毫秒。
   *     如果不指定本属性，则使用 '400'。
   *   data-timing-function
   *     控速函数名称或表达式，详情请参考 animation.addClip 的 timingFunction 参数。
   *     如果不指定本属性，则使用 'ease'。
   * @新增行为
   * * “照片墙”可以横向滚动，以显示不同的照片。
   * * 如果指定了“活动照片”，则同一时刻只有一张“照片”是活动的，“活动照片”会被添加 'active' 类。
   * * 如果指定了 data-interval，则：
   *   如果没有指定“活动照片”，则“照片墙”每隔设定的时间后会自动横向滚动，即向左滑动隐藏一个“照片”，同时右侧会滑出新的“照片”。当右侧没有更多的照片可显示时，会滚动到最左侧。
   *   如果指定了“活动照片”，则每隔设定的时间后，“活动照片”会被切换到下一张，为确保“活动照片”永远可见，“照片墙”可能会进行横向滚动。当右侧没有更多的照片可显示时，会将“活动照片”设置为第一张。
   *   当鼠标移入本元素时，自动播放会被暂时禁用；当鼠标移出本元素时，自动播放会被重新启用。
   * * 如果有“向左滚动”和“向右滚动”按钮，则：
   *   如果没有指定“活动照片”，通过按下这些按钮即可使“照片墙”向左和向右滚动。
   *   如果指定了“活动照片”，，通过按下这些按钮即可切换“活动照片”，为确保“活动照片”永远可见，“照片墙”可能会进行横向滚动。
   *   如果“照片墙”已经滚动到最左侧，则“照片墙”会被添加 'first' 类，“向左滚动”会被添加 'disabled' 类，并且点击此按钮无效。
   *   如果“照片墙”已经滚动到最右侧，则“照片墙”会被添加 'last' 类，“向右滚动”会被添加 'disabled' 类，并且点击此按钮无效。
   * @新增属性
   *   {Array} photos 包含所有“照片”的数组。
   *   {Number} before 当前位于“照片墙”左侧的不可见“照片”数。
   *   {Number} after 当前位于“照片墙”右侧的不可见“照片”数。
   * @新增方法
   *   backward
   *     将“照片墙”向左滚动一个“照片”。
   *     返回值：
   *       {Element} 本元素。
   *   forward
   *     将“照片墙”向右滚动一个“照片”。
   *     返回值：
   *       {Element} 本元素。
   * @新增事件
   *   backwardstart
   *     调用 backward 方法后，滚动开始时触发。
   *   backwardfinish
   *     调用 backward 方法后，滚动结束时触发。
   *   forwardstart
   *     调用 forward 方法后，滚动开始时触发。
   *   forwardfinish
   *     调用 forward 方法后，滚动结束时触发。
   */

  Widget.register({
    type: 'photowall',
    selector: 'div.widget-photowall',
    styleRules: [
      'div.widget-photowall .container { display: block; position: relative; overflow: hidden; }',
      'div.widget-photowall .wall { display: block; position: relative; }',
      'div.widget-photowall .photo { float: left; }'
    ],
    config: {
      itemSpacing: 0,
      activeIndex: NaN,
      interval: NaN,
      duration: 400,
      timingFunction: 'ease'
    },
    methods: {
      backward: function() {
        var $photowall = this;
        if ($photowall.before) {
          $photowall.wall.morph({left: '+=' + ($photowall.container.getClientRect().left - $photowall.photos[--$photowall.before].getClientRect().left)}, {
            duration: $photowall.duration,
            timingFunction: $photowall.timingFunction,
            onStart: function() {
              ++$photowall.after;
              $photowall.fire('backwardstart');
            },
            onFinish: function() {
              $photowall.fire('backwardfinish');
            }
          });
        }
        return $photowall;
      },
      forward: function() {
        var $photowall = this;
        var photos = $photowall.photos;
        if ($photowall.after) {
          $photowall.wall.morph({left: '-=' + (photos[photos.length - (--$photowall.after) - 1].getClientRect().right - $photowall.container.getClientRect().right)}, {
            duration: $photowall.duration,
            timingFunction: $photowall.timingFunction,
            onStart: function() {
              ++$photowall.before;
              $photowall.fire('forwardstart');
            },
            onFinish: function() {
              $photowall.fire('forwardfinish');
            }
          });
        }
        return $photowall;
      }
    },
    initialize: function() {
      var $photowall = this;
      var $backward = $photowall.find('.backward');
      var $forward = $photowall.find('.forward');

      // 保存属性。
      var $wall = $photowall.find('.wall');
      var $container = $photowall.find('.container');
      var photos = $photowall.findAll('.photo');
      Object.mixin($photowall, {
        container: $container,
        wall: $wall,
        photos: photos,
        before: 0,
        after: 0
      });

      // 确定“照片”的滚动框的渲染位置。
      var containerRect = $container.getClientRect();
      var containerLeft = containerRect.left;
      var containerRight = containerRect.right;

      // 设置“墙”的宽度。
      var width = 0;
      var itemSpacing = $photowall.itemSpacing;
      photos.forEach(function($photo, index) {
        var marginLeft = index ? itemSpacing : 0;
        $photo.setStyle('marginLeft', marginLeft);
        width += $photo.offsetWidth + marginLeft;
      });
      $wall.setStyle('width', width);

      // 如果设置了“活动照片”，使其保持可视。
      var $active = null;
      if (!isNaN($photowall.activeIndex)) {
        $photowall.activeIndex = Math.limit($photowall.activeIndex, 0, photos.length - 1);
        var difference = (photos[$photowall.activeIndex + 1] || photos[$photowall.activeIndex]).getClientRect().right - containerRight;
        if (difference > 0) {
          $wall.setStyle('left', -difference);
        }
      }

      // 计算当前未显示完全的“照片”数目。
      photos.some(function($photo, index) {
        if ($photo.getClientRect().left >= containerLeft) {
          $photowall.before = index;
          return true;
        } else {
          return false;
        }
      });
      photos.some(function($photo, index) {
        if ($photo.getClientRect().right <= containerRight) {
          return false;
        } else {
          $photowall.after = Math.max(photos.length - index, 0);
          return true;
        }
      });

      // 处理两种模式的不同行为。
      var autoPlayTimer;
      if (isNaN($photowall.activeIndex)) {
        // 没有“活动照片”的情况，通过点击“向左滚动”和“向右滚动”按钮滚动“照片墙”。
        $photowall
            .on('click:relay(.backward).photowall', function() {
              $photowall.backward();
            })
            .on('click:relay(.forward).photowall', function() {
              $photowall.forward();
            });

        // 自动显示下一个条目。
        if (!isNaN($photowall.interval)) {
          $photowall
              .on('mouseenter.photowall', function() {
                if (autoPlayTimer) {
                  clearInterval(autoPlayTimer);
                  autoPlayTimer = undefined;
                }
              })
              .on('mouseleave.photowall', function() {
                if (!autoPlayTimer) {
                  autoPlayTimer = setInterval(function() {
                    if ($photowall.after) {
                      $photowall.forward();
                    } else {
                      while ($photowall.before) {
                        $photowall.backward();
                      }
                    }
                  }, $photowall.interval);
                }
              })
              .fire('mouseleave');
        }

        // 在首尾部禁用“向左滚动”和“向右滚动”按钮。
        $photowall
            .on('forwardstart.photowall, backwardstart.photowall', function() {
              if ($backward) {
                if (this.before === 0) {
                  $photowall.addClass('first');
                  $backward.addClass('disabled');
                } else if (this.before === 1) {
                  $photowall.removeClass('first');
                  $backward.removeClass('disabled');
                }
              }
              if ($forward) {
                if (this.after === 0) {
                  $photowall.addClass('last');
                  $forward.addClass('disabled');
                } else if (this.after === 1) {
                  $photowall.removeClass('last');
                  $forward.removeClass('disabled');
                }
              }
            })
            .fire('backwardstart');

      } else {
        // 有“活动照片”的情况，通过点击非活动的“照片”来切换“活动照片”。
        $photowall.on('click:relay(.photo)', function() {
          if (this !== $active) {
            var activeIndex = $photowall.activeIndex = photos.indexOf(this);
            $photowall.fire('activate', { inactivePhoto: $active && $active.removeClass('active'), activePhoto: $active = this.addClass('active') });

            if (activeIndex - $photowall.before <= 0) {
              do {
                $photowall.backward();
              } while (activeIndex - $photowall.before < 0);
            } else if (photos.length - 1 - activeIndex - $photowall.after <= 0) {
              do {
                $photowall.forward();
              } while (photos.length - 1 - activeIndex - $photowall.after < 0);
            }
          }
        });

        // 通过点击“向左滚动”和“向右滚动”按钮切换“活动照片”。
        $photowall
            .on('click:relay(.backward).photowall', function() {
              if ($photowall.activeIndex > 0) {
                photos[--$photowall.activeIndex].fire('click');
              }
            })
            .on('click:relay(.forward).photowall', function() {
              if ($photowall.activeIndex < photos.length - 1) {
                photos[++$photowall.activeIndex].fire('click');
              }
            });

        // 自动切换“活动照片”。
        if (!isNaN($photowall.interval)) {
          $photowall
              .on('mouseenter.photowall', function() {
                if (autoPlayTimer) {
                  clearInterval(autoPlayTimer);
                  autoPlayTimer = undefined;
                }
              })
              .on('mouseleave.photowall', function() {
                if (!autoPlayTimer) {
                  autoPlayTimer = setInterval(function() {
                    (photos[$photowall.activeIndex + 1] || photos[0]).fire('click');
                  }, $photowall.interval);
                }
              })
              .fire('mouseleave');
        }

        // 在首尾部禁用“向左滚动”和“向右滚动”按钮。
        $photowall
            .on('activate.photowall', function() {
              var activeIndex = $photowall.activeIndex;
              if ($backward) {
                if (activeIndex === 0) {
                  $photowall.addClass('first');
                  $backward.addClass('disabled');
                } else {
                  $photowall.removeClass('first');
                  $backward.removeClass('disabled');
                }
              }
              if ($forward) {
                if (activeIndex === photos.length - 1) {
                  $photowall.addClass('last');
                  $forward.addClass('disabled');
                } else {
                  $photowall.removeClass('last');
                  $forward.removeClass('disabled');
                }
              }
            });

        // 让指定的照片称为“活动照片”。
        document.on('afterdomready:once.photowall', function() {
          photos[$photowall.activeIndex].fire('click');
        });

      }

    }
  });

})();

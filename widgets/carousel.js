/**
 * @fileOverview Widget - 无缝轮播器
 * @author sundongguo@gmail.com
 * @version 20130514
 */

(function() {
//==================================================[Widget - 无缝轮播器]
//--------------------------------------------------[Carousel]
  /**
   * “无缝轮播器”可以无缝的自动轮播多个“条目”的内容（这种无缝轮播也叫做旋转木马）。
   * @启用方式
   *   为一个 DIV 元素添加 'widget-carousel' 类，即可使该元素成为“无缝轮播器”。
   * @结构约定
   *   <div class="widget-carousel">
   *     <div class="container">
   *       <ul class="items">
   *         <li class="item">..</li>
   *         <li class="item">..</li>
   *         <li class="item">..</li>
   *       </ul>
   *     </div>
   *     <div>
   *       <a href="javascript:void('backward');" class="backward">...</a>
   *       <a href="javascript:void('forward');" class="forward">...</a>
   *     </div>
   *   </div>
   * * “无缝轮播器”的后代元素中，类名包含 'container' 的为“条目”的滚动框，类名包含 'items' 的为“条目”的容器，类名包含 'item' 的为“条目”，类名包含 'backward' 的为“向左滚动”按钮，类名包含 'forward' 的为“向右滚动”按钮。
   * * 所有“条目”的宽度可以不同，但高度必须一致。
   * @默认样式
   *   div.widget-carousel, div.widget-carousel .container, div.widget-carousel .items { display: block; position: relative; overflow: hidden; }
   *   div.widget-carousel .item { float: left; }
   * @可配置项
   *   data-item-spacing
   *     各“条目”之间的纵向间距，单位为像素。
   *     如果不指定本属性，则使用 '0'。
   *   data-interval
   *     以毫秒为单位的自动轮播间隔时间。
   *     如果不指定本属性，则使用 '3000'，即每 3 秒滚动一次。
   *   data-duration
   *     每次滚动使用的时间，单位为毫秒。
   *     如果不指定本属性，则使用 '400'。
   *   data-timing-function
   *     控速函数名称或表达式，详情请参考 animation.addClip 的 timingFunction 参数。
   *     如果不指定本属性，则使用 'ease'。
   * @新增行为
   * * “条目”是首尾相连显示的，即最后一个“条目”的右侧是第一个“条目”。
   * * “无缝轮播器”每隔一定的时间后（取决于 data-interval 的设定值），会自动轮播各“条目”，即向左滑动隐藏一个“条目”，同时右侧会滑出新的“条目”。
   * * 当鼠标移入本元素时，自动轮播会被暂时禁用；当鼠标移出本元素时，自动轮播会被重新启用。
   * * 如果有“向左滚动”和“向右滚动”按钮，则通过按下这些按钮即可使“无缝轮播器”向左和向右滚动，此时如果按下按钮不放，则在第一次滚动后，会以 2 倍速连续的向此方向滚动。
   * @新增属性
   *   {Element} container “条目”的滚动框。
   *   {Element} items “条目”的容器。
   * @新增方法
   *   backward
   *     向左滚动一个“条目”。
   *     返回值：
   *       {Element} 本元素。
   *   forward
   *     向右滚动一个“条目”。
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
    type: 'carousel',
    selector: 'div.widget-carousel',
    styleRules: [
      'div.widget-carousel, div.widget-carousel .container, div.widget-carousel .items { display: block; position: relative; overflow: hidden; }',
      'div.widget-carousel .item { float: left; }'
    ],
    config: {
      itemSpacing: 0,
      interval: 3000,
      duration: 400,
      timingFunction: 'ease'
    },
    methods: {
      backward: function(rate) {
        var $carousel = this;
        if (!$carousel.forzen) {
          var $items = $carousel.items;
          var $item = $items.getLastChild();
          $item.insertTo($items, 'afterbegin');
          $items.setStyle('left', -$item.offsetWidth - $carousel.itemSpacing);
          $items.morph({left: 0}, {
            duration: $carousel.duration / (rate || 1),
            timingFunction: $carousel.timingFunction,
            onStart: function() {
              $carousel.forzen = true;
              $carousel.fire('backwardstart');
            },
            onFinish: function() {
              $carousel.forzen = false;
              $carousel.fire('backwardfinish');
            }
          });
        }
        return $carousel;
      },
      forward: function(rate) {
        var $carousel = this;
        if (!$carousel.forzen) {
          var $items = $carousel.items;
          var $item = $items.getFirstChild();
          $items.morph({left: -$item.offsetWidth - $carousel.itemSpacing}, {
            duration: $carousel.duration / (rate || 1),
            timingFunction: $carousel.timingFunction,
            onStart: function() {
              $carousel.forzen = true;
              $carousel.fire('forwardstart');
            },
            onFinish: function() {
              $carousel.forzen = false;
              $item.insertTo($items);
              $items.setStyle('left', 0);
              $carousel.fire('forwardfinish');
            }
          });
        }
        return $carousel;
      }
    },
    initialize: function() {
      var $carousel = this;

      // 保存属性。
      var $items = $carousel.find('.items');
      Object.mixin($carousel, {
        forzen: false,
        container: $carousel.find('.container'),
        items: $items
      });

      // 设置各“条目”及其容器的初始位置。
      var itemSpacing = $carousel.itemSpacing;
      var containerWidth = 0;
      $items.getChildren().forEach(function($item) {
        $item.setStyle('marginRight', itemSpacing);
        containerWidth += $item.offsetWidth + itemSpacing;
      });
      $items.setStyle('width', containerWidth);

      // 通过点击“向左滚动”和“向右滚动”按钮滚动“条目”。
      var backwardIsHolding = false;
      var forwardIsHolding = false;
      $carousel
          .on('mousedown:relay(.backward).carousel', function() {
            backwardIsHolding = true;
            $carousel.backward();
          })
          .on('mousedown:relay(.forward).carousel', function() {
            forwardIsHolding = true;
            $carousel.forward();
          })
          .on('mouseup:relay(.backward).carousel, mouseleave:relay(.backward).carousel', function() {
            backwardIsHolding = false;
          })
          .on('mouseup:relay(.forward).carousel, mouseleave:relay(.forward).carousel', function() {
            forwardIsHolding = false;
          })
          .on('backwardfinish.carousel', function() {
            if (backwardIsHolding) {
              $carousel.backward(2);
            }
          })
          .on('forwardfinish.carousel', function() {
            if (forwardIsHolding) {
              $carousel.forward(2);
            }
          });

      // 自动显示下一个条目。
      var autoPlayTimer;
      $carousel
          .on('mouseenter.carousel', function() {
            if (autoPlayTimer) {
              clearInterval(autoPlayTimer);
              autoPlayTimer = undefined;
            }
          })
          .on('mouseleave.carousel', function() {
            if (!autoPlayTimer) {
              autoPlayTimer = setInterval(function() {
                $carousel.forward();
              }, $carousel.interval);
            }
          })
          .fire('mouseleave');

    }
  });

})();

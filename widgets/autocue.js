/**
 * @fileOverview Widget - 自动提词机
 * @author sundongguo@gmail.com
 * @version 20120905
 */

(function() {
//==================================================[Widget - 自动提词机]
//--------------------------------------------------[showNextMessage]
  var showNextMessage = function($autocue) {
    // 提取。
    var messages = $autocue.messages;
    var message = messages[messages.currentIndex] || '';
    if (messages.length > $autocue.cacheSize) {
      messages.shift();
    } else {
      if (++messages.currentIndex >= messages.length) {
        messages.currentIndex = 0;
      }
    }
    // 展示。
    var $viewport = $autocue.viewport;
    var $message = $('<li>' + message + '</li>');
    var visibleItems = $autocue.visibleItems;
    var count = $viewport.getChildCount();
    if ($autocue.direction === 'down') {
      $message.insertTo($viewport, 'afterBegin');
      if (count >= visibleItems) {
        $viewport.setStyle('top', -$message.offsetHeight);
        $viewport.morph({top: 0}, {
          onFinish: function() {
            $viewport.getLastChild().remove();
          }
        });
      }
    } else {
      $message.insertTo($viewport);
      if (count >= visibleItems) {
        $viewport.morph({top: '-=' + $viewport.getFirstChild().offsetHeight}, {
          onFinish: function() {
            $viewport.getFirstChild().remove();
            $viewport.setStyle('top', 0);
          }
        });
      }
    }
  };

//--------------------------------------------------[Autocue]
  /**
   * “自动提词机”会以滚动字幕的形式展示“信息队列”中的信息。
   * @name Autocue
   * @constructor
   * @fires addmessages
   *   调用 addMessages 方法后触发。
   * @description 启用方式
   *   为一个 DIV 元素添加 'widget-autocue' 类，即可使该元素成为“自动提词机”。
   * @description 结构约定
   *   当“自动提词机”初始化时，会自动在其内部创建一个 UL 和多个 LI 元素（数量取决于 data-visible-items 的设置），其中每一个 LI 元素都会用来容纳一条信息。
   * @description 新增行为
   * * 可以随时通过调用 addMessages 方法来添加要展示的信息，信息会保存在“信息队列”中。
   *   当“信息队列”的长度超过 data-cache-size 的值时，已展示过的信息将被从队列中删除（尚未展示过的信息不会被删除）。
   * * 每隔一定的时间（取决于 data-interval 的设定值），“自动提词机”都会纵向滚动其信息内容，以展示“信息队列”中的下一条信息。
   *   当鼠标移入本元素时，会暂时停止信息的滚动；当鼠标移出本元素时，会重新开始信息的滚动。
   * @description 默认样式
   *   div.widget-autocue { position: relative; overflow: hidden; }
   *   div.widget-autocue ul { position: absolute; left: 0; top: 0; list-style: none; margin: 0; padding: 0; }
   * @description 可配置项
   *   data-cache-size
   *     缓存信息的总条目数。
   *     如果不指定本属性，则使用 10 作为默认值。
   *   data-interval
   *     以毫秒为单位的信息自动滚动间隔时间。
   *     如果不指定本属性，则使用 5000 作为默认值。
   *   data-direction
   *     滚动方向，有效值为 'up' 和 'down'。
   *     如果不指定本属性，则使用 'up' 作为默认值。
   *   data-visible-items
   *     同时展示的信息条目数。
   *     如果不指定本属性，则使用 1 作为默认值。
   */

  /**
   * 添加新信息到“信息队列”。
   * @name Autocue#addMessages
   * @function
   * @param {Array} newMessages 包含新信息的数组。
   * @returns {Element} 本元素。
   * @description
   *   如果当前的“信息队列”中包含了某条新信息，则这条新信息不会被再次添加到“信息队列”中。
   */

  Widget.register({
    type: 'autocue',
    selector: 'div.widget-autocue',
    styleRules: [
      'div.widget-autocue { position: relative; overflow: hidden; }',
      'div.widget-autocue ul { position: absolute; left: 0; top: 0; list-style: none; margin: 0; padding: 0; }'
    ],
    config: {
      cacheSize: 10,
      interval: 5000,
      direction: 'up',
      visibleItems: 1
    },
    methods: {
      addMessages: function(newMessages) {
        var messages = this.messages;
        // 添加当前“信息队列”中不存在的新信息。
        newMessages.forEach(function(newMessage) {
          if (!messages.contains(newMessage)) {
            messages.push(newMessage);
          }
        });
        // 若为首次添加，则展示指定条目的信息。
        if (!this.viewport.getChildCount() && messages.length) {
          for (var i = 0; i < this.visibleItems; i++) {
            showNextMessage(this);
          }
        }
        // 触发事件。
        this.fire('addmessages');
        return this;
      }
    },
    initialize: function() {
      var $autocue = this;

      // 保存属性。
      $autocue.viewport = document.$('<ul></ul>').insertTo($autocue);
      $autocue.messages = [];
      $autocue.messages.currentIndex = 0;

      // 自动提词。
      var timer;
      $autocue
          .on('mouseenter', function() {
            if (timer) {
              clearInterval(timer);
            }
            timer = undefined;
          })
          .on('mouseleave', function() {
            if (!timer) {
              timer = setInterval(function() {
                showNextMessage($autocue);
              }, $autocue.interval);
            }
          })
          .fire('mouseleave');

    }
  });

})();

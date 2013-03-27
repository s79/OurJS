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
    // 显示。
    var $viewport = $autocue.viewport;
    var $message = $('<li>' + message + '</li>');
    var showEntries = $autocue.showEntries;
    var count = $viewport.getChildCount();
    if ($autocue.direction === 'down') {
      $message.insertTo($viewport, 'afterBegin');
      if (count >= showEntries) {
        $viewport.setStyle('top', -$message.offsetHeight);
        $viewport.morph({top: 0}, {
          onFinish: function() {
            $viewport.getLastChild().remove();
          }
        });
      }
    } else {
      $message.insertTo($viewport);
      if (count >= showEntries) {
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
   * 自动提词机。
   * @name Autocue
   * @constructor
   * @attribute data-direction
   *   滚动方向，有效值为 'up' 和 'down'。
   *   如果不指定本属性，则使用 'up' 作为默认值。
   * @attribute data-show-entries
   *   同时显示的信息条目数。
   *   如果不指定本属性，则使用 1 作为默认值。
   * @attribute data-cache-size
   *   缓存信息的总条目数。
   *   如果不指定本属性，则使用 10 作为默认值。
   * @attribute data-interval
   *   以毫秒为单位的自动播放间隔。
   *   如果不指定本属性，则使用 5000 作为默认值。
   * @fires addmessages
   *   调用 addMessages 方法后触发。
   * @description
   *   自动提词机可以将要显示的信息以滚动字幕的形式显示，并且可以随时调用 addMessages 方法添加新的信息。
   *   要显示的信息会保存在缓存中，当信息的总条目数超过 data-cache-size 指定的值时，位于缓存顶端并且已经显示过的信息将被从缓存中删除（尚未显示过的信息不会被删除）。
   *   <strong>启用方式：</strong>
   *   为元素添加 'widget-autocue' 类，即可使该元素成为自动提词机。
   *   <strong>结构约定：</strong>
   *   当自动提词机初始化时，会在其内部自动创建一个 UL 和多个 LI 元素。
   *   其中每一个 LI 元素都会用来容纳一条信息。
   *   <strong>新增行为：</strong>
   *   当鼠标移入本元素时，会自动停止信息的滚动；当鼠标离开本元素时，会自动开始信息的滚动。
   *   <strong>默认样式：</strong>
   *   <pre class="lang-css">
   *   .widget-autocue { position: relative; overflow: hidden; }
   *   .widget-autocue ul { position: absolute; left: 0; top: 0; list-style: none; margin: 0; padding: 0; }
   *   </pre>
   */

  /**
   * 添加新信息到信息队列。
   * @name Autocue#addMessages
   * @function
   * @param {Array} newMessages 包含新信息的数组。
   * @returns {Element} 本元素。
   * @description
   *   如果当前的信息队列中包含了某条新信息，则这条新信息不会被再次添加到信息队列中。
   */

  Widget.register('autocue', {
    css: [
      '.widget-autocue { position: relative; overflow: hidden; }',
      '.widget-autocue ul { position: absolute; left: 0; top: 0; list-style: none; margin: 0; padding: 0; }'
    ],
    config: {
      direction: 'up',
      showEntries: 1,
      cacheSize: 10,
      interval: 5000
    },
    methods: {
      addMessages: function(newMessages) {
        var messages = this.messages;
        // 添加当前信息队列中不存在的新信息。
        newMessages.forEach(function(newMessage) {
          if (!messages.contains(newMessage)) {
            messages.push(newMessage);
          }
        });
        // 若为首次添加，则显示指定条目的信息。
        if (!this.viewport.getChildCount() && messages.length) {
          for (var i = 0; i < this.showEntries; i++) {
            showNextMessage(this);
          }
        }
        // 触发事件。
        this.fire('addmessages');
        return this;
      }
    },
    events: ['addmessages'],
    initialize: function() {
      var $element = this;

      // 保存属性。
      $element.viewport = document.$('<ul></ul>').insertTo($element);
      $element.messages = [];
      $element.messages.currentIndex = 0;

      // 自动提词。
      var timer;
      $element
          .on('mouseenter', function() {
            if (timer) {
              clearInterval(timer);
            }
            timer = undefined;
          })
          .on('mouseleave', function() {
            if (!timer) {
              timer = setInterval(function() {
                showNextMessage($element);
              }, $element.interval);
            }
          })
          .fire('mouseleave');

    }
  });

})();

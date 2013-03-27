/**
 * @fileOverview Widget - 日志记录器
 * @author sundongguo@gmail.com
 * @version 20120806
 */

(function() {
//==================================================[Widget - 日志记录器]
//--------------------------------------------------[Logger]
  /**
   * 日志记录器。
   * @name Logger
   * @constructor
   * @attribute data-clearable
   *   是否启用清除记录内容的按钮。
   * @description
   *   为元素添加 'widget-logger' 类，即可使该元素成为日志记录器。
   *   如果该元素是右浮动的，则其高度将被自动设置为其下一个相邻元素的高度。
   */

  /**
   * 打印一条日志。
   * @name Logger#log
   * @param {Object} message 日志信息，可以包含 HTML 标记，其中 strong em var dfn.true dfn.false 有特殊样式。
   * @function
   * @returns {Object} 本元素。
   */

  /**
   * 打印一条断言及其结果。
   * @name Logger#assert
   * @param {string} expression 表达式，结果为 true 显示为绿色，false 显示为红色。
   * @function
   * @returns {Object} 本元素。
   */

  /**
   * 打印一组列表。
   * @name Logger#list
   * @param {string} item1 本组列表的第一项，可以包含 HTML 标记。
   * @param {string} [item2] 本组列表的第一项，可以包含 HTML 标记。
   * @param {string} […] 本组列表的第 n 项，可以包含 HTML 标记。
   * @function
   * @returns {Object} 本元素。
   * @description
   *   如果一个值是布尔类型，则自动为其着色。
   */

  /**
   * 清空日志记录器。
   * @name Logger#clear
   * @function
   * @returns {Object} 本元素。
   */

  Widget.register('logger', {
    css: [
      '.widget-logger { position: relative; border: 1px solid #252525; background: #252525; }',
      '.widget-logger div.output { height: 100%; overflow-x: hidden; overflow-y: auto; color: #8CC; font: 12px/12px Consolas, "Lucida Console", Courier, SimSun, monospace; white-space: pre-wrap; word-wrap: break-word; }',
      '.widget-logger a:link, .widget-logger a:visited { display: none; position: absolute; left: 5px; bottom: 5px; width: 16px; height: 16px; color: silver; font: 15px/16px Webdings, Verdana, serif; text-decoration: none; text-align: center; }',
      '.widget-logger a:hover { color: white; text-decoration: none; }',
      '.widget-logger table { border-collapse: sperate; border-spacing: 2px; margin: 2px; }',
      '.widget-logger td { padding: 2px; border: none; font-size: 12px; }',
      '.widget-logger p { margin: 2px; padding: 2px; word-wrap: break-word; word-break: break-all; }',
      '.widget-logger strong, .widget-logger em { display: inline-block; margin-right: 2px; padding: 0 3px; border-radius: 8px; color: black; font-weight: bold; }',
      '.widget-logger strong { background: gold; }',
      '.widget-logger em { background: dodgerblue; }',
      '.widget-logger var, .widget-logger dfn { font-style: normal; }',
      '.widget-logger var { color: white; }',
      '.widget-logger dfn { display: inline-block; padding: 0 1px; font-style: italic; font-weight: bold; text-decoration: underline; }',
      '.widget-logger .true { color: yellowgreen; }',
      '.widget-logger .false { color: tomato; }',
      '.widget-logger .true em { background: #A5C261; }',
      '.widget-logger .false em { background: orangered; }'
    ],
    config: {
      clearable: false
    },
    methods: {
      log: function(message) {
        document.$('<p>' + message + '</p>').insertTo(this.outputElement);
        this.outputElement.scrollTop += 10000;
        return this;
      },
      assert: function(expression) {
        var result = !!eval(expression);
        document.$('<p class="' + result + '"><em>' + (result ? '√' : 'X') + '</em><span></span></p>')
            .insertTo(this.outputElement)
            .getLastChild()
            .innerText = expression;
        this.outputElement.scrollTop += 10000;
        return this;
      },
      list: function() {
        var lastChild = this.outputElement.getLastChild();
        if (!lastChild || lastChild.nodeName !== 'TABLE') {
          document.$('<table><tbody></tbody></table>').insertTo(this.outputElement);
        }
        var tbody = this.outputElement.getLastChild().getLastChild();
        var tr = tbody.insertRow(-1);
        var td;
        Array.from(arguments).forEach(function(item) {
          if (typeof item === 'boolean') {
            item = '<dfn class="' + item + '">' + item + '</dfn>';
          }
          td = tr.insertCell(-1);
          td.innerHTML = item;
        });
        this.outputElement.scrollTop += 10000;
        return this;
      },
      clear: function() {
        this.outputElement.empty();
        return this;
      }
    },
    initialize: function() {
      var $logger = this;

      // 保存属性。
      $logger.outputElement = document.$('<div class="output"></div>').insertTo($logger);

      // 高度对齐。
      if ($logger.getStyle('float') === 'right') {
        var $target = $logger;
        while ($target = $target.getNextSibling()) {
          if (!$target.hasClass('widget-logger')) {
            $logger.setStyle('height', $target.offsetHeight - 2);
            break;
          }
        }
      }

      // 启用“清空”功能。
      if ($logger.clearable) {
        $logger.clearButton = document.$('<a href="javascript:clear();" title="清除日志" hidefocus>x</a>')
            .on('click', function(e) {
              e.preventDefault();
              $logger.clear();
              this
                  .highlight('tomato', 'color', {onFinish: function() {
                    this.setStyle('color', '');
                  }})
                  .fade('out');
            })
            .insertTo($logger);
        $logger
            .on('mouseenter', function() {
              $logger.clearButton.setStyle('left', $logger.outputElement.clientWidth - 21).fade('in');
            })
            .on('mouseleave', function() {
              $logger.clearButton.fade('out');
            });
      }

    }
  });

})();

/*!
 * Logger.
 */

/**
 * @fileOverview 日志记录器。
 * @author sundongguo@gmail.com
 * @version 20120806
 */

(function() {
//==================================================[日志记录器]
  var styleRulesInjected = false;
  var injectedStyleRules = function() {
    if (!styleRulesInjected) {
      document.addStyleRules([
        '.logger { position: relative; border: 1px solid silver; background: #252525; }',
        '.logger div.output { height: 100%; overflow-x: hidden; overflow-y: auto; color: #8CC; font: 12px/12px Consolas, "Lucida Console", Courier, SimSun, monospace; white-space: pre-wrap; word-wrap: break-word; }',
        '.logger a { display: none; position: absolute; right: -1px; bottom: -18px; padding: 2px 5px; background: whitesmoke; border: 1px solid silver; border-radius: 0 0 2px 2px; color: black; text-decoration: none; font-size: 12px; line-height: 12px; }',
        '.logger a:hover { background: white; }',
        '.logger table { border-collapse: sperate; border-spacing: 2px; margin: 2px; }',
        '.logger td { padding: 2px; border: none; font-size: 12px; }',
        '.logger p { margin: 2px; padding: 2px; word-wrap: break-word; word-break: break-all; }',
        '.logger strong, .logger em { display: inline-block; margin-right: 2px; padding: 0 3px; border-radius: 8px; color: black; font-weight: bold; }',
        '.logger strong { background: gold; }',
        '.logger em { background: dodgerblue; }',
        '.logger var, .logger dfn { font-style: normal; }',
        '.logger var { color: white; }',
        '.logger dfn { display: inline-block; padding: 0 1px; font-style: italic; font-weight: bold; text-decoration: underline; }',
        '.logger .true { color: yellowgreen; }',
        '.logger .false { color: tomato; }',
        '.logger .true em { background: #A5C261; }',
        '.logger .false em { background: orangered; }'
      ]);
      styleRulesInjected = true;
    }
  };

//--------------------------------------------------[Logger]
  /**
   * 创建一个日志记录器。
   * @name Logger
   * @constructor
   * @param {Element} container 日志记录器的容器。
   * @param {boolean} [enableClearButton] 启用清除记录内容的按钮。
   */
  var Logger = window.Logger = function(container, enableClearButton) {
    var logger = this;
    var $container = document.$(container);
    logger.outputElement = document.$('<div class="output"></div>').insertTo($container.addClass('logger'));
    if (enableClearButton) {
      logger.clearButton = document.$('<a href="javascript:clear();">clear</a>')
          .on('click', function(e) {
            e.preventDefault();
            logger.clear();
          })
          .insertTo(container);
      var timer;
      $container
          .on('mouseenter', function() {
            clearTimeout(timer);
            logger.clearButton.fade('in');
          })
          .on('mouseleave', function() {
            timer = setTimeout(function() {
              logger.clearButton.fade('out');
            }, 1000);
          });
    }
    injectedStyleRules();
  };

//--------------------------------------------------[Logger.prototype.log]
  /**
   * 打印一条日志。
   * @name Logger.prototype.log
   * @param {Object} message 日志信息，可以包含 HTML 标记，其中 strong em var dfn.true dfn.false 有特殊样式。
   * @function
   * @returns {Object} Logger 对象。
   */
  Logger.prototype.log = function(message) {
    document.$('<p>' + message + '</p>').insertTo(this.outputElement);
    this.outputElement.scrollTop += 10000;
    return this;
  };

//--------------------------------------------------[Logger.prototype.assert]
  /**
   * 打印一条断言及其结果。
   * @name Logger.prototype.assert
   * @param {string} expression 表达式，结果为 true 显示为绿色，false 显示为红色。
   * @function
   * @returns {Object} Logger 对象。
   */
  Logger.prototype.assert = function(expression) {
    var result = !!eval(expression);
    document.$('<p class="' + result + '"><em>' + (result ? '√' : 'X') + '</em><span></span></p>')
        .insertTo(this.outputElement)
        .getLastChild().innerText = expression;
    this.outputElement.scrollTop += 10000;
    return this;
  };

//--------------------------------------------------[Logger.prototype.list]
  /**
   * 打印一组列表。
   * @name Logger.prototype.list
   * @param {string} item1 本组列表的第一项，可以包含 HTML 标记。
   * @param {string} [item2] 本组列表的第一项，可以包含 HTML 标记。
   * @param {string} […] 本组列表的第 n 项，可以包含 HTML 标记。
   * @function
   * @returns {Object} Logger 对象。
   * @description
   *   如果一个值是布尔类型，则自动为其着色。
   */
  Logger.prototype.list = function() {
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
  };

//--------------------------------------------------[Logger.prototype.clear]
  /**
   * 清空日志记录器。
   * @name Logger.prototype.clear
   * @function
   * @returns {Object} Logger 对象。
   */
  Logger.prototype.clear = function() {
    this.outputElement.empty();
    return this;
  };

})();

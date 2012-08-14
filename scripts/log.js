/**
 * @fileOverview 组件 - 日志。
 * @author sundongguo@gmail.com
 * @version 20120806
 */

execute(function($) {
//==================================================[Logger]
  var styleRulesInjected = false;

//--------------------------------------------------[Logger Constructor]
  /**
   * 日志。
   * @name Logger
   * @constructor
   * @param {Element} element 日志的容器。
   */
  var Logger = new Component(function(element) {
    this.element = $(element).addClass('log').on('dblclick', function() {
      this.empty();
    });
    if (!styleRulesInjected) {
      document.addStyleRules([
        '.log { overflow-y: scroll; background: #252525; color: #8CC; font: 12px Consolas, "Lucida Console", Courier, SimSun, monospace; }',
        '.log p { margin: 5px; line-height: 1; }',
        '.log em, .log strong { display: inline-block; margin-right: 2px; padding: 0 3px; border-radius: 8px; font-weight: bold; }',
        '.log em { background: dodgerblue; color: black; }',
        '.log strong { background: gold; color: black; }',
        '.log var { color: white; }',
        '.log dfn { display: inline-block; padding: 0 1px; border: 1px solid; border-radius: 3px; }',
        '.log dfn.true { color: greenyellow; }',
        '.log dfn.false { color: orangered; }'
      ]);
      styleRulesInjected = true;
    }
  });

//--------------------------------------------------[Logger.prototype.log]
  /**
   * 打印一条日志。
   * @name Logger.prototype.log
   * @param {Object} message 日志信息，可以包含 HTML 标记，其中 strong em var dfn.true dfn.false 有特殊样式。
   * @function
   * @returns {Object} Logger 对象。
   */
  Logger.prototype.log = function(message) {
    $('<p>' + message + '</p>').insertTo(this.element);
    this.element.scrollTop += 10000;
    return this;
  };

//--------------------------------------------------[Logger]
  window.Logger = Logger;

});

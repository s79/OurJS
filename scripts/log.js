//--------------------------------------------------[addStyleRules]
/**
 * 在页面中添加样式规则。
 * @name addStyleRules
 * @function
 * @param {Array} rules 要添加的样式规则集数组，每项为一单行字符串。
 */
function addStyleRules(rules) {
  document.head.appendChild(document.createElement('style'));
  var styleSheets = document.styleSheets;
  var styleSheet = styleSheets[styleSheets.length - 1];
  rules.forEach(function(rule) {
    if (styleSheet.insertRule) {
      styleSheet.insertRule(rule, styleSheet.cssRules.length);
    } else {
      var lBraceIndex = rule.indexOf('{');
      var rBraceIndex = rule.indexOf('}');
      var selector = rule.slice(0, lBraceIndex);
      var declarations = rule.slice(lBraceIndex + 1, rBraceIndex);
      selector.split(',').forEach(function(selector) {
        styleSheet.addRule(selector, declarations);
      });
    }
  });
}

//--------------------------------------------------[日志]
execute(function($) {
  // 添加样式表。
  addStyleRules([
    '#log { overflow-y: scroll; background: #252525; color: #8CC; font: 12px Consolas, "Lucida Console", Courier, SimSun, monospace; }',
    '#log p { margin: 5px; line-height: 1; }',
    '#log em, #log strong { display: inline-block; margin-right: 2px; padding: 0 3px; border-radius: 8px; font-weight: bold; }',
    '#log em { background: dodgerblue; color: black; }',
    '#log strong { background: gold; color: black; }',
    '#log var { color: white; }',
    '#log dfn { display: inline-block; padding: 0 1px; border: 1px solid; border-radius: 3px; }',
    '#log dfn.true { color: greenyellow; }',
    '#log dfn.false { color: orangered; }'
  ]);

  // 输出 HTML 代码。
  document.write('<div id="log"></div>');

  // 日志功能。
  var $log = $('#log').on('dblclick', function() {
    this.empty();
  });
  window.log = function(message) {
    $log.append($('<p>' + message + '</p>'));
    $log.scrollTop += 10000;
  };

});

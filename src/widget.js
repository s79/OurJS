/**
 * @fileOverview 自定义控件。
 * @author sundongguo@gmail.com
 * @version 20121008
 */

(function() {
//==================================================[自定义控件]
  /*
   * 提供对自定义控件的支持。
   * 控件解析器需要根据情况载入。
   * 控件的配置参数以元素的 attribute 的形式写在标签内部，大小写不敏感。若有多个同名的 attribute，则仅第一个生效。
   *
   * 提供对象：
   *   Widget
   *
   * 提供命名空间：
   *   Widget.parsers
   *
   * 提供静态方法：
   *   Widget.parse
   */

//--------------------------------------------------[Widget]
  /**
   * 提供对自定义控件的支持。
   * @name Widget
   * @namespace
   */
  var Widget = window.Widget = {};

//--------------------------------------------------[Widget.parsers]
  /**
   * 控件解析器的命名空间。
   * @name Widget.parsers
   * @namespace
   * @private
   */
  Widget.parsers = {};

//--------------------------------------------------[Widget.parse]
  /**
   * 解析控件。
   * @name Widget.parse
   * @function
   * @param {Element} element 要解析的元素。
   * @param {boolean} [recursive] 是否解析该元素的后代元素。
   * @description
   *   在 DOM 树解析完成后会自动解析页面内的全部可解析的控件，因此仅应在必要时调用本方法。
   */
  var parseWidget = function(parser, $element) {
    if (!$element.isWidget) {
      // 根据解析器的 config 属性从目标元素的 attribute 中解析配置信息并将其添加到目标元素。
      Object.forEach(parser.config || {}, function(defaultValue, key) {
        var value = $element.getData(key);
        if (value !== null) {
          switch (typeof defaultValue) {
            case 'string':
              break;
            case 'boolean':
              value = true;
              break;
            case 'number':
              value = parseFloat(value);
              break;
            default:
              throw new Error('Invalid config type "' + key + '"');
          }
          $element[key] = value;
        }
      });
      // 根据解析器的 methods 属性为目标元素添加方法。
      Object.forEach(parser.methods || {}, function(value, key) {
        $element[key] = value;
      });
      // 解析元素。
      parser($element);
      $element.isWidget = true;
    }
  };

  Widget.parse = function(element, recursive) {
    var nodeName = element.nodeName.toLowerCase();
    var parser;
    if (nodeName.startsWith('w-') && (parser = Widget.parsers[nodeName.slice(2)])) {
      parseWidget(parser, element);
    }
    if (recursive) {
      Object.keys(Widget.parsers).forEach(function(type) {
        parser = Widget.parsers[type];
        Element.prototype.find.call(element, 'w-' + type).forEach(function($widget) {
          parseWidget(parser, $widget);
        });
      });
    }
  };

//--------------------------------------------------[自动解析]
  document.on('domready', function() {
    Widget.parse(document.body, true);
  });

})();

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
   *   Widget.getConfig
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
      parser($element);
      $element.isWidget = true;
    }
  };

  Widget.parse = function(element, recursive) {
    var nodeName = element.nodeName.toLowerCase();
    var parser;
    if (nodeName.startsWith('widget-') && (parser = Widget.parsers[nodeName.slice(7)])) {
      parseWidget(parser, element);
    }
    if (recursive) {
      Object.keys(Widget.parsers).forEach(function(type) {
        parser = Widget.parsers[type];
        Element.prototype.find.call(element, 'widget-' + type).forEach(function($widget) {
          parseWidget(parser, $widget);
        });
      });
    }
  };

//--------------------------------------------------[Widget.getConfig]
  /**
   * 从创建控件的元素的 attribute 中获取配置信息。
   * @name Widget.getConfig
   * @function
   * @private
   * @param {Element} element 创建控件的元素。
   * @param {Object} config 默认配置信息，其属性值的类型可以是 string、boolean 或 number 中的一种。
   * @description
   *   要获取的属性值类型在不同情况下的结果：
   *   string - 即对应的 attribute 的值，若为空则为空字符串。
   *   boolean - 将对应的 attribute 的值转换为数字，若为空则为 0。
   *   number - 无论对应的 attribute 的值是什么，声明该 attribute 其值即为 true。
   */
  Widget.getConfig = function(element, config) {
    Object.forEach(config, function(defaultValue, key) {
      var value = element.getAttribute(key);
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
            throw new Error('Invalid type of config "' + key + '"');
        }
        config[key] = value;
      }
    });
    return config;
  };

//--------------------------------------------------[自动解析]
  document.on('domready', function() {
    Widget.parse(document.body, true);
  });

})();

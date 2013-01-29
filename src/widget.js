/**
 * @fileOverview Widget。
 * @author sundongguo@gmail.com
 * @version 20121008
 */

(function() {
//==================================================[Widget]
  /*
   * Widget 是指一类特殊的元素，当一个元素成为 Widget 时，将获得新的属性、方法，具备新的行为，并会触发新的事件。
   * 包含 Widget 解析器的脚本可以根据情况载入。
   *
   * 使一个元素成为 Widget 有以下两种方式：
   *   1. 在编写 HTML 代码时，为该元素添加 widget-<type> 类，并使用 data-<config>="<value>" 来定义 Widget 的配置。
   *   2. 在脚本中创建符合方式 1 的元素，之后调用 Widget.parse(<element>) 方法来解析。
   * 其中 type 为 Widget 的类型，config/value 为 Widget 的配置信息，element 为目标元素。
   *
   * 提供对象：
   *   Widget
   *
   * 提供命名空间：
   *   Widget.parsers
   *
   * 提供静态方法：
   *   Widget.register
   *   Widget.parse
   */

//--------------------------------------------------[Widget]
  /**
   * 提供对 Widget 的支持。
   * @name Widget
   * @namespace
   */
  var Widget = window.Widget = {parsers: {}};

//--------------------------------------------------[Widget.register]
  /**
   * 注册一个 Widget 解析器。
   * @name Widget.register
   * @function
   * @param {string} type Widget 的类型。
   * @param {Object} parser Widget 的解析器。
   * @param {Array} parser.css 可选，包含要应用到此类 Widget 的 CSS 规则集的数组。
   * @param {Object} parser.config 可选，包含此类 Widget 的默认配置的对象。
   * @param {Object} parser.methods 可选，包含此类 Widget 的实例方法的对象。
   * @param {Array} parser.events 可选，包含此类 Widget 能够触发的事件名称的数组。
   * @param {Function} parser.initialize 必选，此类 Widget 的初始化函数。
   */
  Widget.register = function(type, parser) {
    if (parser.css) {
      document.addStyleRules(parser.css);
    }

    Widget.parsers[type] = function($element) {
      // 从目标元素的 attribute 中解析配置信息并将其添加到目标元素。
      if (parser.config) {
        Object.forEach(parser.config, function(defaultValue, key) {
          var value = defaultValue;
          var specifiedValue = $element.getData(key);
          if (specifiedValue !== undefined) {
            switch (typeof defaultValue) {
              case 'string':
                value = specifiedValue;
                break;
              case 'boolean':
                value = true;
                break;
              case 'number':
                value = parseFloat(specifiedValue);
                break;
              default:
                throw new Error('Invalid config type "' + key + '"');
            }
          }
          $element[key] = value;
        });
      }
      // 为目标元素添加方法。
      if (parser.methods) {
        Object.mixin($element, parser.methods);
      }
      // 为目标元素添加内联事件监听器。
      if (parser.events) {
        parser.events.forEach(function(name) {
          var inlineName = 'on' + name;
          var inlineEventListener = $element.getAttribute(inlineName);
          if (typeof inlineEventListener === 'string') {
            $element[inlineName] = new Function(inlineEventListener);
          }
          $element.on(name + '.inlineEventListener', function(event) {
            if (this[inlineName]) {
              this[inlineName](event);
            }
          });
        });
      }
      // 初始化。
      parser.initialize.call($element);
    };

  };

//--------------------------------------------------[Widget.parse]
  /**
   * 将符合条件的元素解析为 Widget。
   * @name Widget.parse
   * @function
   * @param {Element} element 要解析的元素。
   * @param {boolean} [recursively] 是否解析该元素的后代元素。
   * @description
   *   在 DOM 树解析完成后会自动将页面内的全部符合条件的元素解析为 Widget，因此仅应在必要时调用本方法。
   */
  Widget.parse = function(element, recursively) {
    var $element = document.$(element);

    if (!$element.widgetType) {
      var classNames = $element.className.clean().split(' ');
      var className;
      while (className = classNames.shift()) {
        if (className.startsWith('widget-')) {
          var type = className.replace('widget-', '');
          var parser = Widget.parsers[type];
          if (parser) {
            parser($element);
            $element.widgetType = type;
            break;
          } else {
            navigator.warn('Widget parser "' + type + '" is not found.');
          }
        }
      }
    }

    if (recursively) {
      $element.find('[class*=widget-]').forEach(function($element) {
        Widget.parse($element);
      });
    }

  };

//--------------------------------------------------[自动解析]
  document.on('domready', function() {
    Widget.parse(document.body, true);
  });

})();

/**
 * @fileOverview Widget - 演示按钮
 * @author sundongguo@gmail.com
 * @version 20130418
 */

(function() {
//==================================================[Widget - 演示按钮]
//--------------------------------------------------[ExecuteCode]
  // 在页面内所有的 domready 监听器被调用之后才启用点击“演示按钮”执行代码的功能。
  document.on('afterdomready', function() {
    document.$('body').on('click:relay(button.widget-demobutton).demobutton', function() {
      if (!this.disabled) {
        eval(this.code || this.innerText);
      }
    });
  });

//--------------------------------------------------[DemoButton]
  /**
   * 演示按钮。
   * @name DemoButton
   * @constructor
   * @description 启用方式
   *   为一个 BUTTON 元素添加 'widget-demobutton' 类，即可使该元素成为“演示按钮”。
   * @description 新增行为
   *   当点击一个“演示按钮”时，该按钮内的文本（或该按钮的 data-code 属性中的文本）将被作为 JS 代码被执行，执行时的作用域为全局作用域。
   * @description 可配置项
   *   data-code
   *     点击该按钮后执行的代码。
   *     如果不指定本属性，则点击该按钮时，以该按钮内的文本作为代码执行。
   */

  var styleRules = [
    'button.widget-demobutton { margin: 1px 0; padding: 6px 12px; overflow: visible; border: none; background: #323232; color: gainsboro; font: bold 14px/14px Verdana, Helvetica, Arial, "Microsoft YaHei", SimSun, sans-serif; text-align: left; }',
    'button.widget-demobutton:hover { background: black; }',
    'button.widget-demobutton:active { color: white; }',
    'button.widget-demobutton code { font-weight: normal; font-family: Consolas, "Lucida Console", Courier, "Microsoft YaHei", SimSun, monospace; }',
    'button.widget-demobutton strong { color: #64D5EB; }',
    'button.widget-demobutton em { color: #A4C639; font-style: italic; }',
    'button.widget-demobutton var { color: #FF6767; font-style: normal; }',
    'button.widget-demobutton[disabled], button.widget-demobutton[disabled]:hover, button.widget-demobutton[disabled]:active { color: gray; background: #323232; }'
  ];
  if (navigator.isIE6) {
    styleRules.pop();
  }
  Widget.register({
    type: 'demobutton',
    selector: 'button.widget-demobutton',
    styleRules: styleRules,
    config: {
      code: ''
    },
    initialize: function() {
      this.setAttribute('type', 'button');
    }
  });

})();

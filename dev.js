/**
 * @fileOverview OurJS 开发版。
 * @author sundongguo@gmail.com
 * @version 20120213
 */
//==================================================[引入开发中的脚本文件]
//--------------------------------------------------[import]
(function() {
  var scripts = [
    '<script src="/framework/src/lang.js"></script>',
    '<script src="/framework/src/browser.js"></script>',
    '<script src="/framework/src/dom.js"></script>',
    '<script src="/framework/src/component.js"></script>',
    '<script src="/framework/src/animation.js"></script>',
    '<script src="/framework/src/request.js"></script>',
    '<script src="/framework/src/modularization.js"></script>',
    '<script src="/framework/src/execute.js"></script>',
    '<script src="/framework/src/plugins/sizzle.js"></script>'
  ];
  if (!window.JSON) {
    scripts.push('<script src="/framework/src/plugins/json2.js"></script>');
  }
  if (document.documentElement.currentStyle && !document.documentElement.currentStyle.minWidth) {
    scripts.push('<script src="/framework/src/plugins/console.js"></script>');
  }
  document.write(scripts.join('\n'));
})();

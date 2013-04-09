/**
 * @fileOverview OurJS 开发版
 * @author sundongguo@gmail.com
 * @version 20120213
 */

(function() {
  var ourjs = [
    'src/lang.js',
    'src/browser.js',
    'src/dom.js',
    'src/event_target.js',
    'src/animation.js',
    'src/request.js',
    'src/widget.js',
    'src/integrated/json2.js',
    'src/integrated/sizzle.js'
  ];
  if (document.documentElement.currentStyle && !document.documentElement.currentStyle.minWidth) {
    ourjs.push('utilities/console.js');
  }
  var path = function() {
    var scripts = document.getElementsByTagName('script');
    var i = 0;
    var script;
    var index;
    while (script = scripts[i++]) {
      index = script.src.indexOf('dev.js');
      if (index > -1) {
        return script.src.slice(0, index);
      }
    }
    return '';
  }();
  var file;
  while (file = ourjs.shift()) {
    document.writeln('<script src="' + path + file + '"></script>');
  }
})();

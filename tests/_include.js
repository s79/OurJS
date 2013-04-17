/**
 * 使用 <include file="/path/to/file"><!-- 注释信息 --></include> 引入模版文件。
 * 注意避免模版文件之间的循环引用。
 * 另外模版文件中不能有脚本调用 document.write 方法，也不应该监听 document 的 domready 事件。
 */

if (navigator.isIElt9) {
  document.createElement('include');
}

document.on('domready', function() {
  function include(target) {
    new Request(target.getAttribute('src'), {useCache: false, async: false})
        .on('finish', function(e) {
          var scripts = [];
          var text = e.text.replace(/(?:<script[^>]*?>)([\s\S]*?)(?:<\/script>)/ig, function(script, scriptText) {
            var match = script.match(/src="([^"]+)"/i);
            if (match) {
              scripts.push([0, match[1]]);
            } else {
              if (scriptText) {
                scripts.push([1, scriptText]);
              }
            }
            return '';
          });
          if (e.status === 200) {
            target.outerHTML = text;
            scripts.forEach(function(script) {
              script[0] ? window.execScript(script[1]) : document.loadScript(script[1]);
            });
          } else {
            target.outerHTML = '<ins style="padding: 0 1em; border: 1px solid red; background: yellow; color: red; font: bold 14px/20px Verdana, Arial, serif; text-decoration: none;">include error: ' + this.url + '</ins>';
          }
        })
        .send();
  }

  var includeElements = document.getElementsByTagName('include');
  var includeElement;
  while (includeElement = includeElements[0]) {
    include(includeElements[0]);
  }

});

/*!
 * Console for IE6.
 * @author sundongguo@gmail.com
 * @version 20120309
 *          20111108 + fixed + localStorage
 */
/**
 * @fileOverview 插件 - 控制台 - console
 */
(function() {
//==================================================[控制台]
  /*
   * 为无控制台的浏览器（主要是 IE6）提供控制台功能，以便调试代码。
   *
   * 补缺对象：
   *   console
   */

  if (window.console) {
    return;
  }

  // 避免 $ 被覆盖。
  var $ = document.$;

//--------------------------------------------------[console.xxx]
  // 空函数。
  var empty = function() {
  };

  // 创建必需的 DOM 对象。
  var $console = $('<form action="" style="display:none; position:absolute; right:0; bottom:0; width:1000px; margin:0; padding:0;">' +
      '<textarea id="console_output" readonly style="display:block; width:100%; height:120px; margin:0 0 -3px; border:1px solid gray; background:#252525; color:#9ACD32; font:12px Consolas, \'Lucida Console\', Courier, SimSun, monospace;"></textarea>' +
      '<input id="console_input" type="text" style="display:block; width:100%; margin:0; border:1px solid gray; background:#252525; color:#F5F5F5; font:12px Consolas, \'Lucida Console\', Courier, SimSun, monospace;">' +
      '</form>');
  document.head.appendChild($console);
  var $input = $('#console_input');
  var $output = $('#console_output');
  $output.value = '';
  var $script = document.createElement('div');
  // 必须插入文档，否则脚本执行后的结果将丢失。
  document.documentElement.firstChild.appendChild($script);

  // 命令输入。
  $console.attachEvent('onsubmit', function() {
    var code = $input.value;
    $input.value = '';
    historyIndex = history.push(code);
    log('>> ' + code);
    $script.innerHTML = '#<script defer>try { window.__result__ = eval("' + code + '"); } catch(e) { window.__result__ = "Error: " + e.message; }</script>';
    var result = window.__result__;
    // 以下写法 IE6 会有作用域问题。
    /*
     try {
     result = window.eval(code);
     } catch(e) {
     result = 'Error: ' + e.message;
     }
     */
    log.call(log, result);
    return false;
  });

  // 日志功能。
  function log() {
    var isInternalCall = this === log;
    var i = 0;
    var length = arguments.length;
    var expression;
    var output = '';
    while (i < length) {
      if (output) {
        output += ' ';
      }
      expression = arguments[i++];
      if (expression == null) {
        output += String(expression);
      } else {
        switch (Object.prototype.toString.call(expression)) {
          case '[object String]':
            output += isInternalCall ? '"' + expression + '"' : expression;
            break;
          case '[object Array]':
            output += '[' + expression + ']';
            break;
          default:
            output += expression.valueOf ? expression.valueOf() : String(expression);
        }
      }
    }
    $output.value += output + '\n';
    $output.scrollTop = 2147483647;
    return undefined;
  }

  // 历史纪录。
  var consoleHistory = localStorage.getItem('consoleHistory');
  var history = consoleHistory ? JSON.parse(consoleHistory) : [''];
  var historyIndex = history.length;
  $input.attachEvent('onkeydown', function(e) {
    switch (e.keyCode) {
      case 38:
        historyIndex = Math.max(--historyIndex, 0);
        $input.value = history[historyIndex];
        break;
      case 40:
        historyIndex = Math.min(++historyIndex, history.length - 1);
        $input.value = history[historyIndex];
        break;
    }
  });
  window.attachEvent('onunload', function() {
    localStorage.setItem('consoleHistory', JSON.stringify(history.slice(-20)));
  });

  // 打开/关闭控制台界面。
  var bodyPaddingBottom = 0;
  var showConsole = function() {
    $console.setStyle('display', 'block');
    $(document.body).setStyle('paddingBottom', bodyPaddingBottom + 150);
//    window.scrollBy(0, 150);
    $input.select();
    $output.scrollTop = 2147483647;
    localStorage.setItem('consoleIsOpen', 'true');
  };
  var hideConsole = function() {
    $console.setStyle('display', 'none');
    $(document.body).setStyle('paddingBottom', 0);
//    window.scrollBy(0, -150);
    localStorage.setItem('consoleIsOpen', 'false');
  };

  // 初始化界面。
  window.attachEvent('onload', function() {
    // 更新文档树及数据。
    var $body = $(document.body).append($console.setStyle('position', 'fixed'));
    bodyPaddingBottom = parseInt($body.getStyle('paddingBottom'), 10) || 0;
    // 启用打开/关闭控制台的快捷键 F12。
    document.attachEvent('onkeydown', function(e) {
      if (e.keyCode === 123) {
        $console.offsetWidth ? hideConsole() : showConsole();
      }
    });
    // 保持状态。
    var consoleIsOpen = localStorage.getItem('consoleIsOpen');
    consoleIsOpen === 'true' ? showConsole() : hideConsole();
  });

  // 输出 console 对象。
  window.console = {
    log: log,
    info: log,
    warn: log,
    error: log,
    trace: empty,
    group: empty,
    groupCollapsed: empty,
    groupEnd: empty
  };

  // 提供清理控制台输出的方法，未做特殊处理，注意避免与应用的全局变量重名。
  window.clear = function() {
    setTimeout(function() {
      $output.value = '';
    }, 0);
  };

}());

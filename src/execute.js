/**
 * @fileOverview 执行代码块的便捷方法。
 * @author sundongguo@gmail.com
 * @version 20120405
 */
(function() {
//==================================================[执行代码块]
  /*
   * 设计思路：
   *   本方案主要为解决标识符 $ 与其他类库冲突的问题，顺便加入“在 DOM 树加载完成后执行”的功能。
   */

  var $ = document.$;

//--------------------------------------------------[execute]
  /**
   * 执行代码块。
   * @name execute
   * @memberOf Global
   * @function
   * @param {Function} codeBlock 包含要执行的代码块的匿名函数。
   * @param {boolean} [waitingForDomReady] 是否在 DOM 树加载完成后执行。
   * @description
   *   通常，为了减少全局变量的数量和避免不同代码块之间的变量名有冲突，会使用一个匿名函数来执行一个相对独立的代码块：
   *   <pre>(function() {...})();</pre>
   *   使用本方法可以达到相同目的，除此之外还有以下好处：
   *   <ul>
   *     <li>原匿名函数的第一个参数将被传入 document.$，因此可以通过在该匿名函数的形参中写上一个 $，以便在函数内直接使用 $ 而不必担心与其他脚本库的 $ 冲突。</li>
   *     <li>的可选参数 waitingForDomReady 可以控制这个匿名函数的执行时机（如何设置这个参数取决于代码块内是否有依赖 DOM 元素的操作）。</li>
   *   </ul>
   * @example
   *   execute(function($){...});
   *   // 在匿名函数中可以使用 $ 代替 document.$。
   * @example
   *   execute(function($){...}, true);
   *   // 匿名函数将在 DOM 树加载完成后执行。
   */
  window.execute = function(codeBlock, waitingForDomReady) {
    waitingForDomReady ? document.on('domready', function() {
      codeBlock($);
    }) : codeBlock($);
  };

})();

var manifest = {
  'Global': [
    '<static> 自定义扩展',
    'Global.typeOf',
    'Global.execScript',
    'Global.getNamespace',
    '<static> 模块化',
    'Global.declareModule',
    'Global.runApplication'
  ],
  'Object': [
    '<static> ES5',
    'Object.keys',
    '<static> 自定义扩展',
    'Object.clone',
    'Object.append',
    'Object.update',
    'Object.forEach'
  ],
  'Array': [
    '<static> ES5',
    'Array.isArray',
    '<instance> ES5',
    'Array.prototype.forEach',
    'Array.prototype.map',
    'Array.prototype.filter',
    'Array.prototype.every',
    'Array.prototype.some',
    'Array.prototype.indexOf',
    'Array.prototype.lastIndexOf',
//    'Array.prototype.reduce',
//    'Array.prototype.reduceRight',
    '<static> 自定义扩展',
    'Array.from'
  ],
  'String': [
    '<instance> ES5',
    'String.prototype.trim',
    'String.prototype.toJSON',
    '<instance> ES6',
    'String.prototype.repeat',
    'String.prototype.startsWith',
    'String.prototype.endsWith',
    'String.prototype.contains',
    'String.prototype.toArray',
    '<instance> 自定义扩展',
    'String.prototype.clean'
  ],
  'Boolean': [
    '<instance> ES5',
    'Boolean.prototype.toJSON'
  ],
  'Number': [
    '<instance> ES5',
    'Number.prototype.toJSON',
    '<instance> ES6',
    'Number.prototype.isFinite',
    'Number.prototype.isNaN',
    'Number.prototype.isInteger',
    'Number.prototype.toInteger',
    '<instance> 自定义扩展',
    'Number.prototype.format'
  ],
  'Math': [
    '<static> 自定义扩展',
    'Math.limit',
    'Math.randomRange'
  ],
  'Date': [
    '<static> ES5',
    'Date.now',
    '<instance> ES5',
    'Date.prototype.toJSON'
  ],
  'RegExp': [
    '<static> 自定义扩展',
    'RegExp.escape'
  ],
  'JSON': [
    '<static> ES5',
    'JSON.parse',
    'JSON.stringify'
  ],
  'navigator': [
    '<static> 从 UA 中得到的结果(仅供参考)',
    'navigator.userAgentInfo',
    'navigator.userAgentInfo.engine',
    'navigator.userAgentInfo.name',
    'navigator.userAgentInfo.version',
    '<static> 特性判断得到的结果(准确)',
    'navigator.inStandardsMode',
    'navigator.isIE',
    'navigator.isIE9',
    'navigator.isIElt9',
    'navigator.isIE8',
    'navigator.isIElt8',
    'navigator.isIE7',
    'navigator.isIE6',
    'navigator.isFirefox',
    'navigator.isChrome',
    'navigator.isSafari',
    'navigator.isOpera'
  ],
  'location': [
    '<static>',
    'location.parameters'
  ],
  'window': [
    '<static> 获取元素',
    'window.$',
    '<static> 与视口相关的方法',
    'window.getClientSize',
    'window.getScrollSize',
    'window.getPageOffset',
    '<static> 处理事件',
    'window.on',
    'window.off',
    'window.fire'
  ],
  'document': [
    '<static> HTML5',
    'document.head',
    '<static> 获取元素',
    'document.$',
    '<static>',
    'document.preloadImages',
    '<static> 处理事件',
    'document.on',
    'document.off',
    'document.fire'
  ],
  'HTMLElement': [
    '<static> HTML5',
    'HTMLElement.prototype.innerText',
    'HTMLElement.prototype.outerText',
    'HTMLElement.prototype.outerHTML'
  ],
  'Element': [
    '<static> 自定义扩展',
    'Element.prototype',
    '<instance> 查找元素',
    'Element.prototype.find',
    '<instance> 处理类',
    'Element.prototype.hasClass',
    'Element.prototype.addClass',
    'Element.prototype.removeClass',
    'Element.prototype.toggleClass',
    '<instance> 处理样式',
    'Element.prototype.getStyle',
    'Element.prototype.getStyles',
    'Element.prototype.setStyle',
    'Element.prototype.setStyles',
    '<instance> 获取位置及尺寸',
    'Element.prototype.getClientRect',
    '<instance> 处理自定义数据',
    'Element.prototype.getData',
    'Element.prototype.setData',
    'Element.prototype.removeData',
    '<instance> 比较位置关系',
    'Element.prototype.comparePosition',
    'Element.prototype.isAncestorOf',
    '<instance> 获取相关元素',
    'Element.prototype.getParent',
    'Element.prototype.getPrevious',
    'Element.prototype.getNext',
    'Element.prototype.getFirstChild',
    'Element.prototype.getLastChild',
    'Element.prototype.getChildren',
    'Element.prototype.getChildCount',
    '<instance> 修改文档树',
    'Element.prototype.append',
    'Element.prototype.prepend',
    'Element.prototype.putBefore',
    'Element.prototype.putAfter',
    'Element.prototype.remove',
    'Element.prototype.replace',
    'Element.prototype.empty',
//    'Element.prototype.clone',
    '<instance> 处理事件',
    'Element.prototype.on',
    'Element.prototype.off',
    'Element.prototype.fire',
    '<instance> 动画效果',
    'Element.prototype.animate',
    'Element.prototype.stopAnimate',
    'Element.prototype.fadeIn',
    'Element.prototype.fadeOut'
  ],
  'components.Switcher': [
    '<constructor>',
    'components.Switcher',
    '<static>',
    'components.Switcher.options',
    '<instance>',
    'components.Switcher.prototype.active'
  ],
  'components.Dialog': [
    '<constructor>',
    'components.Dialog',
    '<static>',
    'components.Dialog.options',
    '<instance>',
    'components.Dialog.prototype.open',
    'components.Dialog.prototype.close',
    'components.Dialog.prototype.adjust'
  ],
  'Animation': [
    '<constructor>',
    'Animation',
    '<static>',
    'Animation.options',
    '<instance>',
    'Animation.prototype.play',
    'Animation.prototype.stop'
  ],
  'Request': [
    '<constructor>',
    'Request',
    '<static>',
    'Request.options',
    '<instance>',
    'Request.prototype.send',
    'Request.prototype.abort'
  ],
  'cookie': [
    '<static>',
    'cookie.set',
    'cookie.get',
    'cookie.remove'
  ],
  'localStorage': [
    '<static> HTML5',
    'localStorage.setItem',
    'localStorage.getItem',
    'localStorage.removeItem',
    'localStorage.clear'
  ]
};

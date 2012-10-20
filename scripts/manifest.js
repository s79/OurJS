var manifest = {
  'Global': [
    '#自定义扩展',
    'Global.typeOf',
    'Global.execScript',
    'Global.getNamespace',
    '#模块化',
    'Global.declareModule',
    'Global.runApplication',
    '#执行代码块',
    'Global.execute'
  ],
  'Object': [
    '#ES5',
    'Object.keys',
    '#自定义扩展',
    'Object.forEach',
    'Object.clone',
    'Object.mixin'
  ],
  'Function': [
    '#ES5',
    'Function.prototype.bind'
  ],
  'Array': [
    '#ES5',
    'Array.isArray',
    'Array.prototype.indexOf',
    'Array.prototype.lastIndexOf',
    'Array.prototype.every',
    'Array.prototype.some',
    'Array.prototype.forEach',
    'Array.prototype.map',
    'Array.prototype.filter',
//    'Array.prototype.reduce',
//    'Array.prototype.reduceRight',
    '#自定义扩展',
    'Array.from',
    'Array.prototype.contains',
    'Array.prototype.remove',
    'Array.prototype.getFirst',
    'Array.prototype.getLast'
  ],
  'String': [
    '#ES5',
    'String.prototype.trim',
    'String.prototype.toJSON',
    '#ES6',
    'String.prototype.repeat',
    'String.prototype.startsWith',
    'String.prototype.endsWith',
    'String.prototype.contains',
    'String.prototype.toArray',
    '#自定义扩展',
    'String.prototype.clean',
    'String.prototype.camelize',
    'String.prototype.dasherize'
  ],
  'Boolean': [
    '#ES5',
    'Boolean.prototype.toJSON'
  ],
  'Number': [
    '#ES5',
    'Number.prototype.toJSON',
    '#ES6',
    'Number.isFinite',
    'Number.isNaN',
    'Number.isInteger',
    'Number.toInteger',
    '#自定义扩展',
    'Number.prototype.padZero'
  ],
  'Math': [
    '#自定义扩展',
    'Math.limit',
    'Math.randomRange'
  ],
  'Date': [
    '#ES5',
    'Date.now',
    'Date.prototype.toJSON',
    '#自定义扩展',
    'Date.from',
    'Date.prototype.format'
  ],
  'RegExp': [
    '#自定义扩展',
    'RegExp.escape'
  ],
  'JSON': [
    '#ES5',
    'JSON.parse',
    'JSON.stringify'
  ],
  'navigator': [
    '#从 UA 中得到的结果(仅供参考)',
    'navigator.userAgentInfo.engine',
    'navigator.userAgentInfo.name',
    'navigator.userAgentInfo.version',
    '#特性判断得到的结果(准确)',
    'navigator.inStandardsMode',
    'navigator.isIE10',
    'navigator.isIElt10',
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
    '#自定义扩展',
    'location.parameters'
  ],
  'cookie': [
    '#自定义扩展',
    'cookie.getItem',
    'cookie.setItem',
    'cookie.removeItem'
  ],
  'localStorage': [
    '#HTML5',
    'localStorage.getItem',
    'localStorage.setItem',
    'localStorage.removeItem',
    'localStorage.clear'
  ],
  'window': [
    '#获取和创建元素',
    'window.$',
    '#获取视口信息',
    'window.getClientSize',
    'window.getScrollSize',
    'window.getPageOffset',
    '#处理事件',
    'window.on',
    'window.off',
    'window.fire'
  ],
  'document': [
    '#HTML5',
    'document.head',
    '#获取和创建元素',
    'document.$',
    '#处理事件',
    'document.on',
    'document.off',
    'document.fire',
    '#自定义扩展',
    'document.addStyleRules',
    'document.loadScript',
    'document.preloadImages'
  ],
  'Element': [
    '#处理类',
    'Element.prototype.hasClass',
    'Element.prototype.addClass',
    'Element.prototype.removeClass',
    'Element.prototype.toggleClass',
    '#处理样式',
    'Element.prototype.getStyle',
    'Element.prototype.getStyles',
    'Element.prototype.setStyle',
    'Element.prototype.setStyles',
    '#处理自定义数据',
    'Element.prototype.getData',
    'Element.prototype.setData',
    'Element.prototype.removeData',
    '#获取坐标信息',
    'Element.prototype.getClientRect',
    '#比较位置关系',
    'Element.prototype.compareDocumentPosition',
    'Element.prototype.contains',
    '#获取相关元素',
    'Element.prototype.find',
    'Element.prototype.getParent',
    'Element.prototype.getPreviousSibling',
    'Element.prototype.getNextSibling',
    'Element.prototype.getFirstChild',
    'Element.prototype.getLastChild',
    'Element.prototype.getChildren',
    'Element.prototype.getChildCount',
    '#克隆元素',
    'Element.prototype.clone',
    '#修改内容或位置',
    'Element.prototype.innerHTML',
    'Element.prototype.outerHTML',
    'Element.prototype.innerText',
    'Element.prototype.outerText',
    'Element.prototype.insertAdjacentHTML',
    'Element.prototype.insertAdjacentText',
    'Element.prototype.insertAdjacentElement',
    'Element.prototype.insertTo',
    'Element.prototype.swap',
    'Element.prototype.replace',
    'Element.prototype.remove',
    'Element.prototype.empty',
    '#处理事件',
    'Element.prototype.on',
    'Element.prototype.off',
    'Element.prototype.fire',
    '#动画效果',
    'Element.prototype.morph',
    'Element.prototype.highlight',
    'Element.prototype.fade',
    'Element.prototype.cancelAnimation'
  ],
  'HTMLFormElement': [
    '#自定义扩展',
    'HTMLFormElement.prototype.getFieldValue',
    'HTMLFormElement.prototype.setValidationRules'
  ],
  'Event': [
    '#自定义扩展',
    'Event.prototype.originalEvent',
    'Event.prototype.type',
    'Event.prototype.isMouseEvent',
    'Event.prototype.isKeyboardEvent',
    'Event.prototype.bubbles',
    'Event.prototype.target',
    'Event.prototype.relatedTarget',
    'Event.prototype.timeStamp',
    'Event.prototype.ctrlKey',
    'Event.prototype.altKey',
    'Event.prototype.shiftKey',
    'Event.prototype.metaKey',
    'Event.prototype.clientX',
    'Event.prototype.clientY',
    'Event.prototype.screenX',
    'Event.prototype.screenY',
    'Event.prototype.pageX',
    'Event.prototype.pageY',
    'Event.prototype.offsetX',
    'Event.prototype.offsetY',
    'Event.prototype.leftButton',
    'Event.prototype.middleButton',
    'Event.prototype.rightButton',
    'Event.prototype.wheelUp',
    'Event.prototype.wheelDown',
    'Event.prototype.which',
    '#DOM3',
    'Event.prototype.isPropagationStopped',
    'Event.prototype.isDefaultPrevented',
    'Event.prototype.isImmediatePropagationStopped',
    'Event.prototype.stopPropagation',
    'Event.prototype.preventDefault',
    'Event.prototype.stopImmediatePropagation'
  ],
  'Configurable': [
    '#可配置的',
    'Configurable',
    '#将此特性应用到目标对象',
    'Configurable.applyTo',
    '#具备此特性的对象即具备更改配置的能力',
    'Configurable.prototype.setConfig'
  ],
  'Observable': [
    '#可观察的',
    'Observable',
    '#将此特性应用到目标对象',
    'Observable.applyTo',
    '#具备此特性的对象即具备处理事件的能力',
    'Observable.prototype.on',
    'Observable.prototype.off',
    'Observable.prototype.fire'
  ],
  'Component': [
    '#组件构造器',
    'Component'
  ],
  'Animation': [
    'Animation',
    'Animation.prototype.addClip',
    'Animation.prototype.play',
    'Animation.prototype.reverse',
    'Animation.prototype.pause',
    'Animation.prototype.stop',
    'Animation.createBasicRenderer',
    'Animation.createStyleRenderer'
  ],
  'Request': [
    'Request',
    'Request.config',
    'Request.prototype.send',
    'Request.prototype.abort'
  ],
  'Switcher': [
    'Switcher',
    'Switcher.prototype.spliceItems',
    'Switcher.prototype.activate'
  ],
  'Widget': [
    'Widget.register',
    'Widget.parse'
  ],
  '多页标签面板': [
    'TABPANEL'
  ],
  'Slideshow': [
    'Slideshow',
    'Slideshow.config',
    'Slideshow.prototype.show'
  ],
  '模态对话框': [
    'DIALOG'
  ],
  'Paginator': [
    'Paginator',
    'Paginator.config',
    'Paginator.prototype.turn',
    'Paginator.prototype.render'
  ],
  'Calendar': [
    'Calendar',
    'Calendar.config',
    'Calendar.prototype.getElement',
    'Calendar.prototype.render'
  ]
};

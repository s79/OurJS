var manifest = {
  'Global': [
    'Global.typeOf',
    'Global.execScript'
  ],
  'Object': [
    'Object.forEach',
    'Object.clone',
    'Object.mixin',
    '=ES5=',
    'Object.keys'
  ],
  'Function': [
    '=ES5=',
    'Function#bind'
  ],
  'Array': [
    'Array.from',
    'Array#contains',
    'Array#remove',
    'Array#getFirst',
    'Array#getLast',
    '=ES5=',
    'Array.isArray',
    'Array#indexOf',
    'Array#lastIndexOf',
    'Array#every',
    'Array#some',
    'Array#forEach',
    'Array#map',
    'Array#filter'
//    'Array#reduce',
//    'Array#reduceRight'
  ],
  'String': [
    'String#clean',
    'String#camelize',
    'String#dasherize',
    '=ES5=',
    'String#trim',
    'String#toJSON',
    '=ES6=',
    'String#repeat',
    'String#startsWith',
    'String#endsWith',
    'String#contains',
    'String#toArray'
  ],
  'Boolean': [
    '=ES5=',
    'Boolean#toJSON'
  ],
  'Number': [
    'Number#padZero',
    '=ES5=',
    'Number#toJSON',
    '=ES6=',
    'Number.isFinite',
    'Number.isNaN',
    'Number.isInteger',
    'Number.toInteger'
  ],
  'Math': [
    'Math.limit',
    'Math.randomRange'
  ],
  'Date': [
    'Date.from',
    'Date#format',
    '=ES5=',
    'Date.now',
    'Date#toJSON'
  ],
  'RegExp': [
    'RegExp.escape'
  ],
  'JSON': [
    '=ES5=',
    'JSON.parse',
    'JSON.stringify'
  ],
  'navigator': [
    '=从 UA 中得到的结果(仅供参考)=',
    'navigator.userAgentInfo.engine',
    'navigator.userAgentInfo.name',
    'navigator.userAgentInfo.version',
    '=特性判断得到的结果(准确)=',
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
    'location.parameters'
  ],
  'cookie': [
    'cookie.getItem',
    'cookie.setItem',
    'cookie.removeItem'
  ],
  'localStorage': [
    '=HTML5=',
    'localStorage.getItem',
    'localStorage.setItem',
    'localStorage.removeItem',
    'localStorage.clear'
  ],
  'window': [
    '=获取和创建元素=',
    'window.$',
    '=获取视口信息=',
    'window.getClientSize',
    'window.getScrollSize',
    'window.getPageOffset',
    '=处理事件=',
    'window.on',
    'window.off',
    'window.fire'
  ],
  'document': [
    '=获取和创建元素=',
    'document.$',
    '=添加样式规则=',
    'document.addStyleRules',
    '=加载脚本=',
    'document.loadScript',
    '=预加载图片=',
    'document.preloadImages',
    '=处理事件=',
    'document.on',
    'document.off',
    'document.fire',
    '=HTML5=',
    'document.head'
  ],
  'Element': [
    '=处理类=',
    'Element#hasClass',
    'Element#addClass',
    'Element#removeClass',
    'Element#toggleClass',
    '=处理样式=',
    'Element#getStyle',
    'Element#getStyles',
    'Element#setStyle',
    'Element#setStyles',
    '=处理自定义数据=',
    'Element#getData',
    'Element#setData',
    'Element#removeData',
    '=获取坐标信息=',
    'Element#getClientRect',
    '=比较在文档树中的位置关系=',
    'Element#compareDocumentPosition',
    'Element#contains',
    '=获取相关元素=',
    'Element#find',
    'Element#getParent',
    'Element#getPreviousSibling',
    'Element#getNextSibling',
    'Element#getFirstChild',
    'Element#getLastChild',
    'Element#getChildren',
    'Element#getChildCount',
    '=克隆元素=',
    'Element#clone',
    '=修改内容或在文档树中的位置=',
    'Element#innerHTML',
    'Element#outerHTML',
    'Element#innerText',
    'Element#outerText',
    'Element#insertAdjacentHTML',
    'Element#insertAdjacentText',
    'Element#insertAdjacentElement',
    'Element#insertTo',
    'Element#swap',
    'Element#replace',
    'Element#remove',
    'Element#empty',
    '=处理事件=',
    'Element#on',
    'Element#off',
    'Element#fire',
    '=动画效果=',
    'Element#morph',
    'Element#highlight',
    'Element#fade',
    'Element#cancelAnimation'
  ],
  'HTMLFormElement': [
    'HTMLFormElement#getFieldValue',
    'HTMLFormElement#setValidationRules'
  ],
  'Event': [
    'Event#originalEvent',
    'Event#type',
    'Event#isMouseEvent',
    'Event#isKeyboardEvent',
    'Event#bubbles',
    'Event#target',
    'Event#relatedTarget',
    'Event#timeStamp',
    'Event#ctrlKey',
    'Event#altKey',
    'Event#shiftKey',
    'Event#metaKey',
    'Event#clientX',
    'Event#clientY',
    'Event#screenX',
    'Event#screenY',
    'Event#pageX',
    'Event#pageY',
    'Event#offsetX',
    'Event#offsetY',
    'Event#leftButton',
    'Event#middleButton',
    'Event#rightButton',
    'Event#wheelUp',
    'Event#wheelDown',
    'Event#which',
    '=DOM3=',
    'Event#isPropagationStopped',
    'Event#isDefaultPrevented',
    'Event#isImmediatePropagationStopped',
    'Event#stopPropagation',
    'Event#preventDefault',
    'Event#stopImmediatePropagation'
  ],
  'Observable': [
    'Observable',
    'Observable.applyTo',
    'Observable#on',
    'Observable#off',
    'Observable#fire'
  ],
  'Animation': [
    'Animation',
    'Animation#addClip',
    'Animation#play',
    'Animation#reverse',
    'Animation#pause',
    'Animation#stop',
    'Animation.createBasicRenderer',
    'Animation.createStyleRenderer'
  ],
  'Request': [
    'Request',
    'Request.options',
    'Request#send',
    'Request#abort'
  ],
  'Widget': [
    'Widget.register',
    'Widget.parse'
  ],
  '多页标签面板': [
    'TabPanel',
    'TabPanel#tabs',
    'TabPanel#panels',
    'TabPanel#activeTab',
    'TabPanel#activePanel',
    'TabPanel#activate'
  ],
  'Slideshow': [
    'Slideshow',
    'Slideshow.config',
    'Slideshow#show'
  ],
  '模态对话框': [
    'Dialog',
    'Dialog#isOpen',
    'Dialog#open',
    'Dialog#close',
    'Dialog#reposition'
  ],
  '分页导航条': [
    'Paginator',
    'Paginator#totalPage',
    'Paginator#currentPage',
    'Paginator#turn',
    'Paginator#update'
  ],
  '月历': [
    'Calendar',
    'Calendar#month',
    'Calendar#update'
  ],
  '日期选择器': [
    'DatePicker'
  ]
};

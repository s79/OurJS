var apiList = {
  'Global': [
    'Global.typeOf',
    'Global.execScript'
  ],
  'Object': [
    'Object.forEach',
    'Object.clone',
    'Object.mixin',
    'Object.toQueryString',
    'Object.fromQueryString',
    '=ES5=',
    'Object.keys'
  ],
  'Function': [
    '=ES5=',
    'Function#bind'
  ],
  'Array': [
    'Array.from',
    'Array#shuffle',
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
    'Date.parseExact',
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
    'navigator.userAgentInfo.engine',
    'navigator.userAgentInfo.name',
    'navigator.userAgentInfo.version',
    'navigator.languageCode',
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
    'window.$',
    'window.getClientSize',
    'window.getScrollSize',
    'window.getPageOffset'
  ],
  'document': [
    'document.$',
    'document.find',
    'document.findAll',
    'document.addStyleRules',
    'document.loadScript',
    'document.preloadImages',
    '=HTML5=',
    'document.head'
  ],
  'Element': [
    '=遍历文档树=',
    'Element#getParent',
    'Element#getPreviousSibling',
    'Element#getNextSibling',
    'Element#getFirstChild',
    'Element#getLastChild',
    'Element#getChildren',
    'Element#getChildCount',
    'Element#find',
    'Element#findAll',
    'Element#matchesSelector',
    '=修改文档树=',
    'Element#innerText',
    'Element#outerText',
    'Element#innerHTML',
    'Element#outerHTML',
    'Element#insertAdjacentText',
    'Element#insertAdjacentHTML',
    'Element#insertAdjacentElement',
    'Element#clone',
    'Element#insertTo',
    'Element#swap',
    'Element#replace',
    'Element#remove',
    'Element#empty',
    '=比较在文档树中的位置关系=',
    'Element#compareDocumentPosition',
    'Element#contains',
    '=获取坐标信息=',
    'Element#getClientRect',
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
    '=动画效果=',
    'Element#morph',
    'Element#highlight',
    'Element#fade',
    'Element#smoothScroll',
    'Element#cancelAnimation'
  ],
  'HTMLFormElement': [
    'HTMLFormElement#getFieldValue',
    'HTMLFormElement#serialize'
  ],
  'HTMLSelectElement': [
    'HTMLSelectElement#insertOption',
    'HTMLSelectElement#deleteOption'
  ],
  'DOMEventTarget': [
    'DOMEventTarget',
    'DOMEventTarget#on',
    'DOMEventTarget#off',
    'DOMEventTarget#fire'
  ],
  'DOMEvent': [
    'DOMEvent#originalEvent',
    'DOMEvent#type',
    'DOMEvent#target',
    'DOMEvent#timeStamp',
    'DOMEvent#bubbles',
    'DOMEvent#ctrlKey',
    'DOMEvent#altKey',
    'DOMEvent#shiftKey',
    'DOMEvent#metaKey',
    'DOMEvent#clientX',
    'DOMEvent#clientY',
    'DOMEvent#screenX',
    'DOMEvent#screenY',
    'DOMEvent#pageX',
    'DOMEvent#pageY',
    'DOMEvent#offsetX',
    'DOMEvent#offsetY',
    'DOMEvent#leftButton',
    'DOMEvent#middleButton',
    'DOMEvent#rightButton',
    'DOMEvent#relatedTarget',
    'DOMEvent#wheelUp',
    'DOMEvent#wheelDown',
    'DOMEvent#which',
    'DOMEvent#isPropagationStopped',
    'DOMEvent#isDefaultPrevented',
    'DOMEvent#isImmediatePropagationStopped',
    'DOMEvent#stopPropagation',
    'DOMEvent#preventDefault',
    'DOMEvent#stopImmediatePropagation'
  ],
  'JSEventTarget': [
    'JSEventTarget',
    'JSEventTarget.create',
    'JSEventTarget#on',
    'JSEventTarget#off',
    'JSEventTarget#fire'
  ],
  'JSEvent': [
    'JSEvent#type',
    'JSEvent#target'
  ],
  'Animation': [
    'Animation',
    'Animation.fps',
    'Animation.createBasicRenderer',
    'Animation.createStyleRenderer',
    'Animation.createScrollRenderer',
    'Animation#timePoint',
    'Animation#addClip',
    'Animation#play',
    'Animation#reverse',
    'Animation#pause'
  ],
  'Request': [
    'Request',
    'Request.options',
    'Request#ongoing',
    'Request#send',
    'Request#abort'
  ],
  'Widget': [
    'Widget.register',
    'Widget.parse'
  ],
  '标签面板': [
    'TabPanel',
    'TabPanel#tabs',
    'TabPanel#panels',
    'TabPanel#activeTab',
    'TabPanel#activePanel',
    'TabPanel#activate'
  ],
  '模态对话框': [
    'Dialog',
    'Dialog#isOpen',
    'Dialog#open',
    'Dialog#close',
    'Dialog#reposition'
  ],
  '幻灯片播放器': [
    'Slideshow',
    'Slideshow#slides',
    'Slideshow#pointers',
    'Slideshow#activeSlide',
    'Slideshow#activePointer',
    'Slideshow#show',
    'Slideshow#showPrevious',
    'Slideshow#showNext'
  ],
  '自动提词机': [
    'Autocue',
    'Autocue#addMessages'
  ],
  '滚动框': [
    'ScrollBox',
    'ScrollBox#update'
  ],
  '分页导航条': [
    'Paginator',
    'Paginator#currentPage',
    'Paginator#totalPages',
    'Paginator#update',
    'Paginator#turn'
  ],
  '月历': [
    'Calendar',
    'Calendar#month',
    'Calendar#update'
  ],
  '日期选择器': [
    'DatePicker'
  ],
  '表单验证器': [
    'Validator',
    'Validator#addValidationRules',
    'Validator#removeValidationRules'
  ]
};

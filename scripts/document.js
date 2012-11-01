//==================================================[buildSymbol]
/**
 * 生成一类对象的文档（同时生成列表和详细内容）。
 * @name buildSymbol
 * @function
 * @param {Element} $container 列表要插入的列。
 * @param {string} name 对象的名称。
 * @param {boolean} isBuiltIn 是否是内置对象（用来区分内置和可选对象）。
 */
var buildSymbol = function() {
//--------------------------------------------------[获取相关信息]
  // 获取 API 类型（构造函数、静态属性/方法或实例属性/方法）。
  var getCategory = function(symbol) {
    return symbol ? (symbol.isConstructor ? 'constructor' : (symbol.isStatic ? 'static' : 'instance')) : '';
  };

  // 获取值类型。
  var getType = function(symbol) {
    return symbol && symbol.type ? '<kbd>&lt;' + symbol.type + '&gt;</kbd>' : '';
  };

  // 获取语法。
  var getSyntax = function(symbol, name) {
    var syntax;
    if (symbol) {
      syntax = '';
      if (!symbol.isStatic) {
        name = name.replace('#', '.');
      }
      var parents = name.split('.');
      var symbolName = parents.pop();
      // Global 对象不在语法中显示。
      if (parents[0] === 'Global') {
        parents.shift();
      }
      // 列出其他的 namespace 或 instance。
      var lastIndex = parents.length - 1;
      parents.forEach(function(member, index) {
        if (index === lastIndex && !symbol.isStatic) {
          syntax += '<samp>' + member.camelize() + '</samp>.';
        } else {
          syntax += '<cite>' + member + '</cite>.';
        }
      });
      // 本对象的名称。
      syntax += '<dfn>' + symbolName + '</dfn>';
      // 生成函数对象的参数部分。
      if (symbol.isFunction) {
        var parameters = symbol.parameters;
        var optionalCount = 0;
        syntax += '(' + parameters.filter(
            function(parameter) {
              // 忽略选项中的参数。
              return !parameter.name.contains('.');
            }
        ).map(
            function(parameter, index) {
              var name = '<var>' + parameter.name + '</var>';
              var separator = index ? ', ' : '';
              if (parameter.isOptional) {
                name = '[' + separator + name;
                optionalCount++;
              } else {
                name = separator + name;
              }
              return name;
            }
        ).join('') + ']'.repeat(optionalCount) + ')';
      }
    } else {
      syntax = '<samp>' + name + '</samp> *';
    }
    return syntax;
  };

  // 获取短描述。
  var shortDescriptionPattern = /<p>(.*?)<\/p>/;
  var getShortDescription = function(symbol) {
    var shortDescription = '-';
    if (symbol) {
      var match = symbol.description.match(shortDescriptionPattern);
      if (match) {
        shortDescription = match[1];
      }
    }
    return shortDescription;
  };

  // 获取长描述。
  var getDescription = function(symbol) {
    return '<blockquote>' + (symbol ? symbol.description : '-') + '</blockquote>';
  };

  // 获取参数。
  var objectKeyPattern = /\.(\w+)/;
  var getParameters = function(symbol) {
    return symbol && symbol.parameters.length ?
        '<dl><dt>参数：</dt><dd><table>' + symbol.parameters.map(
            function(parameter) {
              return '<tr><td><kbd>&lt;' + parameter.type + '&gt;</kbd></td><td><var>' + parameter.name.replace(objectKeyPattern, '.<dfn>$1</dfn>') + (parameter.isOptional ? '<em>Optional</em>' : '') + '</var></td><td>' + parameter.description + '</td></tr>';
            }
        ).join('') + '</table></dd></dl>' :
        '';
  };

  // 获取返回值。
  var getReturns = function(symbol) {
    return symbol && symbol.returns.length ?
        '<dl><dt>返回值：</dt><dd><table>' + symbol.returns.map(
            function(returnValue) {
              return '<tr><td><kbd>&lt;' + returnValue.type + '&gt;</kbd></td><td>' + returnValue.description + '</td></tr>';
            }
        ).join('') + '</table></dd></dl>' :
        '';
  };

  // 获取属性（仅 Widget 可配置属性）。
  var getAttributes = function(symbol) {
    return symbol && symbol.attributes.length ?
        '<dl class="event"><dt>可配置项：</dt><dd><table>' + symbol.attributes.map(
            function(event) {
              return '<tr><td><dfn>' + event.name + '</dfn></td><td>' + event.description + '</td></tr>';
            }
        ).join('') + '</table></dd></dl>' :
        '';
  };

  // 获取可能触发的事件。
  var getFires = function(symbol) {
    return symbol && symbol.fires.length ?
        '<dl class="event"><dt>触发事件：</dt><dd><table>' + symbol.fires.map(
            function(event) {
              return '<tr><td><dfn>' + event.name + '</dfn></td><td>' + event.description + '</td></tr>';
            }
        ).join('') + '</table></dd></dl>' :
        '';
  };

  // 获取代码举例。
  var getExample = function(symbol) {
    return symbol && symbol.examples.length ?
        '<dl><dt>示例：</dt><dd>' + symbol.examples.map(
            function(example) {
              return '<pre class="prettyprint">' + example + '</pre>';
            }
        ).join('') + '</dd></dl>' :
        '';
  };

  // 获取需求内容。
  var getRequires = function(symbol) {
    return symbol && symbol.requires.length ?
        '<dl><dt>要求：</dt>' + symbol.requires.map(
            function(require) {
              return '<dd>' + require + '</dd>';
            }
        ).join('') + '</dl>' :
        '';
  };

  // 获取生效版本。
  var getSince = function(symbol) {
    return symbol && symbol.since ? '<dl><dt>在以下版本中加入：</dt><dd>' + symbol.since + '</dd></dl>' : '';
  };

  // 获取过期标识。
  var getDeprecated = function(symbol) {
    return symbol && symbol.deprecated ? '<dl><dt>已过期：</dt><dd>' + symbol.deprecated + '</dd></dl>' : '';
  };

  // 获取参考信息。
  var getSee = function(symbol) {
    return symbol && symbol.see.length ?
        '<dl><dt>请参阅：</dt>' + symbol.see.map(
            function(see) {
              return '<dd>' + see + '</dd>';
            }
        ).join('') + '</dl>' :
        '';
  };

//--------------------------------------------------[返回函数]
  return function($container, name, isBuiltIn) {
    // 本类对象的标题。
    var $indexFieldset = $('<fieldset' + (isBuiltIn ? '' : ' class="optional"') + '><legend><a href="#' + name.toLowerCase() + '"><dfn>' + name + '</dfn></a>' + (isBuiltIn ? '' : '<span>(可选)</span>') + '</legend></fieldset>');
    var $detailsDiv = $('<div id="' + name.toLowerCase() + '" class="details"><h1><dfn>' + name + '</dfn></h1></div>');
    if (!manifest[name]) {
      return;
    }
    // 本类对象包含的内容分组。
    var group = {
      constructor: '<h2>构造函数</h2>',
      methods: '<h2>方法</h2>',
      properties: '<h2>属性</h2>'
    };
    // 注解信息（可以作用于一类对象内的多个 API）。
    var comment = '';
    var lastGroupName;
    manifest[name].forEach(function(name) {
      if (name.startsWith('=') && name.endsWith('=')) {
        $('<h2>' + name.slice(1, -1) + '</h2>').insertTo($indexFieldset);
      } else {
        var symbol = apiData[name];
        var category = getCategory(symbol);
        // 语法和说明。
        $('<dl' + (category ? ' class="' + category + '"' : '') + '><dt><a href="#' + name.toLowerCase() + '">' + getSyntax(symbol, name) + '</a></dt><dd>' + getShortDescription(symbol) + '</dd></dl>').insertTo($indexFieldset);
        // 详细信息。
        var groupName = symbol ? (symbol.isFunction ? (symbol.isConstructor ? 'constructor' : 'methods') : 'properties') : '';
        if (groupName && groupName !== lastGroupName) {
          $(group[groupName]).insertTo($detailsDiv);
        }
        $('<div id="' + name.toLowerCase() + '" class="symbol">' + '<h3>' + (comment ? '<span class="comment' + ('ES5/ES6/HTML5/DOM3'.contains(comment) ? ' patch' : '') + '">' + comment + '</span>' : '') + '<span class="category">' + category + '</span>' + getType(symbol) + getSyntax(symbol, name) + '</h3>' + getDescription(symbol) + getParameters(symbol) + getReturns(symbol) + getAttributes(symbol) + getFires(symbol) + getRequires(symbol) + getSince(symbol) + getDeprecated(symbol) + getExample(symbol) + getSee(symbol) + '</div>').insertTo($detailsDiv);
        lastGroupName = groupName;
      }
    });
    $detailsDiv.insertTo($('#details'));
    $indexFieldset.insertTo($container);
  };

}();

//==================================================[buildDocument]
/**
 * 列出名单中的指定内容。
 * @name buildDocument
 * @function
 */
var buildDocument = function() {
//--------------------------------------------------[列表共有三列]
  var indexColumns = {
    a: $('#column_a'),
    b: $('#column_b'),
    c: $('#column_c')
  };

//--------------------------------------------------[生成各类对象的文档]
  $('<h1>JS 原生对象</h1>').insertTo(indexColumns.a);
  [
    'Global',
    'Object',
    'Function',
    'Array',
    'String',
    'Boolean',
    'Number',
    'Math',
    'Date',
    'RegExp',
    'JSON'
  ]
      .forEach(function(name) {
        buildSymbol(indexColumns.a, name, true);
      });
  $('<h1>浏览器内置对象</h1>').insertTo(indexColumns.a);
  [
    'navigator',
    'location',
    'cookie',
    'localStorage'
  ]
      .forEach(function(name) {
        buildSymbol(indexColumns.a, name, true);
      });
  $('<h1>DOM 对象</h1>').insertTo(indexColumns.b);
  [
    'window',
    'document',
    'Element',
    'HTMLFormElement',
    'Event'
  ]
      .forEach(function(name) {
        buildSymbol(indexColumns.b, name, true);
      });
  $('<h1>特性</h1>').insertTo(indexColumns.c);
  buildSymbol(indexColumns.c, 'Observable', true);
  $('<h1>动画</h1>').insertTo(indexColumns.c);
  buildSymbol(indexColumns.c, 'Animation', true);
  $('<h1>远程请求</h1>').insertTo(indexColumns.c);
  buildSymbol(indexColumns.c, 'Request', true);
  $('<h1>控件</h1>').insertTo(indexColumns.c);
  [
    'Widget'
  ]
      .forEach(function(name) {
        buildSymbol(indexColumns.c, name, true);
      });
  [
    '多页标签面板',
    'Slideshow',
    '模态对话框',
    '分页导航条',
    '月历',
    '日期选择器'
  ]
      .forEach(function(name) {
        buildSymbol(indexColumns.c, name, false);
      });

};

document.on('domready', function() {
//==================================================[API 细节层 - detailsLayer]
  var $html = $(document.documentElement);
  var $header = $('#header');
  var $content = $('#content');
  var $deatilsPanel = $('#details_container');
  var $detailsClose = $('#details_close');
  var $currentDetails;

  document.addStyleRules([
    '.widget-overlay { opacity: 0.05; filter: alpha(opacity=5); }'
  ]);

  // 获取滚动条宽度。
  var scrollbarWidth = function() {
    var $outer = $('<div></div>').setStyles({position: 'absolute', top: 0, left: -10000, width: 100, height: 100, overflow: 'scroll'});
    var $inner = $('<div></div>').setStyles({height: 200});
    $inner.insertTo($outer.insertTo(document.body));
    var width = 100 - $inner.offsetWidth;
    $outer.remove();
    return width;
  }();

  // 调整位置。
  var adjustDeatilsPanel = function() {
    var pinnedOffsetX = $content.getClientRect().left + 50;
    var clientSize = window.getClientSize();
    $deatilsPanel.setStyles({
      width: clientSize.width - pinnedOffsetX,
      height: clientSize.height
    });
    $detailsClose.setStyles({
      left: Math.max(710 - 20, clientSize.width - pinnedOffsetX - 55)
    });
    $deatilsPanel.offsetX = pinnedOffsetX;
  };

  // 使用对话框实现。
  $deatilsPanel
      .on('open', function() {
        // 按下 ESC 键或点击细节层外即关闭细节层。
        $html.on('keydown.deatilsPanel, mousedown.deatilsPanel', function(e) {
          if (e.isMouseEvent && !$deatilsPanel.contains(e.target) || e.which === 27) {
            detailsLayer.close();
          }
        });
        // 调整窗口尺寸的同时调整细节层的尺寸。
        window.on('resize.deatilsPanel', adjustDeatilsPanel);
      })
      .on('close', function() {
        if (!navigator.isIE6) {
          $header.setStyle('right', 0);
        }
        $html.setStyles({paddingRight: 0, overflow: ''});
        // 删除事件监听器。
        $html.off('keydown.deatilsPanel, mousedown.deatilsPanel');
        window.off('resize.deatilsPanel');
      });

  // 打开/关闭细节层，包裹对话框的方法。
  var detailsLayer = {
    open: function($target) {
      if (!this.isOpen) {
        $currentDetails = $target.hasClass('details') ? $target : $target.getParent();
        this.isOpen = true;
        var offsetY = window.getPageOffset().y;
        if (!navigator.isIE6) {
          $header.setStyle('right', scrollbarWidth);
        }
        $html.setStyles({paddingRight: scrollbarWidth, overflow: 'hidden'});
        adjustDeatilsPanel();
        $deatilsPanel.open();
        window.scrollTo(0, offsetY);
        // 打开时的向左移动的效果。
        var detailsPanelLeft = parseInt($deatilsPanel.getStyle('left'), 10);
        $deatilsPanel
            .setStyles({left: detailsPanelLeft + 30, opacity: 0})
            .morph({
              left: detailsPanelLeft, opacity: 1
            }, {
              duration: 150,
              onStart: function() {
                // 显示当前细节内容。
                $currentDetails.addClass('current');
              }
            });
      }
    },
    close: function() {
      if (this.isOpen) {
        this.isOpen = false;
        // 关闭时的向右移动的效果。
        var detailsPanelLeft = parseInt($deatilsPanel.getStyle('left'), 10);
        $deatilsPanel.morph({
          left: detailsPanelLeft + 15,
          opacity: 0
        }, {
          transition: 'easeIn',
          duration: 150,
          onFinish: function() {
            // 取消当前细节内容。
            $currentDetails.removeClass('current');
            $currentDetails = null;
            var offsetY = window.getPageOffset().y;
            $deatilsPanel.close();
            window.scrollTo(0, offsetY);
          }
        });
      }
    },
    isOpen: false
  };

  // 点击关闭按钮关闭细节层。
  $detailsClose.on('click', function() {
    detailsLayer.close();
    return false;
  });

//==================================================[输出文档]
  buildDocument();

  // 点击 API 条目，进入细节页的对应位置。
  $content.on('click:relay(a)', function() {
    var href = this.href;
    var id = href.slice(href.indexOf('#'));
    var $target = $(id);
    detailsLayer.open($target);
    var scrollTop = $deatilsPanel.scrollTop;
    var top = $target.getClientRect().top + scrollTop;
    $deatilsPanel.scrollTop = scrollTop + ((top - 50) - scrollTop);
    $target.getFirstChild().highlight('yellow', 'backgroundColor', {delay: 150, duration: 1000});
    return false;
  });

  // 如果指定了 hash，则直达细节页的对应位置。
//    if (location.hash) {
//      detailsLayer.open($target);
//      var $target = $(location.hash);
//      if ($target) {
//        $target.scrollIntoView();
//      }
//    }

  // 是否在索引页显示短描述。
  function showShortDescription(show) {
    $content[show ? 'addClass' : 'removeClass']('show_short_description');
  }

  var $shortDescription = $('#short_description').on('change', function() {
    showShortDescription(this.checked);
    localStorage.setItem('showShortDescription', this.checked);
  });

  if (localStorage.getItem('showShortDescription') === 'true') {
    showShortDescription(true);
    $shortDescription.checked = true;
  }

  // 代码高亮。
  prettyPrint();

});

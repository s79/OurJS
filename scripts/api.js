document.on('domready', function() {
  var $content = $('#content');
  var $details = $('#details');

//==================================================[创建 API 文档]
  function buildAPIReference() {
//--------------------------------------------------[格式化 API 信息并注入页面]
    // 获取 API 类型（构造函数、静态属性/方法或实例属性/方法）。
    function getCategory(symbol) {
      return symbol ? symbol.category : '';
    }

    // 获取值类型。
    function getType(symbol) {
      return symbol && symbol.type ? '<kbd>&lt;' + symbol.type + '&gt;</kbd>' : '';
    }

    // 获取语法。
    function getSyntax(symbol, name) {
      var syntax;
      if (symbol) {
        syntax = '';
        if (symbol.category !== 'static') {
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
          if (index === lastIndex && symbol.category !== 'static') {
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
    }

    // 获取短描述。
    function getShortDescription(symbol) {
      var shortDescription = '-';
      if (symbol) {
        var match = symbol.description.match(/<p>(.*?)<\/p>/);
        if (match) {
          shortDescription = match[1];
        }
      }
      return shortDescription;
    }

    // 获取长描述。
    function getDescription(symbol) {
      return '<blockquote>' + (symbol ? symbol.description : '-') + '</blockquote>';
    }

    // 获取参数。
    function getParameters(symbol) {
      return symbol && symbol.parameters.length ?
          '<dl><dt>参数：</dt><dd><table>' + symbol.parameters.map(
              function(parameter) {
                return '<tr><td><kbd>&lt;' + parameter.type + '&gt;</kbd></td><td><var>' + parameter.name.replace(/\.(\w+)/, '.<dfn>$1</dfn>') + (parameter.isOptional ? '<em>Optional</em>' : '') + '</var></td><td>' + parameter.description + '</td></tr>';
              }
          ).join('') + '</table></dd></dl>' :
          '';
    }

    // 获取返回值。
    function getReturns(symbol) {
      return symbol && symbol.returns.length ?
          '<dl><dt>返回值：</dt><dd><table>' + symbol.returns.map(
              function(returnValue) {
                return '<tr><td><kbd>&lt;' + returnValue.type + '&gt;</kbd></td><td>' + returnValue.description + '</td></tr>';
              }
          ).join('') + '</table></dd></dl>' :
          '';
    }

    // 获取属性（仅 Widget 可配置属性）。
    function getAttributes(symbol) {
      return symbol && symbol.attributes.length ?
          '<dl class="event"><dt>可配置项：</dt><dd><table>' + symbol.attributes.map(
              function(event) {
                return '<tr><td><dfn>' + event.name + '</dfn></td><td>' + event.description + '</td></tr>';
              }
          ).join('') + '</table></dd></dl>' :
          '';
    }

    // 获取可能触发的事件。
    function getFires(symbol) {
      return symbol && symbol.fires.length ?
          '<dl class="event"><dt>触发事件：</dt><dd><table>' + symbol.fires.map(
              function(event) {
                return '<tr><td><dfn>' + event.name + '</dfn></td><td>' + event.description + '</td></tr>';
              }
          ).join('') + '</table></dd></dl>' :
          '';
    }

    // 获取代码举例。
    function getExample(symbol) {
      return symbol && symbol.examples.length ?
          '<dl><dt>示例：</dt><dd>' + symbol.examples.map(
              function(example) {
                return '<pre>' + example + '</pre>';
              }
          ).join('') + '</dd></dl>' :
          '';
    }

    // 获取需求内容。
    function getRequires(symbol) {
      return symbol && symbol.requires.length ?
          '<dl><dt>要求：</dt>' + symbol.requires.map(
              function(require) {
                return '<dd>' + require + '</dd>';
              }
          ).join('') + '</dl>' :
          '';
    }

    // 获取生效版本。
    function getSince(symbol) {
      return symbol && symbol.since ? '<dl><dt>在以下版本中加入：</dt><dd>' + symbol.since + '</dd></dl>' : '';
    }

    // 获取过期标识。
    function getDeprecated(symbol) {
      return symbol && symbol.deprecated ? '<dl><dt>已过期：</dt><dd>' + symbol.deprecated + '</dd></dl>' : '';
    }

    // 获取参考信息。
    function getSee(symbol) {
      return symbol && symbol.see.length ?
          '<dl><dt>请参阅：</dt>' + symbol.see.map(
              function(see) {
                return '<dd>' + see + '</dd>';
              }
          ).join('') + '</dl>' :
          '';
    }

    // 生成一类对象的文档（同时生成列表和详细内容）。
    function buildSymbol($container, name, isBuiltIn) {
      // 本类对象的标题。
      var $indexFieldset = $('<fieldset' + (isBuiltIn ? '' : ' class="optional"') + '><legend><a href="#' + name.toLowerCase() + '"><dfn>' + name + '</dfn></a>' + (isBuiltIn ? '' : '<span>(可选)</span>') + '</legend></fieldset>');
      var $detailsContent = $('<div id="' + name.toLowerCase() + '" class="details"><h1><dfn>' + name + '</dfn></h1></div>');
      if (!apiList[name]) {
        return;
      }
      // 本类对象包含的内容分组。
      var group = {
        constructor: '<h2>构造函数</h2>',
        methods: '<h2>方法</h2>',
        properties: '<h2>属性</h2>'
      };
      // 注解信息（可以作用于一类对象内的多个 API）。
      var comment = '自定义扩展';
      var lastGroupName;
      apiList[name].forEach(function(name) {
        if (name.startsWith('=') && name.endsWith('=')) {
          comment = name.slice(1, -1);
          $('<h2>' + comment + '</h2>').insertTo($indexFieldset);
        } else {
          var symbol = apiData[name];
          var category = getCategory(symbol);
          // 语法和说明。
          $('<dl' + (category ? ' class="' + category + '"' : '') + '><dt><a href="#' + name.toLowerCase() + '">' + getSyntax(symbol, name) + '</a></dt><dd>' + getShortDescription(symbol) + '</dd></dl>').insertTo($indexFieldset);
          // 详细信息。
          var groupName = symbol ? (symbol.isFunction ? (symbol.category === 'constructor' ? 'constructor' : 'methods') : 'properties') : '';
          if (groupName && groupName !== lastGroupName) {
            $(group[groupName]).insertTo($detailsContent);
          }
          $('<div id="' + name.toLowerCase() + '" class="symbol">' + '<h3>' + (comment ? '<span class="comment' + ('ES5/ES6/HTML5'.contains(comment) ? ' patch' : '') + '">' + comment + '</span>' : '') + '<span class="category">' + category + '</span>' + getType(symbol) + getSyntax(symbol, name) + '</h3>' + getDescription(symbol) + getParameters(symbol) + getReturns(symbol) + getAttributes(symbol) + getFires(symbol) + getRequires(symbol) + getSince(symbol) + getDeprecated(symbol) + getExample(symbol) + getSee(symbol) + '</div>').insertTo($detailsContent);
          lastGroupName = groupName;
        }
      });
      $detailsContent.insertTo($details);
      $indexFieldset.insertTo($container);
    }

//--------------------------------------------------[分三列注入]
    var indexColumns = {
      a: $('#column_a'),
      b: $('#column_b'),
      c: $('#column_c')
    };

    $('<h1>JS Native Objects</h1>').insertTo(indexColumns.a);
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
    $('<h1>Browser Built-in Objects</h1>').insertTo(indexColumns.a);
    [
      'navigator',
      'location',
      'cookie',
      'localStorage'
    ]
        .forEach(function(name) {
          buildSymbol(indexColumns.a, name, true);
        });
    $('<h1>Document Object</h1>').insertTo(indexColumns.b);
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
    $('<h1>Features</h1>').insertTo(indexColumns.c);
    buildSymbol(indexColumns.c, 'Observable', true);
    $('<h1>Animation</h1>').insertTo(indexColumns.c);
    buildSymbol(indexColumns.c, 'Animation', true);
    $('<h1>Request</h1>').insertTo(indexColumns.c);
    buildSymbol(indexColumns.c, 'Request', true);
    $('<h1>Widgets</h1>').insertTo(indexColumns.c);
    [
      'Widget'
    ]
        .forEach(function(name) {
          buildSymbol(indexColumns.c, name, true);
        });
    [
      '多页标签面板',
      '模态对话框',
      '幻灯片播放器',
      '自动提词机',
      '滚动框',
      '分页导航条',
      '月历',
      '日期选择器',
      '表单验证器'
    ]
        .forEach(function(name) {
          buildSymbol(indexColumns.c, name, false);
        });

  }

//==================================================[创建 API 细节面板]
  function createDeatilsPanel() {
    var $html = $(document.documentElement);
    var $header = $('#header');
    var $content = $('#content');
    var $panel = $('#details_panel');
    var $close = $('#details_close');
    var $currentSymbol;
    var scrollbarWidth = function() {
      var $outer = $('<div></div>').setStyles({position: 'absolute', top: 0, left: -10000, width: 100, height: 100, overflow: 'scroll'});
      var $inner = $('<div></div>').setStyles({height: 200});
      $inner.insertTo($outer.insertTo(document.body));
      var width = 100 - $inner.offsetWidth;
      $outer.remove();
      return width;
    }();

    // 降低遮盖层透明度。
    document.addStyleRules([
      '.widget-overlay { opacity: 0.05; filter: alpha(opacity=5); }'
    ]);

    // 使用对话框实现，扩展对话框的方法。
    $panel.show = function($target) {
      if (!$panel.isOpen) {
        // 打开时的向左移动的效果。
        $panel
            .setStyles({marginLeft: 30, opacity: 0})
            .morph({
              marginLeft: 0,
              opacity: 1
            }, {
              duration: 150,
              onStart: function() {
                // 显示当前细节内容。
                $currentSymbol = ($target.hasClass('details') ? $target : $target.getParent()).addClass('current');
                // 隐藏页面滚动条。
                if (!navigator.isIE6) {
                  $header.setStyle('right', scrollbarWidth);
                }
                $html.setStyles({paddingRight: scrollbarWidth, overflow: 'hidden'});
                // 打开对话框。
                $panel.open();
                // 触发 show 事件。
                $panel.fire('show');
              }
            });
        // 按下 ESC 键或点击细节面板外即关闭细节面板。
        $html.on('keydown.deatilsPanel, mousedown.deatilsPanel', function(e) {
          if (e.type === 'mousedown' && !$panel.contains(e.target) || e.which === 27) {
            $panel.hide();
          }
        });
      }
    };
    $panel.hide = function() {
      if ($panel.isOpen) {
        // 关闭时的向右移动的效果。
        $panel.morph({
          marginLeft: 15,
          opacity: 0
        }, {
          transition: 'easeIn',
          duration: 150,
          onFinish: function() {
            // 取消当前细节内容。
            $currentSymbol.removeClass('current');
            $currentSymbol = null;
            // 显示页面滚动条。
            if (!navigator.isIE6) {
              $header.setStyle('right', 0);
            }
            $html.setStyles({paddingRight: 0, overflow: ''});
            // 关闭对话框。
            $panel.close();
            // 触发 hide 事件。
            $panel.fire('hide');
          }
        });
        // 删除事件监听器。
        $html.off('keydown.deatilsPanel, mousedown.deatilsPanel');
        window.off('resize.deatilsPanel');
      }
    };

    // 定位细节面板。
    $panel
        .on('reposition', function() {
          var left = $content.getClientRect().left + 50;
          var clientSize = window.getClientSize();
          $panel.setStyles({
            left: left,
            width: clientSize.width - left,
            height: clientSize.height
          });
          $close.setStyles({
            left: Math.max(710 - 20, clientSize.width - left - 55)
          });
        });

    // 点击关闭按钮关闭细节面板。
    $close.on('click', function() {
      $panel.hide();
      return false;
    });

    // 返回细节面板供外部调用。
    return $panel;

  }

//==================================================[初始化页面]
  // 创建 API 文档。
  buildAPIReference();

  // 代码高亮。
  $details.find('pre').forEach(function($pre) {
    $pre.addClass('prettyprint');
  });
  prettyPrint();

  // 创建 API 细节面板。
  var $deatilsPanel = createDeatilsPanel();

  // 点击 API 条目，进入细节页的对应位置。
  $content.on('click:relay(a)', function() {
    var href = this.href;
    var id = href.slice(href.indexOf('#'));
    var $target = $(id);
    $deatilsPanel.show($target);
    var scrollTop = $deatilsPanel.scrollTop;
    var top = $target.getClientRect().top + scrollTop;
    $deatilsPanel.scrollTop = scrollTop + ((top - 50) - scrollTop);
    $target.getFirstChild().highlight('yellow', 'backgroundColor', {delay: 150, duration: 1000});
    return false;
  });

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

  // 如果指定了 hash，则直达细节页的对应位置。
//    if (location.hash) {
//      var $target = $(location.hash);
//      if ($target) {
//        detailsLayer.open($target);
//        $target.scrollIntoView();
//      }
//    }

});

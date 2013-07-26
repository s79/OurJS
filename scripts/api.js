document.on('domready', function() {
  var $content = $('#content');

//--------------------------------------------------[创建 API 细节面板]
  var $deatilsPanel = function() {
    var $html = $(document.documentElement);
    var $header = $('#header');
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
      'div.widget-overlay { opacity: 0.05; filter: alpha(opacity=5); }'
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
        // 高亮指定的条目。
        $panel.scrollTop = $panel.scrollTop + $target.getClientRect().top - 50;
        $target.getFirstChild().highlight('yellow', 'backgroundColor', {delay: 150, duration: 1000});
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
    $panel.on('reposition', function() {
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

    // 返回细节面板。
    return $panel;

  }();

//--------------------------------------------------[创建 API 文档]
  (function() {
    // 获取分段后的描述信息。
    var parseParagraphs = function(text) {
      if (typeof text === 'string') {
        text = text.split('\n');
      }
      var result = '';
      var hasList = false;
      text.forEach(
          function(line, index) {
            if (line.startsWith('*')) {
              if (!hasList) {
                result += '<ul>';
                hasList = true;
              }
              result += (index ? '</li>' : '') + '<li>' + line.slice(2);
            } else {
              if (hasList) {
                result += '<br>' + line;
              } else {
                result += line.startsWith('<') || line.endsWith('>') ? line : '<p>' + line + '</p>';
              }
            }
          }
      );
      if (hasList) {
        result += '</li></ul>';
      }
      return result;
    };

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
          var parameters = symbol.parameters || [];
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
      return  symbol ? symbol.description.split('\n')[0].trim() : '-';
    }

    var additionalDescriptions = ['启用方式', '结构约定', '新增行为', '默认样式', '可配置项'];
    // 获取长描述。
    function getDescription(symbol) {
      var description = [];
      var additional = [
        [],
        [],
        [],
        [],
        []
      ];
      var target = description;
      if (symbol) {
        symbol.description.split('\n').forEach(function(line) {
          line = line.trim();
          var type = additionalDescriptions.indexOf(line);
          if (type > -1) {
            target = additional[type];
          } else {
            target.push(line);
          }
        });
        return '<blockquote>' + parseParagraphs(description) + '</blockquote>'
            .concat(
                additional[0].length ? '<dl><dt>启用方式</dt><dd>' + parseParagraphs(additional[0]) + '</dd></dl>' : ''
            )
            .concat(
                additional[1].length ? '<dl><dt>结构约定</dt><dd>' + parseParagraphs(additional[1]) + '</dd></dl>' : ''
            )
            .concat(
                additional[2].length ? '<dl><dt>新增行为</dt><dd>' + parseParagraphs(additional[2]) + '</dd></dl>' : ''
            )
            .concat(
                additional[3].length ? '<dl><dt>默认样式</dt><dd><pre class="lang-css">' + additional[3].join('\n') + '</pre></dd></dl>' : ''
            )
            .concat(
                additional[4].length ? '<dl><dt>可配置项</dt><dd>' +
                    (function() {
                      var text = '';
                      additional[4].forEach(
                          function(line, index) {
                            if (/^[\w-]+$/.test(line)) {
                              text += (index ? '</td></tr>' : '') + '<tr><td><dfn>' + line + '</dfn></td><td>';
                            } else {
                              text += '<p>' + line + '</p>';
                            }
                          }
                      );
                      return '<table>' + text + '</td></tr></table>';
                    })() +
                    '</dd></dl>' : ''
            );
      } else {
        return '<blockquote><p>-</p></blockquote>';
      }
    }

    // 获取参数。
    function getParameters(symbol) {
      return symbol && symbol.parameters && symbol.parameters.length ?
          '<dl><dt>参数：</dt><dd><table>' + symbol.parameters.map(
              function(parameter) {
                return '<tr><td><kbd>&lt;' + parameter.type + '&gt;</kbd></td><td><var>' + parameter.name.replace(/\.(\w+)/, '.<dfn>$1</dfn>') + (parameter.isOptional ? '<em>Optional</em>' : '') + '</var></td><td>' + parseParagraphs(parameter.description) + '</td></tr>';
              }
          ).join('') + '</table></dd></dl>' :
          '';
    }

    // 获取返回值。
    function getReturns(symbol) {
      return symbol && symbol.returns && symbol.returns.length ?
          '<dl><dt>返回值：</dt><dd><table>' + symbol.returns.map(
              function(returnValue) {
                return '<tr><td><kbd>&lt;' + returnValue.type + '&gt;</kbd></td><td>' + parseParagraphs(returnValue.description) + '</td></tr>';
              }
          ).join('') + '</table></dd></dl>' :
          '';
    }

    // 获取可能触发的事件。
    function getFires(symbol) {
      return symbol && symbol.fires && symbol.fires.length ?
          '<dl><dt>触发事件：</dt><dd><table>' + symbol.fires.map(
              function(e) {
                return '<tr><td><dfn>' + e.name + '</dfn></td><td>' +
                    (function() {
                      var description = '';
                      var propertiesList = '';
                      e.description.split('\n').forEach(
                          function(line, index) {
                            var match;
                            if (match = line.match(/^\{([\?\w\|]+)\}\s(\w+)\s(.*)$/)) {
                              propertiesList += '<tr><td><kbd>&lt;' + match[1] + '&gt;</kbd></td><td><dfn><var>event</var>.' + match[2] + '</dfn></td><td>' + match[3] + '</td></tr>';
                            } else {
                              description += '<p>' + line + '</p>';
                            }
                          }
                      );
                      return description + (propertiesList ? '<table>' + propertiesList + '</table>' : '');
                    })() +
                    '</td></tr>';
              }
          ).join('') + '</table></dd></dl>' :
          '';
    }

    // 获取代码举例。
    function getExample(symbol) {
      return symbol && symbol.examples && symbol.examples.length ?
          '<dl><dt>示例：</dt><dd>' + symbol.examples.map(
              function(example) {
                return '<pre>' + example + '</pre>';
              }
          ).join('') + '</dd></dl>' :
          '';
    }

    // 获取需求内容。
    function getRequires(symbol) {
      return symbol && symbol.requires && symbol.requires.length ?
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
      return symbol && symbol.see && symbol.see.length ?
          '<dl><dt>请参阅：</dt>' + symbol.see.map(
              function(see) {
                return '<dd><a href="' + see + '" target="_blank" class="link">' + see + '</a></dd>';
              }
          ).join('') + '</dl>' :
          '';
    }

    // 生成每个对象的文档。
    var groupNames = {
      constructor: '<h2>构造函数</h2>',
      methods: '<h2>方法</h2>',
      properties: '<h2>属性</h2>'
    };
    var $details = $('#details');
    var buildSymbol = function($container, name) {
      // 所有 Widget 的名称均为中文，可以根据这一点来判断当前处理的对象是否为 Widget 对象。
      var isWidget = !apiData.hasOwnProperty(name);
      var id = encodeURIComponent(name.toLowerCase());
      // 本对象的组列表。
      var $indexFieldset = $('<fieldset' + (isWidget ? ' class="widget"' : '') + '><legend><a href="#' + id + '"><dfn>' + name + '</dfn></a></legend></fieldset>').insertTo($container);
      // 本对象的详细信息。
      var $detailsContent = $('<div id="' + id + '" class="details"><h1><dfn>' + name + '</dfn></h1></div>').insertTo($details);
      // 本对象的文档可能是缺失的。
      if (!apiList[name]) {
        return;
      }
      // 注解信息（可以作用于一类对象内的多个 API）。
      var comment = '自定义扩展';
      var lastType;
      apiList[name].forEach(function(name) {
        if (name.startsWith('=') && name.endsWith('=')) {
          comment = name.slice(1, -1);
          $('<h2>' + comment + '</h2>').insertTo($indexFieldset);
        } else {
          var id = name.toLowerCase().replace('#', '.');
          var symbol = apiData[name];
          // 语法和说明。
          var category = getCategory(symbol);
          var syntax = isWidget && !id.contains('.') ? '<dfn>' + name + '</dfn>' : getSyntax(symbol, name);
          $('<dl' + (category ? ' class="' + category + '"' : '') + '><dt><a href="#' + id + '">' + syntax + '</a></dt><dd>' + getShortDescription(symbol) + '</dd></dl>').insertTo($indexFieldset);
          // 详细信息。
          var type = symbol ? (symbol.isFunction ? (symbol.category === 'constructor' ? 'constructor' : 'methods') : 'properties') : '';
          if (type && type !== lastType) {
            if (!isWidget || type !== 'constructor') {
              $(groupNames[type]).insertTo($detailsContent);
            }
          }
          lastType = type;
          $('<div id="' + id + '" class="symbol">' + '<h3>' + (comment ? '<span class="comment' + ('ES5/ES6/HTML5'.contains(comment) ? ' patch' : '') + '">' + comment + '</span>' : '') + '<span class="category">' + (isWidget && category === 'constructor' ? '' : category) + '</span>' + getType(symbol) + syntax + '</h3>' + getDescription(symbol) + getParameters(symbol) + getReturns(symbol) + getFires(symbol) + getRequires(symbol) + getSince(symbol) + getDeprecated(symbol) + getExample(symbol) + getSee(symbol) + '</div>').insertTo($detailsContent);
        }
      });
    };

    // 分三列注入。
    var columns = $content.findAll('div.column');
    $('<h1>JS Native Objects</h1>').insertTo(columns[0]);
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
          buildSymbol(columns[0], name);
        });
    $('<h1>Browser Built-in Objects</h1>').insertTo(columns[0]);
    [
      'navigator',
      'location',
      'cookie',
      'localStorage'
    ]
        .forEach(function(name) {
          buildSymbol(columns[0], name);
        });
    $('<h1>DOM Objects</h1>').insertTo(columns[1]);
    [
      'window',
      'document',
      'Element',
      'HTMLFormElement',
      'HTMLSelectElement'
    ]
        .forEach(function(name) {
          buildSymbol(columns[1], name);
        });
    $('<h1>DOM Event Module</h1>').insertTo(columns[1]);
    [
      'DOMEventTarget',
      'DOMEvent'
    ]
        .forEach(function(name) {
          buildSymbol(columns[1], name);
        });
    $('<h1>JS Event Module</h1>').insertTo(columns[2]);
    [
      'JSEventTarget',
      'JSEvent'
    ]
        .forEach(function(name) {
          buildSymbol(columns[2], name);
        });
    $('<h1>Animation</h1>').insertTo(columns[2]);
    buildSymbol(columns[2], 'Animation');
    $('<h1>Request</h1>').insertTo(columns[2]);
    buildSymbol(columns[2], 'Request');
    $('<h1>Widgets</h1>').insertTo(columns[2]);
    [
      'Widget'
    ]
        .forEach(function(name) {
          buildSymbol(columns[2], name);
        });

  })();

//--------------------------------------------------[页面其他功能]
  // 代码高亮。
  document.findAll('pre').forEach(function($pre) {
    $pre.addClass('prettyprint');
  });
  prettyPrint();

  // 点击 API 条目，进入细节页的对应位置。
  $content.on('click:relay(a)', function() {
    var href = this.href;
    $deatilsPanel.show(document.getElementById(href.slice(href.indexOf('#') + 1)));
    return false;
  });

  // 是否在索引页显示短描述。
  var $shortDescription = $('#short_description').on('change', function() {
    $content[this.checked ? 'addClass' : 'removeClass']('show_short_description');
    localStorage.setItem('showShortDescription', this.checked);
  });
  $shortDescription.checked = localStorage.getItem('showShortDescription') === 'true';
  $shortDescription.fire('change');

  // 如果指定了 hash，则直达细节页的对应位置。
//  if (location.hash) {
//    var $target = document.find('a[href$=' + location.hash + ']');
//    if ($target) {
//      setTimeout(function() {
//        $target.click();
//      });
//    }
//  }

});

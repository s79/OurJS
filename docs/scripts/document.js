execute(function($) {
  var $html = $(document.documentElement);
  var $content = $('#content');
  var indexColumns = {
    a: $('#column_a'),
    b: $('#column_b'),
    c: $('#column_c')
  };
  var $deatilsPanel = $('#details_container');
  var $details = $('#details');
  var $detailsClose = $('#details_close');

//==================================================[API 参考]
  declareModule('reference', function(listen, notify) {
//--------------------------------------------------[getCategory]
    var getCategory = function(symbol) {
      return symbol ? (symbol.isConstructor ? 'constructor' : (symbol.isStatic ? 'static' : 'instance')) : '';
    };

//--------------------------------------------------[getType]
    var getType = function(symbol) {
      return symbol && symbol.type ? '<kbd>&lt;' + symbol.type + '&gt;</kbd>' : '';
    };

//--------------------------------------------------[getSyntax]
    var getSyntax = function(symbol, name) {
      var syntax;
      if (symbol) {
        syntax = '';
        if (!symbol.isStatic) {
          name = name.replace('.prototype.', '.');
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
            syntax += '<samp>' + member.toLowerCase() + '</samp>.';
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
        syntax = '<em>' + name + '</em> *';
      }
      return syntax;
    };

//--------------------------------------------------[getShortDescription]
    var getShortDescription = function(symbol) {
      var shortDescription = '-';
      if (symbol) {
        var index = symbol.description.indexOf('<br>');
        shortDescription = symbol.description.slice(0, index === -1 ? undefined : index);
      }
      return shortDescription;
    };

//--------------------------------------------------[getDescription]
    var getDescription = function(symbol) {
      return '<blockquote>' + (symbol ? symbol.description : '-') + '</blockquote>';
    };

//--------------------------------------------------[getParameters]
    var getParameters = function(symbol) {
      return symbol && symbol.parameters.length ?
          '<dl><dt>参数：</dt><dd><table>' + symbol.parameters.map(
              function(parameter) {
                return '<tr><td><kbd>&lt;' + parameter.type + '&gt;</kbd></td><td><dfn>' + parameter.name.replace('options.', '<var>options.</var>') + (parameter.isOptional ? '<em>Optional</em>' : '') + '</dfn></td><td>' + parameter.description + '</td></tr>';
              }
          ).join('') + '</table></dd></dl>' :
          '';
    };

//--------------------------------------------------[getReturns]
    var getReturns = function(symbol) {
      return symbol && symbol.returns.length ?
          '<dl><dt>返回值：</dt><dd><table>' + symbol.returns.map(
              function(returnValue) {
                return '<tr><td><kbd>&lt;' + returnValue.type + '&gt;</kbd></td><td>' + returnValue.description + '</td></tr>';
              }
          ).join('') + '</table></dd></dl>' :
          '';
    };

//--------------------------------------------------[getFires]
    var getFires = function(symbol) {
      return symbol && symbol.fires.length ?
          '<dl class="event"><dt>触发事件：</dt><dd><table>' + symbol.fires.map(
              function(event) {
                return '<tr><td><dfn>' + event.name + '</dfn></td><td>' + event.description + '</td></tr>';
              }
          ).join('') + '</table></dd></dl>' :
          '';
    };

//--------------------------------------------------[getRequires]
    var getRequires = function(symbol) {
      return symbol && symbol.requires.length ?
          '<dl><dt>要求：</dt>' + symbol.requires.map(
              function(require) {
                return '<dd>' + require + '</dd>';
              }
          ).join('') + '</dl>' :
          '';
    };

//--------------------------------------------------[getSince]
    var getSince = function(symbol) {
      return symbol && symbol.since ? '<dl><dt>在以下版本中加入：</dt><dd>' + symbol.since + '</dd></dl>' : '';
    };

//--------------------------------------------------[getDeprecated]
    var getDeprecated = function(symbol) {
      return symbol && symbol.deprecated ? '<dl><dt>已过期：</dt><dd>' + symbol.deprecated + '</dd></dl>' : '';
    };

//--------------------------------------------------[getExample]
    var getExample = function(symbol) {
      return symbol && symbol.examples.length ?
          '<dl><dt>示例：</dt><dd>' + symbol.examples.map(
              function(example) {
                return '<pre class="prettyprint">' + example + '</pre>';
              }
          ).join('') + '</dd></dl>' :
          '';
    };

//--------------------------------------------------[getSee]
    var getSee = function(symbol) {
      return symbol && symbol.see.length ?
          '<dl><dt>请参阅：</dt>' + symbol.see.map(
              function(see) {
                return '<dd>' + see + '</dd>';
              }
          ).join('') + '</dl>' :
          '';
    };

//--------------------------------------------------[getAuthor]
//    var getAuthor = function(symbol) {
//      return symbol && symbol.author ? '<dl><dt>Author:</dt><dd>' + symbol.author + '</dd></dl>' : '';
//    };

//--------------------------------------------------[生成一类对象的文档]
    // 同时生成索引文档和细节文档，side 参数仅供索引文档使用。
    var buildDocument = function(name, side) {
      // 本类对象的标题。
      var $indexFieldset = $('<fieldset><legend><a href="#' + name.toLowerCase() + '"><dfn>' + name + '</dfn></a></legend></fieldset>');
      var $detailsDiv = $('<div id="' + name.toLowerCase() + '"><h1><dfn>' + name + '</dfn></h1></div>');
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
        if (name.startsWith('#')) {
          comment = name.slice(1);
          $indexFieldset.append($('<h2>' + comment + '</h2>'));
        } else {
          var symbol = apiData[name];
          var category = getCategory(symbol);
          // 语法和说明。
          $indexFieldset.append($('<dl' + (category ? ' class="' + category + '"' : '') + '><dt><a href="#' + name.toLowerCase() + '">' + getSyntax(symbol, name) + '</a></dt><dd>' + getShortDescription(symbol) + '</dd></dl>'));
          // 详细信息。
          var groupName = symbol ? (symbol.isFunction ? (symbol.isConstructor ? 'constructor' : 'methods') : 'properties') : '';
          if (groupName && groupName !== lastGroupName) {
            $detailsDiv.append($(group[groupName]));
          }
          $detailsDiv.append($('<div id="' + name.toLowerCase() + '" class="symbol">' + '<h3>' + (comment ? '<span class="comment' + ('ES5/ES6/HTML5/DOM3'.contains(comment) ? ' patch' : '') + '">' + comment + '</span>' : '') + '<span class="category">' + category + '</span>' + getType(symbol) + getSyntax(symbol, name) + '</h3>' + getDescription(symbol) + getParameters(symbol) + getReturns(symbol) + getFires(symbol) + getRequires(symbol) + getSince(symbol) + getDeprecated(symbol) + getExample(symbol) + getSee(symbol) + '</div>'));
          lastGroupName = groupName;
        }
      });
      $details.append($detailsDiv);
      indexColumns[side].append($indexFieldset);
    };

//--------------------------------------------------[列出名单中的指定内容]
    listen('build', function() {
      [
        'Global',
        'Object',
        'Array',
        'String',
        'Boolean',
        'Number',
        'Math',
        'Date',
        'RegExp',
        'JSON',
        'navigator',
        'location',
        'cookie',
        'localStorage'
      ]
          .forEach(function(name) {
            buildDocument(name, 'a');
          });
      [
        'window',
        'document',
        'Element',
        'Event'
      ]
          .forEach(function(name) {
            buildDocument(name, 'b');
          });
      [
        'Component',
        'Request',
        'Animation',
        'Switcher',
        'TabPanel',
        'Dialog',
        'Calendar'
      ]
          .forEach(function(name) {
            buildDocument(name, 'c');
          });
    });

  });

//==================================================[API 细节]
  declareModule('details', function(listen, notify) {
//--------------------------------------------------[细节层]
    var pinnedOffsetX = $content.getClientRect().left + 50;
    // 调整位置。
    var adjustDeatilsPanel = function() {
      var clientSize = window.getClientSize();
      $deatilsPanel.setStyles({
        width: clientSize.width - pinnedOffsetX,
        height: clientSize.height
      });
      $detailsClose.setStyles({
        left: Math.max(710 - 20, clientSize.width - pinnedOffsetX - 55)
      });
    };
    // 使用对话框实现。
    var deatilsPanel = new Dialog($deatilsPanel, {
      maskStyles: {background: 'black', opacity: .05},
      offsetX: pinnedOffsetX,
      offsetY: 0
    })
        .on('open',
        function() {
          // 按下 ESC 键或点击细节层外即关闭细节层。
          $html.on('keydown.deatilsPanel mousedown.deatilsPanel', function(e) {
            if (e.isMouseEvent && !$deatilsPanel.contains(e.target) || e.which === 27) {
              detailsLayer.close();
            }
          });
          // 调整窗口尺寸的同时调整细节层的尺寸。
          window.on('resize.deatilsPanel', adjustDeatilsPanel);
        })
        .on('close',
        function() {
          $html.setStyle('overflow', '');
          // 取消事件绑定。
          $html.off('keydown.deatilsPanel mousedown.deatilsPanel');
          window.off('resize.deatilsPanel');
        });
    // 打开/关闭细节层，包裹对话框的方法。
    var detailsPanelLeft;
    var detailsLayer = {
      open: function() {
        if (!this.isOpen) {
          this.isOpen = true;
          var offsetY = window.getPageOffset().y;
          $html.setStyle('overflow', 'hidden');
          adjustDeatilsPanel();
          deatilsPanel.open();
          window.scrollTo(0, offsetY);
          // 打开时的向左移动的效果。
          detailsPanelLeft = parseInt($deatilsPanel.getStyle('left'), 10);
          $deatilsPanel.setStyles({left: detailsPanelLeft + 30, opacity: 0}).morph({left: detailsPanelLeft, opacity: 1}, {duration: 150});
        }
      },
      close: function() {
        if (this.isOpen) {
          this.isOpen = false;
          // 关闭时的向右移动的效果。
          $deatilsPanel.morph({left: detailsPanelLeft + 15, opacity: 0}, {transition: 'easeIn', duration: 150, onFinish: function() {
            var offsetY = window.getPageOffset().y;
            deatilsPanel.close();
            window.scrollTo(0, offsetY);
          }});
        }
      },
      isOpen: false
    };
    // 点击关闭按钮关闭细节层。
    $detailsClose.on('click', function() {
      detailsLayer.close();
      return false;
    });

//--------------------------------------------------[打开细节层]
    listen('show', function() {
      detailsLayer.open();
    });

  });

//==================================================[本页应用]
  runApplication(function(listen, notify) {
    // 输出文档。
    notify('reference.build');

    // 点击 API 条目，进入细节页的对应位置。
    $content.on('click', function(e) {
      notify('details.show');
    }, function() {
      return this.nodeName === 'A';
    });

    // 如果指定了 hash，则直达细节页的对应位置。
    if (location.hash) {
      notify('details.show');
      var $target = document.$(location.hash);
      if ($target) {
        $target.scrollIntoView();
      }
    }

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

}, true);

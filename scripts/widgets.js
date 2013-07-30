document.on('beforedomready', function() {
//==================================================[生成 Widget 的通用说明]
  $('#content').getFirstChild().insertAdjacentHTML('afterend', '<blockquote><p>注意：<br>一个 Widget 本身仍是一个元素。<br>当一个元素成为 Widget 时，将具备新的行为，获得新的属性、方法，并能触发新的事件。<br>这些新增的特性并不妨碍将一个 Widget 视为一个普通元素来对其进行操作（如修改某部分的内容、结构、表现或行为）。</p></blockquote><div id="api"></div>');

//==================================================[生成 Widget 的 API 文档]
//--------------------------------------------------[数据]
  var data = {
    '基本描述': [],
    '启用方式': [],
    '结构约定': [],
    '默认样式': [],
    '可配置项': [],
    '新增行为': [],
    '新增属性': [],
    '新增方法': [],
    '新增事件': []
  };

//--------------------------------------------------[分析源文件并提取数据]
  function parseAPIData(lines) {
    var commentStartPattern = /\/\*\*/;
    var commentEndPattern = /\*\//;
    var commentPattern = /\s*\*\s*(?:@([\S]+)\s*)?(.*)/;
    var codeCommentPaddingPattern = /\s*\*\s{3}/;
    var configNamePattern = /^[a-z0-9-]+$/;
    var methodNamePattern = /^[a-zA-Z0-9]+$/;
    var argumentDescriptionPattern = /^\{([a-zA-Z\?\|]+)\}\s+([a-zA-Z0-9\[\]]+)+\s+(.*)$/;
    var propertyDescriptionPattern = /^\{([a-zA-Z\?\|]+)\}\s+([a-zA-Z0-9]+)+\s+(.*)$/;
    var returnValueDescriptionPattern = /^\{([a-zA-Z\?\|]+)\}\s+(.*)$/;

    var reading = false;
    // 当前处理的注释类型。
    var tagName = '';
    var lastDescription;
    var lastItem;
    var match;

    lines.forEach(function(line) {
      if (!reading && commentStartPattern.test(line)) {
        // 本段注释开始。
        reading = true;
        tagName = '基本描述';
      } else if (reading && commentEndPattern.test(line)) {
        // 本段注释结束。
        reading = false;
        tagName = '';
      } else if (reading && (match = line.match(commentPattern))) {
        // 分析本段注释。
        tagName = match[1] || tagName;
        var tagValue = match[2];
        if (tagValue) {
          switch (tagName) {
            case '基本描述':
            case '启用方式':
            case '默认样式':
            case '新增行为':
              // 基本描述/启用方式/默认样式/新增行为[描述]
              data[tagName].push(tagValue);
              break;
            case '结构约定':
              // 结构约定[代码, 描述]
              if (data[tagName].length === 0) {
                data[tagName].push([], []);
              }
              if (data[tagName][1].length || tagValue.startsWith('*')) {
                data[tagName][1].push(tagValue);
              } else {
                data[tagName][0].push(line.replace(codeCommentPaddingPattern, ''));
              }
              break;
            case '可配置项':
              if (configNamePattern.test(tagValue)) {
                // 可配置项[名称, 描述]
                data[tagName].push([tagValue, lastDescription = []]);
              } else {
                lastDescription.push(tagValue);
              }
              break;
            case '新增属性':
              if (match = tagValue.match(propertyDescriptionPattern)) {
                // 新增属性[类型, 名称, 描述]
                data[tagName].push([match[1], match[2], lastDescription = [match[3]]]);
              } else {
                lastDescription.push(tagValue);
              }
              break;
            case '新增方法':
              if (methodNamePattern.test(tagValue)) {
                // 新增方法[名称, 描述, 参数, 返回值]
                data[tagName].push(lastItem = [tagValue, lastDescription = [], [], []]);
              } else if (match = tagValue.match(argumentDescriptionPattern)) {
                // 参数[类型, 名称, 描述]
                lastItem[2].push([match[1], match[2], lastDescription = [match[3]]]);
              } else if (match = tagValue.match(returnValueDescriptionPattern)) {
                // 参数[类型, 描述]
                lastItem[3].push(match[1], lastDescription = [match[2]]);
              } else if (tagValue !== '参数：' && tagValue !== '返回值：') {
                lastDescription.push(tagValue);
              }
              break;
            case '新增事件':
              if (methodNamePattern.test(tagValue)) {
                // 新增事件[类型, 描述, 属性]
                data[tagName].push(lastItem = [tagValue, lastDescription = [], []]);
              } else if (match = tagValue.match(propertyDescriptionPattern)) {
                // 属性[类型, 名称, 描述]
                lastItem[2].push([match[1], match[2], lastDescription = [match[3]]]);
              } else if (tagValue !== '属性：') {
                lastDescription.push(tagValue);
              }
              break;
          }
        }
      }
    });

  }

//--------------------------------------------------[输出 API 文档]
  // 获取描述信息。
  var getDescription = function(description) {
    var text = '';
    var hasList = false;
    description.forEach(
        function(line, index) {
          if (line.startsWith('*')) {
            if (!hasList) {
              text += '<ul>';
              hasList = true;
            }
            text += (index ? '</li>' : '') + '<li>' + line.slice(2);
          } else {
            if (hasList) {
              text += '<br>' + line;
            } else {
              text += line.startsWith('<') || line.endsWith('>') ? line : '<p>' + line + '</p>';
            }
          }
        }
    );
    if (hasList) {
      text += '</li></ul>';
    }
    return text;
  };

  // 获取结构约定。
  var getConvention = function(convention) {
    var code = convention[0];
    var text = code.length ? '<pre class="lang-html">' + code.join('\n').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>' : '';
    return text + getDescription(convention[1]);
  };

  // 获取默认样式。
  var getStyles = function(styles) {
    return styles.length ? '<pre class="lang-css">' + styles.join('\n') + '</pre>' : '';
  };

  // 获取可配置项。
  var getConfigs = function(configs) {
    var text = configs
        .map(function(config) {
          return '<tr class="anchor" data-title="' + config[0] + '"><td><dfn>' + config[0] + '</dfn></td><td>' + getDescription(config[1]) + '</td></tr>';
        })
        .join('');
    return text ? '<table>' + text + '</table>' : '';
  };

  // 获取属性。
  var getProperties = function(properties) {
    var text = properties
        .map(function(property) {
          return '<tr class="anchor" data-title="' + property[1] + '"><td><kbd>&lt;' + property[0] + '&gt;</kbd></td><td><dfn>' + property[1] + '</dfn></td><td>' + getDescription(property[2]) + '</td></tr>';
        })
        .join('');
    return text ? '<table>' + text + '</table>' : '';
  };

  // 获取方法。
  var methodAndEventNamePattern = /^[a-zA-Z0-9]+/;
  var argumentPattern = /[^,\[\]\(\)]+(?=,|\[|\]|\))/g;
  var optionalArgumentPattern = /^\[[a-zA-Z0-9]+\]$/;
  var getSyntax = function(method) {
    var syntax = method[0];
    var optionalCount = 0;
    syntax += '(' + method[2].map(
        function(parameter, index) {
          var name = parameter[1];
          var separator = index ? ', ' : '';
          if (optionalArgumentPattern.test(name)) {
            name = '[' + separator + name.slice(1, -1);
            optionalCount++;
          } else {
            name = separator + name;
          }
          return name;
        }
    ).join('') + ']'.repeat(optionalCount) + ')';
    return syntax;
  };
  var getParameters = function(parameters) {
    var text = parameters
        .map(function(parameter) {
          var name = parameter[1];
          return '<tr><td><kbd>&lt;' + parameter[0] + '&gt;</kbd></td><td><var>' + (optionalArgumentPattern.test(name) ? name.slice(1, -1) + '<em>Optional</em>' : name) + '</var></td><td>' + getDescription(parameter[2]) + '</td></tr>';
        })
        .join('');
    return text ? '<h4>参数：</h4><table>' + text + '</table>' : '';
  };
  var getReturns = function(returns) {
    return returns.length ? '<table><tr><td><kbd>&lt;' + returns[0] + '&gt;</kbd></td><td>' + getDescription(returns[1]) + '</td></tr></table>' : '';
  };
  var getMethods = function(methods) {
    var text = methods
        .map(function(method) {
          var syntax = getSyntax(method);
          var structuredSyntax = '<kbd>&lt;' + method[3][0] + '&gt;</kbd>' + syntax.replace(methodAndEventNamePattern, '<dfn>$&</dfn>').replace(argumentPattern, '<var>$&</var>');
          return '<div><p class="anchor" data-title="' + syntax + '">' + structuredSyntax + '</p>' + getDescription(method[1]) + getParameters(method[2]) + '<h4>返回值：</h4>' + getReturns(method[3]) + '</div>';
        })
        .join('');
    return text ? '<div class="list">' + text + '</div>' : '';
  };

  // 获取事件。
  var getEventProperties = function(properties) {
    var text = properties
        .map(function(property) {
          return '<tr><td><kbd>&lt;' + property[0] + '&gt;</kbd></td><td><dfn>' + property[1] + '</dfn></td><td>' + getDescription(property[2]) + '</td></tr>';
        })
        .join('');
    return text ? '<h4>事件对象的属性：</h4><table>' + text + '</table>' : '';
  };
  var getEvents = function(events) {
    var text = events
        .map(function(event) {
          var name = event[0];
          return '<div><p class="anchor" data-title="' + name + '"><dfn>' + name + '</dfn></p>' + getDescription(event[1]) + getEventProperties(event[2]) + '</div>';
        })
        .join('');
    return text ? '<div class="list">' + text + '</div>' : '';
  };

  // 输出 API 文档。
  function writeAPIDoc() {
    var $api = $('#api');
    $api.insertAdjacentHTML('beforeend', getDescription(data['基本描述']));
    $api.insertAdjacentHTML('beforeend', '<h2>启用方式</h2>' + getDescription(data['启用方式']));
    $api.insertAdjacentHTML('beforeend', '<h2>结构约定</h2>' + getConvention(data['结构约定']));
    $api.insertAdjacentHTML('beforeend', '<h2>默认样式</h2>' + getStyles(data['默认样式']));
    $api.insertAdjacentHTML('beforeend', '<h2>可配置项</h2>' + getConfigs(data['可配置项']));
    $api.insertAdjacentHTML('beforeend', '<h2>新增行为</h2>' + getDescription(data['新增行为']));
    $api.insertAdjacentHTML('beforeend', '<h2>新增属性</h2>' + getProperties(data['新增属性']));
    $api.insertAdjacentHTML('beforeend', '<h2>新增方法</h2>' + getMethods(data['新增方法']));
    $api.insertAdjacentHTML('beforeend', '<h2>新增事件</h2>' + getEvents(data['新增事件']));

    document.findAll('pre').forEach(function($pre) {
      $pre.addClass('prettyprint');
    });
    prettyPrint();

  }

//--------------------------------------------------[读取源文件]
  var sourceCode = $('html').getData('sourceCode');
  if (sourceCode) {
    new Request(sourceCode, {noCache: true, sync: true})
        .on('finish', function(e) {
          parseAPIData(e.text.split(/[\r\n]+/));
          writeAPIDoc();
        })
        .send();
  }

});

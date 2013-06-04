/**
 * @fileOverview OurJS API data generator
 * @author sundongguo@gmail.com
 * @version 20120320
 */

/** Make JSON.stringify available. */
var JSON = {};
(function() {
//--------------------------------------------------[JSON.stringify]
  var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
      },
      rep;

  function quote(string) {
    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
      var c = meta[a];
      return typeof c === 'string'
          ? c
          : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
  }

  function str(key, holder) {
    var i,
        k,
        v,
        length,
        mind = gap,
        partial,
        value = holder[key];
    if (value && typeof value === 'object' &&
        typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    }
    if (typeof rep === 'function') {
      value = rep.call(holder, key, value);
    }
    switch (typeof value) {
      case 'string':
        return quote(value);
      case 'number':
        return isFinite(value) ? String(value) : 'null';
      case 'boolean':
      case 'null':
        return String(value);
      case 'object':
        if (!value) {
          return 'null';
        }
        gap += indent;
        partial = [];
        if (Object.prototype.toString.apply(value) === '[object Array]') {
          length = value.length;
          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || 'null';
          }
          v = partial.length === 0
              ? '[]'
              : gap
              ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
              : '[' + partial.join(',') + ']';
          gap = mind;
          return v;
        }
        if (rep && typeof rep === 'object') {
          length = rep.length;
          for (i = 0; i < length; i += 1) {
            if (typeof rep[i] === 'string') {
              k = rep[i];
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        } else {
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        }
        v = partial.length === 0
            ? '{}'
            : gap
            ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
            : '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
  }

  if (typeof JSON.stringify !== 'function') {
    JSON.stringify = function(value, replacer, space) {
      var i;
      gap = '';
      indent = '';
      if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
          indent += ' ';
        }
      } else if (typeof space === 'string') {
        indent = space;
      }
      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
          (typeof replacer !== 'object' ||
              typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
      }
      return str('', {'': value});
    };
  }

})();

/** Parse string for Descriptions and Examples. */
String.prototype.startsWith = function(subString) {
  return this.indexOf(subString) === 0;
};
String.prototype.endsWith = function(subString) {
  var lastIndex = this.lastIndexOf(subString);
  return lastIndex >= 0 && lastIndex === this.length - subString.length;
};

function parseDescription(string) {
  return string.split(/[\r\n]+/)
      .map(function(line) {
        return line.trim();
      })
      .join('\n');
}

/** Get a symbol's raw data. */
function parseSymbol(source) {
  var name = source.alias;
  symbols[name] = {
//    author: source.author,
    name: name,
    category: source.isa === 'CONSTRUCTOR' ? 'constructor' : (name.indexOf('#') === -1 ? 'static' : 'instance'),
    type: source.type,
    isFunction: (source.isa === 'CONSTRUCTOR' || source.isa === 'FUNCTION'),
    parameters: source.params.map(function(item) {
      return {
        type: item.type,
        name: item.name,
        description: parseDescription(item.desc),
        isOptional: item.isOptional
      };
    }),
    returns: source.returns.map(function(item) {
      return {
        type: item.type,
        description: parseDescription(item.desc)
      };
    }),
    // fires 仅为字符串，因此在写注释文档时约定：第一行为事件名，其后为描述。
    fires: source.fires.map(function(item) {
      var items = parseDescription(item).split('\n');
      return {
        name: items.shift() || '',
        description: items.join('\n') || ''
      };
    }),
    description: parseDescription(source.desc),
    examples: source.example.map(function(item) {
      return item.desc.split(/[\r\n]+/)
          .map(function(line) {
            return line.startsWith('  ') ? line.slice(2) : line;
          })
          .join('\n');
    }),
    requires: source.requires,
    since: source.since,
    deprecated: source.deprecated,
    see: source.see
  };

  source.properties.forEach(function(property) {
    parseSymbol(property);
  });

  source.methods.forEach(function(method) {
    parseSymbol(method);
  });

}

/** Called automatically by JsDoc Toolkit. */
var symbols = {};
function publish(symbolSet) {
  // Get a list of all the classes in the symbolset.
  var classes = symbolSet.toArray().filter(function(symbol) {
    return (symbol.is('CONSTRUCTOR') || symbol.isNamespace)
  });

  // Parse symbols.
  classes.forEach(function(symbol) {
    symbol.methods = symbol.getMethods();
    // Handle a symbol.
    if (symbol.name === '_global_') {
      return;
    }
    parseSymbol(symbol);
  });

  // Output data.
  var replacer = function(key, value) {
    return value.length === 0 ? undefined : value;
  };
  IO.saveFile(JSDOC.opt.d, 'api_data.js', 'var apiData = ' + JSON.stringify(symbols, replacer) + ';');

}

/**
 * @fileOverview OurJA API data generator.
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

/** Encode string for HTML code. */
var toString = Object.prototype.toString;
function encode(value) {
  if (typeof value === 'string') {
    return value.replace(/[&<>`'"\\\n]/g, function(charactor) {
      return '&#' + charactor.charCodeAt(0) + ';';
    });
  } else if (toString.call(value) === '[object Array]') {
    return value.map(function(item) {
      return encode(item);
    });
  } else {
    return toString.call(value);
  }
}

/** Get a symbol's raw data. */
function filterSymbol(source) {
  symbols[source.alias.replace('#', (source.isNamespace ? '.' : '.prototype.'))] = {
    author: encode(source.author),
    name: source.name,
    memberOf: source.memberOf,
    isFunction: (source.isa === 'CONSTRUCTOR' || source.isa === 'FUNCTION'),
    type: source.type,
    parameters: source.params.map(function(item) {
      var newItem = {};
      newItem.type = item.type;
      newItem.name = item.name;
      newItem.description = encode(item.desc);
      newItem.isOptional = item.isOptional;
      return newItem;
    }),
    exceptions: source.exceptions.map(function(item) {
      var newItem = {};
      newItem.type = item.type;
      newItem.description = encode(item.desc);
      return newItem;
    }),
    returns: source.returns.map(function(item) {
      var newItem = {};
      newItem.type = item.type;
      newItem.description = encode(item.desc);
      return newItem;
    }),
    description: encode(source.desc),
    examples: encode(source.example),
    requires: encode(source.requires),
    deprecated: encode(source.deprecated),
    since: encode(source.since),
    see: encode(source.see)
  };

  if (source.properties.length) {
    source.properties.forEach(function(property) {
      filterSymbol(property);
    });
  }

  if (source.methods.length) {
    source.methods.forEach(function(method) {
      filterSymbol(method);
    });
  }

}

/** Called automatically by JsDoc Toolkit. */
var symbols = {};
function publish(symbolSet) {
  // Config.
  publish.conf = {
    outDir: JSDOC.opt.d || SYS.pwd + '../out/jsdoc/'
  };

  // Get a list of all the classes in the symbolset.
  var classes = symbolSet.toArray().filter(function($) {
    return ($.is('CONSTRUCTOR') || $.isNamespace)
  });

  // Output data.
  classes.forEach(function(symbol) {
    symbol.methods = symbol.getMethods();
    // Handle a symbol.
    if (symbol.name === '_global_') {
      return;
    }
    filterSymbol(symbol);
  });

  IO.saveFile(publish.conf.outDir + '/scripts/', 'data.js', 'var apiData = ' + JSON.stringify(symbols) + ';');

}

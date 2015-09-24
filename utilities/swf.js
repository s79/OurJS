var swf = {};

swf.version = (function() {
  if (navigator.plugins && navigator.mimeTypes.length) {
    var flashPlugin = navigator.plugins['Shockwave Flash'];
    if (flashPlugin && flashPlugin.description) {
      return flashPlugin.description.replace(/\D+/, '');
    }
  } else if (window.ActiveXObject) {
    try {
      var flash = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      if (flash) {
        return flash.GetVariable('$version').replace(/\D+/, '').replace(/,/g, '.');
      }
    } catch (e) {
    }
  }
})();

var encodeHTML = function(string) {
  return string.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
};

swf.createHTML = function(options) {
  options = options || {};
  var version = swf.version,
      needVersion = options['ver'] || '6.0.0',
      vUnit1, vUnit2, i, k, len, item, tmpOpt = {};

  // 复制options，避免修改原对象
  for (k in options) {
    tmpOpt[k] = options[k];
  }
  options = tmpOpt;

  // 浏览器支持的flash插件版本判断
  if (version) {
    version = version.split('.');
    needVersion = needVersion.split('.');
    for (i = 0; i < 3; i++) {
      vUnit1 = parseInt(version[i], 10);
      vUnit2 = parseInt(needVersion[i], 10);
      if (vUnit2 < vUnit1) {
        break;
      } else if (vUnit2 > vUnit1) {
        return ''; // 需要更高的版本号
      }
    }
  } else {
    return ''; // 未安装flash插件
  }

  var vars = options['vars'],
      objProperties = ['classid', 'codebase', 'id', 'width', 'height', 'align'];

  // 初始化object标签需要的classid、codebase属性值
  options['align'] = options['align'] || 'middle';
  options['classid'] = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000';
  options['codebase'] = 'http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0';
  options['movie'] = options['url'] || '';
  delete options['vars'];
  delete options['url'];

  // 初始化flashvars参数的值
  if ('string' == typeof vars) {
    options['flashvars'] = vars;
  } else {
    var fvars = [];
    for (k in vars) {
      item = vars[k];
      fvars.push(k + "=" + encodeURIComponent(item));
    }
    options['flashvars'] = fvars.join('&');
  }

  // 构建IE下支持的object字符串，包括属性和参数列表
  var str = ['<object '];
  for (i = 0, len = objProperties.length; i < len; i++) {
    item = objProperties[i];
    str.push(' ', item, '="', encodeHTML(options[item]), '"');
  }
  str.push('>');
  var params = {
    'wmode': 1,
    'scale': 1,
    'quality': 1,
    'play': 1,
    'loop': 1,
    'menu': 1,
    'salign': 1,
    'bgcolor': 1,
    'base': 1,
    'allowscriptaccess': 1,
    'allownetworking': 1,
    'allowfullscreen': 1,
    'seamlesstabbing': 1,
    'devicefont': 1,
    'swliveconnect': 1,
    'flashvars': 1,
    'movie': 1
  };

  for (k in options) {
    item = options[k];
    k = k.toLowerCase();
    if (params[k] && (item || item === false || item === 0)) {
      str.push('<param name="' + k + '" value="' + encodeHTML(item) + '" />');
    }
  }

  // 使用embed时，flash地址的属性名是src，并且要指定embed的type和pluginspage属性
  options['src'] = options['movie'];
  options['name'] = options['id'];
  delete options['id'];
  delete options['movie'];
  delete options['classid'];
  delete options['codebase'];
  OPTIONS['type'] = 'application/x-shockwave-flash';
  options['pluginspage'] = 'http://www.macromedia.com/go/getflashplayer';

  // 构建embed标签的字符串
  str.push('<embed');
  // 在firefox、opera、safari下，salign属性必须在scale属性之后，否则会失效
  // 经过讨论，决定采用BT方法，把scale属性的值先保存下来，最后输出
  var salign;
  for (k in options) {
    item = options[k];
    if (item || item === false || item === 0) {
      if ((new RegExp("^salign$", "i")).test(k)) {
        salign = item;
        continue;
      }

      str.push(' ', k, '="', encodeHTML(item), '"');
    }
  }

  if (salign) {
    str.push(' salign="', encodeHTML(salign), '"');
  }
  str.push('></embed></object>');

  return str.join('');
};

swf.create = function(options, target) {
  options = options || {};
  var html = swf.createHTML(options)
      || options['errorMessage']
      || '';

  if (target && 'string' == typeof target) {
    target = document.getElementById(target);
  }
  baidu.dom.insertHTML(target || document.body, 'beforeEnd', html);
};

swf.getMovie = function(name) {
  //ie9下, Object标签和embed标签嵌套的方式生成flash时,
  //会导致document[name]多返回一个Object元素,而起作用的只有embed标签
  var movie = document[name], ret;
  return baidu.browser.ie == 9 ?
          movie && movie.length ?
          (ret = baidu.array.remove(baidu.lang.toArray(movie), function(item) {
            return item.tagName.toLowerCase() != "embed";
          })).length == 1 ? ret[0] : ret
      : movie
      : movie || window[name];
};

swf.Proxy = function(id, property, loadedHandler) {

  var me = this,
      flash = this._flash = swf.getMovie(id),
      timer;
  if (!property) {
    return this;
  }
  timer = setInterval(function() {
    try {

      if (flash[property]) {
        me._initialized = true;
        clearInterval(timer);
        if (loadedHandler) {
          loadedHandler();
        }
      }
    } catch (e) {
    }
  }, 100);
};

swf.Proxy.prototype.getFlash = function() {
  return this._flash;
};

swf.Proxy.prototype.isReady = function() {
  return !!this._initialized;
};

swf.Proxy.prototype.call = function(methodName, var_args) {
  try {
    var flash = this.getFlash(),
        args = Array.prototype.slice.call(arguments);

    args.shift();
    if (flash[methodName]) {
      flash[methodName].apply(flash, args);
    }
  } catch (e) {
  }
};

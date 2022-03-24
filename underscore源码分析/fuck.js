
var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    // 以上四个为最常用的字符实体
    // 也是仅有的可以在所有环境下使用的实体字符（其他应该用「实体数字」，如下）
    // 浏览器也许并不支持所有实体名称（对实体数字的支持却很好）
    "'": '&#x27;',
    '`': '&#x60;'
  };
  function keys(obj) {
    if (!isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
  }
  var _escape = createEscaper(escapeMap);
  var nativeKeys = Object.keys;
  function createEscaper(map) {
    var escaper = function(match) {
      return map[match];
    };
    // 使用非捕获性分组
    var source = '(?:' + keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    
    // 全局替换
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  }

  var settings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };
  
  // 转义字符
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',  // 回车符
    '\n': 'n',  // 换行符
    '\u2028': 'u2028',  // 行分隔符
    '\u2029': 'u2029'  // 段落分隔符
  };
  
  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;
  
  function escapeChar(match) {
    return '\\' + escapes[match];
  }
  
  var template = function (text) {
    var matcher = RegExp([
      (settings.escape).source,
      (settings.interpolate).source,
      (settings.evaluate).source
    ].join('|') + '|$', 'g');
  
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;
  
      if (escape) {
        // 考虑属性不存在的情况 
        source += "'+\n((__t=(" + escape + "))==null?'':_escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
  
      return match;
    });
    source += "';\n";
  
    source = 'with(obj||{}){\n' + source + '}\n';
    source = "var __t, __p='';" +
      source + 'return __p;\n';
  
    var render = new Function('obj', '_escape', source);
  
    var template = function(data) {
      return render.call(this, data);
    };
    return template;
  
  };
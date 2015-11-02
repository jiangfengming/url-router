/*!
 * Router.js v1.1.0
 *
 * Copyright (c) 2014 Jiang Fengming <fenix@noindoin.com>
 * Released under the MIT license
 */

function Router(conf) {
  this.routes = {};

  if (conf.constructor == Array)
    conf = {ALL: conf};

  for (var method in conf) {
    var routes = conf[method];
    var rts = this.routes[method] = {string: {}, regex: []};
    var rt, validate, pattern, replacement, params, extra;
    for (var i = 0; i < routes.length; i++) {
      rt = routes[i];
      validate = true;

      if (rt.constructor == String) {
        pattern = rt;
        replacement = '$&';
        params = [];
        extra = {};
      } else {
        if (rt[0].constructor == Boolean)
          validate = rt.shift();
        pattern = rt.shift();
        replacement = rt.shift() || '$&';
        extra = typeof rt[rt.length - 1] == 'object' ? rt.pop() : {};
        params = rt;
      }

      if (pattern.constructor == RegExp) {
        rts.regex.push({
          validate: validate,
          pattern: pattern,
          replacement: replacement,
          params: params,
          extra: extra
        });
      } else {
        if (pattern.indexOf(':') == -1 && pattern.indexOf('*') == -1) {
          rts.string[pattern] = {
            replacement: replacement == '$&' ? pattern : replacement,
            extra: extra
          };
        } else {
          params = [];

          pattern = pattern.replace(/[\\&()+.\[?\^{|]/g, '\\$&')
                .replace(/\*/g, '.*')
                .replace(/:(\w+)/g, function(str, key) {
                  params.push(key);
                  return '([^/]+)';
                });

          rts.regex.push({
            validate: validate,
            pattern: new RegExp('^' + pattern + '$'),
            replacement: replacement,
            params: params,
            extra: extra
          });
        }
      }
    }
  }
}

Router.prototype.resolve = function(path, method) {
  path = String(path);

  if (!method)
    method = 'ALL';

  var rts = this.routes[method] || this.routes.ALL;

  if (!rts)
    return null;

  if (rts.string[path]) {
    return {
      path: rts.string[path].replacement,
      extra: rts.string[path].extra
    };
  }

  var replacement;
  var params = {};
  for (var i = 0; i < rts.regex.length; i++) {
    var rt = rts.regex[i];

    if (rt.validate && !/^((\.?[\w-]+)+\/?)+$/.test(path))
      continue;

    var matches = path.match(rt.pattern);
    if (matches) {
      replacement = rt.replacement;
      if (replacement.indexOf('$') != -1) {
        replacement = replacement == '$&' ? path : path.replace(rt.pattern, replacement);
      }

      matches.shift();
      for (var j = 0; j < rt.params.length; j++) {
        if (rt.params[j])
          params[rt.params[j]] = matches[j];
      }

      return {
        path: replacement,
        params: params,
        extra: rt.extra
      };
    }
  }

  if (method != 'ALL')
    return this.resolve(path);
  else
    return null;
};

if (typeof module != 'undefined' && module.exports) // node
  module.exports = Router;

/*!
 * Router.js v1.1.1
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
    var rt, validate, pattern, replacement, params, options;
    for (var i = 0; i < routes.length; i++) {
      rt = routes[i];
      validate = false;

      if (rt.constructor == String) {
        pattern = rt;
        replacement = '$&';
        params = [];
        options = {};
      } else {
        if (rt[0].constructor == Boolean)
          validate = rt.shift();
        pattern = rt.shift();
        replacement = rt.shift() || '$&';
        options = typeof rt[rt.length - 1] == 'object' ? rt.pop() : {};
        params = rt;
      }

      if (pattern.constructor == RegExp) {
        rts.regex.push({
          validate: validate,
          pattern: pattern,
          replacement: replacement,
          params: params,
          options: options
        });
      } else {
        if (!/:|\*|\$/.test(pattern)) {
          rts.string[pattern] = {
            replacement: replacement == '$&' ? pattern : replacement,
            options: options
          };
        } else {
          params = [];

          pattern = pattern.replace(/[\\&()+.\[?\^{|]/g, '\\$&')
                .replace(/:(\w+)/g, function(str, key) {
                  params.push(key);
                  return '([^/]+)';
                })
                .replace(/\$(\w+)$/, function(str, key) {
                  params.push(key);
                  return '(.+)';
                })
                .replace(/\*/g, '.*');

          rts.regex.push({
            validate: validate,
            pattern: new RegExp('^' + pattern + '$'),
            replacement: replacement,
            params: params,
            options: options
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
      params: {},
      options: rts.string[path].options
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
        options: rt.options
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

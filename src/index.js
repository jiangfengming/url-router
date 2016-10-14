export default class {
  constructor(conf) {
    this.routes = {};

    if (conf.constructor == Array) {
      conf = { ALL: conf };
    }

    for (let method in conf) {
      const routes = conf[method];
      const rts = this.routes[method] = {
        string: {},
        regex: []
      };
      for (let rt of routes) {
        let validate = false;
        let pattern, replacement, params, options;

        if (rt.constructor == String) {
          pattern = rt;
          replacement = '$&';
          params = [];
          options = {};
        } else {
          if (rt[0].constructor == Boolean) {
            validate = rt.shift();
          }
          pattern = rt.shift();
          replacement = rt.shift() || '$&';
          options = typeof rt[rt.length - 1] == 'object' ? rt.pop() : {};
          params = rt;
        }

        if (pattern.constructor == RegExp) {
          rts.regex.push({
            validate,
            pattern,
            replacement,
            params,
            options
          });
        } else {
          if (!/:|\*|\$/.test(pattern)) {
            rts.string[pattern] = {
              replacement: replacement == '$&' ? pattern : replacement,
              options
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
              validate,
              pattern: new RegExp(`^${pattern}$`),
              replacement,
              params,
              options
            });
          }
        }
      }
    }
  }

  resolve(path, method) {
    path = String(path);

    if (!method) {
      method = 'ALL';
    }

    const rts = this.routes[method] || this.routes.ALL;

    if (!rts) {
      return null;
    }

    if (rts.string[path]) {
      return {
        path: rts.string[path].replacement,
        params: {},
        options: rts.string[path].options
      };
    }

    var replacement;
    var params = {};
    for (let rt of rts.regex) {
      if (rt.validate && !/^((\.?[\w-]+)+\/?)+$/.test(path)) {
        continue;
      }

      const matches = path.match(rt.pattern);
      if (matches) {
        replacement = rt.replacement;
        if (replacement.indexOf('$') != -1) {
          replacement = replacement == '$&' ? path : path.replace(rt.pattern, replacement);
        }

        matches.shift();
        for (var j = 0; j < rt.params.length; j++) {
          if (rt.params[j]) {
            params[rt.params[j]] = matches[j];
          }
        }

        return {
          path: replacement,
          params: params,
          options: rt.options
        };
      }
    }

    if (method != 'ALL') {
      return this.resolve(path);
    } else {
      return null;
    }
  }
}

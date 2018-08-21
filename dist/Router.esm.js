var Router =
/*#__PURE__*/
function () {
  function Router(routes) {
    this._routes = {};

    if (routes) {
      for (var _iterator = routes, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var route = _ref;
        this.add.apply(this, route);
      }
    }
  }

  var _proto = Router.prototype;

  _proto.add = function add(method, path, handler, test) {
    method = method.toUpperCase();
    if (!this._routes[method]) this._routes[method] = [];
    var table = this._routes[method];

    if (path.constructor === RegExp) {
      table.push({
        path: path,
        regex: path,
        handler: handler,
        test: test
      });
    } else {
      if (!/:|\*|\$/.test(path)) {
        table.push({
          path: path,
          handler: handler,
          test: test
        });
      } else {
        var params = [];
        var regex = path.replace(/[\\&()+.[?^{|]/g, '\\$&').replace(/:(\w+)/g, function (str, key) {
          params.push(key);
          return '([^/]+)';
        }).replace(/\*/g, '.*');
        table.push({
          path: path,
          regex: new RegExp("^" + regex + "$"),
          handler: handler,
          params: params,
          test: test
        });
      }
    }
  };

  _proto.get = function get(path, handler, test) {
    return this.add('GET', path, handler, test);
  };

  _proto.post = function post(path, handler, test) {
    return this.add('POST', path, handler, test);
  };

  _proto.put = function put(path, handler, test) {
    return this.add('PUT', path, handler, test);
  };

  _proto.delete = function _delete(path, handler, test) {
    return this.add('DELETE', path, handler, test);
  };

  _proto.head = function head(path, handler, test) {
    return this.add('HEAD', path, handler, test);
  };

  _proto.connect = function connect(path, handler, test) {
    return this.add('CONNECT', path, handler, test);
  };

  _proto.options = function options(path, handler, test) {
    return this.add('OPTIONS', path, handler, test);
  };

  _proto.trace = function trace(path, handler, test) {
    return this.add('TRACE', path, handler, test);
  };

  _proto.patch = function patch(path, handler, test) {
    return this.add('PATCH', path, handler, test);
  };

  _proto.find = function find(method, path, testArg) {
    method = method.toUpperCase();
    var table = this._routes[method];

    for (var _iterator2 = table, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref2 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref2 = _i2.value;
      }

      var route = _ref2;
      var resolved = void 0;

      if (route.regex) {
        (function () {
          var matches = path.match(route.regex);

          if (matches) {
            var handler = route.handler;

            if (handler.constructor === String && handler.includes('$')) {
              handler = handler === '$&' ? path : path.replace(route.regex, handler);
            }

            matches.shift();
            var params = {};

            if (route.params) {
              route.params.forEach(function (v, i) {
                return params[v] = matches[i];
              });
            } else {
              matches.forEach(function (v, i) {
                return params['$' + (i + 1)] = v;
              });
            }

            resolved = {
              method: method,
              path: path,
              handler: handler,
              params: params
            };
          }
        })();
      } else {
        if (route.path === path) {
          resolved = {
            method: method,
            path: path,
            handler: route.handler,
            params: {}
          };
        }
      }

      if (resolved && (!route.test || route.test(resolved, testArg))) {
        return resolved;
      }
    }

    return null;
  };

  return Router;
}();

export default Router;

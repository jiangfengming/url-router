import { StringCaster } from 'cast-string';

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

  _proto.add = function add(method, path, handler) {
    // if method is omitted, defaults to 'GET'
    if (method.constructor !== String || !['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
      var _ref2 = ['GET', method, path];
      method = _ref2[0];
      path = _ref2[1];
      handler = _ref2[2];
    }

    if (!this._routes[method]) {
      this._routes[method] = [];
    }

    var table = this._routes[method];

    if (path.constructor === RegExp) {
      table.push({
        path: path,
        regex: path,
        handler: handler
      });
    } else {
      if (!/:|\*|\$/.test(path)) {
        table.push({
          path: path,
          handler: handler
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
          params: params
        });
      }
    }

    return this;
  };

  _proto.get = function get(path, handler) {
    return this.add('GET', path, handler);
  };

  _proto.post = function post(path, handler) {
    return this.add('POST', path, handler);
  };

  _proto.put = function put(path, handler) {
    return this.add('PUT', path, handler);
  };

  _proto["delete"] = function _delete(path, handler) {
    return this.add('DELETE', path, handler);
  };

  _proto.patch = function patch(path, handler) {
    return this.add('PATCH', path, handler);
  };

  _proto.head = function head(path, handler) {
    return this.add('HEAD', path, handler);
  };

  _proto.options = function options(path, handler) {
    return this.add('OPTIONS', path, handler);
  };

  _proto.trace = function trace(path, handler) {
    return this.add('TRACE', path, handler);
  };

  _proto.find = function find(method, path) {
    // if method is omitted, defaults to 'GET'
    if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
      var _ref3 = ['GET', method];
      method = _ref3[0];
      path = _ref3[1];
    }

    var table = this._routes[method];

    if (!table) {
      return null;
    }

    for (var _iterator2 = table, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref4;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref4 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref4 = _i2.value;
      }

      var route = _ref4;
      var resolved = void 0;

      if (route.regex) {
        (function () {
          var matches = path.match(route.regex);

          if (matches) {
            var handler = route.handler;

            if (handler.constructor === String && handler.includes('$')) {
              handler = handler === '$&' ? path : path.replace(route.regex, handler);
            }

            var params;

            if (matches.groups) {
              params = matches.groups;
            } else {
              params = {};
              matches.shift();

              if (route.params) {
                route.params.forEach(function (v, i) {
                  return params[v] = matches[i];
                });
              } else {
                matches.forEach(function (v, i) {
                  return params['$' + (i + 1)] = v;
                });
              }
            }

            for (var k in params) {
              params[k] = !params[k] ? params[k] : decodeURIComponent(params[k]);
            }

            resolved = {
              method: method,
              path: path,
              handler: handler,
              params: new StringCaster(params)
            };
          }
        })();
      } else {
        if (route.path === path) {
          resolved = {
            method: method,
            path: path,
            handler: route.handler,
            params: new StringCaster({})
          };
        }
      }

      if (resolved) {
        return resolved;
      }
    }

    return null;
  };

  return Router;
}();

export default Router;

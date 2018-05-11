(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Router = factory());
}(this, (function () { 'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var Router = function () {
    function Router(conf) {
      classCallCheck(this, Router);

      this._routes = {};

      if (conf.constructor === Array) conf = { ALL: conf };

      for (var method in conf) {
        var routes = conf[method];
        var rts = this._routes[method] = {
          string: {},
          regex: []
        };

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

          var _rt = _ref;

          var rt = [].concat(_rt);
          var path = rt.shift();
          var handler = rt.shift() || '$&';
          var options = rt.shift() || {};

          if (path.constructor === RegExp) {
            rts.regex.push({
              path: path,
              handler: handler,
              options: options,
              origin: _rt
            });
          } else {
            if (!/:|\*|\$/.test(path)) {
              rts.string[path] = {
                handler: handler === '$&' ? path : handler,
                options: options,
                origin: _rt
              };
            } else {
              (function () {
                var params = [];

                var regex = path.replace(/[\\&()+.[?^{|]/g, '\\$&').replace(/:(\w+)/g, function (str, key) {
                  params.push(key);
                  return '([^/]+)';
                }).replace(/\*/g, '.*');

                rts.regex.push({
                  path: new RegExp('^' + regex + '$'),
                  handler: handler,
                  params: params,
                  options: options,
                  origin: _rt
                });
              })();
            }
          }
        }
      }
    }

    Router.prototype.find = function find(path) {
      var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'ALL';

      var rts = this._routes[method];

      if (rts) {
        var _ret2 = function () {
          if (rts.string[path]) {
            var match = {
              handler: rts.string[path].handler,
              params: {},
              options: rts.string[path].options,
              origin: rts.string[path].origin
            };

            if (Router.log) {
              console.log('path:', path, '\n', 'method:', method, '\n', 'match:', match); // eslint-disable-line
            }

            return {
              v: match
            };
          }

          var handler = void 0;
          var params = {};

          var _loop = function _loop(rt) {
            var matches = path.match(rt.path);
            if (matches) {
              handler = rt.handler;
              if (handler && handler.constructor === String && handler.indexOf('$') !== -1) {
                handler = handler === '$&' ? path : path.replace(rt.path, handler);
              }

              matches.shift();

              if (rt.params) {
                rt.params.forEach(function (v, i) {
                  return params[v] = matches[i];
                });
              } else {
                matches.forEach(function (v, i) {
                  return params['$' + (i + 1)] = v;
                });
              }

              var _match = {
                handler: handler,
                params: params,
                options: rt.options,
                origin: rt.origin
              };

              if (Router.log) {
                console.log('path:', path, '\n', 'method:', method, '\n', 'match:', _match); // eslint-disable-line
              }

              return {
                v: {
                  v: _match
                }
              };
            }
          };

          for (var _iterator2 = rts.regex, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
            var _ref2;

            if (_isArray2) {
              if (_i2 >= _iterator2.length) break;
              _ref2 = _iterator2[_i2++];
            } else {
              _i2 = _iterator2.next();
              if (_i2.done) break;
              _ref2 = _i2.value;
            }

            var rt = _ref2;

            var _ret3 = _loop(rt);

            if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
          }
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
      }

      if (Router.log) {
        console.log('path:', path, '\n', 'method:', method, '\n', 'match:', null); // eslint-disable-line
      }

      return method === 'ALL' ? null : this.match(path);
    };

    return Router;
  }();

  return Router;

})));

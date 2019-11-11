'use strict';

var Router =
/*#__PURE__*/
function () {
  function Router(routes) {
    this.root = this._createNode();

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

  _proto._createNode = function _createNode(_temp) {
    var _ref2 = _temp === void 0 ? {} : _temp,
        regex = _ref2.regex,
        param = _ref2.param,
        handler = _ref2.handler;

    return {
      regex: regex,
      param: param,
      handler: handler,
      children: {
        string: {},
        regex: {}
      }
    };
  };

  _proto.add = function add(path, handler) {
    this._parseOptim(path, handler, this.root);

    return this;
  };

  _proto._parse = function _parse(remain, handler, parent) {
    if (/^(:\w|\()/.test(remain)) {
      var match = remain.match(/^(?::(\w+))?(?:\(([^)]+)\))?/);
      var node = parent.children.regex[match[0]];

      if (!node) {
        node = parent.children.regex[match[0]] = this._createNode({
          regex: match[2] ? new RegExp('^' + match[2]) : /^[^/]+/,
          param: match[1]
        });
      }

      if (match[0].length === remain.length) {
        node.handler = handler;
      } else {
        this._parseOptim(remain.slice(match[0].length), handler, node);
      }
    } else {
      var _char = remain[0];
      var _node = parent.children.string[_char];

      if (!_node) {
        _node = parent.children.string[_char] = this._createNode();
      }

      this._parse(remain.slice(1), handler, _node);
    }
  };

  _proto._parseOptim = function _parseOptim(remain, handler, node) {
    if (/:\w|\(/.test(remain)) {
      this._parse(remain, handler, node);
    } else {
      node.children.string[remain] = this._createNode({
        handler: handler
      });
    }
  };

  _proto.find = function find(path) {
    return this._findOptim(path, this.root, {});
  };

  _proto._findOptim = function _findOptim(remain, node, params) {
    var child = node.children.string[remain];

    if (child && child.handler) {
      return {
        handler: child.handler,
        params: params
      };
    }

    return this._find(remain, node, params);
  };

  _proto._find = function _find(remain, node, params) {
    var child = node.children.string[remain[0]];

    if (child) {
      var result = this._find(remain.slice(1), child, params);

      if (result) {
        return result;
      }
    }

    for (var k in node.children.regex) {
      child = node.children.regex[k];
      var match = remain.match(child.regex);

      if (match) {
        if (child.param) {
          params[child.param] = match[0];
        }

        if (match[0].length === remain.length) {
          return {
            handler: child.handler,
            params: params
          };
        } else {
          var _result = this._findOptim(remain.slice(match[0].length), child, params);

          if (_result) {
            return _result;
          }
        }
      }
    }

    return null;
  };

  return Router;
}();

module.exports = Router;

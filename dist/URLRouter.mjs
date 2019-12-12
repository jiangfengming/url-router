var REGEX_PARAM_DEFAULT = /^[^/]+/;
var REGEX_START_WITH_PARAM = /^(:\w|\()/;
var REGEX_INCLUDE_PARAM = /:\w|\(/;
var REGEX_MATCH_PARAM = /^(?::(\w+))?(?:\(([^)]+)\))?/;

var Router =
/*#__PURE__*/
function () {
  function Router(routes) {
    var _this = this;

    this.root = this._createNode();

    if (routes) {
      routes.forEach(function (route) {
        return _this.add.apply(_this, route);
      });
    }
  }

  var _proto = Router.prototype;

  _proto._createNode = function _createNode(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        regex = _ref.regex,
        param = _ref.param,
        handler = _ref.handler;

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

  _proto.add = function add(pattern, handler) {
    this._parseOptim(pattern, handler, this.root);

    return this;
  };

  _proto._parse = function _parse(remain, handler, parent) {
    if (REGEX_START_WITH_PARAM.test(remain)) {
      var match = remain.match(REGEX_MATCH_PARAM);
      var node = parent.children.regex[match[0]];

      if (!node) {
        node = parent.children.regex[match[0]] = this._createNode({
          regex: match[2] ? new RegExp('^' + match[2]) : REGEX_PARAM_DEFAULT,
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
    if (REGEX_INCLUDE_PARAM.test(remain)) {
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

    if (child && child.handler !== undefined) {
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
        if (match[0].length === remain.length && child.handler !== undefined) {
          if (child.param) {
            params[child.param] = decodeURIComponent(match[0]);
          }

          return {
            handler: child.handler,
            params: params
          };
        } else {
          var _result = this._findOptim(remain.slice(match[0].length), child, params);

          if (_result) {
            if (child.param) {
              params[child.param] = decodeURIComponent(match[0]);
            }

            return _result;
          }
        }
      }
    }

    return null;
  };

  return Router;
}();

export default Router;

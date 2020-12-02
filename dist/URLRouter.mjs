function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var REGEX_PARAM_DEFAULT = /^[^/]+/;
var REGEX_START_WITH_PARAM = /^(:\w|\()/;
var REGEX_INCLUDE_PARAM = /:\w|\(/;
var REGEX_MATCH_PARAM = /^(?::(\w+))?(?:\(([^)]+)\))?/;

var Router = /*#__PURE__*/function () {
  function Router(routes) {
    var _this = this;

    _classCallCheck(this, Router);

    this.root = this._createNode();

    if (routes) {
      routes.forEach(function (route) {
        return _this.add.apply(_this, _toConsumableArray(route));
      });
    }
  }

  _createClass(Router, [{
    key: "_createNode",
    value: function _createNode() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
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
    }
  }, {
    key: "add",
    value: function add(pattern, handler) {
      this._parseOptim(pattern, handler, this.root);

      return this;
    }
  }, {
    key: "_parse",
    value: function _parse(remain, handler, parent) {
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
    }
  }, {
    key: "_parseOptim",
    value: function _parseOptim(remain, handler, node) {
      if (REGEX_INCLUDE_PARAM.test(remain)) {
        this._parse(remain, handler, node);
      } else {
        var child = node.children.string[remain];

        if (child) {
          child.handler = handler;
        } else {
          node.children.string[remain] = this._createNode({
            handler: handler
          });
        }
      }
    }
  }, {
    key: "find",
    value: function find(path) {
      return this._findOptim(path, this.root, {});
    }
  }, {
    key: "_findOptim",
    value: function _findOptim(remain, node, params) {
      var child = node.children.string[remain];

      if (child && child.handler !== undefined) {
        return {
          handler: child.handler,
          params: params
        };
      }

      return this._find(remain, node, params);
    }
  }, {
    key: "_find",
    value: function _find(remain, node, params) {
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
    }
  }]);

  return Router;
}();

export default Router;

'use strict';

class Router {
  constructor(...routes) {
    this.root = this._createNode();

    for (const route of routes) {
      this.add(...route);
    }
  }

  _createNode({ regex, param, handler } = {}) {
    return {
      regex,
      param,
      handler,

      children: {
        string: {},
        regex: {}
      }
    }
  }

  add(pattern, handler) {
    this._parseOptim(pattern, handler, this.root);
    return this
  }

  _parse(remain, handler, parent) {
    if (/^(:\w|\()/.test(remain)) {
      const match = remain.match(/^(?::(\w+))?(?:\(([^)]+)\))?/);
      let node = parent.children.regex[match[0]];

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
      const char = remain[0];
      let node = parent.children.string[char];

      if (!node) {
        node = parent.children.string[char] = this._createNode();
      }

      this._parse(remain.slice(1), handler, node);
    }
  }

  _parseOptim(remain, handler, node) {
    if (/:\w|\(/.test(remain)) {
      this._parse(remain, handler, node);
    } else {
      node.children.string[remain] = this._createNode({ handler });
    }
  }

  find(path) {
    return this._findOptim(path, this.root, {})
  }

  _findOptim(remain, node, params) {
    const child = node.children.string[remain];

    if (child && child.handler) {
      return {
        handler: child.handler,
        params
      }
    }

    return this._find(remain, node, params)
  }

  _find(remain, node, params) {
    let child = node.children.string[remain[0]];

    if (child) {
      const result = this._find(remain.slice(1), child, params);

      if (result) {
        return result
      }
    }

    for (const k in node.children.regex) {
      child = node.children.regex[k];
      const match = remain.match(child.regex);

      if (match) {
        if (child.param) {
          params[child.param] = match[0];
        }

        if (match[0].length === remain.length) {
          return {
            handler: child.handler,
            params
          }
        } else {
          const result = this._findOptim(remain.slice(match[0].length), child, params);

          if (result) {
            return result
          }
        }
      }
    }

    return null
  }
}

module.exports = Router;

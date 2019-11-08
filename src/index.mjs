import { StringCaster } from 'cast-string'

class Router {
  constructor(routes) {
    this.root = this._createNode('', null)

    if (routes) {
      for (const route of routes) {
        this.add.apply(this, route)
      }
    }
  }

  _createNode(segment, param, handler) {
    return {
      segment,
      param,
      handler,

      children: {
        string: {},
        regex: []
      }
    }
  }

  add(path, handler) {
    if (/:\w/.test(path)) {
      this._parse(path, handler, this.root)
    } else {
      this.root.children.string[path] = this._createNode(path, null, handler)
    }

    return this
  }

  _parse(remain, handler, parent) {
    if (/^:\w/.test(remain)) {
      const match = remain.match(/^:(\w+)(?:\(([^)]+)\))?/)
      const param = match[1]
      const regex = new RegExp('^' + match[2])
      const node = this._createNode(regex, param, handler)
    } else {
      const char = remain[0]
      const node = parent.children.string[char] = this._createNode(char, handler)
      this._parse(remain.slice(1), handler, node)
    }
  }

  find(path) {
  }
}

export default Router

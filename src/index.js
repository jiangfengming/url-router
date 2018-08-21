class Router {
  constructor(routes) {
    this._routes = {}

    if (routes) {
      for (const route of routes) {
        this.add(...route)
      }
    }
  }

  add(method, path, handler, test) {
    method = method.toUpperCase()
    if (!this._routes[method]) this._routes[method] = []

    const table = this._routes[method]

    if (path.constructor === RegExp) {
      table.push({
        path,
        regex: path,
        handler,
        test
      })
    } else {
      if (!/:|\*|\$/.test(path)) {
        table.push({
          path,
          handler,
          test
        })
      } else {
        const params = []

        const regex = path.replace(/[\\&()+.[?^{|]/g, '\\$&')
          .replace(/:(\w+)/g, (str, key) => {
            params.push(key)
            return '([^/]+)'
          })
          .replace(/\*/g, '.*')

        table.push({
          path,
          regex: new RegExp(`^${regex}$`),
          handler,
          params,
          test
        })
      }
    }
  }

  get(path, handler, test) {
    return this.add('GET', path, handler, test)
  }

  post(path, handler, test) {
    return this.add('POST', path, handler, test)
  }

  put(path, handler, test) {
    return this.add('PUT', path, handler, test)
  }

  delete(path, handler, test) {
    return this.add('DELETE', path, handler, test)
  }

  head(path, handler, test) {
    return this.add('HEAD', path, handler, test)
  }

  connect(path, handler, test) {
    return this.add('CONNECT', path, handler, test)
  }

  options(path, handler, test) {
    return this.add('OPTIONS', path, handler, test)
  }

  trace(path, handler, test) {
    return this.add('TRACE', path, handler, test)
  }

  patch(path, handler, test) {
    return this.add('PATCH', path, handler, test)
  }

  find(method, path, testArg) {
    method = method.toUpperCase()
    const table = this._routes[method]

    for (const route of table) {
      let resolved

      if (route.regex) {
        const matches = path.match(route.regex)
        if (matches) {
          let handler = route.handler
          if (handler.constructor === String && handler.includes('$')) {
            handler = handler === '$&' ? path : path.replace(route.regex, handler)
          }

          matches.shift()
          const params = {}

          if (route.params) {
            route.params.forEach((v, i) => params[v] = matches[i])
          } else {
            matches.forEach((v, i) => params['$' + (i + 1)] = v)
          }

          resolved = {
            method,
            path,
            handler,
            params
          }
        }
      } else {
        if (route.path === path) {
          resolved = {
            method,
            path,
            handler: route.handler,
            params: {}
          }
        }
      }

      if (resolved && (!route.test || route.test(resolved, testArg))) {
        return resolved
      }
    }

    return null
  }
}

export default Router

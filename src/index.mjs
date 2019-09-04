import { StringCaster } from 'cast-string'

class Router {
  constructor(routes) {
    this._routes = {}

    if (routes) {
      for (const route of routes) {
        this.add.apply(this, route)
      }
    }
  }

  add(method, path, handler) {
    // if method is omitted, defaults to 'GET'
    if (method.constructor !== String
      || !['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)
    ) {
      [method, path, handler] = ['GET', method, path]
    }

    if (!this._routes[method]) {
      this._routes[method] = []
    }

    const table = this._routes[method]

    if (path.constructor === RegExp) {
      table.push({
        path,
        regex: path,
        handler
      })
    } else {
      if (!/:|\*|\$/.test(path)) {
        table.push({
          path,
          handler
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
          params
        })
      }
    }

    return this
  }

  get(path, handler) {
    return this.add('GET', path, handler)
  }

  post(path, handler) {
    return this.add('POST', path, handler)
  }

  put(path, handler) {
    return this.add('PUT', path, handler)
  }

  delete(path, handler) {
    return this.add('DELETE', path, handler)
  }

  patch(path, handler) {
    return this.add('PATCH', path, handler)
  }

  head(path, handler) {
    return this.add('HEAD', path, handler)
  }

  options(path, handler) {
    return this.add('OPTIONS', path, handler)
  }

  trace(path, handler) {
    return this.add('TRACE', path, handler)
  }

  find(method, path) {
    // if method is omitted, defaults to 'GET'
    if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
      [method, path] = ['GET', method]
    }

    const table = this._routes[method]

    if (!table) {
      return null
    }

    for (const route of table) {
      let resolved

      if (route.regex) {
        const matches = path.match(route.regex)

        if (matches) {
          let handler = route.handler

          if (handler.constructor === String && handler.includes('$')) {
            handler = handler === '$&' ? path : path.replace(route.regex, handler)
          }

          let params

          if (matches.groups) {
            params = matches.groups
          } else {
            params = {}
            matches.shift()

            if (route.params) {
              route.params.forEach((v, i) => params[v] = matches[i])
            } else {
              matches.forEach((v, i) => params['$' + (i + 1)] = v)
            }
          }

          for (const k in params) {
            params[k] = !params[k] ? params[k] : decodeURIComponent(params[k])
          }

          resolved = {
            method,
            path,
            handler,
            params: new StringCaster(params)
          }
        }
      } else {
        if (route.path === path) {
          resolved = {
            method,
            path,
            handler: route.handler,
            params: new StringCaster({})
          }
        }
      }

      if (resolved) {
        return resolved
      }
    }

    return null
  }
}

export default Router

import { int, float, number, bool, string, arrayOfInt, arrayOfFloat, arrayOfNumber, arrayOfString } from 'cast-string'

class Router {
  constructor(routes) {
    this._routes = {}

    if (routes) {
      for (const route of routes) {
        this.add.apply(this, route)
      }
    }
  }

  add(method, path, handler, test) {
    // if method is omitted, defaults to 'GET'
    if (method.constructor !== String ||
      !['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
      [method, path, handler, test] = ['GET', method, path, handler]
    }

    if (!this._routes[method]) {
      this._routes[method] = []
    }

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

    return this
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

  patch(path, handler, test) {
    return this.add('PATCH', path, handler, test)
  }

  head(path, handler, test) {
    return this.add('HEAD', path, handler, test)
  }

  options(path, handler, test) {
    return this.add('OPTIONS', path, handler, test)
  }

  trace(path, handler, test) {
    return this.add('TRACE', path, handler, test)
  }

  find(method, path, testArg) {
    // if method is omitted, defaults to 'GET'
    if (method.constructor !== String ||
      !['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
      [method, path, testArg] = ['GET', method, path]
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
            params[k] = decodeURIComponent(params[k])
          }

          resolved = {
            method,
            path,
            handler,
            params: createParamsObj(params)
          }
        }
      } else {
        if (route.path === path) {
          resolved = {
            method,
            path,
            handler: route.handler,
            params: createParamsObj({})
          }
        }
      }

      if (resolved && (!route.test || route.test(resolved, testArg))) {
        return resolved
      }
    }

    return null

    function createParamsObj(params) {
      return {
        all: params,

        int(param, radix, defaults, throwIfInvalid) {
          return int(this.all[param], radix, defaults, throwIfInvalid)
        },

        float(param, defaults, throwIfInvalid) {
          return float(this.all[param], defaults, throwIfInvalid)
        },

        number(param, defaults, throwIfInvalid) {
          return number(this.all[param], defaults, throwIfInvalid)
        },

        bool(param, defaults, throwIfInvalid) {
          return bool(this.all[param], defaults, throwIfInvalid)
        },

        string(param, defaults) {
          return string(this.all[param], defaults)
        },

        arrayOfInt(param, radix, defaults, throwIfInvalid) {
          const a = this.all[param] == null ? [] : this.all[param].split(',')
          return arrayOfInt(a, radix, defaults, throwIfInvalid)
        },

        arrayOfFloat(param, defaults, throwIfInvalid) {
          const a = this.all[param] == null ? [] : this.all[param].split(',')
          return arrayOfFloat(a, defaults, throwIfInvalid)
        },

        arrayOfNumber(param, defaults, throwIfInvalid) {
          const a = this.all[param] == null ? [] : this.all[param].split(',')
          return arrayOfNumber(a, defaults, throwIfInvalid)
        },

        arrayOfString(param, defaults, throwIfInvalid) {
          const a = this.all[param] == null ? [] : this.all[param].split(',')
          return arrayOfString(a, defaults, throwIfInvalid)
        }
      }
    }
  }
}

export default Router

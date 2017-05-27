class Router {
  constructor(conf) {
    this._routes = {}

    if (conf.constructor === Array) conf = { ALL: conf }

    for (const method in conf) {
      const routes = conf[method]
      const rts = this._routes[method] = {
        string: {},
        regex: []
      }

      for (const _rt of routes) {
        let path, result, params, options

        if (_rt.constructor === String) {
          path = _rt
          result = '$&'
          params = []
          options = {}
        } else {
          const rt = _rt.concat() // clone, preserve original route
          path = rt.shift()
          result = rt.length ? rt.shift() : '$&'
          options = typeof rt[rt.length - 1] === 'object' ? rt.pop() : {}
          params = rt
        }

        if (path.constructor === RegExp) {
          rts.regex.push({
            path,
            result,
            params,
            options,
            origin: _rt
          })
        } else {
          if (!/:|\*|\$/.test(path)) {
            rts.string[path] = {
              result: result === '$&' ? path : result,
              options,
              origin: _rt
            }
          } else {
            params = []

            path = path.replace(/[\\&()+.[?^{|]/g, '\\$&')
              .replace(/:(\w+)/g, (str, key) => {
                params.push(key)
                return '([^/]+)'
              })
              .replace(/\*/g, '.*')

            rts.regex.push({
              path: new RegExp(`^${path}$`),
              result,
              params,
              options,
              origin: _rt
            })
          }
        }
      }
    }
  }

  find(path, method = 'ALL') {
    const rts = this._routes[method]

    if (rts) {
      if (rts.string[path]) {
        const match = {
          result: rts.string[path].result,
          params: {},
          options: rts.string[path].options,
          origin: rts.string[path].origin
        }

        if (Router.log) {
          console.log('path:', path, '\n', 'method:', method, '\n', 'match:', match) // eslint-disable-line
        }

        return match
      }

      let result
      const params = {}
      for (const rt of rts.regex) {
        const matches = path.match(rt.path)
        if (matches) {
          result = rt.result
          if (result && result.constructor === String && result.indexOf('$') !== -1) {
            result = result === '$&' ? path : path.replace(rt.path, result)
          }

          matches.shift()
          for (let j = 0; j < rt.params.length; j++) {
            if (rt.params[j]) {
              params[rt.params[j]] = matches[j]
            }
          }

          const match = {
            result,
            params,
            options: rt.options,
            origin: rt.origin
          }

          if (Router.log) {
            console.log('path:', path, '\n', 'method:', method, '\n', 'match:', match) // eslint-disable-line
          }

          return match
        }
      }
    }

    if (Router.log) {
      console.log('path:', path, '\n', 'method:', method, '\n', 'match:', null) // eslint-disable-line
    }

    return method === 'ALL' ? null : this.match(path)
  }
}

export default Router

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
        const rt = [].concat(_rt)
        const path = rt.shift()
        const handler = rt.shift() || '$&'
        const options = rt.shift() || {}

        if (path.constructor === RegExp) {
          rts.regex.push({
            path,
            handler,
            options,
            origin: _rt
          })
        } else {
          if (!/:|\*|\$/.test(path)) {
            rts.string[path] = {
              handler: handler === '$&' ? path : handler,
              options,
              origin: _rt
            }
          } else {
            const params = []

            const regex = path.replace(/[\\&()+.[?^{|]/g, '\\$&')
              .replace(/:(\w+)/g, (str, key) => {
                params.push(key)
                return '([^/]+)'
              })
              .replace(/\*/g, '.*')

            rts.regex.push({
              path: new RegExp(`^${regex}$`),
              handler,
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
          handler: rts.string[path].handler,
          params: {},
          options: rts.string[path].options,
          origin: rts.string[path].origin
        }

        if (Router.log) {
          console.log('path:', path, '\n', 'method:', method, '\n', 'match:', match) // eslint-disable-line
        }

        return match
      }

      let handler
      const params = {}
      for (const rt of rts.regex) {
        const matches = path.match(rt.path)
        if (matches) {
          handler = rt.handler
          if (handler && handler.constructor === String && handler.indexOf('$') !== -1) {
            handler = handler === '$&' ? path : path.replace(rt.path, handler)
          }

          matches.shift()

          if (rt.params) {
            rt.params.forEach((v, i) => params[v] = matches[i])
          } else {
            matches.forEach((v, i) => params[`$${i + 1}`] = v)
          }

          const match = {
            handler,
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

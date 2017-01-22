class Router {
  constructor(conf) {
    this.routes = {}

    if (conf.constructor === Array) conf = { ALL: conf }

    for (const method in conf) {
      const routes = conf[method]
      const rts = this.routes[method] = {
        string: {},
        regex: []
      }

      for (const _rt of routes) {
        let pattern, replacement, params, options

        if (_rt.constructor === String) {
          pattern = _rt
          replacement = '$&'
          params = []
          options = {}
        } else {
          const rt = _rt.concat()
          pattern = rt.shift()
          replacement = rt.shift() || '$&'
          options = typeof rt[rt.length - 1] == 'object' ? rt.pop() : {}
          params = rt
        }

        if (pattern.constructor === RegExp) {
          rts.regex.push({
            pattern,
            replacement,
            params,
            options,
            origin: _rt
          })
        } else {
          if (!/:|\*|\$/.test(pattern)) {
            rts.string[pattern] = {
              replacement: replacement === '$&' ? pattern : replacement,
              options,
              origin: _rt
            }
          } else {
            params = []

            pattern = pattern.replace(/[\\&()+.[?^{|]/g, '\\$&')
              .replace(/:(\w+)/g, (str, key) => {
                params.push(key)
                return '([^/]+)'
              })
              .replace(/\*/g, '.*')

            rts.regex.push({
              pattern: new RegExp(`^${pattern}$`),
              replacement,
              params,
              options,
              origin: _rt
            })
          }
        }
      }
    }
  }

  match(path, method = 'ALL') {
    const rts = this.routes[method]

    if (rts) {
      if (rts.string[path]) {
        const match = {
          path: rts.string[path].replacement,
          params: {},
          options: rts.string[path].options,
          origin: rts.string[path].origin
        }

        if (Router.log) {
          console.log('path:', path, '\n', 'method:', method, '\n', 'match:', match) // eslint-disable-line
        }

        return match
      }

      let replacement
      const params = {}
      for (const rt of rts.regex) {
        const matches = path.match(rt.pattern)
        if (matches) {
          replacement = rt.replacement
          if (replacement.indexOf('$') !== -1) {
            replacement = replacement === '$&' ? path : path.replace(rt.pattern, replacement)
          }

          matches.shift()
          for (let j = 0; j < rt.params.length; j++) {
            if (rt.params[j]) {
              params[rt.params[j]] = matches[j]
            }
          }

          const match = {
            path: replacement,
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

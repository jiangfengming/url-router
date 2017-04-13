# Router
A URL router library.

## Installing

```
npm install url-router --save
```

## Examples

### Browser:

```js
import Router from 'url-router'

const router = new Router([
  ['/path/from', '/resolve/to', { layout: 'main' }],
  '/foo/bar',
  '/baz/*',
  ['/user/:id/profile', '/user/profile'],
  ['/services/:controller/:method', '/service/$1'],
  [/^\/article\/(\d+)$/, '/article', 'id', { layout: 'main' }],
  ['/resolve/to/function', () => { console.log('hello') } ],
  ['/resolve/to/object', { template: 'hello' }],
  ['/in/fact/you/can/resolve/to/any/type', Symbol('hello')]
])

const route = router.find(location.pathname)
```

### node.js:

```js
const http = require('http')
const Router = require('url-router')
const url = require('url')

const ArticleController = require('./controllers/article')

const router = new Router({
  GET: [
    ['/article/:id', ArticleController.get]
  ],

  POST: [
    ['/article', ArticleController.create]
  ],

  PUT: [
    ['/article/:id', ArticleController.update]
  ],

  DELETE: [
    ['/article/:id', ArticleController.remove]
  ]
})

http.createServer((req, res) => {
  const _url = url.parse(req.url)
  const route = router.find(_url.pathname, req.method)
  route.result(req, res)
  // ...
}).listen(8080)
```

## API

### new Router(routes)
Create a router.

#### Routes Definition:

```js
const routes = {
  GET: [
    route,
    ...
  ],

  POST: [
    route,
    ...
  ],

  PUT: [
    route,
    ...
  ],

  DELETE: [
    route,
    ...
  ],

  ALL: [
    route,
    ...
  ]
}
```

Routes are grouped by different HTTP methods. Routes in group `ALL` will be checked by all requests regardless of method.

In the browser-side, there's no need to distinguish HTTP methods, we can simply write:

```js
const routes = [
  route,
  ...
]
```

It's a shorthand of

```js
const routes = {
  ALL: [
    route,
    ...
  ]
}
```

#### Route Definition

```js
const router = new Router([
  /*
    Syntax: [path, result, options]

    path: String. The path to match against.
    result: Any. The result.
    options: Object. Optional. If set, it will be returned as 'matchedRoute.options' unchanged.
  */
  ['/path/from', '/resolve/to', { layout: 'main', requireLogin: true }],
  /*
    router.find('/path/from')

    Returns:

    {
      result: '/resolve/to',
      params: {},
      options: { layout: 'main', requireLogin: true },
      origin: ['/path/from', '/resolve/to', { layout: 'main', requireLogin: true }]
    }
  */

  // resolve to a function
  ['/resolve/to/function', () => { console.log('hello') }, { layout: 'main', requireLogin: true } ],
  /*
    router.find('/resolve/to/function')

    Returns:

    {
      result: () => { console.log('hello') },
      params: {},
      options: { layout: 'main', requireLogin: true },
      origin: ['/resolve/to/function', () => { console.log('hello') }, { layout: 'main', requireLogin: true } ]
    }
  */


  // resolve to an object
  ['/resolve/to/object', { template: 'hello' }, { layout: 'main', requireLogin: true } ],
  /*
    router.find('/resolve/to/object')

    Returns:

    {
      result: { template: 'hello' },
      params: {},
      options: { layout: 'main', requireLogin: true },
      origin: ['/resolve/to/object', { template: 'hello' }, { layout: 'main', requireLogin: true } ]
    }
  */

  // resolve to any type
  ['/in/fact/you/can/resolve/to/any/type', Symbol('hello')]

  /*
    Parameters

    Words begin with : will be resolved as parameters.
  */
  ['/user/:id/profile', '/user/profile'],
  /*
    router.find('/user/123/profile')

    Returns:

    {
      result: '/user/profile',
      params: { id: 123 },
      options: {},
      origin: ['/user/:id/profile', '/user/profile'],
    }
  */


  /*
    Internally, ":key" will be converted to regular expression sub-pattern. So we can use $1~$9 to access them in result
  */
  ['/services/:controller/:method', '/service/$1'],
  /*
    router.find('/services/article/create')

    Returns:

    {
      result: '/services/article',
      params: { controller: 'article', method: 'create' },
      options: {},
      origin: ['/services/:controller/:method', '/service/$1']
    }
  */


  // Shorthand of [path, '$&']. '$&' means keep the path unchanged.
  '/foo/bar',
  /*
    router.match('/foo/bar')

    Returns:

    {
      result: '/foo/bar',
      params: {},
      options: {},
      origin: '/foo/bar'
    }
  */


  /*
    Wildcard
  */
  '/baz/*',
  /*
    Shorthand of ['/baz/*', '$&']

    This route will match all paths begin with '/baz/'.

    router.match('/baz/hello')

    Returns:

    {
      result: '/baz/hello',
      params: {},
      options: {},
      origin: '/barz/*'
    }
  */


  /*
    path can be a regular expression.
    The matched substrings will be set as params, the name of params are defined after result and before options.
  */
  [/^\/article\/(\d+)$/, '/article', 'id', { layout: 'main' }],
  /*
    router.find('/article/123')

    Returns:

    {
      result: '/article',
      params: { id: '123' },
      options: { layout: 'main' },
      origin: [/^\/article\/(\d+)$/, '/article', 'id', { layout: 'main' }]
    }
  */
])
```

### router.find(path, method = 'ALL')
Gives the path and method, returns a matched route.

#### Returns
Matched route object, or `null` if no route matches.

```js
{
  path,
  params,
  options,
  origin
}
```

See Route Definition.


### Router.log
Turn on log:

```js
Router.log = true
```


## License
[MIT](LICENSE)

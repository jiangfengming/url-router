# Router.js

## Installing

```
npm install url-router --save
```

## Usage

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
])

const route = router.match(location.pathname)
```

### node.js:

```js
const http = require('http')
const Router = require('url-router')
const url = require('url')

const router = new Router({
  GET: [
    ['/article/:id', '/article', { method: 'get' }]
  ],

  POST: [
    ['/article', '/article', { method: 'create' }]
  ],

  PUT: [
    ['/article/:id', '/article', { method: 'update' }]
  ],

  DELETE: [
    ['/article/:id', '/article', { method: 'remove' }]
  ]
})

http.createServer((req, res) => {
  const _url = url.parse(req.url)
  const route = router.match(_url.pathname, req.method)

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
    Syntax: [from, to, options]

    from: String. the path to match against.
    to: String. the path rewrited to.
    options: Object. Optional. If set, it will be returned as 'matchedRoute.options' unchanged.
  */
  ['/path/from', '/resolve/to', { layout: 'main' }],
  /*
    router.match('/path/from')

    Returns:

    {
      path: '/resolve/to',
      params: {},
      options: { layout: 'main' },
      origin: ['/path/from', '/resolve/to', { layout: 'main' }]
    }
  */


  /*
    Syntax: from

    Shorthand of [from, '$&']
    '$&' means keep the path unchanged.
  */
  '/foo/bar',
  /*
    router.match('/foo/bar')

    Returns:

    {
      path: '/foo/bar',
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
    Shorthand of ['/baz/*', '$&]

    This route will match all paths begin with '/baz/'.

    router.match('/baz/hello')

    Returns:

    {
      path: '/baz/hello',
      params: {},
      options: {},
      origin: '/barz/*'
    }
  */


  /*
    Parameters

    Words begin with : will be resolved as parameters.
  */
  ['/user/:id/profile', '/user/profile'],
  /*
    router.match('/user/123/profile')

    Returns:

    {
      path: '/user/profile',
      params: { id: 123 },
      options: {},
      origin: ['/user/:id/profile', '/user/profile'],
    }
  */


  /*
    Internally, ":key" will be converted to regular expression sub-pattern. So we can use $1~$9 to access them in 'to'
  */
  ['/services/:controller/:method', '/service/$1'],
  /*
    router.match('/services/article/create')

    Returns:

    {
      path: '/services/article',
      params: { controller: 'article', method: 'create' },
      options: {},
      origin: ['/services/:controller/:method', '/service/$1']
    }
  */


  /*
    'from' can be a regular expression.
    The matched substrings will be set as params, the keys are defined after 'to' but before 'options'.
  */
  [/^\/article\/(\d+)$/, '/article', 'id', { layout: 'main' }],
  /*
    router.match('/article/123')

    Returns:

    {
      path: '/article',
      params: { id: 123 },
      options: { layout: 'main' },
      origin: [/^\/article\/(\d+)$/, '/article', 'id', { layout: 'main' }]
    }
  */
])
```

### router.match(path, method = 'ALL')
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

# url-router

A non-opinionated cross-platform URL routing library.

## Installing

```
npm install url-router
```

## Examples

### Browser:

```js
import Router from 'url-router'

const router = new Router([
  ['GET', '/', () => import('./views/Homepage')],
  ['GET', '/user/:id/profile', () => import('./views/UserProfile')],
  ['GET', /^\/article\/(\d+)$/, () => import('./views/Article')]
])

const route = router.find(location.pathname)
route.handler(route)
```

### node.js:

```js
const http = require('http')
const Router = require('url-router')
const { URL } = require('url')

const ArticleController = require('./controllers/article')

const router = new Router([
  ['GET','/article/:id', ArticleController.get],
  ['POST', '/article', ArticleController.create],
  ['PUT', '/article/:id', ArticleController.update],
  ['DELETE', '/article/:id', ArticleController.remove],
])

http.createServer((req, res) => {
  const url = new URL(req.url)
  const route = router.find(req.method, url.pathname)
  route.handler({ req, res, route })
}).listen(8080)
```

## API

### new Router(routes)

Creates a router instance.

Params:  
`routes`: Array. An array of routes.

route signature:

```js
new Router([
  [method, path, handler, test],
  ...
])
```


#### method

String. HTTP method. 'GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'.  


#### path

String | Regexp. The path to match against the request path.
`path` is the `pathname` of [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL),
that is, without query string and hash segment.

You could define route params in a string `path`, for example:

```
route path: /people/:username/articles/:articleId
request: /people/johnsmith/articles/123
params: { username: 'johnsmith', articleId: '123' }
```

`*` is wildcard, e.g., route path `/foo*bar` can match `/foowwsdfbar`.

If you need more power, use Regexp. Capturing groups will be set as route params, keys are `$1, $2, ...`.

```
route path: /^\/article\/(\d+)$/
request: /article/123
params: { $1: '123' }
```


#### handler

Any type. The handler you wish to handle the request.
Based on your framework design, the handler can be a function to resolve the request,
or the file path to your controller file, or an object with various options.

If `handler` is a string and contains `$` character, and `path` is a regexp (string with route params and wildcard will be converted to regexp underlying), the `handler` will be rewitten. For example:

```
route path: /people/:username/:page
handler: /people/$2
request: /people/johnsmith/articles

result: { handler: '/people/articles', params: { username: 'johnsmith', page: 'articles' } }
```

The rewrite formula is
```js
routeHandler = requestPath.replace(routePath, routeHandler)
```

The route params will be converted to capturing groups, so can be accessed by `$1, $2, ...`.


#### test

Function. Optional. Your custom test function to test against the request.
If test function is defined, the route will be matched only if
1. The request path is matched with route's path
2. The test function is passed (return true)

Function signature:

```js
function test(matchedRoute, testArg) {
  // should return true or false
}
```

`matchedRoute`: Object.

```js
{
  method,
  path,
  handler,
  params
}
```

`testArg`: Arguments passed by `router.find()`.


### router.add(method, path, handler, test)

Adds a route to route table.

Every HTTP method has a shortcut alias:

```js
router.get(path, handler, test)
router.post(path, handler, test)
router.put(path, handler, test)
router.delete(path, handler, test)
router.head(path, handler, test)
router.connect(path, handler, test)
router.options(path, handler, test)
router.trace(path, handler, test)
router.patch(path, handler, test)
```


### router.find(method, path, testArg)

Finds the route which matches the method and path, and passes the test function if thers is one, or `undefined` if no route matches.

Params:  
`method`: String. The request method.  
`path`: String. The request method.  
`testArg`: Any. Argument provides to route test function.

Returns: 
```js
{
  method,
  path,
  handler,
  params
}
```

## License
[MIT](LICENSE)

# url-router
A non-opinionated cross-platform URL routing library.

## Installation
```
npm install url-router
```

## Examples

### Browser:

```js
import Router from 'url-router'

const router = new Router([
  ['/', () => import('./views/Homepage')],
  ['/user/:id/profile', () => import('./views/UserProfile')],
  [/^\/article\/(\d+)$/, () => import('./views/Article')],

  // es2018 named capture groups
  [/^\/post\/(?<id>\d+)$/, () => import('./views/Post')]
])

const route = router.find(location.pathname)
route.handler(route)
```

### node.js:

```js
const http = require('http')
const Router = require('url-router')
const { URL } = require('url')

const article = require('./controllers/article')

const router = new Router([
  ['GET','/article/:id', article.get],
  ['POST', '/article', article.create],
  ['PUT', '/article/:id', article.update],
  ['DELETE', '/article/:id', article.remove],
])

http.createServer((req, res) => {
  const url = new URL(req.url)
  const route = router.find(req.method, url.pathname)
  route.handler({ req, res, route })
}).listen(8080)
```

## API

### new Router()
```js
new Router([routes])
```

Creates a router instance.

#### routes
`Array`. An array of routes.

```js
[
  [method?, path, handler],
  ...
]
```

##### method
`String.` Optional. HTTP method, case-sensitive. `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, `OPTIONS`, `TRACE`.
If `method` is omitted, it defaults to `GET`.

##### path
`String` | `RegExp`. The path to match against the request path.

###### params
You could define route params in `path`, for example:

```js
const router = new Router([
  ['/people/:username/articles/:articleId', handler]
])

const matchedRoute = router.find('/people/johnsmith/articles/123')

/*
result:
{
  method: 'GET',
  path: '/people/johnsmith/articles/123',
  handler: handler
  params: new StringCaster({ username: 'johnsmith', articleId: '123' })
}
*/
```

`matchedRoute.params` is a [StringCaster](https://github.com/jiangfengming/cast-string#stringcaster) object.

###### wildcard
`*` can match any characters. e.g., `/foo*bar` can match `/foowwsdfbar`.

###### RegExp
If you need more power, use RegExp. Capture groups will be set as route params, keys are `$1, $2, ...`.

```js
const router = new Router([
  [/^\/article\/(\d+)$/, handler]
])

router.find('/article/123')

/*
result:
{
  method: 'GET',
  path: '/article/123',
  handler: handler
  params: new StringCaster({ $1: '123' })
}
*/
```

You can use [named capture groups](http://2ality.com/2017/05/regexp-named-capture-groups.html) introduced in ES2018:
```js
const router = new Router([
  [/^\/article\/(?<id>\d+)$/, handler]
])

router.find('/article/123')

/*
result:
{
  method: 'GET',
  path: '/article/123',
  handler: handler
  params: new StringCaster({ id: '123' })
}
*/
```

##### handler
`Any`. The handler you wish to handle the request.
Based on your framework design, the handler can be a function to handle the request,
or the file path to your controller file, or an object (such as Vue component), etc.

If `handler` is a string and contains `$` character, and `path` is a regexp (string with route params and wildcard will be converted to regexp underlying), the `handler` will be rewitten. For example:

```js
const router = new Router([
  ['/people/:username/:page', '/people/$2']
])

router.find('/people/johnsmith/articles')

/*
result:
{
  method: 'GET',
  path: '/people/johnsmith/articles',
  handler: '/people/articles',
  params: new StringCaster({ username: 'johnsmith', page: 'articles' })
}
*/
```

The rewrite formula is
```js
routeHandler = requestPath.replace(routePath, routeHandler)
```

The route params will be converted to capture groups, so can be accessed by `$1, $2, ...`.

Use ES2018 named capture groups:
```js
const router = new Router([
  [/\/member\/(?<id>\d+)\/(?<page>[^/]+)$/, '/member/$<page>']
])

router.find('/member/234/profile')

/*
result:
{
  method: 'GET',
  path: '/member/234/profile',
  handler: '/member/profile',
  params: new StringCaster({ id: '234', page: 'profile' })
}
*/
```

`matchedRoute`: `Object`.

```js
{
  method,
  path,
  handler,
  params
}
```

### Router.add()
```js
router.add([method], path, handler)
```

Adds a route to the route table.

`method` is optional, it defaults to `GET`.

Every HTTP method has a shortcut alias:

```js
router.get(path, handler)
router.post(path, handler)
router.put(path, handler)
router.delete(path, handler)
router.patch(path, handler)
router.head(path, handler)
router.options(path, handler)
router.trace(path, handler)
```

#### Returns
The router instance. So you could use method chaining:

```js
router
  .get('/foo', foo)
  .get('/bar', bar)
```

### Router.find()
```js
router.find([method], path)
```

Finds the route which matches the method and path, or `null` if no route matches.

#### Parameters
##### method
`String.` Optional. The request method. If omitted, defaults to `GET`.  

##### path
`String.` The request path.  

#### Returns
```js
{
  method,
  path,
  handler,
  params
}
```

`params` is a [StringCaster](https://github.com/jiangfengming/cast-string#stringcaster) object.

## License
[MIT](LICENSE)

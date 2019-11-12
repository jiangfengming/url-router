# url-router
A Trie-based router.

## Installation
```
npm install url-router
```

## Examples

```js
const assert = require('assert')
const Router = require('url-router')

const router = new Router(
  ['/foo', 1],
  ['/user/:id', 2],
  ['/user/:id/:page', 3],
  ['/people/:name(\\w+)', 4],
  ['(.*)', 5]
)

let r
r = router.find('/foo')
assert.strictEqual(r.handler, 1)

r = router.find('/user/123')
assert.strictEqual(r.handler, 2)
assert.strictEqual(r.params.id, '123')

r = router.find('/user/456/articles')
assert.strictEqual(r.handler, 3)
assert.strictEqual(r.params.id, '456')
assert.strictEqual(r.params.page, 'articles')

r = router.find('/people/john')
assert.strictEqual(r.handler, 4)
assert.strictEqual(r.params.name, 'john')

r = router.find('/404')
assert.strictEqual(r.handler, 5)
```

## API

### Router
```js
new Router(
  [pattern1, handler1],
  [pattern2, handler2],
  ...
)
```

Creates a router instance.

If parameters are provided, `router.add` will be applied on each parameter.

### router.add
```js
router.add(pattern, handler)
```

Adds a route definition.

#### Params

##### pattern
`String`. The pattern to match against the request path.

You can define params in `pattern`, for example:

```js
const router = new Router()
router.add('/people/:username/articles/:articleId(\\d+)', handler)
const result = router.find('/people/johnsmith/articles/123')
/*
result:
{
  handler: handler,
  params: {
    username: 'johnsmith',
    articleId: '123'
  }
}
*/
```

If regex is omitted, it defaults to `[^/]+`.

You can also use regex without setting the parameter name, for example:

```js
router.add('(.*)', NotFound)
```

This defines a catch-all route.

##### handler
`Any`. The handler you wish to handle the request.
Based on your framework design, the handler can be a function to handle the request,
or the file path to your controller file, or an object (such as Vue component), etc.

#### Returns
The router instance. So you could use method chaining:

```js
router
  .add('/foo', foo)
  .add('/bar', bar)
```

### router.find
```js
router.find(path)
```

Finds the route which matches the path.

#### Parameters

##### path
`String.` The request path.  

#### Returns

`handler` and `params` of the route:

```js
{
  handler,
  params
}
```

Or `null` if not found.

## License
[MIT](LICENSE)

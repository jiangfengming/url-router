# url-router
A Trie-based router.

## V13 Breaking Change
The constructor's `routes` parameter changed to key-value object that key is pattern and value is handler.

## Installation
```
npm install url-router
```

NOTE: This package is written in ES2020 syntax and not transpiled. It is tested only on Node.js v14 LTS.
To use it in old browsers, you should transpile the code using tools such as Babel.

## Examples

```js
import assert from 'assert';
import Router from 'url-router';

const router = new Router({
  '/foo': 1,
  '/foo/bar': 2,
  '/user/:id': 3,
  '/user/:id/:page': 4,
  '/people/:name(\\w+)': 5,
  '(.*)': 6,
  '/:year(\\d+)-:month(\\d+)': 7
});

assert.deepStrictEqual(
  router.find('/foo'),

  {
    handler: 1,
    params: {}
  }
);

assert.deepStrictEqual(
  router.find('/foo/bar'),

  {
    handler: 2,
    params: {}
  }
);

assert.deepStrictEqual(
  router.find('/user/123'),

  {
    handler: 3,
    params: {
      id: '123'
    }
  }
);

assert.deepStrictEqual(
  router.find('/user/456/articles'),

  {
    handler: 4,
    params: {
      id: '456',
      page: 'articles'
    }
  }
);

assert.deepStrictEqual(
  router.find('/people/john'),

  {
    handler: 5,
    params: {
      name: 'john'
    }
  }
);

assert.deepStrictEqual(
  router.find('/404'),

  {
    handler: 6,
    params: {}
  }
);

assert.deepStrictEqual(
  router.find('/2019-11'),

  {
    handler: 7,
    params: {
      year: '2019',
      month: '11'
    }
  }
);
```

## API

### Router
```js
const routes = {
  pattern_1: handler_1,
  pattern_2: handler_2,
  ...
};

router = new Router(routes);
```

Creates a router instance.

#### Params
##### routes
Optional. A key-value object that key is pattern and value is handler.
See `router.add()` below for how to define pattern and handler.

### router.add
```js
router.add(pattern, handler)
```

Adds a route entry.

#### Params

##### pattern
`String`. The pattern to match against the request path.

You can define params in `pattern`, for example:

```js
const router = new Router();
router.add('/people/:username/:year(\\d+)-:month(\\d+)/:articleId(\\d+)', handler);
const result = router.find('/people/johnsmith/2020-02/123');
/*
result:
{
  handler: handler,
  params: {
    username: 'johnsmith',
    year: '2020',
    month: '02,
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
`any`. The handler you wish to handle the request.
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
`String`. The request path.  

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

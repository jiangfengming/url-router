# Router.js

## Usage
### browser:
```js
var router = new Router([
  'foo/bar',
  'api/*',
  ['foo/abc', 'view', {foo: 111}],
  ['product/item/:id', 'product/item', {foo: 123}],
  // [regex, redirect_to, regex_subexpression_1, regex_subexpression_2, ..., {param1: value, param2: value, ...}]
  [/^article\/(\d+)$/, 'article', 'id', {bar: 456}],
  
  // by default, path will be validated with /^((\.?[\w-]+)+\/?)+$/.test(path)
  // set validate to false to allow other characters in path
  [false, /^search\/(.+)$/, 'search', 'keyword', {foo: 123}],
  ['*', 'view', {masterpage: 'frame'}]
]);
console.log(router.resolve('foo/bar'));
console.log(router.resolve('api/foo'));
console.log(router.resolve('foo/abc'));
console.log(router.resolve('product/item/111'));
console.log(router.resolve('article/123'));
console.log(router.resolve('search/something'));
console.log(router.resolve('search/一二三'));
console.log(router.resolve('everything/else'));
```

### node.js:
```js
var Router = require('url-router');
var router = new Router({
  GET: [
    [/([a-z]+)\/(\d+)/i, '$1', 'controller', 'id', {method: 'get'}],
    [':controller/:method', '$1']
  ],

  POST: [
    [':controller', '$1', {method: 'create'}]
  ],

  PUT: [
    [':controller/:id', '$1', {method: 'update'}],
    [':controller', '$1', {method: 'update'}]
  ],

  DELETE: [
    [':controller/:id', '$1', {method: 'remove'}]
  ]
});

console.log(router.resolve('article/123', 'GET'));
console.log(router.resolve('article/list', 'GET'));
console.log(router.resolve('article', 'POST'));
console.log(router.resolve('article/123', 'PUT'));
console.log(router.resolve('article/123', 'DELETE'));
```

## License
MIT

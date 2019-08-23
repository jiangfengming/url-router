const assert = require('assert')
const Router = require('..')

const router = new Router([
  ['GET', '/path/from', '/resolve/to'],
  ['POST', '/resolve/to/function', () => { console.log('hello') }],
  ['PUT', '/resolve/to/object', { template: '<h1>hello</h1>' }],

  // method defaults to 'GET'
  ['/user/:id/profile', '/user/profile'],
  ['/people/:username/:page', '/people/$2'],
  [/^\/article\/(\d+)$/, '/article'],

  // es2018 named capture groups
  [/^\/post\/(?<id>\d+)$/, '/post'],
  [/\/member\/(?<id>\d+)\/(?<page>[^/]+)$/, '/member/$<page>'],

  // used as url rewriter
  ['https://www.example.com/', 'https://www.google.com/']
])

router.get('*', { template: '<h1>404</h1>' })

let r
r = router.find('GET', '/path/from')
assert.strictEqual(r.method, 'GET')
assert.strictEqual(r.handler, '/resolve/to')

r = router.find('POST', '/resolve/to/function')
assert.strictEqual(r.method, 'POST')
assert.strictEqual(r.handler.constructor, Function)

r = router.find('PUT', '/resolve/to/object')
assert.strictEqual(r.method, 'PUT')
assert.strictEqual(r.handler.constructor, Object)

r = router.find('/user/123/profile')
assert.strictEqual(r.method, 'GET')
assert.strictEqual(r.handler, '/user/profile')
assert.strictEqual(r.params.int('id'), 123)

r = router.find('/people/johnsmith/articles')
assert.strictEqual(r.handler, '/people/articles')
assert.strictEqual(r.params.string('username'), 'johnsmith')
assert.strictEqual(r.params.string('page'), 'articles')

r = router.find('/people/%E9%95%BF%E8%80%85/news')
assert.strictEqual(r.handler, '/people/news')
assert.strictEqual(r.params.string('username'), '长者')
assert.strictEqual(r.params.string('page'), 'news')

r = router.find('/article/123')
assert.strictEqual(r.handler, '/article')
assert.strictEqual(r.params.int('$1'), 123)

r = router.find('/post/123')
assert.strictEqual(r.handler, '/post')
assert.strictEqual(r.params.int('id'), 123)

r = router.find('/member/234/profile')
assert.strictEqual(r.handler, '/member/profile')
assert.strictEqual(r.params.int('id'), 234)
assert.strictEqual(r.params.string('page'), 'profile')

r = router.find('/404')
assert.strictEqual(r.handler.template, '<h1>404</h1>')

r = router.find('https://www.example.com/')
assert.strictEqual(r.handler, 'https://www.google.com/')

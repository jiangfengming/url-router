const assert = require('assert')
const Router = require('..')

const router = new Router([
  ['/foo', 1],
  ['/user/:id', 2],
  ['/user/:id/:page', 3],
  ['/people/:name(\\w+)', 4]
])

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

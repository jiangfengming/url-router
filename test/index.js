const assert = require('assert')
const Router = require('..')

const router = new Router(
  ['/foo', 1],
  ['/foo/bar', 2],
  ['/user/:id', 3],
  ['/user/:id/:page', 4],
  ['/people/:name(\\w+)', 5],
  ['(.*)', 6]
)

let r
r = router.find('/foo')
assert.strictEqual(r.handler, 1)

r = router.find('/foo/bar')
assert.strictEqual(r.handler, 2)

r = router.find('/user/123')
assert.strictEqual(r.handler, 3)
assert.strictEqual(r.params.id, '123')

r = router.find('/user/456/articles')
assert.strictEqual(r.handler, 4)
assert.strictEqual(r.params.id, '456')
assert.strictEqual(r.params.page, 'articles')

r = router.find('/people/john')
assert.strictEqual(r.handler, 5)
assert.strictEqual(r.params.name, 'john')

r = router.find('/404')
assert.strictEqual(r.handler, 6)

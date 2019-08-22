const Router = require('..')

const router = new Router([
  ['GET', '/path/from', '/resolve/to'],
  ['POST', '/resolve/to/function', () => { console.log('hello') }],
  ['PUT', '/resolve/to/object', { template: '<h1>hello</h1>', layout: 'main' }],

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
console.log(r.method, r.path, r.handler)

r = router.find('POST', '/resolve/to/function')
console.log(r.method, r.path, r.handler)

r = router.find('PUT', '/resolve/to/object')
console.log(r.method, r.path, r.handler)

r = router.find('/user/123/profile')
console.log(r.method, r.path, r.handler, r.params.int('id'))

r = router.find('/people/johnsmith/articles')
console.log(r.method, r.path, r.handler, r.params.string('username'), r.params.string('page'))

r = router.find('/people/%E9%95%BF%E8%80%85/news')
console.log(r.method, r.path, r.handler, r.params.string('username'), r.params.string('page'))

r = router.find('/article/123')
console.log(r.method, r.path, r.handler, r.params.int('$1'))

r = router.find('/post/123')
console.log(r.method, r.path, r.handler, r.params.int('id'))

r = router.find('/member/234/profile')
console.log(r.method, r.path, r.handler, r.params.int('id'), r.params.string('page'))

r = router.find('/404')
console.log(r.method, r.path, r.handler)

r = router.find('https://www.example.com/')
console.log(r.method, r.path, r.handler)

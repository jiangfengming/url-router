import assert from 'assert';
import Router from '../dist/index.js';

const router = new Router({
  '/foo': 1,
  '/foo/bar': 2,
  '/user/:id': 3,
  '/user/:id/:page': 4,
  '/people/:name([\\w%]+)': 5,
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
  router.find('/people/%E5%BC%A0%E4%B8%89'),

  {
    handler: 5,
    params: {
      name: '张三'
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

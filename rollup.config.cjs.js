import babel from '@rollup/plugin-babel';

export default {
  input: 'src/index.js',

  output: {
    format: 'cjs',
    file: 'dist/url-router.cjs',
    exports: 'auto'
  },

  plugins: [
    babel({
      babelHelpers: 'bundled'
    })
  ]
};

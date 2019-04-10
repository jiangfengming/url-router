import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.mjs',

  output: {
    format: 'esm',
    file: 'es5/index.mjs'
  },

  plugins: [
    babel()
  ]
}

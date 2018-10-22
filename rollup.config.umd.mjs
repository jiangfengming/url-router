import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.mjs',
  output: {
    format: 'umd',
    name: 'Router',
    file: 'dist/Router.js'
  },
  plugins: [
    babel()
  ]
}

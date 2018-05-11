import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: {
    format: 'umd',
    name: 'Router',
    file: 'dist/Router.umd.js'
  },
  plugins: [
    babel()
  ]
}

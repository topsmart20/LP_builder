import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'
import replace from 'rollup-plugin-replace'
import json from 'rollup-plugin-json'
import regexReplace from 'rollup-plugin-re'
import alias from 'rollup-plugin-alias'

const pkg = require('./package.json')

const libraryName = 'builder-widgets'

const resolvePlugin = resolve()

const externalDependencies = Object.keys(pkg.dependencies)
  .concat(Object.keys(pkg.optionalDependencies || {}))
  .concat(Object.keys(pkg.peerDependencies || {}))
  .filter(name => !name.startsWith('lodash-es'))

const options = {
  input: `src/${libraryName}.ts`,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  watch: {
    include: 'src/**'
  },
  external: ['vm2'],
  plugins: [
    typescript({ useTsconfigDeclarationDir: true }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    // Allow json resolution
    json(),
    // Compile TypeScript files
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolvePlugin,

    // Resolve source maps to the original source
    sourceMaps()
  ]
}

export default [
  {
    ...options,
    output: {
      format: 'umd',
      file: 'dist/builder-widgets.umd.js',
      name: 'BuilderWidgets',
      sourcemap: true,
      amd: {
        id: '@builder.io/widgets'
      }
    }
  },
  {
    ...options,
    output: [
      { file: pkg.module, format: 'es', sourcemap: true },
      { file: pkg.main, format: 'cjs', sourcemap: true }
    ],
    // Do not resolve for es module build
    // TODO: should really do a cjs build too (probably for the default build instead of umd...)
    external: externalDependencies,
    plugins: options.plugins.filter(plugin => plugin !== resolvePlugin).concat([
      resolve({
        only: [/^\.{0,2}\//, /lodash\-es/]
      })
    ])
  },
  // React 15
  {
    ...options,
    output: [
      { file: './dist/15.esm.js', format: 'es', sourcemap: true },
      { file: './dist/15.js', format: 'cjs', sourcemap: true }
    ],
    external: externalDependencies.filter(name => !name.startsWith('lodash-es')),
    plugins: options.plugins.filter(plugin => plugin !== resolvePlugin).concat([
      resolve({
        only: [/^\.{0,2}\//, /lodash\-es/]
      }),
      replace({
        'React.Fragment': '"span"',
        'React.createContext': `require('create-react-context')`
      }),
      regexReplace({
        // ... do replace before commonjs
        patterns: [
          {
            test: /\/\/\/REACT15ONLY/g,
            replace: ''
          },
          {
            test: /\/\*\*\*REACT15ONLY([^\*]+)\*\//g,
            replace: '$1'
          }
        ]
      })
    ])
  },
  // Preact
  // TODO: may have to do react 15 modifications for support (no fragment/context?)
  {
    ...options,
    output: [
      { file: './dist/preact.esm.js', format: 'es', sourcemap: true },
      { file: './dist/preact.js', format: 'cjs', sourcemap: true }
    ],
    external: externalDependencies.filter(name => !name.startsWith('lodash-es')),
    plugins: options.plugins.filter(plugin => plugin !== resolvePlugin).concat([
      resolve({
        only: [/^\.{0,2}\//, /lodash\-es/]
      }) /*as any*/,
      alias({
        react: 'preact-compat',
        'react-dom': 'preact-compat',
        // For 3rd party libs
        preact: 'preact-compat',
        'preact-dom': 'preact-compat',
        '@builder.io/react': '@builder.io/react/dist/preact'
      }),
    ])
  },
  // Inferno
  // TODO: may have to do react 15 modifications for support (no fragment/context?)
  // {
  //   ...options,
  //   output: [
  //     { file: './dist/inferno.esm.js', format: 'es', sourcemap: true },
  //     { file: './dist/inferno.js', format: 'cjs', sourcemap: true }
  //   ],
  //   external: externalDependencies.filter(name => !name.startsWith('lodash-es')),
  //   plugins: options.plugins.filter(plugin => plugin !== resolvePlugin).concat([
  //     resolve({
  //       only: [/^\.{0,2}\//, /lodash\-es/]
  //     }),
  //     alias({
  //       react: 'inferno-compat',
  //       'react-dom': 'inferno-compat',
  //       // For 3rd party libs
  //       inferno: 'inferno-compat',
  //       'inferno-dom': 'inferno-compat'
  //     }),
  //     replace({
  //       'React.createContext': `require('create-inferno-context')`
  //     })
  //   ])
  // },
  {
    ...options,
    output: { file: pkg.unpkg, format: 'iife', name: 'BuilderReact', sourcemap: true }
  },
  {
    ...options,
    output: {
      format: 'iife',
      file: pkg.unpkg,
      name: 'BuilderWidgets',
      sourcemap: true
    }
  }
  // {
  //   ...options,
  //   output: {
  //     format: 'system',
  //     file: TODO,
  //     sourcemap: true
  //   }
  // }
]

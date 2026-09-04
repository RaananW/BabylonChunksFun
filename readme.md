# Babylon.js code splitting with webpack and Rollup

This repository demonstrates how webpack and Rollup split a Babylon.js
application into chunks. The sample dynamically selects a WebGL or WebGPU
engine, loads a glTF controller model and an environment texture, and uses both
`@babylonjs/core` and `@babylonjs/loaders`.

The webpack configuration also demonstrates named cache groups and build-time
ignore lists. The Rollup configuration demonstrates dynamic chunks and the same
ignore lists, but intentionally lets Rollup choose chunk boundaries because its
chunk model does not distinguish synchronous and asynchronous cache groups in
the same way as webpack.

## Requirements

- Node.js 22.15 or newer
- npm

Install the locked dependencies:

```sh
npm ci
```

## Build and serve

| Command | Description |
| --- | --- |
| `npm run build` | Build the default webpack and Rollup examples |
| `npm run webpack:build` | Build the default webpack example |
| `npm run webpack:webgl-gltf:build` | Include only WebGL and glTF support with webpack |
| `npm run webpack:webgpu-gltf:build` | Include only WebGPU and glTF support with webpack |
| `npm run rollup:build` | Build the default Rollup example |
| `npm run rollup:webgl-gltf:build` | Include only WebGL and glTF support with Rollup |
| `npm run rollup:webgpu-gltf:build` | Include only WebGPU and glTF support with Rollup |
| `npm run webpack:serve` | Serve the default webpack example |
| `npm run webpack:webgl-gltf:serve` | Serve the WebGL-only webpack example |
| `npm run webpack:webgpu-gltf:serve` | Serve the WebGPU-only webpack example |
| `npm test` | Run optimization-mapping regression tests |
| `npm run check` | Test, type-check, and build every supported configuration |

Webpack writes to `dist-webpack`; Rollup writes to `dist-rollup`.

The sample uses WebGL by default. Add `?engine=webgpu` to the URL when serving a
WebGPU build.

## Production and single-chunk builds

Use `npm run webpack:production:build` or
`npm run rollup:production:build` for minified production output.

To preserve the ignore lists while disabling code splitting, pass the
single-chunk option:

```sh
npm run webpack:webgl-gltf:build -- --env=singleChunk=true
npm run rollup:webgl-gltf:build -- --environment singleChunk:true
```

## Extending the example

`optimizations.js` maps feature names to package paths. webpack uses those paths
for named cache groups and both bundlers use them to replace excluded modules
at build time. If Babylon.js adds another dynamically imported feature, add its
path mapping there to place or exclude it explicitly.

This is an experiment rather than a reusable build package. A production
Babylon.js build tool could turn these mappings into a supported, versioned
configuration layer for multiple bundlers.

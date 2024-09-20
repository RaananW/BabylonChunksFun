# Babylon.js Code splitting using webpack and rollup

This is an example of how to  use either webpack or rollup to generate chunks for your Babylon.js project.

The project will load an environment and a glb file and uses both `@babylonjs/core` and `@babylonjs/loaders` to load the scene.

The general gist is - there is an included list and ignored list. ignored list is for the files that you don't want to be included in the chunk. The included list is for the files that you want to be included in the chunk.

Note that this is just an example. There is a lot of room for improvement. It does feel however, like the optimization file should be a consumable package or part of some sort of a "Babylon build tool" that would be able to generate the chunks for you

## How to use?

Simple - build your project using one of the provided scripts. The scripts are:

- `npm run webpack:build` - builds the project using webpack with no ignored list
- `npm run rollup:build` - builds the project using rollup with no ignored list
- `npm run webpack:webgl-gltf:build` - build the project with ONLY webgl and glTF loaders included
- `npm run rollup:webgl-gltf:build` - build the project with ONLY webgl and glTF loaders included
- `npm run webpack:webgpu-gltf:build` - build the project with ONLY webgpu and glTF loaders included
- `npm run rollup:webgpu-gltf:build` - build the project with ONLY webgpu and glTF loaders included

To server (currently only supported with webpack) change "build" with "serve" in the script name. For example `npm run webpack:webgl-gltf:serve`

Note that if you use the webgpu version, the initial load will fail! That is because the initial load is configured to use WebGL. add `?engine=webgpu` to the URL to see it working.

### Production build

If you are building with rollup, add `-- --environment NODE_ENV:production` after the npm run call. if you are building with webpack, add `-- --env=mode=production`.

### Single chunk

To avoid generating chunks (but still use the ignore lists!) add the following to the npm command:

- in rollup add `-- --environment singleChunk:true`
- in webpack add `-- --env=singleChunk=true`

## Caveats

- Due to the way rollup works and the way we currently pack our packages, rollup's manual chunks function doesn't quite work as expected. If you want to know exactly why I will be happy to explain privately. The webpack version works as expected.
- webpack natively supports separating between async-loads and static loads for chunking. You will see that certain chunks have the suffix "async" in their name. This is because they are loaded asynchronously. Rollup doesn't support this out of the box.
- If Babylon will add new dynamic imports that are not supported here, they will be added to the default "vendors" package. If you want to chunk'em out you will need to configure the optimization file accordingly.

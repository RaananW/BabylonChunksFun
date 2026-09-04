import assert from "node:assert/strict";
import test from "node:test";
import {
    getIgnoresArray,
    getOptimizations,
    shouldIgnore,
} from "../optimizations.js";

test("creates the expected default webpack cache groups", () => {
    const cacheGroups = getOptimizations(["all"]).splitChunks.cacheGroups;

    assert.deepEqual(Object.keys(cacheGroups).sort(), [
        "textureLoaders-all",
        "vendors-async",
        "vendors-initial",
        "webglShaders-all",
        "webgpuShaders-all",
    ]);
});

test("keeps only glTF loader implementations in glTF builds", () => {
    const ignores = getIgnoresArray(["notGLTF"]);

    assert.equal(
        shouldIgnore(
            "/node_modules/@babylonjs/loaders/FBX/fbxFileLoader.pure.js",
            ignores
        ),
        true
    );
    assert.equal(
        shouldIgnore(
            "/node_modules/@babylonjs/loaders/FBX/fbxFileLoader.metadata.js",
            ignores
        ),
        false
    );
    assert.equal(
        shouldIgnore(
            "/node_modules/@babylonjs/loaders/glTF/2.0/glTFLoader.pure.js",
            ignores
        ),
        false
    );
});

test("WebGPU builds keep shared engine extensions", () => {
    const ignores = getIgnoresArray(["notWebGPU"]);

    assert.equal(
        shouldIgnore("/node_modules/@babylonjs/core/Engines/engine.js", ignores),
        true
    );
    assert.equal(
        shouldIgnore(
            "/node_modules/@babylonjs/core/Engines/Extensions/engine.dynamicBuffer.pure.js",
            ignores
        ),
        false
    );
    assert.equal(
        shouldIgnore("/node_modules/@babylonjs/core/Shaders/default.vertex.js", ignores),
        true
    );
});

import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default function (env, argv) {
    return {
        input: "src/index.ts",
        output: {
            sourcemap: true,
            dir: "dist-rollup",
            //   manualChunks: (id) => {
            //     if (id.includes("ShadersWGSL")) {
            //       return "webgpu-shaders";
            //     } else if (id.includes("Shaders")) {
            //       return "webgl-shaders";
            //     } else if (id.includes("WebGPU")) {
            //       return "webgpu-extensions";
            //     } else if (id.includes("babylonjs")) {
            //       return "babylonjs";
            //     }
            //   },
            //   globals: (id) => {
            //     if (id.includes("ShadersWGSL")) {
            //       return "webgpu-shaders";
            //     }
            //   },
        },
        plugins: [nodeResolve(), typescript()],
    };
}

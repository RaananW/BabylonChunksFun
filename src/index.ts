import { Scene } from "@babylonjs/core/scene.js";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { ImportMeshAsync } from "@babylonjs/core/Loading/sceneLoader.js";
import { EnvironmentHelper } from "@babylonjs/core/Helpers/environmentHelper.js";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic.js";
import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine.js";

export const createScene = async (
    engine: AbstractEngine,
    canvas: HTMLCanvasElement
): Promise<Scene> => {
    // This creates a basic Babylon Scene object (non-mesh)
    const scene = new Scene(engine);

    // This creates and positions a free camera (non-mesh)
    const camera = new ArcRotateCamera(
        "my first camera",
        0,
        Math.PI / 3,
        10,
        new Vector3(0, 0, 0),
        scene
    );

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    camera.attachControl(canvas, true);

    new EnvironmentHelper(
        {
            skyboxTexture: "./room.env",
            createGround: false,
        },
        scene
    );

    const importResult = await ImportMeshAsync("./controller.glb", scene);
    const rootMesh = importResult.meshes[0];

    if (!rootMesh) {
        throw new Error("The controller model did not contain any meshes.");
    }
    rootMesh.scaling.scaleInPlace(10);

    return scene;
};

export const babylonInit = async (): Promise<void> => {
    const engineType =
        new URLSearchParams(window.location.search).get("engine") || "webgl";
    const canvas = document.getElementById("renderCanvas");

    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("Could not find the render canvas.");
    }
    if (engineType !== "webgl" && engineType !== "webgpu") {
        throw new Error(`Unsupported engine "${engineType}".`);
    }

    let engine: AbstractEngine;
    if (engineType === "webgl") {
        engine = new (await import("@babylonjs/core/Engines/engine.js")).Engine(
            canvas,
            true
        );
    } else {
        engine = await (
            await import("@babylonjs/core/Engines/webgpuEngine.js")
        ).WebGPUEngine.CreateAsync(canvas, {
            antialias: true,
        });
    }

    registerBuiltInLoaders();

    const scene = await createScene(engine, canvas);

    engine.runRenderLoop(() => {
        scene.render();
    });

    const resize = () => {
        engine.resize();
    };
    window.addEventListener("resize", resize);
    window.addEventListener(
        "pagehide",
        () => {
            window.removeEventListener("resize", resize);
            engine.dispose();
        },
        { once: true }
    );
};

void babylonInit().catch((error: unknown) => {
    console.error("Failed to initialize the Babylon.js scene.", error);
});

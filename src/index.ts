import { Scene } from "@babylonjs/core/scene.js";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader.js";
import { EnvironmentHelper } from "@babylonjs/core/Helpers/environmentHelper.js";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic.js";

// digital assets
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine.js";

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

    // This attaches the camera to the canvas
    camera.attachControl(true);

    // if not setting the envtext of the scene, we have to load the DDS module as well
    new EnvironmentHelper(
        {
            skyboxTexture: "./room.env",
            createGround: false,
        },
        scene
    );

    const importResult = await SceneLoader.ImportMeshAsync(
        "",
        "",
        "./controller.glb",
        scene,
    );

    // just scale it so we can see it better
    importResult.meshes[0].scaling.scaleInPlace(10);

    return scene;
};

export const babylonInit = async (): Promise<void> => {
    const engineType =
        location.search.split("engine=")[1]?.split("&")[0] || "webgl";
    // Get the canvas element
    const canvas = document.getElementById(
        "renderCanvas"
    ) as unknown as HTMLCanvasElement;
    // Generate the BABYLON 3D engine
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

    // Create the scene
    const scene = await createScene(engine, canvas);

    // JUST FOR TESTING. Not needed for anything else
    (window as any).scene = scene;

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });
};

babylonInit().then(() => {
    // scene started rendering, everything is initialized
});

export function getOptimizations(types) {
    return (types || [])
        .flatMap((type) => getMapping(type).flat())
        .map((type) => getOptimization(type))
        .filter((optimization) => optimization !== undefined)
        .reduce(
            (result, optimization) => ({
                splitChunks: {
                    cacheGroups: {
                        ...result.splitChunks?.cacheGroups,
                        ...optimization.splitChunks.cacheGroups,
                    },
                },
            }),
            {}
        );
}

export function getMapping(type) {
    switch (type) {
        case "vendors": {
            return ["vendors;chunks=initial", "vendors;chunks=async"];
        }
        case "shaders": {
            return ["webglShaders", "webgpuShaders"];
        }
        case "all": {
            return [
                getMapping("vendors"),
                getMapping("shaders"),
                "textureLoaders",
            ];
        }
        case "separateEngines": {
            return [
                getMapping("webgpu"),
                getMapping("webgl"),
                getMapping("vendors"),
            ];
        }
        case "webgpu": {
            return [
                "webgpuShaders",
                "webgpuExtensions;chunks=initial",
                "webgpuEngine",
            ];
        }
        case "webgl": {
            return [
                "webglShaders",
                "webglExtensions;chunks=initial",
                "webglEngine",
                "webglOnly",
            ];
        }
        case "notWebGPU": {
            return ["webglOnly", "webglShaders"];
        }
        case "loaders": {
            return [
                "loadersGlTF",
                "loadersBVH",
                "loadersFBX",
                "loadersOBJ",
                "loadersSPLAT",
                "loadersSTL",
            ];
        }
        case "gltf": {
            return ["loadersGlTF;chunks=async"];
        }
        case "notGLTF": {
            return [
                "loadersGlTF1",
                "loadersBVH;not=metadata",
                "loadersFBX;not=metadata",
                "loadersOBJ;not=metadata",
                "loadersSTL;not=metadata",
                "loadersSPLAT;not=metadata",
            ];
        }
        default: {
            return [type];
        }
    }
}

export function getIgnoresArray(types) {
    return (types || [])
        .flatMap((type) => getMapping(type).flat())
        .map((type) => getRegexForType(type))
        .filter((ignore) => ignore);
}

export function shouldIgnore(fullPath, ignoreList) {
    return ignoreList.some((ignore) => {
        const test = ignore instanceof RegExp ? ignore : ignore.test;
        const metadata = ignore instanceof RegExp ? [] : ignore.metadata;
        const matches = Array.isArray(test)
            ? test.some((pattern) => pattern.test(fullPath))
            : test.test(fullPath);

        return (
            matches &&
            metadata.every((entry) => {
                const [key, condition] = entry.split("=");
                return key !== "not" || !fullPath.includes(condition);
            })
        );
    });
}

export function getRegexForType(type) {
    switch (type) {
        case "vendors": {
            return /@babylonjs/;
        }
        case "webglShaders": {
            return /\/Shaders\//;
        }
        case "webgpuShaders": {
            return /\/ShadersWGSL\//;
        }
        case "textureLoaders": {
            return /\/Textures\/Loaders\//;
        }
        case "webgpuExtensions": {
            return /\/WebGPU\/Extensions\//;
        }
        case "webglExtensions": {
            return /Engines\/Extensions/;
        }
        case "webgpuEngine": {
            return /webgpu/i;
        }
        case "webglEngine": {
            return /Engines\//;
        }
        case "loadersGlTF": {
            return /loaders\/glTF\/2\.0/;
        }
        case "webglOnly": {
            return /Engines\/engine\.js$/;
        }
        case "loadersGlTF1": {
            return /loaders\/glTF\/1\.0/;
        }
        case "loadersBVH": {
            return /loaders\/BVH/;
        }
        case "loadersFBX": {
            return /loaders\/FBX/;
        }
        case "loadersOBJ": {
            return /loaders\/OBJ/;
        }
        case "loadersSTL": {
            return /loaders\/STL/;
        }
        case "loadersSPLAT": {
            return /loaders\/SPLAT/;
        }
        default: {
            if (type.includes(";")) {
                const [test, ...metadata] = type.split(";");
                return {
                    test: getRegexForType(test),
                    metadata,
                };
            }
            return null;
        }
    }
}

function getOptimization(optimizationType) {
    const [type, ...metadata] = optimizationType.split(";");
    const data = (metadata || []).reduce((acc, curr) => {
        const [key, value] = curr.split("=");
        acc[key] = value;
        return acc;
    }, {});
    const chunks = data.chunks || "all";
    const test = getRegexForType(type);
    switch (type) {
        case "vendors": {
            return {
                splitChunks: {
                    cacheGroups: {
                        ["vendors-" + chunks]: {
                            test,
                            name: "vendors-" + chunks,
                            priority: 0,
                            ...data,
                        },
                    },
                },
            };
        }
        case "webglShaders": {
            return {
                splitChunks: {
                    cacheGroups: {
                        ["webglShaders-" + chunks]: {
                            name: "webgl-shaders-" + chunks,
                            priority: 20,
                            test,
                            ...data,
                        },
                    },
                },
            };
        }
        case "webgpuShaders": {
            return {
                splitChunks: {
                    cacheGroups: {
                        ["webgpuShaders-" + chunks]: {
                            name: "webgpu-shaders-" + chunks,
                            priority: 20,
                            test,
                            ...data,
                        },
                    },
                },
            };
        }
        case "textureLoaders": {
            return {
                splitChunks: {
                    cacheGroups: {
                        ["textureLoaders-" + chunks]: {
                            name: "texture-loaders-" + chunks,
                            chunks: "all",
                            priority: 20,
                            test,
                        },
                    },
                },
            };
        }
        case "webgpuExtensions": {
            return {
                splitChunks: {
                    cacheGroups: {
                        ["webgpuExtensions-" + chunks]: {
                            name: "webgpu-extensions-" + chunks,
                            priority: 20,
                            test,
                            ...data,
                        },
                    },
                },
            };
        }
        case "webglExtensions": {
            return {
                splitChunks: {
                    cacheGroups: {
                        ["webglExtensions-" + chunks]: {
                            name: "webgl-extensions-" + chunks,
                            priority: 20,
                            test,
                            ...data,
                        },
                    },
                },
            };
        }
        case "webgpuEngine": {
            return {
                splitChunks: {
                    cacheGroups: {
                        ["webgpuEngine-" + chunks]: {
                            name: "webgpu-engine-" + chunks,
                            priority: 5,
                            test,
                            ...data,
                        },
                    },
                },
            };
        }
        case "webglEngine": {
            return {
                splitChunks: {
                    cacheGroups: {
                        ["webglEngine-" + chunks]: {
                            name: "webgl-engine-" + chunks,
                            priority: 3,
                            test,
                            ...data,
                        },
                    },
                },
            };
        }
        default: {
            if (!type || !test || Array.isArray(test)) {
                return undefined;
            }
            return {
                splitChunks: {
                    cacheGroups: {
                        [type + "-" + chunks]: {
                            test,
                            name: type + "-" + chunks,
                            priority: 1,
                            ...data,
                        },
                    },
                },
            };
        }
    }
}

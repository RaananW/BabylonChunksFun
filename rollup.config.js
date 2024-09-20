import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { getIgnoresArray, getOptimizations } from "./optimizations.js";
import path from "path";

const isProduction = process.env.NODE_ENV === "production"; // --environment NODE_ENV:production

export default async function (env) {
    const opts = getOptimizations(
        (process.env.optimization || "all").split(",")
    );
    const ignores = getIgnoresArray((process.env.ignore || "").split(","));
    const asyncSet = new Set();
    const syncSet = new Set();
    return {
        input: "src/index.ts",
        output: {
            sourcemap: !isProduction,
            dir: "dist-rollup",
            
            // manualChunks needs to be implemented correctly. at the moment it is not possible to do the same as webpack due to side-effects
            // until then there will be quite a few chunks that are not optimized, but it will still work!

            // manualChunks: (id, { getModuleInfo, getModuleIds }) => {
            //     const async =
            //         getModuleInfo(id).dynamicImporters.length !== 0 &&
            //         getModuleInfo(id).importers.length === 0;
            //     if (async) {
            //         console.log("async", id);
            //     }
            //     return (
            //         Object.keys(opts.splitChunks.cacheGroups)
            //             .filter((opt) => {
            //                 const cacheGroup =
            //                     opts.splitChunks.cacheGroups[opt];
            //                 if (cacheGroup.test.test(id)) {
            //                     return opt;
            //                 }
            //             })
            //             .sort((a, b) => {
            //                 const aPriority =
            //                     opts.splitChunks.cacheGroups[a].priority;
            //                 const bPriority =
            //                     opts.splitChunks.cacheGroups[b].priority;
            //                 return bPriority - aPriority;
            //             })[0] || "default" + (async ? "-async" : "")
            //     );
            // },
        },
        plugins: [
            nodeResolve(),
            typescript(),
            ignore(ignores),
            isProduction && (await import("@rollup/plugin-terser")).default(),
        ],
    };
}

const emptyFile = "export default {}";

function shouldIgnore(fullPath, ignoreList) {
    return ignoreList.some((ignore) => {
        let test = ignore;
        let metadata = [];
        if (ignore.metadata) {
            test = ignore.test;
            metadata = ignore.metadata;
        }
        let returnValue = Array.isArray(test)
            ? test.some((t) => t.test(fullPath))
            : test.test(fullPath);
        (metadata || []).forEach((meta) => {
            const [key, condition] = meta.split("=");
            if (key === "not" && ignore) {
                returnValue = returnValue && !fullPath.includes(condition);
            }
        });
        return returnValue;
    });
}

const ignoreStaticFilename = "IGNORE_FILE";

function ignore(
    list,
    options = {
        ignoreCallback: shouldIgnore,
    }
) {
    return {
        resolveId(source, importer) {
            if (list.length === 0) {
                return null;
            }
            return options.ignoreCallback(
                path.join(importer || "", source),
                list
            )
                ? ignoreStaticFilename
                : null;
        },
        load(id) {
            return id === ignoreStaticFilename ? emptyFile : null;
        },
    };
}

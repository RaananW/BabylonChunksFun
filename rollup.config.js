import { nodeResolve } from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import terser from "@rollup/plugin-terser";
import { getIgnoresArray, shouldIgnore } from "./optimizations.js";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";

export default function () {
    const ignores = getIgnoresArray((process.env.ignore || "").split(";"));

    return {
        input: "src/index.ts",
        output: {
            inlineDynamicImports: process.env.singleChunk === "true",
            sourcemap: !isProduction,
            dir: "dist-rollup",
        },
        plugins: [
            nodeResolve(),
            swc({
                include: ["src/**/*.ts"],
                swc: {
                    jsc: {
                        parser: {
                            syntax: "typescript",
                        },
                        target: "es2022",
                    },
                    sourceMaps: !isProduction,
                },
            }),
            ignore(ignores),
            isProduction && terser(),
        ],
    };
}

const ignoreStaticFilename = "IGNORE_FILE";
const emptyFile = "export default {}";

function ignore(list) {
    return {
        resolveId(source, importer) {
            if (list.length === 0) {
                return null;
            }
            return shouldIgnore(
                path.join(importer ? path.dirname(importer) : "", source),
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

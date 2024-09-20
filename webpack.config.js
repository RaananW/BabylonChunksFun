import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import fs from "fs";
import { getOptimizations, getIgnoresArray } from "./optimizations.js";
import webpack from "webpack";

const appDirectory = fs.realpathSync(process.cwd());

export default function (env) {
    const ignoreList = getIgnoresArray((env.ignore || "").split(","));
    return {
        entry: path.resolve(appDirectory, "src/index.ts"),
        mode: env.mode || "development",
        output: {
            filename: "js/[name].js",
            path: path.resolve("./dist-webpack/"),
            clean: true,
        },
        resolve: {
            extensions: [".ts", ".js"],
            fallback: {
                fs: false,
                path: false,
            },
        },
        module: {
            rules: [
                {
                    test: /\.m?js/,
                },
                {
                    test: /\.(js|mjs|jsx|ts|tsx)$/,
                    loader: "source-map-loader",
                    enforce: "pre",
                },
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                inject: true,
                template: path.resolve(appDirectory, "public/index.html"),
            }),

            new webpack.IgnorePlugin({
                checkResource(resource, context) {
                    // context is where the file is loaded FROM. meaning - it can also be in the src directory
                    // resource is the file that is being loaded, excluding the package if loaded from the package itself.
                    return ignoreList.flat().some((ignore) => {
                        let test = ignore;
                        let metadata = [];
                        if (ignore.metadata) {
                            test = ignore.test;
                            metadata = ignore.metadata;
                        }
                        const fullPath = path.join(context, resource);
                        let returnValue = test.test(fullPath);
                        (metadata || []).forEach((meta) => {
                            const [key, condition] = meta.split("=");
                            if (key === "not" && ignore) {
                                returnValue =
                                    returnValue &&
                                    !fullPath.includes(condition);
                            }
                        });
                        return returnValue;
                    });
                },
            }),
        ],
        optimization: {
            ...getOptimizations((env.optimization || "all").split(",")),
            minimize: env.mode === "production",
        },
    };
}

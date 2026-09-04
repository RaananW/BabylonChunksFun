import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import fs from "fs";
import {
    getOptimizations,
    getIgnoresArray,
    shouldIgnore,
} from "./optimizations.js";
import webpack from "webpack";

const appDirectory = fs.realpathSync(process.cwd());

export default function (env = {}) {
    const ignoreList = getIgnoresArray((env.ignore || "").split(","));
    const mode = env.mode || "development";

    return {
        entry: path.resolve(appDirectory, "src/index.ts"),
        mode,
        devtool: mode === "production" ? "source-map" : "eval-source-map",
        output: {
            filename: "js/[name].js",
            path: path.resolve(appDirectory, "dist-webpack"),
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
                    test: /\.m?js$/,
                    loader: "source-map-loader",
                    enforce: "pre",
                },
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "swc-loader",
                        options: {
                            jsc: {
                                parser: {
                                    syntax: "typescript",
                                },
                                target: "es2022",
                            },
                        },
                    },
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
                    return shouldIgnore(
                        path.join(context, resource),
                        ignoreList
                    );
                },
            }),
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: env.singleChunk ? 1 : 30,
            }),
        ],
        optimization: {
            ...getOptimizations((env.optimization || "all").split(",")),
            minimize: mode === "production",
        },
    };
}

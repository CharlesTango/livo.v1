const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const fs = require("fs");

const devCerts = {
  key: fs.existsSync(path.resolve(__dirname, "certs/localhost.key"))
    ? fs.readFileSync(path.resolve(__dirname, "certs/localhost.key"))
    : undefined,
  cert: fs.existsSync(path.resolve(__dirname, "certs/localhost.crt"))
    ? fs.readFileSync(path.resolve(__dirname, "certs/localhost.crt"))
    : undefined,
};

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: {
      taskpane: "./src/index.tsx",
      commands: "./src/commands.ts",
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].bundle.js",
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.CONVEX_URL": JSON.stringify(
          process.env.CONVEX_URL || "https://healthy-duck-95.convex.cloud"
        ),
      }),
      new HtmlWebpackPlugin({
        template: "./src/taskpane.html",
        filename: "taskpane.html",
        chunks: ["taskpane"],
      }),
      new HtmlWebpackPlugin({
        template: "./src/commands.html",
        filename: "commands.html",
        chunks: ["commands"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "assets",
            to: "assets",
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      port: 3001,
      server: {
        type: "https",
        options: devCerts.key && devCerts.cert ? devCerts : {},
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      hot: true,
      allowedHosts: "all",
    },
    devtool: isProduction ? "source-map" : "eval-source-map",
  };
};

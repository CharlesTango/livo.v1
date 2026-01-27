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
        "Access-Control-Allow-Private-Network": "true",
      },
      hot: true,
      allowedHosts: "all",
      setupMiddlewares: (middlewares, devServer) => {
        if (devServer && devServer.app) {
          devServer.app.use((req, res, next) => {
            const url = req.url || "";
            if (url.includes("/assets/icon-64.png") || url.includes("/assets/icon-128.png")) {
              // #region agent log
              fetch("http://127.0.0.1:7243/ingest/eaeb51b8-92ad-488d-a31b-c9c2d792a076", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId: "debug-session",
                  runId: "pre-fix",
                  hypothesisId: "H4",
                  location: "webpack.config.js:92",
                  message: "Icon request received by dev server",
                  data: {
                    url,
                    method: req.method,
                    origin: req.headers.origin,
                    referer: req.headers.referer,
                    host: req.headers.host,
                    secFetchSite: req.headers["sec-fetch-site"],
                    acRequestPrivateNetwork: req.headers["access-control-request-private-network"],
                    userAgent: req.headers["user-agent"],
                  },
                  timestamp: Date.now(),
                }),
              }).catch(() => {});
              // #endregion agent log

              if (req.method === "OPTIONS") {
                // #region agent log
                fetch("http://127.0.0.1:7243/ingest/eaeb51b8-92ad-488d-a31b-c9c2d792a076", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sessionId: "debug-session",
                    runId: "pre-fix",
                    hypothesisId: "H5",
                    location: "webpack.config.js:108",
                    message: "Icon preflight handled",
                    data: {
                      url,
                      origin: req.headers.origin,
                      acRequestPrivateNetwork: req.headers["access-control-request-private-network"],
                    },
                    timestamp: Date.now(),
                  }),
                }).catch(() => {});
                // #endregion agent log

                res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
                res.setHeader("Access-Control-Allow-Private-Network", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type");
                return res.status(204).end();
              }
            }
            next();
          });
        }
        return middlewares;
      },
    },
    devtool: isProduction ? "source-map" : "eval-source-map",
  };
};

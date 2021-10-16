const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        board: "./src/gui/index.js",
        "vs-bot": "./src/gui/vs-bot.js"
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false
                }
            }
        ]
    },
    output: {
        filename: "js/[name].js",
        path: path.resolve(__dirname, "public")
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "src/gui/index.html",
                    to: "index.html"
                },
                {
                    from: "src/gui/vs-bot.html",
                    to: "vs-bot.html"
                },
                {
                    context: "assets/",
                    from: "*.svg",
                    to: "images/"
                },
                {
                    from: "src/gui/board.css",
                    to: "css/board.css"
                },
                {
                    context: "node_modules/@chrisoakman/chessboardjs/dist/",
                    from: "chessboard-*.min.{js,css}",
                    to: "lib/"
                },
                {
                    from: "node_modules/jquery/dist/jquery.js",
                    to: "lib/jquery.js"
                }
            ]
        })
    ]
};

const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        board: "./src/gui/board.js",
        home: "./src/gui/index.js",
        "vs-bot": "./src/gui/vs-bot.js",
        openings: "./src/gui/openings.js"
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
        new HtmlWebpackPlugin({
            filename: "index.html",
            chunks: [ "home" ],
            templateParameters: {
                buttons: {
                    "vs-computer": "Vs Computer",
                    "openings": "Openings"
                }
            },
            template: "src/gui/template.html",
            inject: false
        }),
        new HtmlWebpackPlugin({
            filename: "vs-bot.html",
            chunks: [ "vs-bot" ],
            templateParameters: {
                buttons: {
                    "new-game": "New Game",
                    "flip-board": "Play as black",
                    "toggle-highlight": "Hide moves"
                }
            },
            template: "src/gui/template.html",
            inject: false
        }),
        new HtmlWebpackPlugin({
            filename: "openings.html",
            chunks: [ "openings" ],
            templateParameters: {
                buttons: {
                    "start": "Select",
                    "practice": "Practice"
                }
            },
            template: "src/gui/template.html",
            inject: false
        }),
        new CopyPlugin({
            patterns: [
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

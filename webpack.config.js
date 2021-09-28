const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./src/gui/index.js",
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
        filename: "chess.js",
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
                    context: "assets/",
                    from: "*.svg",
                    to: "images/"
                },
                {
                    from: "src/gui/board.css",
                    to: "board.css"
                },
                {
                    context: "node_modules/@chrisoakman/chessboardjs/dist/",
                    from: "chessboard-*.min.{js,css}",
                    to: "board/"
                },
                {
                    from: "node_modules/jquery/dist/jquery.js",
                    to: "board/jquery.js"
                }
            ]
        })
    ]
};

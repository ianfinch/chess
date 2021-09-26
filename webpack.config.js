const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./src/board.js",
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
        filename: "board.js",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "src/board.css",
                    to: "board.css"
                },
                {
                    from: "node_modules/@chrisoakman/chessboardjs/dist/chessboard-*.min.js",
                    to: "board/chessboard.js"
                },
                {
                    from: "node_modules/@chrisoakman/chessboardjs/dist/chessboard-*.min.css",
                    to: "board/chessboard.css"
                },
                {
                    from: "node_modules/jquery/dist/jquery.js",
                    to: "board/jquery.js"
                }
            ]
        })
    ]
};

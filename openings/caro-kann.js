/**
 * Mine the Caro-Kann openings from the openings book, to populate the openings tutor
 */
const fs = require("fs");
const { Chess } = require("chess.js");
const game = new Chess();
const openings = JSON.parse(fs.readFileSync("./openings/openings.json").toString());
const caroKann = "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";

// Our initial two moves for the Caro-Kann
const initialMoves = {
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1": {
        moves: [ "e4" ],
        comments: "King's Pawn opening"
    },
    "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1": {
        moves: [ ["c7", "c6"] ],
        comments: "Caro-Kann"
    }
};

// Convert a move from SAN to from/to
const convertMove = (san, fen) => {

    game.load(fen);
    const moved = game.move(san);
    return [moved.from, moved.to];
};

// Get a position from the openings file, based on a FEN
const getPosition = (fen, depth = 0) => {

    const fenFields = fen.split(" ");
    let moves = Object.keys(openings[fen].future);

    if (fenFields[1] === "b") {
        moves = moves.map(san => convertMove(san, fen));
    }

    const result = {

        [fen]: {
            comments: openings[fen].name,
            moves
        }
    };

    if (depth < 20) {
        const futures = Object.values(openings[fen].future).map(x => getPosition(x, depth + 1));
        return Object.assign.apply({}, [result].concat(futures));
    }

    return result;
};

console.log("export default " + JSON.stringify(Object.assign({}, initialMoves, getPosition(caroKann)), null, 4) + ";");

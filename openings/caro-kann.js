/**
 * Mine the Caro-Kann openings from any PGN files we have
 */
const fs = require("fs");
const { Chess } = require("chess.js");
const game = new Chess();
const pgnFolder = "./pgn/";

/**
 * Process all the PGN files in an opening-specific directory
 */
const processDirectory = (opening) => {

    // Find the files to analyse - assume they are grouped in folders named
    // after the opening family
    const pgnFiles = fs.readdirSync(pgnFolder + opening);

    // Run the analysis on each PGN file
    const analysed = pgnFiles.map(filename => {

        const pgn = fs.readFileSync(pgnFolder + opening + "/" + filename).toString();
        return convertPgn(pgn);
    });

    // Combine the analyses
    const combined = [].concat.apply([], analysed).reduce(combine, {});

    return combined;
};

/**
 * Convert a specific PGN file
 */
const convertPgn = pgn => {

    game.load_pgn(pgn);

    // Create an array of the moves, to collect the fields needed for the
    // openings data structure
    const moves = game.history().concat([null]).map(move => ({
        fen: null,
        comments: null,
        move
    }));

    moves.reverse().forEach(move => {
        move.comments = game.get_comment();
        move.fen = game.fen();

        if (move.move) {
            move.full = enrichMove(move.fen, move.move);
        }

        game.undo();
    });

    return moves;
};

/**
 * Add the 'from' and 'to' to each move
 */
const enrichMove = (fen, move) => {

    const analysis = new Chess();
    analysis.load(fen);
    return analysis.move(move);
};

/**
 * Combine multiple analyses into a single object, keyed on FEN
 */
const combine = (result, item) => {

    // We truncate the FEN, so it doesn't matter when in the game this position
    // is reached
    const fen = item.fen.replace(/ [0-9]* [0-9]*$/, "");

    // If we haven't seen this position before, add it
    if (!result[fen]) {
        result[fen] = {
            moves: []
        };
    }

    // Copy across the move
    if (result[fen].moves && item.move) {
        if (!result[fen].moves.map(x => x.san).includes(item.move)) {
            result[fen].moves.push(item.full);
        }
    }

    // Add any comments
    if (item.comments) {
        if (result[fen].comments) {
            result[fen].comments += " ... ADDITIONAL COMMENT ... " + item.comments.trim();
        } else {
            result[fen].comments = item.comments.trim();
        }
    }

    return result;
};

console.log("export default");
console.log(JSON.stringify(processDirectory("caro-kann"), null, 4));
console.log(";");

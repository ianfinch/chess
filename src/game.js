const Chess = require("chess.js");
const game = new Chess();

/**
 * Print some debug info to the console
 */
const debug = () => {
    console.log(game.ascii());
};

/**
 * Load a game using FEN notation
 */
const load = (fen) => {
    const result = game.load(fen);
    if (!result) {
        window.alert("Error loading position: " + fen);
    }
    debug();
    return { pgn: game.pgn() };
};

/**
 * Make a move
 *
 * Return null if move is not valid
 */
const move = details => {

    const result = game.move(details);
    if (!result) {
        return result;
    }

    debug();
    return Object.assign({}, result, { pgn: game.pgn(), fen: game.fen() });
};

/**
 * Reset the board to the starting position
 */
const reset = () => {
    game.reset();
    debug();
};

export default {

    fen: game.fen,
    load,
    move,
    reset

};

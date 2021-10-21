const Chess = require("chess.js");
const game = new Chess();

/**
 * Load a game using FEN notation
 */
const load = (fen) => {
    const result = game.load(fen);
    if (!result) {
        window.alert("Error loading position: " + fen);
    }
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

    return Object.assign({}, result, { pgn: game.pgn(), fen: game.fen() });
};

/**
 * Reset the board to the starting position
 */
const reset = () => {
    game.reset();
};

export default {

    comment: game.set_comment,
    fen: game.fen,
    header: game.header,
    inCheck: game.in_check,
    load,
    move,
    moves: game.moves,
    pgn: game.pgn,
    reset,
    turn: game.turn

};

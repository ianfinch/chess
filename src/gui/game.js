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

/**
 * Check whether the game is over
 */
const gameIsOver = () => {

    const winner = game.turn() === "w" ? "black" : "white";

    if (game.in_checkmate()) {
        return {
            result: "checkmate",
            winner
        };
    }

    if (game.in_draw()) {
        if (game.insufficient_material()) {
            return {
                result: "draw due to insufficient material",
                winner
            };
        }

        return {
            result: "draw due to the fifty move rule",
            winner
        };
    }

    if (game.in_stalemate()) {
        return {
            result: "stalemate",
            winner
        };
    }

    if (game.in_threefold_repetition()) {
        return {
            result: "repeated moves",
            winner
        };
    }

    return false;
};

export default {

    comment: game.set_comment,
    fen: game.fen,
    gameIsOver,
    header: game.header,
    inCheck: game.in_check,
    load,
    move,
    moves: game.moves,
    pgn: game.pgn,
    reset,
    turn: game.turn

};

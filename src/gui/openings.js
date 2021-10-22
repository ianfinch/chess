import arrows from "./arrows.js";
import caroKann from "./openings-caro-kann.js";
import board from "./board.js";
import messages from "./messages.js";

// FEN for starting position (for convenience)
const startingPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";

/**
 * Our openings
 *
 * For automated moves, use SAN notation, but for moves to highlight, use an
 * array with from and to fields
 */
const openings = {

    "Caro-Kann": {
        player: "black",
        lines: caroKann
    },

    "London": {
        player: "white",
        lines: {
            [ startingPosition ]: { moves: [ [ "e2", "e4"] ] }
        }
    }
};

/**
 * Show the next moves in the opening
 */
const showPossibleMoves = (opening, fen) => {

    arrows.clear();

    const moves = opening.lines[fen].moves;
    moves.forEach(move => {
        arrows.drawArrow(move.from, move.to);
    });
};

/**
 * Make an automatic move
 */
const tutorMakesMove = opening => {

    return fen => {

        const result = null;
        fen = truncateFen(fen);

        if (opening.lines[fen]) {

            showPossibleMoves(opening, fen);

            const moves = opening.lines[fen].moves;
            const selected = Math.floor(Math.random() * moves.length);
            const response = { move: { move: moves[selected].san } };
            const moveDelay = fen === startingPosition ? 0 : 1000;

            if (opening.lines[fen].comments) {
                response.move.comment = opening.lines[fen].comments;
            }

            return new Promise((resolve, reject) => {

                setTimeout(() => {
                    resolve(response);
                }, moveDelay);
            });
        };

        return Promise.resolve(null);
    };
};

/**
 * Trim down a FEN
 */
const truncateFen = fen => fen.replace(/ [0-9]* [0-9]*$/, "");

/**
 * Pick an opening to practice
 */
const pickOpening = (chessboard) => {

    messages.options("Choose opening", Object.keys(openings))
        .then(opening => {

            const headers = [
                [ "Opening", opening ]
            ];

            const tutor = { name: "Tutor", move: tutorMakesMove(openings[opening]) };

            let openingPosition = null;
            if (openings[opening].player === "white") {
                openingPosition = chessboard.startNewGame(null, tutor, headers);
            } else {
                openingPosition = chessboard.startNewGame(tutor, null, headers);
            }

            chessboard.addHook("onDrop", () => showPossibleMoves(openings[opening], truncateFen(chessboard.fen())));

            return openingPosition
                    .then(() => showPossibleMoves(openings[opening], truncateFen(chessboard.fen())));
        });
};

// Wait until the page is fully loaded before doing anything
window.addEventListener("load", () => {

    const chessboard = board.init();
    document.getElementById("start").addEventListener("click", () => pickOpening(chessboard));
});

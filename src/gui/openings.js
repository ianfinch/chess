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
 * Add a comment to the game (after a move has been completed)
 */
const checkForComment = (chessboard, opening, fen) => {

    if (opening.lines[fen].comments) {
        chessboard.comment(opening.lines[fen].comments);
    }
};

/**
 * Make an automatic move
 */
const tutorMakesMove = opening => {

    return fen => {

        const result = null;
        fen = truncateFen(fen);

        if (opening.lines[fen]) {

            arrows.clear();

            const moves = opening.lines[fen].moves;
            const selected = Math.floor(Math.random() * moves.length);
            const response = { move: { move: moves[selected].san } };
            const moveDelay = fen === startingPosition ? 0 : 250;

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

            // In practice mode, set up the function to make the tutor play moves
            let tutor = null;
            if (chessboard.settings.practice) {
                tutor = { name: "Tutor", move: tutorMakesMove(openings[opening]) };
            }

            // Set up a new game as either white or black
            let openingPosition = null;
            if (openings[opening].player === "white") {
                openingPosition = chessboard.startNewGame(null, tutor, headers);
            } else {
                openingPosition = chessboard.startNewGame(tutor, null, headers);
                if (tutor === null) {
                    chessboard.flip();
                }
            }

            // Show possible moves after each player's move
            chessboard.addHook("onDrop", () => {

                const fen = truncateFen(chessboard.fen());
                showPossibleMoves(openings[opening], fen);
                checkForComment(chessboard, openings[opening], fen);
            });

            return openingPosition
                    .then(() => showPossibleMoves(openings[opening], truncateFen(chessboard.fen())));
        });
};

/**
 * Switch between "play" mode and "study" mode
 */
const togglePlayMode = (chessboard) => {

    if (chessboard.settings.practice) {
        chessboard.settings.practice = false;
        document.getElementById("practice").textContent = "Practice";
    } else {
        chessboard.settings.practice = true;
        document.getElementById("practice").textContent = "Study";
    }

    pickOpening(chessboard);
};

// Wait until the page is fully loaded before doing anything
window.addEventListener("load", () => {

    const chessboard = board.init();
    chessboard.settings = {};
    chessboard.settings.practice = false;

    document.getElementsByTagName("h1")[0].addEventListener("click", () => document.location = "index.html");
    document.getElementsByTagName("h1")[0].style.cursor = "pointer";

    document.getElementById("start").addEventListener("click", () => pickOpening(chessboard));
    document.getElementById("practice").addEventListener("click", () => togglePlayMode(chessboard));
});

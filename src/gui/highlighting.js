/**
 * Highlight the moves list, based on the passed in array
 */
const highlightMoves = moves => {

    moves.forEach(move => {

        const target = "square-" + move.to;
        const elem = document.getElementsByClassName(target)[0];

        if (move.flags.includes("c") || move.flags.includes("e")) {
            elem.classList.add("possible-capture");
        } else {
            elem.classList.add("possible-move");
        }
    });
};

/**
 * Show moves when moving over a piece
 */
const showMovesForPiece = (boardDetails, engine) => {

    return (square, piece) => {

        // Only do anything if we're showing moves
        if (boardDetails.settings.showMoves === false) {
            return;
        }

        // Check there's a piece on this square
        if (piece === false) {
            return;
        }

        // Where can we move to?
        const moves = engine.moves({ square, verbose: true });
        if (moves.length === 0) {
            return;
        }

        // Display the moves
        highlightMoves(moves);
    };
};

/**
 * Clear any displayed moves
 */
const hideMoves = () => {

    [
        "possible-move",
        "possible-capture"
    ].forEach(className => {

        [...document.getElementsByClassName(className)].forEach(elem => {
            elem.classList.remove(className);
        });
    });
};

/**
 * When moving out of a square, hide the moves we were showing
 */
const hideMovesForPiece = (boardDetails, engine) => {

    return (square, piece) => {

        if (boardDetails.settings.showMoves === false) {
            return;
        }

        hideMoves();
    };
};

/**
 * Indicate that a king is in check
 */
const showCheck = player => {

    // Filter down our pieces to identify just the king
    const squares = [...document.getElementsByTagName("img")].filter(elem => {

        // Find which of the pieces is the player in check's king
        const attrs = [...elem.attributes].map(attr => {

            if (attr.nodeName === "data-piece") {
                return attr.nodeValue;
            }

            return null;

        }).filter(x => x);

        // Only retain this if it's the king
        if (attrs.includes(player + "K")) {
            return true;
        }

        // Otherwise we discard it
        return false;
    });

    // Assume that we will always have a king in play, so take the first of the
    // matching squares
    const kingSquare = squares[0].parentNode;

    // Now add the class to show it's in check
    kingSquare.classList.add("check");
};

/**
 * Highlight the square a piece has moved from
 */
const movedFrom = square => {
    document.getElementsByClassName("square-" + square)[0].classList.add("last-move-from");
};

/**
 * Highlight the square a piece has moved to
 */
const movedTo = square => {
    document.getElementsByClassName("square-" + square)[0].classList.add("last-move-to");
};

/**
 * Clear any existing highlights
 */
const clear = () => {

    [
        "possible-move",
        "possible-capture",
        "check",
        "last-move-from",
        "last-move-to"
    ].forEach(className => {

        [...document.getElementsByClassName(className)].forEach(elem => {
            elem.classList.remove(className);
        });
    });
};

export default {
    clear,
    hideMovesForPiece,
    movedFrom,
    movedTo,
    showCheck,
    showMovesForPiece
};

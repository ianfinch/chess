/**
 * Handle moving pieces
 */
const pieceMoved = (source, target, piece, newPos, oldPos, orientation) => {
    console.log('Source: ' + source)
    console.log('Target: ' + target)
    console.log('Piece: ' + piece)
    console.log('New position: ' + Chessboard.objToFen(newPos))
    console.log('Old position: ' + Chessboard.objToFen(oldPos))
    console.log('Orientation: ' + orientation)
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
};

/**
 * Add actions to our buttons
 */
const initButtons = board => {

    const actions = {

        "Reset": () => {
            board.start();
            board.orientation("white");
        },

        "Caro-Kann": () => {
            board.position("rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR");
            board.orientation("black");
        },

        "Flip": () => {
            board.flip();
        }
    };

    [...document.getElementsByTagName("button")].forEach(button => {
        const label = button.textContent;

        if (actions[label]) {
            button.addEventListener("click", actions[label]);
        }
    });
};

/**
 * Set up our chess board
 */
const initChessBoard = e => {

    return Chessboard("the-board", {
        draggable: true,
        dropOffBoard: "snapback",
        onDrop: pieceMoved,
        pieceTheme: "assets/{piece}.svg",
        position: "start"
    });
};

/**
 * Run our initialisations
 */
const init = e => {
    const board = initChessBoard();
    initButtons(board);
};

/**
 * Start everything off when the page is fully loaded
 */
window.addEventListener("load", init);

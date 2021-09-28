/**
 * Update the "who moves next" indicator
 */
const setStatusNext = player => {

    const icon = document.getElementById("next").getElementsByTagName("img")[0];
    const alt = document.createAttribute("alt");
    const src = document.createAttribute("src");

    if (player === "w") {
        alt.value = "white";
        src.value = "images/wK.svg";
    } else {
        alt.value = "black";
        src.value = "images/bK.svg";
    }
 
    icon.attributes.setNamedItem(alt);
    icon.attributes.setNamedItem(src);
};

/**
 * Update the text area
 */
const setText = newContent => {
    document.getElementById("text").textContent = newContent;
};

/**
 * Update the list of captured pieces
 */
const getCapturedPieces = fen => {

    const countPieces = (result, item) => {
        if (!result[item]) {
            result[item] = 0;
        }
        result[item] = result[item] + 1;
        return result;
    };

    const countMissingPieces = pieces => {
        const fullSet = { B: 2, K: 1, N: 2, P: 8, Q: 1, R: 2, b: 2, k: 1, n: 2, p: 8, q: 1, r: 2 };

        return Object.keys(fullSet).reduce((result, key) => {
            const taken = fullSet[key] - (pieces[key] || 0);
            if (taken) {
                result.push({ piece: key, count: taken });
            }
            return result;
        }, []);
    };

    const tally = fen.split(" ")[0]
                     .replace(/[0-9/]/g, "")
                     .split("")
                     .reduce(countPieces, {});

    return countMissingPieces(tally);
};

/**
 * Display the captured pieces
 */
const displayCapturedPieces = (fen, board) => {

    const captured = getCapturedPieces(fen);

    const pieces = {
        B: { player: "white", alt: "white bishop", src: "images/wB.svg" },
        K: { player: "white", alt: "white king",   src: "images/wK.svg" },
        N: { player: "white", alt: "white knight", src: "images/wN.svg" },
        P: { player: "white", alt: "white pawn",   src: "images/wP.svg" },
        Q: { player: "white", alt: "white queen",  src: "images/wQ.svg" },
        R: { player: "white", alt: "white rook",   src: "images/wR.svg" },
        b: { player: "black", alt: "black bishop", src: "images/bB.svg" },
        k: { player: "black", alt: "black king",   src: "images/bK.svg" },
        n: { player: "black", alt: "black knight", src: "images/bN.svg" },
        p: { player: "black", alt: "black pawn",   src: "images/bP.svg" },
        q: { player: "black", alt: "black queen",  src: "images/bQ.svg" },
        r: { player: "black", alt: "black rook",   src: "images/bR.svg" }
    };

    const createImage = piece => {

        const img = document.createElement("img");
        const alt = document.createAttribute("alt");
        const src = document.createAttribute("src");

        alt.value = pieces[piece].alt;
        src.value = pieces[piece].src;

        img.attributes.setNamedItem(alt);
        img.attributes.setNamedItem(src);

        return img;
    };

    let takenWhite = null;
    let takenBlack = null;

    if (board.orientation() === "white") {
        takenWhite = document.getElementById("captured-top");
        takenBlack = document.getElementById("captured-bottom");
    } else {
        takenWhite = document.getElementById("captured-bottom");
        takenBlack = document.getElementById("captured-top");
    }

    takenWhite.replaceChildren();
    takenBlack.replaceChildren();

    captured.forEach(taken => {

        if (pieces[taken.piece].player === "white") {
            for (let i = 0; i < taken.count; i++) {
                takenWhite.appendChild(createImage(taken.piece));
            }
        } else {
            for (let i = 0; i < taken.count; i++) {
                takenBlack.appendChild(createImage(taken.piece));
            }
        }
    });
};

/**
 * Wrap pgn output
 */
const wrapPgn = text => {
    return text.replace(/ ([0-9]\.)/g, "\n $1")
               .replace(/ ([0-9][0-9]\.)/g, "\n$1")
               .replace(/^([0-9]\.)/, " $1")
               .replace(/\n([0-9]\.)/, " $1");
};

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
 * Handle moving pieces, using the engine for validation
 */
const pieceMoved = (boardDetails, engine) => {

    return (source, target, piece, newPos, oldPos, orientation) => {

        // First check that we are still on the board
        if (target === "offboard") {
            return "snapback";
        }

        // Now try to make the move
        const moved = engine.move({
            from: source,
            to: target
        });

        // Tidy up if it wasn't a legal move
        if (!moved) {
            return "snapback";
        }

        // Indicate which player is to move next
        if (moved.color === "b") {
            setStatusNext("w");
        } else {
            setStatusNext("b");
        }

        // Update any captured pieces
        displayCapturedPieces(moved.fen, boardDetails.board);

        // Display the moves so far
        setText(wrapPgn(moved.pgn));

        // Make sure the displayed board is aligned to the game
        boardDetails.board.position(moved.fen, false);
    };
};

/**
 * Add actions to our buttons
 */
const initButtons = (boardDetails, engine) => {

    /**
     * Things we need to do for multiple actions
     */
    const boardHousekeeping = () => {

        displayCapturedPieces(engine.fen(), boardDetails.board);
    };

    const actions = {

        "Reset": () => {
            boardDetails.board.start(false);
            boardDetails.board.orientation("white");
            engine.reset();
            boardHousekeeping();
            setStatusNext("w");
            setText("New game started");
        },

        "Caro-Kann": () => {
            const pieces = "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR";
            const fen = pieces + " w KQkq - 0 2";
            boardDetails.board.position(pieces, false);
            boardDetails.board.orientation("black");
            const position = engine.load(fen);
            boardHousekeeping();
            setStatusNext("w");
            setText(wrapPgn(position.pgn));
        },

        "Flip": () => {
            boardDetails.board.flip();
            boardHousekeeping();
        },

        "Show Moves": e => {
            if (e.target.childNodes[0].textContent === "Show Moves") {
                boardDetails.settings.showMoves = true;
                e.target.childNodes[0].textContent = "Hide Moves";
            } else {
                boardDetails.settings.showMoves = false;
                e.target.childNodes[0].textContent = "Show Moves";
            }
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
const initChessBoard = engine => {

    const boardDetails = {
        board: null,
        settings: {
            showMoves: false
        }
    };

    boardDetails.board = Chessboard("the-board", {
        draggable: true,
        dropOffBoard: "snapback",
        onDrop: pieceMoved(boardDetails, engine),
        onMouseoverSquare: showMovesForPiece (boardDetails, engine),
        onMouseoutSquare: hideMovesForPiece (boardDetails, engine),
        pieceTheme: "images/{piece}.svg",
        position: "start"
    });

    engine.reset();
    setStatusNext("w");
    setText("New game started");
    return boardDetails;
};

/**
 * Run our initialisations
 */
const init = engine => {
    const board = initChessBoard(engine);
    initButtons(board, engine);
};

export default { init };

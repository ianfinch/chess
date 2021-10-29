import game from "./game.js";
import highlighting from "./highlighting.js";
import messages from "./messages.js";

/**
 * Update the "who moves next" indicator
 */
const setStatusNext = player => {

    // Remove old highlight
    [...document.getElementsByClassName("next")].forEach(elem => {
        elem.classList.remove("next");
    });

    // Highlight the current player
    [...document.getElementsByClassName("player")].forEach(elem => {

        const img = [...elem.childNodes].filter(x => x.nodeName === "IMG")[0];
        const src = [...img.attributes].filter(x => x.nodeName === "src")[0];

        if (src.nodeValue === "images/" + player + "K.svg") {
            elem.classList.add("next");
        }

    });
};

/**
 * Update legend to indicate human or computer players
 */
const displayPlayerTypes = boardDetails => {

    [...document.getElementsByClassName("player")].forEach(elem => {

        const img = [...elem.childNodes].filter(x => x.nodeName === "IMG")[0];
        const src = [...img.attributes].filter(x => x.nodeName === "src")[0];
        const label = [...elem.childNodes].filter(x => x.nodeName === "SPAN")[0];

        if (src.nodeValue === "images/wK.svg") {
            if (boardDetails.settings.white === null) {
                label.textContent = "Player";
            } else {
                label.textContent = boardDetails.settings.white.name;
            }
        }

        if (src.nodeValue === "images/bK.svg") {
            if (boardDetails.settings.black === null) {
                label.textContent = "Player";
            } else {
                label.textContent = boardDetails.settings.black.name;
            }
        }
    });
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
        B: { player: "white", alt: "white bishop", src: "images/wB.svg", value: -3    },
        K: { player: "white", alt: "white king",   src: "images/wK.svg", value: -1000 },
        N: { player: "white", alt: "white knight", src: "images/wN.svg", value: -3    },
        P: { player: "white", alt: "white pawn",   src: "images/wP.svg", value: -1    },
        Q: { player: "white", alt: "white queen",  src: "images/wQ.svg", value: -9    },
        R: { player: "white", alt: "white rook",   src: "images/wR.svg", value: -5    },
        b: { player: "black", alt: "black bishop", src: "images/bB.svg", value: 3     },
        k: { player: "black", alt: "black king",   src: "images/bK.svg", value: 1000  },
        n: { player: "black", alt: "black knight", src: "images/bN.svg", value: 3     },
        p: { player: "black", alt: "black pawn",   src: "images/bP.svg", value: 1     },
        q: { player: "black", alt: "black queen",  src: "images/bQ.svg", value: 9     },
        r: { player: "black", alt: "black rook",   src: "images/bR.svg", value: 5     }
    };

    const createImage = piece => {

        const img = document.createElement("img");
        const alt = document.createAttribute("alt");
        const src = document.createAttribute("src");

        alt.value = piece.alt;
        src.value = piece.src;

        img.attributes.setNamedItem(alt);
        img.attributes.setNamedItem(src);

        return img;
    };

    const createBalance = value => {

        const span = document.createElement("span");
        span.textContent = "+" + value;
        return span;
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

    let balance = 0;
    captured.forEach(taken => {

        if (pieces[taken.piece].player === "white") {
            for (let i = 0; i < taken.count; i++) {
                takenWhite.appendChild(createImage(pieces[taken.piece]));
                balance = balance + pieces[taken.piece].value;
            }
        } else {
            for (let i = 0; i < taken.count; i++) {
                takenBlack.appendChild(createImage(pieces[taken.piece]));
                balance = balance + pieces[taken.piece].value;
            }
        }
    });

    if (balance < 0) {
        takenWhite.appendChild(createBalance(-1 * balance));

    } else if (balance > 0) {
        takenBlack.appendChild(createBalance(balance));
    }
};

/**
 * Wrap pgn output
 */
const formatPgn = text => {

    let result = "";

    // Display any headers
    const headers = text.match(/\[[^\]]*\]/g);
    if (headers) {
        text.match(/\[[^\]]*\]/g).forEach(header => {
            result += "<div>" + header + "</div>";
        });
        text = text.replace(/^.*\]/s, "");
    }

    // Separate out the moves
    let moves = text
                .split(/([0-9][0-9]*\.)/)
                .map(x => x.split(/( |{|})/));
    moves = [].concat.apply([], moves)
                .map(x => x.trim())
                .filter(x => x);

    // Add the moves to the result
    let moveNumber = "";
    let white = true;
    let addingComment = false;
    let pending = "";
    moves.forEach(move => {

        if (pending) {
            result += pending;
            pending = "";
        }

        if (move === "}") {
            result += "</div>";
            addingComment = false;

            if (!white) {
                pending = "<div>(" + moveNumber + ") ... ";
            }
        }

        else if (move === "{") {
            result += '<div class="comment">';
            addingComment = true;
        }

        else if (addingComment) {
            result += move + " ";
        }

        else if (move.match(/[0-9][0-9]*\./)) {
            moveNumber = move;
            result += "<div>" + move + " ";
        }

        else if (white) {
            result += move + " ";
            white = false;
        }

        else {
            result += move + "</div>";
            white = true;
        }
    });

    return result;
};

/**
 * Display the game's moves
 */
const displayPgn = pgn => {
    document.getElementById("text").innerHTML = formatPgn(pgn);
};

/**
 * Update the display following a move
 */
const postMoveDisplayUpdate = (moved, boardDetails) => {

    // Clear any previous highlights
    highlighting.clear();

    // Make sure our player types are still correct
    displayPlayerTypes(boardDetails);

    // Indicate which player is to move next
    const nextPlayer = moved.color === "b" ? "w" : "b";
    setStatusNext(nextPlayer);

    // Update any captured pieces
    displayCapturedPieces(moved.fen, boardDetails.board);

    // Display the moves so far
    displayPgn(boardDetails.engine.pgn());

    // Make sure the displayed board is aligned to the game
    boardDetails.board.position(moved.fen, false);

    // Highlight the move which has just happened
    highlighting.movedFrom(moved.from);
    highlighting.movedTo(moved.to);

    // Check whether the next player to move is in check
    if (boardDetails.engine.inCheck()) {
        highlighting.showCheck(nextPlayer);
    }

    // Returning a value, in case I end up using this in a promise chain
    // somewhere
    return true;
};

/**
 * Check for automatic moves
 *
 * We do this in a loop, to allow both sides to play automatically (if game is
 * set up in that way)
 */
const automaticMoves = boardDetails => {

    const playerToMove = boardDetails.engine.turn();

    if (playerToMove === "w" && boardDetails.settings.white) {
        return boardDetails.settings.white.move(boardDetails.engine.fen())
                .then(response => tidyUpAfterAutomaticMove(response, boardDetails))
                .then(() => automaticMoves(boardDetails));
    }

    if (playerToMove === "b" && boardDetails.settings.black) {
        return boardDetails.settings.black.move(boardDetails.engine.fen())
                .then(response => tidyUpAfterAutomaticMove(response, boardDetails))
                .then(() => automaticMoves(boardDetails));
    }

    return Promise.resolve(null);
};

/**
 * Handle the outcome of an automatic move
 */
const tidyUpAfterAutomaticMove = (response, boardDetails) => {

    // Handle an error from the automatic move
    if (!response || !response.move || !response.move.move ) {

        // Give a bit of information about the error
        if (!response) {
            messages.alert("Backend Error", "The backend service is not available");
        } else if (response.error) {
            messages.alert("Backend Error", response.error);
        } else {
            messages.alert("Backend Error", "The backend service is unable to respond");
        }

        // And let's give up on the bot
        if (boardDetails.engine.turn() === "w") {
            boardDetails.settings.white = null;
        } else {
            boardDetails.settings.black = null;
        }
    }

    // Play the move in our internal engine
    const moved = boardDetails.engine.move(response.move.move);

    // Add any headers from the bot
    if (response.move.headers) {
        Object.keys(response.move.headers).forEach(header => {
            boardDetails.engine.header(header, response.move.headers[header]);
        });
    }

    // Add any comments from the bot
    if (response.move.comment) {
        boardDetails.engine.comment(response.move.comment);
    }

    // Run our usual set of display updates
    return postMoveDisplayUpdate(moved, boardDetails);
};

/**
 * Check whether the last move has ended the game
 */
const handleGameOver = boardDetails => {

    const gameOver = boardDetails.engine.gameIsOver();
    if (!gameOver) {
        return false;
    }

    const winner = gameOver.winner.substr(0, 1).toUpperCase() + gameOver.winner.substr(1);
    const loser = gameOver.winner === "white" ? "Black" : "White";

    if (gameOver.result === "checkmate") {
        messages.alert("Win for " + winner, winner + " won game by checkmate");
    }

    else if (gameOver.result === "stalemate") {
        messages.alert("Stalemate", winner + " put " + loser + " in stalemate");
    }

    else {
        messages.alert("Drawn Game", "Game was drawn by " + gameOver.result);
    }

    return true;
};

/**
 * Handle moving pieces, using the engine for validation
 */
const pieceMoved = boardDetails => {

    return (source, target, piece, newPos, oldPos, orientation) => {

        // First check that we are still on the board
        if (target === "offboard") {
            return "snapback";
        }

        // Check whether the game has already ended
        if (handleGameOver(boardDetails)) {
            return "snapback";
        }

        // Do we need to promote a pawn?
        let checkForPromotion = null;
        if ((piece === "wP" && target.match(/8$/)) ||
            (piece === "bP" && target.match(/1$/))) {
            checkForPromotion = messages.options("Promote pawn to ...", ["Queen", "Rook", "Knight", "Bishop"]);
        } else {
            checkForPromotion = Promise.resolve(null);
        }

        // Once we know about whether promotion is needed, try to make the move
        return checkForPromotion.then(promotion => {

            // Set up the details of the move
            const moveDetails = {
                from: source,
                to: target
            };

            // If there's a promotion, add it to the move details
            if (promotion) {
                moveDetails.promotion = promotion.substr(0, 1).toLowerCase();
            }

            // Now try to make the move
            const moved = boardDetails.engine.move(moveDetails);

            // Tidy up if it wasn't a legal move
            // Note that we can't just return "snapback", because we are now in
            // a promise chain, so have to return a promise.  So, we will
            // redraw the board explictly to make sure it is aligned to the
            // internal position
            if (!moved) {
                boardDetails.board.position(boardDetails.engine.fen(), false);
                return null;
            }

            // Make sure the display reflects the move
            postMoveDisplayUpdate(moved, boardDetails);

            // Now look for any automatic moves
            return automaticMoves(boardDetails)
                    .then(() => callHook(boardDetails, "onDrop"))
                    .then(() => handleGameOver(boardDetails));
        });
    };
};

/**
 * Things we need to set up a basic board before we play any games
 */
const setupBoard = (boardDetails, white, black) => {

    // Initialise the board and engine
    boardDetails.board.start(false);
    boardDetails.engine.reset();

    // If one of the players is manual (i.e. null), orientate the board for
    // that player.  If both players are manual or neither player is manual,
    // orientate the board for white
    let player = "white";
    if (black === null && white !== null) {
        player = "black";
    }
    boardDetails.board.orientation(player);

    // White moves first
    setStatusNext("w");

    // Set up the players
    boardDetails.settings.white = white;
    boardDetails.settings.black = black;

    // Set up the button to allow flipping of the board
    const opponent = player === "white" ? "black" : "white";
    [...document.getElementsByTagName("button")]
        .filter(x => x.textContent === "Play as " + player)
        .forEach(button => button.textContent = "Play as " + opponent);
};

/**
 * Flip a board - if white is at the bottom, put black at the bottom
 *
 * Return the colour of the player at the bottom of the board after the flip
 */
const flipBoard = boardDetails => {

    // Actually rotate the board
    boardDetails.board.flip();

    // Switch over the players
    const blackPlayer = boardDetails.settings.black;
    boardDetails.settings.black = boardDetails.settings.white;
    boardDetails.settings.white = blackPlayer;

    // See if we need to trigger an automatic move
    return automaticMoves(boardDetails);
};

/**
 * Start a new game
 */
const startNewGame = (boardDetails, white, black, pgnHeaders, moves) => {

    // Create the board
    setupBoard(boardDetails, white, black);
    boardDetails.engine.header("Started", new Date().toUTCString());

    // Add any passed in headers
    if (pgnHeaders) {
        pgnHeaders.forEach(([key, value]) => {
            boardDetails.engine.header(key, value);
        });
    }

    // If there are any moves needed to complete the setup, apply them
    if (moves) {
        moves.forEach(move => {
            const moved = boardDetails.engine.move(move);
            boardDetails.board.position(moved.fen, false);
        });
    }

    // Display the areas around the board
    displayPgn(boardDetails.engine.pgn());
    displayCapturedPieces(boardDetails.engine.fen(), boardDetails.board);
    displayPlayerTypes(boardDetails);

    // Check whether we need an automatic move now
    return automaticMoves(boardDetails);
};

/**
 * Run a hook (if defined)
 */
const callHook = (boardDetails, hook) => {

    if (boardDetails.hooks[hook]) {
        boardDetails.hooks[hook]();
    }
};

/**
 * Set up our chess board
 */
const initChessBoard = engine => {

    // Initialise the settings for our board
    const boardDetails = {
        board: null,
        engine,
        hooks: {
            onDrop: null
        },
        settings: {
            showMoves: true,
            white: null,
            black: null
        }
    };

    // Create the board GUI
    boardDetails.board = Chessboard("the-board", {
        draggable: true,
        dropOffBoard: "snapback",
        onDrop: pieceMoved(boardDetails, engine),
        onMouseoverSquare: highlighting.showMovesForPiece(boardDetails, engine),
        onMouseoutSquare: highlighting.hideMovesForPiece(boardDetails, engine),
        pieceTheme: "images/{piece}.svg",
        position: "start"
    });

    // Return our board
    return boardDetails;
};

/**
 * Run our initialisations
 */
const init = () => {

    const board = initChessBoard(game);
    messages.init();

    return {

        addHook: (hook, fn) => {
            board.hooks[hook] = fn;
        },

        comment: text => {
            board.engine.comment(text);
            displayPgn(board.engine.pgn());
        },

        fen: () => {
            return board.engine.fen();
        },

        flip: () => {
            return flipBoard(board);
        },

        showMoves: onOrOff => {
            board.settings.showMoves = onOrOff;
        },

        startNewGame: (white, black, pgnHeaders, moves) => {
            return startNewGame(board, white, black, pgnHeaders, moves);
        }
    };
};

export default { init };

import messages from "./messages.js";

/**
 * Display a "game over" message
 */
const gameOver = msg => {
    return messages.alert("Game Over", msg);
};

/**
 * Display a "try later" message
 */
const unexpectedProblem = msg => {
    return messages.alert("Unexpected Problem", msg);
};

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
        const label = [...elem.childNodes].filter(x => x.nodeName === "DIV")[0];

        if (src.nodeValue === "images/wK.svg") {
            if (boardDetails.settings.whiteIsPlayer) {
                label.textContent = "Player";
            } else {
                label.textContent = boardDetails.settings.opponent;
            }
        }

        if (src.nodeValue === "images/bK.svg") {
            if (boardDetails.settings.blackIsPlayer) {
                label.textContent = "Player";
            } else {
                label.textContent = boardDetails.settings.opponent;
            }
        }

    });
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
 * Ask for an API token
 */
const requestApiToken = boardDetails => {

    return fetch(location.origin + "/join")
            .then(response => response.json())
            .then(response => {
                boardDetails.settings.apiToken = response.token;
                boardDetails.settings.opponents = response.opponents;
                return response.token;
            })
            .catch(() => null);
};

/**
 * Get an API token (either stored or a new request)
 */
const getApiToken = boardDetails => {

    // Need a token from the API.  Because it's an API call, we need to get all
    // async.  So, let's start with a promise, which we resolve to the current
    // value of the apiToken from our settings
    let theToken = Promise.resolve(boardDetails.settings.apiToken);

    // Now, if we don't actually have a token, make an API call to get one, and
    // use the result to replace our "theToken" promise
    if (!boardDetails.settings.apiToken) {
        theToken = unexpectedProblem("You don't seem to have signed in for a game - will join now")
                    .then(() => requestApiToken(boardDetails));
    }

    // However we got our token, return it
    return theToken;
};

/**
 * Get our list of known opponents
 */
const getOpponentList = boardDetails => {

    // We should already have a list of opponents
    let opponents = Promise.resolve(boardDetails.settings.opponents);

    // If we don't make one attempt to get it again
    if (!boardDetails.settings.opponents || boardDetails.settings.opponents.length === 0) {
        opponents = unexpectedProblem("No opponents can be found - will retry")
                        .then(() => requestApiToken(boardDetails))
                        .then(() => boardDetails.settings.opponents);
    }

    return opponents;
};

/**
 * Select an opponent
 */
const selectOpponent = boardDetails => {

    return getOpponentList(boardDetails)
            .then(opponents => {

                // Bail out if we have no opponents
                if (!opponents || opponents.length === 0) {
                    return unexpectedProblem("No opponents are available")
                            .then(() => null);
                }

                // Let the player select the opponent
                const opponent = Promise.resolve(opponents[0]);

                // We also need an API token to select this opponent on the API server
                const token = getApiToken(boardDetails);

                // Make the API call
                const selected = Promise.all([ opponent, token ])
                                    .then(([ opponent, token ]) => {
                                        return fetch(location.origin + "/opponent/" + token + "/" + opponent);
                                    })
                                    .then(response => response.json())
                                    .catch(() => null);
                return selected;
            });
};

/**
 * Make an API call to the backend bot to get the next move
 */
const requestNextMoveFromBot = (boardDetails, engine) => {

    // Our FRN needs to be URI encoded
    const protectedFen = encodeURI(engine.fen()).replace(/\//g, "|");

    // Now get our token and make the API call
    return getApiToken(boardDetails)
            .then(token => fetch(location.origin + "/bot/" + token + "/" + protectedFen))
            .then(response => response.json())
            .catch(() => null);
};

/**
 * Update the display following a move
 */
const postMoveDisplayUpdate = (moved, boardDetails, engine) => {

    // Indicate which player is to move next
    const nextPlayer = moved.color === "b" ? "w" : "b";
    setStatusNext(nextPlayer);

    // Update any captured pieces
    displayCapturedPieces(moved.fen, boardDetails.board);

    // Display the moves so far
    setText(wrapPgn(moved.pgn));

    // Make sure the displayed board is aligned to the game
    boardDetails.board.position(moved.fen, false);

    // Check whether we need the bot to make the next move
    if ((nextPlayer === "w" && !boardDetails.settings.whiteIsPlayer) ||
        (nextPlayer === "b" && !boardDetails.settings.blackIsPlayer)) {

        botMakesMove(boardDetails, engine);
    }
};

/**
 * Make an automated move, by calling the bot backend
 */
const botMakesMove = (boardDetails, engine) => {

    /**
     * Make the move in the engine
     */
    const makeMove = response => {

        // Catch any errors
        if (!response || !response.move || !response.move.move ) {

            if (!response) {
                gameOver("The backend service is not available");
            } else if (response.error) {
                gameOver(response.error);
            } else {
                gameOver("The backend service is unable to find a move to play");
            }

            if (engine.turn() === "w") {
                boardDetails.settings.whiteIsPlayer = true;
            } else {
                boardDetails.settings.blackIsPlayer = true;
            }
            displayPlayerTypes(boardDetails);

            return null;
        }

        // Add any headers from the bot
        if (response.move.headers) {
            Object.keys(response.move.headers).forEach(header => {
                engine.header(header, response.move.headers[header]);
            });
        }

        // Return the move
        return engine.move(response.move.move);
    };

    /**
     * Update the display after the move
     */
    const updateDisplay = moved => {

        if (!moved) {
            return null;
        }

        postMoveDisplayUpdate(moved, boardDetails, engine);
    };

    requestNextMoveFromBot(boardDetails, engine)
        .then(makeMove)
        .then(updateDisplay);
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

        // Make sure the display reflects the move
        postMoveDisplayUpdate(moved, boardDetails, engine);
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
        displayPlayerTypes(boardDetails);
    };

    const actions = {

        "Reset": () => {

            boardDetails.board.start(false);
            boardDetails.board.orientation("white");
            boardDetails.settings.whiteIsPlayer = true;
            boardDetails.settings.blackIsPlayer = false;
            [...document.getElementsByTagName("button")]
                .filter(x => x.textContent === "Play as white")
                .forEach(button => button.textContent = "Play as black");
            engine.reset();
            setStatusNext("w");
            engine.header("Start", new Date().toUTCString());
            setText(wrapPgn(engine.pgn()));
            boardHousekeeping();
        },

        "Play as black": e => {

            // Rotate the board DIV
            boardDetails.board.flip();

            // Switch over the players
            const blackIsPlayer = boardDetails.settings.blackIsPlayer;
            boardDetails.settings.blackIsPlayer = boardDetails.settings.whiteIsPlayer;
            boardDetails.settings.whiteIsPlayer = blackIsPlayer;

            // Update the button label
            if (boardDetails.board.orientation() === "white") {
                e.target.childNodes[0].textContent = "Play as black";
            } else {
                e.target.childNodes[0].textContent = "Play as white";
            }

            // See if we need to trigger an API-based move
            const playerToMove = engine.turn();
            if ((playerToMove === "w" && !boardDetails.settings.whiteIsPlayer) ||
                (playerToMove === "b" && !boardDetails.settings.blackIsPlayer)) {
                botMakesMove(boardDetails, engine);
            }

            // Tidy up the display
            boardHousekeeping();
        },

        "Show moves": e => {

            if (e.target.childNodes[0].textContent === "Show moves") {
                boardDetails.settings.showMoves = true;
                e.target.childNodes[0].textContent = "Hide moves";
            } else {
                boardDetails.settings.showMoves = false;
                e.target.childNodes[0].textContent = "Show moves";
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
 * Start a new game
 */
const startNewGame = (boardDetails, engine) => {

    return selectOpponent(boardDetails)
            .then(() => {

                engine.reset();
                setStatusNext("w");
                displayPlayerTypes(boardDetails);

                engine.header("Start", new Date().toUTCString());
                setText(wrapPgn(engine.pgn()));
            });
};

/**
 * Set up our chess board
 */
const initChessBoard = engine => {

    // Initialise the settings for our board
    const boardDetails = {
        board: null,
        settings: {
            apiToken: null,
            showMoves: false,
            whiteIsPlayer: true,
            blackIsPlayer: false,
            opponent: "CPU"
        }
    };

    // Create the board GUI
    boardDetails.board = Chessboard("the-board", {
        draggable: true,
        dropOffBoard: "snapback",
        onDrop: pieceMoved(boardDetails, engine),
        onMouseoverSquare: showMovesForPiece (boardDetails, engine),
        onMouseoutSquare: hideMovesForPiece (boardDetails, engine),
        pieceTheme: "images/{piece}.svg",
        position: "start"
    });

    // Return our board
    return boardDetails;
};

/**
 * Run our initialisations
 */
const init = engine => {

    // Set everything up
    const board = initChessBoard(engine);
    initButtons(board, engine);
    messages.init();

    // Start a new game
    requestApiToken(board)
        .then(() => startNewGame(board, engine));
};

export default { init };

import bots from "./bots.js";
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
 * Display the game's moves
 */
const displayPgn = pgn => {
    document.getElementById("text").textContent = wrapPgn(pgn);
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
 * Select an opponent
 */
const selectOpponent = boardDetails => {

    const opponents = boardDetails.bot.getOpponents();

    // Bail out if we have no opponents
    if (!opponents || opponents.length === 0) {
        return messages.alert("Unexpected Problem", "No opponents are available")
                .then(() => null);
    }

    // Let the player select the opponent
    return messages.options("Select opponent", opponents)
            .then(opponent => boardDetails.bot.selectOpponent(opponent));
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
    displayPgn(moved.pgn);

    // Make sure the displayed board is aligned to the game
    boardDetails.board.position(moved.fen, false);

    // Highlight the move which has just happened
    highlighting.movedFrom(moved.from);
    highlighting.movedTo(moved.to);

    // Check whether the next player to move is in check
    if (engine.inCheck()) {
        highlighting.showCheck(nextPlayer);
    }

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
     * Prepare the board to make a moge
     */
    const preMove = () => {

        highlighting.clear();
        return Promise.resolve(true);
    };

    /**
     * Make the move in the engine
     */
    const makeMove = response => {

        // Catch any errors
        if (!response || !response.move || !response.move.move ) {

            if (!response) {
                messages.alert("Bot Error", "The backend service is not available");
            } else if (response.error) {
                messages.alert("Bot Error", response.error);
            } else {
                messages.alert("Bot Error", "The backend service is unable to find a move to play");
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

    preMove()
        .then(() => boardDetails.bot.move(engine.fen()))
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
    const setupBoard = player => {

        const opponent = player === "white" ? "black" : "white";

        boardDetails.board.start(false);
        boardDetails.board.orientation(player);

        if (player === "white") {
            boardDetails.settings.whiteIsPlayer = true;
            boardDetails.settings.blackIsPlayer = false;
        } else {
            boardDetails.settings.whiteIsPlayer = false;
            boardDetails.settings.blackIsPlayer = true;
        }

        [...document.getElementsByTagName("button")]
            .filter(x => x.textContent === "Play as " + player)
            .forEach(button => button.textContent = "Play as " + opponent);

        engine.reset();
        setStatusNext(player.substr(0, 1));
    };

    const boardHousekeeping = () => {

        displayCapturedPieces(engine.fen(), boardDetails.board);
        displayPlayerTypes(boardDetails);
    };

    /**
     * Action-specific functions
     */
    const actions = {

        "New Game": () => {

            messages.options("Select game type", [
                "New Game",
                "Defend e4"
            ]).then(option => {

                if (option === "New Game") {

                    selectOpponent(boardDetails).then(opponent => {

                        engine.reset();
                        setupBoard("white");
                        engine.header("Start", new Date().toUTCString());
                        displayPgn(engine.pgn());
                        boardHousekeeping();
                    });
                
                } else if (option === "Defend e4") {

                    selectOpponent(boardDetails).then(opponent => {

                        engine.reset();
                        setupBoard("black");
                        engine.header("Defend against e4", new Date().toUTCString());
                        const moved = engine.move("e4");
                        boardDetails.board.position(moved.fen, false);
                        displayPgn(engine.pgn());
                        boardHousekeeping();
                    });
                }
            });
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

        "Hide moves": e => {

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
 * Set up our chess board
 */
const initChessBoard = engine => {

    // Initialise the settings for our board
    const boardDetails = {
        board: null,
        bot: null,
        settings: {
            showMoves: true,
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
        onMouseoverSquare: highlighting.showMovesForPiece (boardDetails, engine),
        onMouseoutSquare: highlighting.hideMovesForPiece (boardDetails, engine),
        pieceTheme: "images/{piece}.svg",
//        position: "start"
    });

    // Return our board
    return boardDetails;
};

/**
 * Run our initialisations
 */
const init = engine => {

    const board = initChessBoard(engine);
    initButtons(board, engine);
    messages.init();
    bots.init().then(bot => { board.bot = bot; });
};

export default { init };

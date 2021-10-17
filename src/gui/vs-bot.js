import board from "./board.js";
import bots from "./bots.js";
import messages from "./messages.js";

/**
 * Select an opponent
 */
const selectOpponent = (boardDetails, bot) => {

    const opponents = bot.getOpponents();

    // Bail out if we have no opponents
    if (!opponents || opponents.length === 0) {
        return messages.alert("Unexpected Problem", "No opponents are available")
                .then(() => null);
    }

    // Let the player select the opponent
    return messages.options("Select opponent", opponents);
};

/**
 * Make an automated move, by calling the bot backend
 */
const botMakesMove = boardDetails => {

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

            // Give a bit of information about the error
            if (!response) {
                messages.alert("Bot Error", "The backend service is not available");
            } else if (response.error) {
                messages.alert("Bot Error", response.error);
            } else {
                messages.alert("Bot Error", "The backend service is unable to find a move to play");
            }

            // Set the player who was meant to move back to manual
            if (boardDetails.engine.turn() === "w") {
                boardDetails.settings.white = null;
            } else {
                boardDetails.settings.black = null;
            }
            displayPlayerTypes(boardDetails);

            return null;
        }

        // Add any headers from the bot
        if (response.move.headers) {
            Object.keys(response.move.headers).forEach(header => {
                boardDetails.engine.header(header, response.move.headers[header]);
            });
        }

        // Return the move
        return boardDetails.engine.move(response.move.move);
    };

    /**
     * Update the display after the move
     */
    const updateDisplay = moved => {

        if (!moved) {
            return null;
        }

        postMoveDisplayUpdate(moved, boardDetails);
    };

    return preMove()
            .then(() => bot.move(boardDetails.engine.fen()))
            .then(makeMove)
            .then(updateDisplay);
};

/**
 * Add actions to our buttons
 */
const initButtons = (boardDetails, bot) => {

    /**
     * Action-specific functions
     */
    const actions = {

        "new-game": () => {

            messages.options("Select game type", [
                "New Game",
                "Defend e4"
            ]).then(option => {

                if (option === "New Game") {

                    const move = board => { botMakesMove(board, bot); };

                    selectOpponent(boardDetails, bot)
                        .then(opponent => {

                            startNewGame(boardDetails, null, { name: opponent, move });
                            bot.selectOpponent(opponent);
                        });
                
                } else if (option === "Defend e4") {

                    selectOpponent(boardDetails, bot)
                        .then(opponent => {

                            const moves = [ "e4" ];
                            const headers = [
                                [ "Type of game", "Defend against e4" ]
                            ];

                            startNewGame(boardDetails, { name: opponent, move }, null, headers, moves);
                            bot.selectOpponent(opponent);
                        });
                }
            });
        },

        "flip-board": e => {

            // Rotate the board DIV
            boardDetails.board.flip();

            // Switch over the players
            const blackPlayer = boardDetails.settings.black;
            boardDetails.settings.black = boardDetails.settings.white;
            boardDetails.settings.white = blackPlayer;

            // Update the button label
            if (boardDetails.board.orientation() === "white") {
                e.target.childNodes[0].textContent = "Play as black";
            } else {
                e.target.childNodes[0].textContent = "Play as white";
            }

            // See if we need to trigger an API-based move
            automaticMoves(boardDetails)
                .then(() => {

                    // Tidy up the display
                    displayCapturedPieces(boardDetails.engine.fen(), boardDetails.board);
                    displayPlayerTypes(boardDetails);
                });
        },

        "toggle-highlight": e => {

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
        const id = button.id;

        if (actions[id]) {
            button.addEventListener("click", actions[id]);
        }
    });
};

// Wait until the page is fully loaded before doing anything
window.addEventListener("load", () => {

    const boardDetails = board.init();
    bots.init().then(bot => {
        initButtons(boardDetails, bot);
    });

});

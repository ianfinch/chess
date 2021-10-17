import board from "./board.js";
import bots from "./bots.js";
import messages from "./messages.js";

/**
 * Select an opponent
 */
const selectOpponent = (bot) => {

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
 * Add actions to our buttons
 */
const initButtons = (chessboard, bot) => {

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

                    selectOpponent(bot)
                        .then(opponent => {

                            chessboard.startNewGame(null, { name: opponent, move: bot.move });
                            bot.selectOpponent(opponent);
                        });
                
                } else if (option === "Defend e4") {

                    selectOpponent(bot)
                        .then(opponent => {

                            const moves = [ "e4" ];
                            const headers = [
                                [ "Type of game", "Defend against e4" ]
                            ];

                            chessboard.startNewGame({ name: opponent, move: bot.move }, null, headers, moves);
                            bot.selectOpponent(opponent);
                        });
                }
            });
        },

        "flip-board": e => {

            // Rotate the board
            const player = chessboard.flip();

            // Update the button label
            if (player === "white") {
                e.target.childNodes[0].textContent = "Play as black";
            } else {
                e.target.childNodes[0].textContent = "Play as white";
            }
        },

        "toggle-highlight": e => {

            if (e.target.childNodes[0].textContent === "Show moves") {
                e.target.childNodes[0].textContent = "Hide moves";
                chessboard.showMoves(true);
            } else {
                e.target.childNodes[0].textContent = "Show moves";
                chessboard.showMoves(false);
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

    const chessboard = board.init();
    bots.init().then(bot => {
        initButtons(chessboard, bot);
    });

});

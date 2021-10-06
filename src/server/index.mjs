import * as uuid from "uuid";
import express from "express";
const app = express();

import book from "./opening-book.mjs";
import stockfish from "./stockfish.mjs";
import randomMove from "./random-move.mjs";

// The bots we will try (in order)
const bots = [
    book,
    stockfish,
    randomMove
];

// A lookup table for games in flight
const games = [];

const log = {
    format: (level, msg) => (new Date().toISOString()) + " " + level + " SERVER    " + msg,
    info: (msg) => console.log(log.format("INFO ", msg)),
    error: (msg) => console.error(log.format("ERROR", msg))
};

/**
 * Find a bot which returns a next move
 */
const getNextMove = (fen) => {

    // Get all possible responses
    const responses = Promise.all(bots.map(bot => bot.next(fen)));

    // Identify which are usable moves
    const moves = responses.then(result => {
        log.info("Moves from bots: " + JSON.stringify(result));
        return result.filter(move => move);
    });

    // Select a move to use
    const result = moves.then(options => {

        // If we have no moves, we can't do anything
        if (options.length === 0) {
            log.info("No moves available");
            return null;
        }

        // If we have exactly one move, play it
        if (options.length === 1) {
            log.info("Only move possible: " + options[0]);
            return options[0];
        }

        // Otherwise, play the first one
        // REPLACE THIS AT SOME POINT WITH A VOTE?
        log.info("Selected move: " + options[0]);
        return options[0];
    });

    return result;
};

process.on("SIGINT", () => {
    log.info("Server received interrupt signal");
    process.exit();
});

// Serve static files from the "public" folder
app.use(express.static("public"));

// An initial call to get the UUID we need for subsequent calls
app.get("/join", (req, res) => {

    const token = uuid.v4();
    games.push(token);

    res.send({ token });
});

// Handle a valid call to our bot (passing a FEN)
app.get("/bot/:player/:fen", (req, res) => {

    if (!games.includes(req.params.player)) {
        res.sendStatus(401);
        return;
    }

    const decodedFen = decodeURI(req.params.fen.replace(/\|/g, "/"));
    getNextMove(decodedFen).then(move => { res.send({ move }) });
});

// Start the server
const start = port => {
    app.listen(port, () => {
        log.info("Server listening on port " + port);
    });
};

export default { start };

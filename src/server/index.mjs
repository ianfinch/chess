import * as uuid from "uuid";
import express from "express";
const app = express();

import book from "./opening-book.mjs";
import randomMove from "./random-move.mjs";

// The bots we will try (in order)
const bots = [
    book,
    randomMove
];

// A lookup table for games in flight
const games = [];

const log = {
    format: (level, msg) => (new Date().toISOString()) + " " + level + " SERVER " + msg,
    info: (msg) => console.log(log.format("INFO ", msg)),
    error: (msg) => console.error(log.format("ERROR", msg))
};

/**
 * Find a bot which returns a next move
 */
const getNextMove = (fen) => {

    const moves = bots.map(bot => bot.next(fen))
                      .filter(move => move);

    // If we have no moves, we can't do anything
    if (moves.length === 0) {
        return null;
    }

    // If we have exactly one move, play it
    if (moves.length === 1) {
        return moves[0];
    }

    // Otherwise, play the first one
    // REPLACE THIS AT SOME POINT WITH A VOTE?
    return moves[0];
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
    res.send({ move: getNextMove(decodedFen) });
});

// Start the server
const start = port => {
    app.listen(port, () => {
        log.info("Server listening on port " + port);
    });
};

export default { start };

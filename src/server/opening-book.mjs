import fs from "fs";

const log = {
    format: (level, msg) => (new Date().toISOString()) + " " + level + " BOOK        " + msg,
    info: (msg) => console.log(log.format("INFO ", msg)),
    error: (msg) => console.error(log.format("ERROR", msg))
};

// Load in the opening book
const book = JSON.parse(fs.readFileSync("./openings/openings.json").toString());

/**
 * Handle a request to find the next position from the passed in one
 */
const next = fen => {

    log.info("Current position: " + fen);

    // See if we can find this in the book
    const fromBook = book[fen];
    if (!fromBook) {
        log.info("Not found in opening book");
        return null;
    }

    // Now see which moves are known from here
    log.info("Opening: " + fromBook.name);
    const moves = Object.keys(fromBook.future);
    log.info("Documented next moves: " + moves.length);

    // If we don't have a next move, stop now
    if (moves.length === 0) {
        log.info("No move could be identified");
        return null;
    }

    const selected = Math.floor(Math.random() * moves.length);
    const continuation = book[fromBook.future[moves[selected]]].name;
    log.info("Move chosen: " + moves[selected] + " (" + continuation + ")");
    return {
        move: moves[selected],
        source: "opening book",
        comment: continuation
    };
};

log.info("Opening book loaded with " + Object.keys(book).length + " positions");
export default { next };

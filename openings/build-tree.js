const fs = require("fs");
const { Chess } = require("chess.js");
const game = new Chess();

// Load in the openings from the TSV file
const openings = fs.readFileSync("./openings/openings.tsv").toString();

// Initialise our book with the start position
const start = game.fen();
const book = {
    [start]: {
        name: "Start of Game",
        history: [],
        future: {}
    }
};

// Go through the openings, and initially populate the book for lookup by position
openings.split("\n").forEach(opening => {

    if (!opening.match(/^[A-E][0-9][0-9]/)) {
        return;
    }

    // Read in the record
    const [eco, name, pgn, uci, epd] = opening.split("\t");

    // Convert to fen
    if (game.load_pgn(pgn)) {

if (book[game.fen()]) {
    console.log("Clash: " + name + " vs " + book[game.fen()].name);
}

        book[game.fen()] = {
            name,
            history: game.history(),
            future: {}
        };

    } else {
        console.error("ERROR: UNABLE TO LOAD PGN: " + name);
    }
});

// Go through the book and link the positions together
Object.keys(book).forEach(fen => {

    // Begin at the start position
    let position = start;
    game.load(start);

    // Go through each of the moves in this opening, to trace them through the book
    book[fen].history.forEach(move => {

        if (game.move(move)) {

            // Update our position
            newPosition = game.fen();

            // If we don't recognise this position, add it with this opening's name
            if (!book[newPosition]) {
                book[newPosition] = { name: book[fen].name, future: {} };
            }

            // Update our book to reflect this move
            book[position].future[move] = newPosition;
            position = newPosition;

        } else {
            console.error("ERROR: Unable to make move: " + move + " (" + book[fen].name + ")");
        }
    });
});

fs.writeFileSync("./openings/openings.json", JSON.stringify(book, null, 4));

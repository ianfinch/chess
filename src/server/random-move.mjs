import { Chess } from "chess.js";
const chess = new Chess();

const log = {
    format: (level, msg) => (new Date().toISOString()) + " " + level + " RANDOM " + msg,
    info: (msg) => console.log(log.format("INFO ", msg)),
    error: (msg) => console.error(log.format("ERROR", msg))
};

const next = fen => {

    log.info("Current position: " + fen);

    // Load in the current position
    if (!chess.load(fen)) {
        log.error("Unable to load FEN: " + fen);
        return null;
    }

    // See what moves we have
    const moves = chess.moves();
    if (!moves || moves.length === 0) {
        return null;
    }

    // Select a move at random
    const selected = Math.floor(Math.random() * moves.length);
    return moves[selected];
};

log.info("Random moves available");
export default { next };

import nodeUci from "node-uci";
const { Engine } = nodeUci;
const engine = new Engine("./bin/stockfish_14_linux_x64/stockfish_14_x64");

import { Chess } from "chess.js";
const chess = new Chess();

const log = {
    format: (level, msg) => (new Date().toISOString()) + " " + level + " STOCKFISH " + msg,
    info: (msg) => console.log(log.format("INFO ", msg)),
    error: (msg) => console.error(log.format("ERROR", msg))
};

const convertToSan = (fen, move) => {

    chess.load(fen);
    const result = chess.move({ from: move.substr(0, 2), to: move.substr(2) });

    if (result) {
        return result.san;
    }

    return null;
};

const next = fen => {
    log.info("Current position: " + fen);

    return engine
            .position(fen)
            .then(e => e.go({ depth: 8 }))
            .then(result => {
                const san = convertToSan(fen, result.bestmove);
                log.info("Move chosen: " + san);
                return { move: san, source: "stockfish" };
            });
};

engine
    .init()
    .then(e => e.setoption("Skill Level", 3))
    .then(e => e.setoption("MultiPV", 3))
    .then(e => e.isready())
    .then(result => {
        log.info("Stockfish engine: " + result.id.name + ", " +
                 [...result.options].filter(x => ["Skill Level"].includes(x[0]))
                                    .map(x => x.join(": "))
                                    .join(", "));
    });

export default { next };

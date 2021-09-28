import express from "express";
import book from "./opening-book.mjs";
const app = express();

const log = {
    format: (level, msg) => (new Date().toISOString()) + " " + level + " [" + process.env["HOSTNAME"] + "] " + msg,
    info: (msg) => console.log(log.format("INFO ", msg)),
    error: (msg) => console.error(log.format("ERROR", msg))
};

process.on("SIGINT", () => {
    log.info("Server received interrupt signal");
    process.exit();
});

// Serve static files from the "public" folder
app.use(express.static("public"));

// Indicate that a call to our bot has the wrong format (to avoid returning 404)
app.get("/bot", (req, res) => {
    res.sendStatus(400);
});

// Handle a valid call to our bot (passing a FEN)
app.get("/bot/:fen", (req, res) => {

    const decodedFen = decodeURI(req.params.fen.replace(/\|/g, "/"));
    res.send({ move: book.next(decodedFen) });
});

// Start the server
const start = port => {
    app.listen(port, () => {
        log.info("Server listening on port " + port);
    });
};

export default { start };

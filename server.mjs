import express from "express";

const log = {
    format: (level, msg) => (new Date().toISOString()) + " " + level + " [" + process.env["HOSTNAME"] + "] " + msg,
    info: (msg) => console.log(log.format("INFO ", msg)),
    error: (msg) => console.error(log.format("ERROR", msg))
};

process.on("SIGINT", () => {
    log.info("Server received interrupt signal");
    process.exit();
});

const port = 3000;
const server = `http://localhost:${port}`;
const app = express();

// Serve static files from the "public" folder
app.use(express.static("public"));

// Start the server
app.listen(port, () => {
    log.info("Server listening at " + server);
});

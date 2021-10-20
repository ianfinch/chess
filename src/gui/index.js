import board from "./board.js";

// Wait until the page is fully loaded before doing anything
window.addEventListener("load", () => {

    document.getElementById("vs-computer").addEventListener("click", () => {
        document.location = "vs-bot.html";
    });

    document.getElementById("openings").addEventListener("click", () => {
        document.location = "openings.html";
    });

    const chessboard = board.init();
});

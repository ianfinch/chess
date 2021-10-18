import board from "./board.js";
import arrows from "./arrows.js";

// Wait until the page is fully loaded before doing anything
window.addEventListener("load", () => {

    document.getElementById("vs-computer").addEventListener("click", () => {
        document.location = "vs-bot.html";
    });

    const chessboard = board.init();
    arrows.drawArrow("d2", "d4");
    arrows.drawArrow("c1", "f4");
});

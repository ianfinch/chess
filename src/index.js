import board from "./board.js";
import game from "./game.js";

/**
 * Wait until the page is fully loaded before doing anything
 */
window.addEventListener("load", () => board.init(game));

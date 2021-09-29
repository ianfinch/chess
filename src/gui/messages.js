/**
 * Action to close the modal dialogue
 */
const closeModal = () => {
    document.getElementById("modal").style.display = "none";
};

/**
 * Initialise button actions
 *
 * Walk down one level from the modal DIV, assuming that's where all the
 * dialogues will be, then look for buttons in that dialogue, and add an action
 */
const initButtons = () => {

    const dialogues = [...document.getElementById("modal").children].filter(elem => elem.tagName === "DIV");
    dialogues.forEach(dialogue => {

        const buttons = [...dialogue.children].filter(elem => elem.tagName === "BUTTON");
        buttons.forEach(button => {
            if (button.textContent === "Close") {
                button.addEventListener("click", closeModal);
            }
        });
    });
};

/**
 * Initialise all our messaging elements
 */
const init = () => {

    initButtons();
};

/**
 * Pop up the alert dialog
 */
const alert = (header, msg) => {

    [...document.getElementById("messages").children].forEach(elem => {

        if (elem.tagName === "H2") {
            elem.textContent = header;
        } else if (elem.tagName === "P") {
            elem.textContent = msg;
        }
    });

    document.getElementById("modal").style.display = "block";
};

export default {
    alert,
    init
};

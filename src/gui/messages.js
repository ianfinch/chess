// Use a promise to link modal close with its open
let pendingClose = null;

// Somewhere we can queue messages if they arrive while another message is displayed
const backlog = [];

/**
 * Generate a new promise to resolve later
 */
const generatePromise = () => {

    const result = {};

    result.promise = new Promise((resolve, reject) => {
        result.resolve = resolve;
        result.reject = reject;
    });

    return result;
};

/**
 * Action to close the modal dialogue
 */
const closeModal = () => {

    document.getElementById("modal").style.display = "none";

    const queuedAlert = backlog.pop();
    if (queuedAlert) {
        alert(queuedAlert.header, queuedAlert.msg);
    }

    if (pendingClose) {
        pendingClose.resolve(true);
        pendingClose = null;
    }
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

    const modal = document.getElementById("modal");
    if (modal.style.display === "block") {
        backlog.push ({ header, msg });
        return;
    }

    [...document.getElementById("messages").children].forEach(elem => {

        if (elem.tagName === "H2") {
            elem.textContent = header;
        } else if (elem.tagName === "P") {
            elem.textContent = msg;
        }
    });

    modal.style.display = "block";

    pendingClose = generatePromise();
    return pendingClose.promise;
};

export default {
    alert,
    init
};

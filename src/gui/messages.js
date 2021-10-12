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
const closeModal = ev => {

    document.getElementById("modal").style.display = "none";

    const queuedAlert = backlog.pop();
    if (queuedAlert) {
        alert(queuedAlert.header, queuedAlert.msg);
    }

    if (pendingClose) {
        pendingClose.resolve(ev.target.textContent);
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
            if (button.id === "close") {
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
        } else if (elem.tagName === "BUTTON") {
            elem.textContent = "Close";
        }
    });

    modal.style.display = "block";

    pendingClose = generatePromise();
    return pendingClose.promise;
};

/**
 * Create an options button
 */
const optionButton = legend => {

    const button = document.createElement("button");
    button.textContent = legend;
    button.classList.add("option");
    button.addEventListener("click", closeModal);
    return button;
};

/**
 * Let the user choose from multiple options
 */
const options = (header, options) => {

    const modal = document.getElementById("modal");
    if (modal.style.display === "block") {
        backlog.push ({ header, msg });
        return;
    }

    [...document.getElementById("messages").children].forEach(elem => {

        if (elem.tagName === "H2") {
            elem.textContent = header;
        } else if (elem.tagName === "P") {
            elem.textContent = "";
            options.forEach(option => {
                elem.appendChild(optionButton(option));
            });
        } else if (elem.tagName === "BUTTON") {
            elem.textContent = "Cancel";
        }
    });

    modal.style.display = "block";

    pendingClose = generatePromise();
    return pendingClose.promise;
};

export default {
    alert,
    init,
    options
};

/**
 * Request an API token to be able to start interacting with a bot
 */
const requestApiToken = () => {

    return fetch(location.origin + "/join")
            .then(response => response.json())
            .catch(() => null);
};

/**
 * Make an API call to the backend bot to get the next move
 */
const requestNextMoveFromBot = (token, fen) => {

    // Our FEN needs to be URI encoded
    const protectedFen = encodeURI(fen).replace(/\//g, "|");

    // Now make the API call
    return fetch(location.origin + "/bot/" + token + "/" + protectedFen)
            .then(response => response.json())
            .catch(() => null);
};

/**
 * Make a move, based on the current position
 */
const makeMove = token => {

    return fen => {
        return requestNextMoveFromBot(token, fen);
    };
};

/**
 * Select an opponent to play
 *
 * The opponent will be passed in as a promise
 */
const selectOpponent = token => {

    return opponent => {

        return fetch(location.origin + "/opponent/" + token + "/" + opponent)
                .then(response => response.json())
                .catch(() => null);
    };
};

/**
 * Initialise so we can start making calls to the bot APIs
 *
 * This gets a new API token, then returns an object with the move function in
 * it, which can be called when a move is needed from the bot
 */
const init = () => {

    return requestApiToken()
            .then(tokenDetails => ({
                move: makeMove(tokenDetails.token),
                getOpponents: () => tokenDetails.opponents,
                selectOpponent: selectOpponent(tokenDetails.token)
            }));
};

export default {
    init
};

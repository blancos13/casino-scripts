import Vue from 'vue';

const eventBus = new Vue()

eventBus.$games = {}

eventBus.$addGame = (game, update, finish) => {
    eventBus.$games[game] = {
        update,
        finish
    }
}

export { eventBus }

const io = require('socket.io-client');
import { eventBus } from './eventBus';
import { getCookie } from '../utils/getCookie'
import { BALANCE, CHAT, BONUSES, BET, DICE, ROULETTE, CRASH, JACKPOT, BATTLE } from '../constants/socket'

let socket = null

const connect = () => {
    if (socket) {
        socket.close()
    }

    const query = {};
    const token = getCookie('token')
    let path = '/socket.io';

    if (token) {
        query.token = token
    }

    socket = io('http://localhost:3000/', {
        path,
        query,
        transports: ['websocket'],
    });

    Object.keys({
        ...BALANCE,
        ...CHAT,
        ...BONUSES,
        ...BET,
        ...DICE,
        ...ROULETTE,
        ...CRASH,
        ...JACKPOT,
        ...BATTLE,
        FINISH_GAME: 'FINISH_GAME'
    }).forEach(eventType => {
        socket.on(eventType, (data) => {
            eventBus.$emit(eventType, data)
        })
    })
}

export default connect

eventBus.$on('FINISH_GAME', game => {
    const { name, ...data } = game;
    if (eventBus.$games[name]) {
        eventBus.$games[name].finish(data);
    }
})

eventBus.$on('PLAY_GAME', game => { socket.emit('PLAY_GAME', game) })
// -- Roulette
eventBus.$on(ROULETTE.SEND_TEAM_GAME_BET, bet => { socket.emit(ROULETTE.TEAM_GAME_BET, bet) })
// -- Roulette

// -- JACKPOT
eventBus.$on(JACKPOT.SEND_JACKPOT_GAME_BET, bet => { socket.emit(JACKPOT.JACKPOT_GAME_BET, bet) })
// -- JACKPOT

// -- BATTLE
eventBus.$on(BATTLE.SEND_BATTLE_GAME_BET, bet => { socket.emit(BATTLE.BATTLE_GAME_BET, bet) })
// -- BATTLE

// -- Crash
eventBus.$on(CRASH.SEND_CRASH_GAME_BET, bet => { socket.emit(CRASH.CRASH_GAME_BET, bet) })
// -- Crash

// --- Dice
eventBus.$on(DICE.SEND_DICE_BET, bet => socket.emit(DICE.SEND_DICE_BET, bet))
// --- Dice

//   eventBus.$on(EVENT_TYPES.MINES_OPEN_CELL_SEND, data => socket.emit(EVENT_TYPES.MINES_OPEN_CELL_SEND, data))

//   eventBus.$on(EVENT_TYPES.TOKEN_REFRESHED, () => reconnect())
// }

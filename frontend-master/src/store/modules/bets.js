const state = () => ({
  types: {
    0: { name: 'Roulette', image: '/images/icons/roulette.png' },
    1: { name: 'Jackpot', image: '/images/icons/jackpot.png' },
    2: { name: 'Battle', image: '/images/icons/battle.png' },
    3: { name: 'Crash', image: '/images/icons/crash.png' },
    4: { name: 'Mines', image: '/images/icons/mine-gray.png' },  
    5: { name: 'Dice', image: '/images/icons/dice.png' },
    6: { name: 'Hilo', image: '/images/icons/hilo.png' }
  },
  bets: [],
  self: [],
})

const mutations = {
  set(state, {payload, self}) {
    if (!payload) {
      return
    }

    const data = JSON.parse(payload)

    if (self) {
      state.self = [ ...data ]
    } else {
      state.bets = [ ...data ]
    }
  }
}

const actions = {
  set({ commit }, payload) {
    commit('set', payload)
  }
}

const getters = {
  all() {
    return this.bets.slice(0, 100)
  },
  roulette(state) {
    return state.bets.filter(item => item.game === 0).slice(0, 10)
  },
  jackpot(state) {
    return state.bets.filter(item => item.game === 1).slice(0, 10)
  },
  battle(state) {
    return state.bets.filter(item => item.game === 2).slice(0, 10)
  },
  crash(state) {
    return state.bets.filter(item => item.game === 3).slice(0, 10)
  },
  mines(state) {
    return state.bets.filter(item => item.game === 4).slice(0, 10)
  },
  dice(state) {
    return state.bets.filter(item => item.game === 5).slice(0, 10)
  },
  hilo(state) {
    return state.bets.filter(item => item.game === 6).slice(0, 10)
  },

  self_roulette(state) {
    return state.self.filter(item => item.game === 0).slice(0, 10)
  },
  self_jackpot(state) {
    return state.self.filter(item => item.game === 1).slice(0, 10)
  },
  self_battle(state) {
    return state.self.filter(item => item.game === 2).slice(0, 10)
  },
  self_crash(state) {
    return state.self.filter(item => item.game === 3).slice(0, 10)
  },
  self_mines(state) {
    return state.self.filter(item => item.game === 4).slice(0, 10)
  },
  self_dice(state) {
    return state.self.filter(item => item.game === 5).slice(0, 10)
  },
  self_hilo(state) {
    return state.self.filter(item => item.game === 6).slice(0, 10)
  },
}

export default {
  state,
  actions,
  mutations,
  namespaced: true,
  getters
}
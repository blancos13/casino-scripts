import cookie from 'vue-cookie'

const state = () => ({
  selectedDiamonds: 0
})

const mutations = {
  init(state) {
    const data = cookie.get('selectedDiamonds') || 0
    state.selectedDiamonds = +data
  },
  setDiamonds(state, {count}) {
    if (+count === 0) {
      state.selectedDiamonds = 0
      cookie.set('selectedDiamonds', 0)
    } else {
      state.selectedDiamonds += count

      cookie.set('selectedDiamonds', state.selectedDiamonds)
    }
  }
} 

const actions = {
  setDiamonds({ commit }, { count }) {
    commit('setDiamonds', { count })
  }
}

const getters = {

}

export default {
  state,
  mutations,
  actions,
  namespaced: true,
  getters
}
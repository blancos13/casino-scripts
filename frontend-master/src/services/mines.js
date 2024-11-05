export default axios => resource => ({
    getStat() {
      return axios.get(`${resource}`)
    },
    mines(wager, bombs) {
      return axios.get(`${resource}/${wager}/${bombs}`)
    },
    minesTake(id) {
      return axios.get(`${resource}/take/${id}`)
    },
    minesMine(id, mineId) {
      return axios.get(`${resource}/mine/${id}/${mineId}`)
    },
    minesMultiplier(bombs) {
      return axios.get(`${resource}/mul/${bombs}`)
    }
})
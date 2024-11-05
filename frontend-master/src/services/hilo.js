export default axios => resource => ({
  getStats() {
    return axios.get(`${resource}/stats`)
  },
  take(id) {
    return axios.get(`${resource}/take/${id}`)
  },
  game(wager, starting) {
    return axios.get(`${resource}/${wager}/${starting}`)
  },
  flip(id, type) {
    return axios.get(`${resource}/flip/${id}/${type}`)
  }
})
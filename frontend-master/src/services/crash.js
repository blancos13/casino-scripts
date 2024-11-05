export default axios => resource => ({
  getStats() {
    return axios.get(`${resource}/stats`)
  },
  getGame() {
    return axios.get(`${resource}/current`)
  },
  crash(wager) {
    return axios.get(`${resource}/${wager}`)
  },
  tick(id) {
    return axios.get(`${resource}/tick/${id}`)
  },
  take(id) {
    return axios.get(`${resource}/take/${id}`)
  }
})
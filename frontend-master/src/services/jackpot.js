export default axios => resource => ({
  getStats() {
    return axios.get(`${resource}/stats`)
  },
  getGame() {
    return axios.get(`${resource}/current`)
  }
})
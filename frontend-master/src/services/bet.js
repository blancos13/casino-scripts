export default axios => resource => ({
  getStats() {
    return axios.get(`${resource}/stats`)
  },
  getAll() {
    return axios.get(`${resource}?count=20`)
  },
  getSelf() {
    return axios.get(`${resource}/my`)
  }
})
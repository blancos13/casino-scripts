export default axios => resource => ({
  set({ id, reason }) {
    return axios.post(`${resource}`, { id, reason })
  }
})
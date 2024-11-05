export default axios => resource => ({
  update(payload) {
    return axios.put(`${resource}`, { ...payload })
  }
})
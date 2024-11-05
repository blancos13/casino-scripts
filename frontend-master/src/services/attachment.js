export default axios => resource => ({
    get(id) {
        return axios.get(`${resource}/${id}`)
    },
    set(payload) {
        return axios.post(`${resource}`, payload)
    }
  })
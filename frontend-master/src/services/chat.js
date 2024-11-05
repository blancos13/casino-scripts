export default axios => resource => ({
	get() {
		return axios.get(`${resource}`)
	},
	create(content) {
		return axios.post(`${resource}`, { content })
	},
	delete(id) {
		return axios.delete(`${resource}/${id}`)
	}
})

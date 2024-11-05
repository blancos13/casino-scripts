export default axios => resource => ({
	updateUser(payload) {
		return axios.put(`${resource}`, payload);
	}
})

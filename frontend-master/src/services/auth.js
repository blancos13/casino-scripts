export default axios => resource => ({
	getVkUrl() {
		return axios.get(`${resource}/vk/url`)
	},
	authVk({ code }) {
		return axios.post(`${resource}/vk/sign?code=${code}`)
	},
	signIn({ loginOrEmail, password }) {
		return axios.post(`${resource}/signIn`, { loginOrEmail, password })
	},
	signUp(payload) { // login, email, password
		return axios.post(`${resource}/signUp`, { ...payload })
	},
	checkAuth() {
		return axios.get(`${resource}/check-token`)
	},
	confirmEmail({ id, hash }) {
		return axios.get(`${resource}/confirm-email?id=${id}&hash=${hash}`)
	},
	recovery(email) {
		return axios.put(`${resource}?email=${email}`)
	},
	logout() {
		return axios.get(`${resource}/logout`)
	}
})

export default {
	setItem (name, data) {
		if (data) {
			localStorage.setItem(name, JSON.stringify(data))
		} else {
			console.warn('Data is clear')
		}
	},
	getItem (name) {
		if (name && localStorage.getItem(name) !== 'undefined') {
			return JSON.parse(localStorage.getItem(name))
		} else {
			return null
		}
	},
	rmItem (name) {
		localStorage.removeItem(name)
	},
	clearAll () {
		localStorage.clear()
	}
}

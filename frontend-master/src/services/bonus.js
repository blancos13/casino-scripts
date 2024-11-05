export default axios => resource => ({
    activate(name) {
      return axios.get(`${resource}/activate/one-time?name=${name}`)
    },
    getCountChest() {
      return axios.get(`${resource}/chest`)
    },
    takeChest() {
      return axios.post(`${resource}/chest`)
    },
    getSelectedDiamonds() {
      return axios.get(`${resource}/diamonds`)
    },
    getQuests() {
      return axios.get(`${resource}/quests`)
    },
    takeBonus(id) {
      return axios.post(`${resource}/quests`, { id })
    },
})
export default axios => resource => ({
  getMainPage() {
    return axios.get(`${resource}/main-page`)
  },
  getGames() {
    return axios.get(`${resource}/games`)
  },
  getFaq() {
    return axios.get(`${resource}/faq`)
  },
  getAgreement() {
    return axios.get(`${resource}/agreement`)
  },
  getDiceSettings() {
    return axios.get(`${resource}/dice`)
  },
  getMinesSettings() {
    return axios.get(`${resource}/mines`)
  },
  getRouletteSettings() {
    return axios.get(`${resource}/roulette`)
  },
  getCrashSettings() {
    return axios.get(`${resource}/crash`)
  },
  getBattleSettings() {
    return axios.get(`${resource}/battle`)
  },
  getHiloSettings() {
    return axios.get(`${resource}/hilo`)
  },
  getJackpotSettings() {
    return axios.get(`${resource}/jackpot`)
  },
})
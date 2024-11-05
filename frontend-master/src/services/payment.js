export default axios => resource => ({
  getHistory() {
    return axios.get(`${resource}/history/withdraw`)
  },
  getIncomeHistory() {
    return axios.get(`${resource}/history/income`)
  },
  getPaymentPageSettings() {
    return axios.get(`${resource}/page/settings`)
  },
  getPaymentForm(sum, direction, params) {
    return axios.post(`${resource}/url`, { sum, direction, params })
  },
  requestWithdraw (sum, direction, params, verificationUUID) {
    return axios.post(`${resource}/withdraw`, { sum, direction, params, verificationUUID })
  }
})
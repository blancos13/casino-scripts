module.exports = {
  devServer: {
    proxy: {
      '/websocket/': {
        target: process.env.VUE_APP_BASE_URL_API,
        pathRewrite: { '^/websocket': '' }
      }
    }
  }
}
import Vue from 'vue'

export default function ({ $axios, redirect, app }) {
  $axios.onError(error => {
    console.log(error)
    if(error.response.status === 401 || error.response.status === 403) {
      redirect('/login')
    }
    if(error.response.status === 400) {
      const dataMessage = error.response.data.message;
      const message = Array.isArray(dataMessage) ? dataMessage.join(', ') : dataMessage;
      console.log(error.response)

      new Vue().$bvToast.toast(message, {
        title: 'Ошибка',
        variant: 'danger',
        solid: true
      });
    }
  })

  $axios.onRequest(config => {
    config.headers.authorization = app.$cookies.get('token')
    return config
  })
}

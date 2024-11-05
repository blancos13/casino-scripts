import Vue from 'vue'
import VueCookie from 'vue-cookie'
import Vuelidate from 'vuelidate';
import Toasted from 'vue-toasted';
import Meta from 'vue-meta'
import App from './App.vue'
import router from './router'
import store from './store/index.js'
import { current_language } from './plugins/i18n'
import localStorage from './plugins/localStorage'
import { eventBus } from './plugins/eventBus'
import { BALANCE, BET } from './constants/socket'
import { api } from './plugins/api'
import i18n from './plugins/i18n'
import socket from './plugins/sockets'
import lazy from './directives/lazy'
import './plugins/toasted'
import Notifications from 'vue-notification'
Vue.use(Notifications)
Vue.config.productionTip = false
Vue.prototype.$api = api
store.$api = api
Vue.prototype.$bus = eventBus
Vue.prototype.$storage = localStorage
Vue.use(VueCookie)
Vue.use(Vuelidate)
Vue.use(Toasted)
Vue.use(Meta)

if (document) {
  document.addEventListener('DOMContentLoaded', () => {
    socket();
  })
}

Vue.directive('lazy', lazy);
new Vue({
  data() {
    return {
      current_language
    }
  },
  metaInfo() {
    return {
      link: [
        { rel: "stylesheet", href: "https://pro.fontawesome.com/releases/v5.10.0/css/all.css", integrity: "sha384-AYmEC3Yw5cVb3ZcuHtOA93w35dYTsvhLPVnYs9eStHfGJvOvKxVfELGroGkvsg+p", crossorigin: "anonymous" }
      ]
    }
  },
  async created () {
    const user = this.$cookie.get('user');
    const token = this.$cookie.get('token');

    if ((user && user !== 'undefined') && (token && token !== 'undefined')) {
      this.$store.commit('initAuth', { user, token })
    }

    const query = this.$route.query

    if (this.$route.name === 'HomeVK' && query.code) {
      await this.$store.dispatch('authVK', query.code)

      this.$router.push({ name: 'Home' })
    }

    if (this.$route.name === 'ConfirmEmail' && query.hash && query.id) {
      const result = await this.$api.auth.confirmEmail({ id: query.id, hash: query.hash })

      if (result.error) {
        this.$notify({
          group: 'foo',
          title: 'Error',
          type: 'error',
          text: this.$t('error_email_confirmation')
        })
      } else {
        this.$notify({
          group: 'foo',
          title: 'Message',
          text: this.$t('success_email_confirmation')
        })
      }

      this.$router.push({ name: 'Home' })
    }

    await this.$store.dispatch('init')
  },
  mounted() {
    this.$bus.$on(BALANCE.NEW_DEMO_BALANCE, (payload) => {
      this.$store.commit('changeBalance', { balance: +JSON.parse(payload).newBalance, isDemo: true })
    })

    this.$bus.$on(BALANCE.NEW_BALANCE, (payload) => {
      this.$store.commit('changeBalance', { balance: +JSON.parse(payload).newBalance })
    })

    this.$bus.$on(BET.BET_HISTORY_ANSWER, payload => this.$store.commit('bets/set', {payload}))
    this.$bus.$on(BET.MY_BET_HISTORY_ANSWER, payload => this.$store.commit('bets/set', {payload, self: true}))
  },
  methods: {
    changeLanguage(lang) {
      if (this.$i18n.locale !== lang) {
        this.$i18n.locale = lang;
        this.current_language = lang;
        this.$cookie.set('lang', lang);
        this.$store.commit('changeLanguage', { lang })
      }
    },
  },
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')

export {
  Vue
}

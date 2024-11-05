import Vue from 'vue';
import Vuex from 'vuex';
import cookie from 'vue-cookie';
import { httpInstance } from '../plugins/api'
import { getHeaderAuth } from '../utils/getHeaderAuth';
import bonus from './modules/bonus'
import bets from './modules/bets'

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        token: null,
        user: {},
        games: [],
        lang: 'ru'
    },
    getters: {
        isAuth: store => !!store.token
    },
    mutations: {
        initial(state, { games }) {
            state.games = [ ...games ]
            state.lang = cookie.get('lang')

            if (!state.lang) {
                state.lang = 'ru'
                cookie.set('lang', 'ru')
            }
        },
        initAuth(state, { user, token }) {
            state.user = {
                ...JSON.parse(user)
            }
            state.token = token
        },
        changeBalance(state, { balance, isDemo }) {
            const data = isDemo ? { demoBalance: balance } : { balance }

            state.user = {
                ...state.user,
                ...data
            }

            cookie.set('user', JSON.stringify(state.user))
        },
        changeLanguage(state, { lang }) {
            state.lang = lang
        },
        auth(state, { user, token }) {
            const strToken = getHeaderAuth(token)

            cookie.set('user', JSON.stringify(user))
            cookie.set('token', strToken)

            httpInstance.defaults.headers.authorization = strToken

            state.user = { ...user }
            state.token = strToken
        },
        updateUser(state, payload) {
            const keys = Object.keys(payload)

            if (keys.length > 1) {
                return
            }

            state.user[keys[0]] = payload[keys[0]]
            cookie.set('user', JSON.stringify(state.user))
        },
        logout (state) {
            cookie.delete('user')
            cookie.delete('token')

            delete httpInstance.defaults.headers.authorization

            state.user = {}
            state.token = null

            return true
        }
    },
    actions: {
        async authVK({ commit }, code) {
            const result = await this.$api.auth.authVk({ code });

            if (result.error || !result) {
                return false;
            }

            commit('auth', result)
        },
        async auth({ commit }, payload) {
            const result = await this.$api.auth.signIn({ ...payload });

            if (result.error || !result) {
                return false;
            }

            commit('auth', result)
        },
        async logout ({ commit }) {
            const result = await this.$api.auth.logout()

            if (result.error || !result) {
                return false;
            }

            commit('logout')
        },
        async init({ commit, dispatch, getters }) {
            const games = await this.$api.admin.getGames()
            const selectedDiamonds = await this.$api.bonus.getSelectedDiamonds()

            const bets = await this.$api.bet.getAll()

            if (bets && bets.length) {
                dispatch('bets/set', { payload: JSON.stringify(bets) })
            }

            if (getters.isAuth) {
                const selfBets = await this.$api.bet.getSelf()

                if (selfBets && selfBets.length) {
                    dispatch('bets/set', { payload: JSON.stringify(selfBets), self: true })
                }
            }

            if (selectedDiamonds !== null && !selectedDiamonds.error) {
                dispatch('bonus/setDiamonds', { count: selectedDiamonds })
            }

            if (games && !games.error) {
                commit('initial', { games })
            }
        }
    },
    modules: { bonus, bets }
});

export default store;

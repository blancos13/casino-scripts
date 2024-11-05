import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Mine from '../views/Mine';
import Battle from '../views/Battle';
import Hilo from '../views/Hilo';
import Dice from '../views/Dice';
import OneVsOne from '../views/OneVsOne';
import Crash from '../views/Crash.vue';
import Roulette from '../views/Roulette.vue';
import Profile from '../views/Profile.vue';
import Faq from '../views/Faq.vue';
import Feedback from '../views/Feedback.vue';
import Agreement from '../views/Agreement.vue';
Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/auth/vk',
        name: 'HomeVK',
        component: Home
    },
    {
        path: '/auth/confirm-email',
        name: 'ConfirmEmail',
        component: Home
    },
    {
        path: "/mine",
        name: "Mine",
        component: Mine
    },
    {
        path: "/battle",
        name: "Battle",
        component: Battle,
    },
    {
        path: "/hilo",
        name: "Hilo",
        component: Hilo,
    },
    {
        path: "/dice",
        name: "Dice",
        component: Dice,
    },
    {
        path: "/jackpot",
        name: "Jackpot",
        component: OneVsOne,
    },
    {
        path: "/crash",
        name: "Crash",
        component: Crash
    },
    {
        path: "/roulette",
        name: "Roulette",
        component: Roulette
    },
    {
        path: "/profile",
        name: "Profile",
        component: Profile,
    },
    {
        path: "/faq",
        name: "Faq",
        component: Faq
    },
    {
        path: "/feedback",
        name: "Feedback",
        component: Feedback
    },
    {
        path: "/agreement",
        name: "Agreement",
        component: Agreement
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router

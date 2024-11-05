<template>
    <div class="left-menu">
        <router-link to="/" class="logo">
            <img src="/images/logo.png" alt="">
        </router-link>

        <nav v-if="games.length">
            <router-link v-for="itm in games" :key="itm" :to="`/${itm}`">
                <img
                    :src="$route.name === capitalize(itm)
                            ? `/images/icons/${itm}-active.png`
                            : `/images/icons/${itm}.png`"
                    :alt="itm">
                <span :class="{'active': $route.name === capitalize(itm)}">{{ capitalize(itm) }}</span>
            </router-link>
        </nav>
    </div>
</template>

<script>
import { capitalize } from '../utils/capitalize'

export default {
    computed: {
        games() {
            return this.$store.state.games
        }
    },
    methods: {
        capitalize(string) {
            return capitalize(string)
        }
    }
}
</script>

<style scoped lang="scss">
    .left-menu {
        background: #202126;
        height: 100vh;
        padding: 28px 0;

        .logo {
            img {
                width: 55px;
                margin: 0 auto;
                display: block;
            }

            margin-bottom: 45px;
            text-align: center;
            display: block;
        }

        nav {
            width: 100%;

            overflow-y: auto;

            -ms-overflow-style: none;
            scrollbar-width: none;

            &::-webkit-scrollbar {
                display: none;
            }

            a {
                margin-bottom: 38px;
                text-decoration: none;
                display: flex;
                justify-content: center;
                flex-wrap: wrap;

                img {
                    max-width: 30px;
                    margin-bottom: 8px;
                }

                span {
                    text-align: center;
                    color: #404148;
                    display: block;
                    width: 100%;
                    font-size: 12px;
                    &.active {
                        color: #fff;
                    }
                }


                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }

</style>

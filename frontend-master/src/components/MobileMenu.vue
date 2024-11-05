<template>
    <transition name="fade">
        <div class="mobile-menu-wrapper" ref="wrapper" v-show="openMobileMenu">
            <div class="backdrop"></div>
            <div class="mobile-menu" ref="mobile_menu">
                <div v-if="isAuth">
                    <router-link to="/profile" class="user-info">
                        <img v-lazy="{ id: user.photoUrl, default: '/images/harley-test.png' }" alt="">
                        <div class="user-text">
                            <div class="username">{{ user.username }}</div>
                            <div class="balance">
                                <img src="/images/icons/coin.png" alt="">
                            <span>{{ user.balance && user.balance.toLocaleString() }} P</span>
                            </div>
                            <div class="btn-logout">
                                <a href="/" @click.prevent="logout"><img src="/images/icons/exit.png" alt="">Выход</a>
                            </div>
                        </div>
                    </router-link>
                </div>
                <div v-else class="btn">
                    <button class="btn btn-login" @click="$root.$emit('openLogin')">{{ $t('header.login') }}</button>
                    <button class="btn btn-reg" @click="$root.$emit('openRegister')">{{ $t('header.register') }}</button>
                </div>
                <nav>
                    <router-link to="/">
                        <img src="/images/icons/home-gray.png" alt="">
                        <span>{{ $t('header.home') }}</span>
                    </router-link>
                    <router-link to="/agreement">
                        <img src="/images/icons/rules.png" alt="">
                        <span>{{ $t('header.rules') }}</span>
                    </router-link>
                    <router-link to="/faq">
                        <img src="/images/icons/faq.png" alt="">
                        <span>FAQ</span>
                    </router-link>
                </nav>
                <div class="game-list">
                    <div>
                        <router-link to="/roulette">
                            <img src="/images/icons/roulette-active.png" v-show="$route.name === 'Roulette'" alt="">
                            <img src="/images/icons/roulette.png" v-show="$route.name !== 'Roulette'" alt="">
                            <span>Roulette</span>
                        </router-link>
                        <router-link to="/crash">
                            <img src="/images/icons/crash-active.png" v-show="$route.name === 'Crash'" alt="">
                            <img src="/images/icons/crash.png" v-show="$route.name !== 'Crash'" alt="">
                            <span>Crash</span>
                        </router-link>
                    </div>
                    <div>
                        <router-link to="/battle">
                            <img src="/images/icons/battle-active.png" v-show="$route.name === 'Battle'" alt="">
                            <img src="/images/icons/battle.png" v-show="$route.name !== 'Battle'" alt="">
                            <span>Battle</span>
                        </router-link>
                        <router-link to="/dice">
                            <img src="/images/icons/dice-active.png" v-show="$route.name === 'Dice'" alt="">
                            <img src="/images/icons/dice.png" v-show="$route.name !== 'Dice'" alt="">
                            <span :class="{'active': $route.name === 'Dice'}">Dice</span>
                        </router-link>
                    </div>
                    <div>
                        <router-link to="/1-vs-1">
                            <img src="/images/icons/jackpot-active.png" v-show="$route.name === '1VS1'" alt="">
                            <img src="/images/icons/jackpot.png" v-show="$route.name !== '1VS1'" alt="">
                            <span>Jackpot</span>
                        </router-link>
                        <router-link to="/mine">
                            <img src="/images/icons/mine-active.png" v-show="$route.name === 'Mine'" alt="">
                            <img src="/images/icons/mine.png" v-show="$route.name !== 'Mine'" alt="">
                            <span :class="{'active': $route.name === 'Mine'}">Mine</span>
                        </router-link>
                    </div>
                    <div>
                        <router-link to="/hilo">
                            <img src="/images/icons/hilo-active.png" v-show="$route.name === 'Hilo'" alt="">
                            <img src="/images/icons/hilo.png" v-show="$route.name !== 'Hilo'" alt="">
                            <span :class="{'active': $route.name === 'Hilo'}">Hilo</span>
                        </router-link>
                    </div>
                </div>

                <a class="language-switcher" @click.stop="openLanguageSwitcher = !openLanguageSwitcher">
                    <img v-if="$root.current_language === 'ru'" src="/images/icons/russian.png" alt="">
                    <img v-if="$root.current_language === 'en'" src="/images/icons/en.png" alt="">
                    <span>{{ $root.current_language }}</span>
                    <img src="/images/icons/down-arrow.png" :style="{'transform': (openLanguageSwitcher ? 'rotate(180deg)' : '')}" alt="">
                    <span class="languages" v-show="openLanguageSwitcher">
                        <span class="lang" v-if="$root.current_language !== 'en'" @click="$root.changeLanguage('en')">
                            <img src="/images/icons/en.png" alt="">
                            <span>EN</span>
                        </span>
                        <span class="lang" v-if="$root.current_language !== 'ru'" @click="$root.changeLanguage('ru')">
                            <img src="/images/icons/russian.png" alt="">
                            <span>RU</span>
                        </span>
                    </span>
                </a>
            </div>
        </div>
    </transition>
</template>
<script>
    export default {
        props: ['openMobileMenu'],
        data() {
            return {
                openLanguageSwitcher: false,
            }
        },
        mounted() {
            let specifiedElement = this.$refs['mobile_menu'];
            this.$refs['wrapper'].addEventListener('click', (event) => {
                let isClickInside = specifiedElement.contains(event.target);

                if (!isClickInside && this.openMobileMenu) {
                    this.$emit('close');
                }
            });
        },
        watch: {
            '$route': function () {
                this.$emit('close');
            }
        },
        methods: {
            reload() {
                if (window) {
                    window.location.reload()
                }
            },
            logout() {
                this.$store.dispatch('logout');
                
                setTimeout(() => {
                    this.reload()
                }, 500)
            }
        },
        computed: {
            isAuth () {
                return this.$store.getters.isAuth;
            },
            user() {
                return this.$store.state.user
            },
        }
    }
</script>
<style scoped lang="scss">
    .mobile-menu-wrapper {
        z-index: 9999;
        position: relative;
    }

    .backdrop {
        background: rgba(0, 0, 0, 0.3);
        z-index: 999;
        width: 100%;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .mobile-menu {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        padding: 23px 14px;
        width: 190px;
        background: #1a1b21;
        z-index: 999;
        box-shadow: 15px 0px 34px 15px rgba(0, 0, 0, 0.4);
        overflow-y: auto;

        .user-info {
            text-decoration: none;
            text-align: center;
            padding-bottom: 30px;
            margin-bottom: 20px;
            padding-left: 10px;
            border-bottom: 1px solid rgba(255,255,255, 0.1);
            display: flex;

            align-items: center;
            .user-text {
                .balance {
                    display: flex;
                    align-items: center;
                    img {
                        margin-right: 7px;
                    }
                }
                .btn-logout{
                    margin-top: 10px;
                }
            }

            > img {
                width: 45px;
                display: block;
                margin-right: 10px;
            }

            .username {
                font-weight: bold;
                color: #e6e8f5;
                text-decoration: none;
                font-size: 14px;
                margin-bottom: 5px;
                text-align: left;
            }
        }

        .btn {
            
            border-bottom: 1px solid rgba(255,255,255, 0.1);
            margin-bottom: 15px;

            .btn-login {
                border-radius: 30px;
                outline: none;
                background: linear-gradient(90deg, #00ba76 0%, #00ba47 100%);
                padding: 5px 10px;
                cursor: pointer;
                border: none;
                margin-bottom: 10px;
                width: 100%;
            }

            .btn-reg {
                border-radius: 30px;
                outline: none;
                background: linear-gradient(90deg, #00ba76 0%, #00ba47 100%);
                padding: 5px 10px;
                cursor: pointer;
                border: none;
                margin-bottom: 20px;
                width: 100%;
            }
        }

        nav {
            width: 100%;
            padding-bottom: 25px;
            padding-left: 10px;
            border-bottom: 1px solid rgba(255,255,255, 0.1);
            a {
                text-decoration: none;
                display: flex;
                margin-bottom: 33px;
                align-items: center;
                &:last-child {
                    margin-bottom: 0;
                }
                img {
                    max-width: 16px;
                    margin-right: 10px;
                    min-width: 16px;
                }

                span {
                    text-align: center;
                    color: #6d707d;
                    display: block;
                    font-size: 14px;

                    &.active {
                        color: #fff;
                    }
                }


                &:last-child {
                    margin-bottom: 0;
                }
            }
        }

        .game-list {
            padding-top: 25px;
            border-bottom: 1px solid rgba(255,255,255, 0.1);
            > div {
                justify-content: space-between;
                display: flex;
                a {
                    text-align: center;
                    text-decoration: none;
                    display: block;
                    width: 50px;
                    text-align: center;
                    img {
                        max-width: 34px;
                        margin-bottom: 7px;
                    }
                    span {
                        font-size: 12px;
                        color: #6d707d;

                    }
                }

                margin-bottom: 40px;
                padding: 0 10px
            }
        }
        .language-switcher {
            display: flex;
            cursor: pointer;
            align-items: center;
            margin-top: 25px;
            padding: 0 10px;
            span {
                margin-right: 10px;
                color: #6d707d;
                margin-left: 10px;
                text-transform: capitalize;
            }

            position: relative;
            .languages {
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                margin-right: 0;
                .lang {
                    width: 100%;
                    margin-right: 0;
                    display: flex;
                    align-items: center;
                    margin-left: 0;
                    img {
                        margin-left: 0;
                        margin-right: 10px;
                        width: 20px;
                        border-radius: 5px;
                    }
                    span {
                        margin-left: 0;
                    }
                    padding: 10px 0;
                }

            }
            img:first-child {
                width: 20px;
            }
        }
    }
</style>

<template>
    <div class="header w-100">
        <header>
            <nav>
                <router-link to="/" href="">
                    <img src="/images/icons/home-i.png" v-if="$route.name === 'Home'" alt="">
                    <img src="/images/icons/home-gray.png" v-else alt="">
                    <span>{{ $t('header.home') }}</span>
                </router-link>
                <router-link to="/agreement">
                <img src="/images/icons/rules-i.png" v-if="$route.name === 'Agreement'" alt="">
                    <img src="/images/icons/rules.png" v-else alt="">
                    <span>{{ $t('header.rules') }}</span>
                </router-link>
                <router-link to="/faq">
                <img src="/images/icons/faq-i.png" v-if="$route.name === 'Faq'" alt="">
                    <img src="/images/icons/faq.png" v-else alt="">
                    <span>FAQ</span>
                </router-link>
                <a class="language-switcher" @click.stop="openLanguageSwitcher = !openLanguageSwitcher">
                    <img v-if="$root.current_language === 'ru'" src="/images/icons/russian.png" alt="">
                    <img v-if="$root.current_language === 'en'" src="/images/icons/en.png" alt="">
                    <span>{{ $root.current_language }}</span>
                    <img
                        src="/images/icons/down-arrow.png"
                        :style="{'transform': (openLanguageSwitcher ? 'rotate(180deg)' : '')}" alt="">
                    <span class="languages" v-show="openLanguageSwitcher">
                        <span class="lang" v-if="$root.current_language !== 'en'" @click="$root.changeLanguage('en'); reload()">
                            <img src="/images/icons/en.png" alt="">
                            <span>EN</span>
                        </span>
                        <span class="lang" v-if="$root.current_language !== 'ru'" @click="$root.changeLanguage('ru'); reload()">
                            <img src="/images/icons/russian.png" alt="">
                            <span>RU</span>
                        </span>
                    </span>
                </a>
            </nav>
            <div class="user-info">
                <div v-if="!isAuth" class="buttons">
                    <button class="btn btn-login" @click="$root.$emit('openLogin')">{{ $t('header.login') }}</button>
                    <button class="btn btn-register" @click="$root.$emit('openRegister')">{{ $t('header.register') }}</button>
                </div>
                <div v-else class="mini-profile" :style="{'border-bottom-left-radius': (openDopMenu ? '0' : '15px'), 'border-bottom-right-radius': (openDopMenu ? '0' : '15px')}">
                    <img :src="userPhoto" class="mini-profile-photo" alt="">
                    <div class="open-mini" v-show="openDopMenu">
                        <a @click="$root.$emit('openDeposit')"><img src="/images/icons/dp.png" style="transform: rotate(180deg)" alt="">Пополнить</a>
                        <a @click="$root.$emit('openWithdraw')"><img src="/images/icons/dp.png" alt="">Вывести</a>
                        <router-link to="/profile"><img src="/images/icons/set.png" alt="">Настройки</router-link>
                        <a href="/" @click.prevent="logout"><img src="/images/icons/exit.png" alt="">Выход</a>
                    </div>
                    <div class="info-mini"  @click="openDopMenu = !openDopMenu">
                        <img src="/images/icons/caret-down.png" :style="{'transform': (openDopMenu ? 'rotate(180deg)' : '') }" class="caret" alt="">
                        <div class="nickname">{{ user.username }}</div>
                        <div class="balance">
                            <img src="/images/icons/coin.png" alt="">
                            <span>{{ user.balance }} P</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        <div class="mobile-header">
            <mobile-menu :openMobileMenu="openMobileMenu" @close="openMobileMenu = false"></mobile-menu>

            <div class="mobile-header__burger" @click="openMobileMenu = !openMobileMenu">
                <img src="/images/icons/burger.png" alt="">
            </div>
            <router-link to="/" class="mobile-header__logo">
                <img src="/images/logo.png" alt="">
            </router-link>
            <div class="mobile-header__controls">
                <div class="controls__sound">
                    <img src="/images/icons/sound.png" alt="">
                </div>
                <div class="controls__chat" @click="$root.$emit('openChat')">
                    <img src="/images/icons/chat-icon.png" alt="">
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                openLanguageSwitcher: false,
                openMobileMenu: false,
                openDopMenu: false,
            }
        },
        watch: {
            '$route': function () {
                this.openDopMenu = false;
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
            user () {
                return this.$store.state.user
            },
            userPhoto () {
                return this.user.photoUrl || '/images/icons/gray-g.png'
            }
        },
        components: {
            'mobile-menu': () => import('../components/MobileMenu'),
        }
    }
</script>
<style lang="scss" scoped>
    header {
        padding: 20px 0px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        nav {
            display: flex;

            a {
                display: flex;
                align-items: center;
                text-decoration: none;

                img {
                    margin-right: 10px;
                }

                span {
                    font-size: 14px;
                    color: #6d6f7c;
                }

                margin-right: 38px;
            }

            .language-switcher {
                display: flex;
                cursor: pointer;
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
                        img {
                            margin-right: 10px;
                            width: 20px;
                            border-radius: 5px;
                        }
                        padding: 10px 0;
                    }
                }
                span {
                    margin-right: 10px;
                    text-transform: capitalize;
                }
                img:first-child {
                    width: 20px;
                }
            }
        }

        .buttons {
            border-radius: 25px;
            background: #18191d;
            display: flex;
            padding: 7px;

            button {
                border-radius: 25px;
                cursor: pointer;

                &.btn-login {
                    background: #272931;
                    margin-right: 5px;
                    padding: 0 55px;
                    color: #878997;
                }

                &.btn-register {
                    padding: 0 30px;
                    background: #00ba47;
                    color: #ffffff;
                }

                outline: none;
                border: none;
                height: 48px;
                display: flex;
                font-size: 14px;
                align-items: center;
                justify-content: center;
            }
        }
        .mini-profile {
            border-radius: 20px;
            background: #202126;
            z-index: 99;
            padding: 10px;
            position: relative;
            align-items: center;
            box-shadow: 0px 0px 13px 3px rgba(0, 0, 0, 0.2);

            display: flex;
            > img {
                width: 45px;
                border-radius: 100%;
                margin-right: 10px;
            }
            .open-mini {
                position: absolute;
                top: 100%;
                border-bottom-right-radius: 15px;
                border-bottom-left-radius: 15px;
                box-shadow: 0px 8px 13px 3px rgba(0, 0, 0, 0.5);
                padding: 15px 20px;
                background: #202126;
                > a {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    img {

                        margin-right: 7px;
                    }
                    width: 100%;
                    font-size: 14px;
                    color: #6d6f7c;
                    transition: 0.2s;
                    &:hover {
                        color: #d5d7dd;
                    }
                    margin-bottom: 10px;
                    text-decoration: none;
                }
                left: 0;
                width: 100%;
            }

            .info-mini {

                padding-right: 60px;

                .caret {
                    position: absolute;
                    right: 14px;
                    top: 48%;
                }
                cursor: pointer;
                .nickname {
                    font-weight: bold;
                    color: #fff;
                    font-size: 14px;
                    margin-bottom: 5px;
                    display: block;
                }
                .balance {
                    display: flex;
                    align-items: center;
                    img {
                        margin-right: 5px;
                    }
                    span {
                        font-size: 12px;
                        color: #a6a7a7;
                    }
                }
            }

            .mini-profile-photo {
                border: 4px solid rgba(43, 44, 49, 0.75);
                border: 3px solid #56575a;
            }
        }
    }

    .mobile-header {
        margin-left: -20px;
        margin-right: -20px;
        display: none;
        height: 80px;
        padding: 0 20px;
        background: #1a1b21;
        margin-bottom: 20px;
        align-items: center;

        .mobile-header__burger {
            display: flex;
            align-items: center;
            margin-right: 25px;
            cursor: pointer;

            img {
                width: 20px;
            }
        }

        .mobile-header__logo {
            img {
                height: 40px;
            }
        }

        .mobile-header__controls {
            display: flex;
            align-items: center;
            margin-left: auto;

            .controls__sound {
                cursor: pointer;
                margin-right: 18px;
            }

            .controls__chat {
                cursor: pointer;
            }
        }

    }

    @media screen and (max-width: 1280px) {
        header .buttons button.btn-login {
            background: #272931;
            margin-right: 5px;
            padding: 0 30px;
            color: #878997;
        }
        header .buttons button.btn-register {
            padding: 0 25px;
            background: #00ba47;
            color: #ffffff;
        }
    }

    @media screen and (max-width: 1180px) {
        header {
            padding: 37px 0px;
            padding-top: 20px;

            .buttons {
                width: 100%;
                padding: 7px 0;
                margin-bottom: 15px;

                button.btn-login {
                    width: 50%;
                }

                button.btn-register {
                    width: 50%;
                }
            }
        }
    }

    @media screen and (max-width: 992px) {
        header {
            display: none;
        }
        .mobile-header {
            display: flex;
        }
    }
</style>

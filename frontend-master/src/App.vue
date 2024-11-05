<template>
    <div id="app">
        <div id="content">
            <left-menu></left-menu>
            <div class="content">
                <header-top></header-top>
                <router-view></router-view>
                <footer-down></footer-down>
            </div>
            <chat></chat>
        </div>
        <transition name="slide-fade">
            <register v-show="registerModal" @close="registerModal = false"></register>
        </transition>

        <transition name="slide-fade">
            <login v-show="loginModal" @close="loginModal = false"></login>
        </transition>

        <transition name="slide-fade">
            <deposit v-if="showDepositModal" @close="showDepositModal = false"></deposit>
        </transition>

        <transition name="slide-fade">
            <withdraw v-if="showWithdrawModal" @close="showWithdrawModal = false"></withdraw>
        </transition>

        <notifications group="foo" position="bottom left" />
    </div>
</template>
<script>
    import LeftMenu from './components/LeftMenu';
    import Chat from './components/Chat';
    import Header from './components/Header';
    import Register from './components/modals/Register';
    import Login from './components/modals/Login';
    import Footer from './components/Footer';
    export default {
        data() {
            return {
                registerModal: false,
                loginModal: false,
                showDepositModal: false,
                showWithdrawModal: false,
            }
        },
        mounted() {
            this.$root.$on('openLogin', () => {
                this.loginModal = true;
            });
            this.$root.$on('openRegister', () => {
                this.registerModal = true;
            });
            this.$root.$on('openDeposit', () => {
                this.showDepositModal = true;
            });
            this.$root.$on('openWithdraw', () => {
                this.showWithdrawModal = true;
            });
            console.log(this.$route);

            if (this.$route.hash === '#success') {
                this.$notify({
                    group: 'foo',
                    title: 'Message',
                    text: 'Платеж успешно выполнен'
                })

            }
          if (this.$route.hash === '#fail') {
              this.$notify({
                  group: 'foo',
                  title: 'Error',
                  type: 'error',
                  text: 'Платеж не выполнен'
              })
          }
        },
        components: {
            'deposit': () => import('./components/modals/Deposit'),
            'withdraw': () => import('./components/modals/Withdraw'),
            'left-menu': LeftMenu,
            'chat': Chat,
            'header-top': Header,
            'register': Register,
            'login': Login,
            'footer-down': Footer,
        }
    }
</script>
<style>
    @import './styles/main.scss';

    #content {
        display: flex;
        width: 100%;
    }
    .left-menu {
        width: 112px;
        min-width: 112px;
        max-width: 112px;
        position: sticky;
        top: 0;
    }

    .content {
        position: relative;
        padding: 40px;
        min-width: 0;
        flex-grow: 1;
        padding-top: 0;
        padding-bottom: 0;
        background: url(/images/content-bg.png) #121419;
        background-size: contain;
        background-position: top center;
        background-repeat: no-repeat;
        max-width: 100%;
    }
    .content::-webkit-scrollbar {
        width: 0;
    }
    .footer {
        min-width: 0;
        flex-grow: 1;
        overflow: hidden;
        margin: 40px -40px 0px -40px;
    }

    .chat {
        width: 350px;
        min-width: 350px;
        max-width: 350px;
        position: sticky;
        top: 0;
        height: 100vh;
    }

    .chat.unset {
        height: auto;
    }


    @media screen and (max-width: 1600px) {
        .content {
            padding-right: 20px;
            padding-left: 20px;
            padding-bottom: 0;
        }
        .footer {
            margin: 40px -20px 0px -20px;
        }
    }


    @media screen and (max-width: 1440px) {
        .chat {
            min-width: 290px;
            width: 290px;
        }
    }


    @media screen and (max-width: 1300px) {
        .content {
            padding: 40px 20px;
            padding-top: 0;
            padding-bottom: 0;
        }
        .footer {
            margin: 40px -20px 0px -20px;
        }
    }

    @media screen and (max-width: 1280px) {
        .left-menu {
            width: 90px;
            min-width: 90px;
        }
    }

    @media screen and (max-width: 1040px) {
        .chat {
            position: fixed;
            right: 0;
            z-index: 9999;
        }
    }
    @media screen and (max-width: 992px) {
        .left-menu {
            display: none;
        }
        .content {
            padding: 0 15px;
        }
        .footer {
            margin: 40px -10px 0px -10px;
        }

      #app {
        width: 100vw;
        overflow-x: hidden;
      }

    }
</style>

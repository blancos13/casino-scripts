<template>
    <div class="footer w-100">
        <footer>
            <div class="footerImg">
                <a href="/"><img src="/images/logo.png" alt=""></a>
                <div class="footerImg-content">
                    <span>© 2020 Bellereve</span>
                    <span class="allRights">{{ $t('footer.copyright') }}</span>
                </div>
            </div>
            <div class="games">
                <div class="games-head">
                    <span>{{ $t('footer.games') }}</span>
                </div>
                <div class="games-list">
                    <div class="games-list--col1">
                        <nav v-if="games.length" class="games-list--col1">
                            <router-link v-for="itm in games.slice(0, 4)" :key="itm" :to="`/${itm}`">
                                <span :class="{'active': $route.name === capitalize(itm)}">{{ capitalize(itm) }}</span>
                            </router-link>
                        </nav>
                    </div>
                    <div class="games-list--col2">
                        <nav v-if="games.length" class="games-list--col1">
                            <router-link v-for="itm in games.slice(4)" :key="itm" :to="`/${itm}`">
                                <span :class="{'active': $route.name === capitalize(itm)}">{{ capitalize(itm) }}</span>
                            </router-link>
                        </nav>
                    </div>
                </div>
            </div>
            <div class="info">
                <div class="info-head">
                    <span>{{ $t('footer.info.information') }}</span>
                </div>
                <div class="info-list">
                    <a href="/about">{{ $t('footer.info.about') }}</a>
                    <a href="/feedback">{{ $t('footer.info.contacts') }}</a>
                    <a href="/partner">{{ $t('footer.info.partner') }}</a>
                    <a href="/faq">{{ $t('footer.info.faq') }}</a>
                </div>
            </div>
            <div class="paymethods">
                <div class="paymethods-head">
                    <span>{{ $t('footer.paymethods') }}</span>
                </div>
                <div class="paymethods-list">
                    <div class="paymethods-list--row1">
                        <img src="/images/svg/visa_logo2.svg" alt="">
                        <img src="/images/svg/Mastercard-logo.svg" alt="">
                        <img src="/images/svg/Yandex.svg" alt="">
                        <img src="/images/svg/WebMoney_logo.svg" alt="">
                    </div>
                    <div class="paymethods-list--row2">
                        <img src="/images/svg/PayPal_logo.svg" alt="">
                        <img src="/images/svg/Sberbank_Logo_2020.svg" alt="">
                        <img src="/images/svg/qiwi.svg" alt="">
                        <a href="//freekassa.ru/"><img src="//www.free-kassa.ru/img/fk_btn/17.png" title="Приём оплаты на сайте картами"></a>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>


<script>

    import { capitalize } from '../utils/capitalize'

    export default {
        data() {
            return {

            }
        },
        watch: {

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
            },
            capitalize(string) {
                return capitalize(string)
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
            },
            games() {
                return this.$store.state.games
            }
        },
        components: {

        }
    }
</script>

<style scoped lang="scss">
    footer {
        position: absolute;
        bottom: -250px;
        left: -112px;
        right: -350px;
        padding: 20px 270px 0px 170px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 250px;
        background-color: #0d0f13;
        .footerImg {
            padding: 0px 0px 0px 20px;
            img {
                width: 70px;
                height: 50px;
            }

            .footerImg-content{
                margin-top: 5px;
                display:grid;
                width: 140px;
                height: 26px;

                span {
                    color: #404148;
                    white-space: nowrap;
                }
                .allRights{
                    font-size: 12px;
                }
            }
        }

        .games {

            .games-head{
                font-weight: bold;
                margin: -10px 0 15px 44px;
            }
            .games-list {
                display: flex;
                a {
                    text-decoration: none;
                    margin-top: 5px;
                    span {
                        color: #404148;
                    }
                }
                .games-list--col1 {
                    display: grid;
                }
                .games-list--col2 {
                    margin-left: 30px;
                    display: grid;
                }
            }
        }

        .info {
            .info-head {
                font-weight: bold;
                margin: -10px 0 15px 30px;
            }
            .info-list {
                display: grid;
                a {
                    text-decoration: none;
                    margin-top: 5px;
                    color: #404148;
                }
            }
        }

        .paymethods {
            .paymethods-head {
                font-weight: bold;
                margin: -10px 0 15px 80px;
            }
            .paymethods-list {
                display: grid;
                .paymethods-list--row1 {
                    display: inline-flex;
                    img {
                    width: 90px;
                    height: 70px;
                    padding-right: 20px;
                    fill:#404148;
                }
                }
                .paymethods-list--row2 {
                    display: inline-flex;
                    align-items: center;
                    & > img {
                    width: 90px;
                    height: 70px;
                    padding-right: 20px;
                    fill:#404148;
                }
                }
            }
        }

        @media screen and (max-width: 1600px) {

        }
        @media screen and (max-width: 1440px) {
            right: -290px;
        }
        @media screen and (max-width: 1300px) {
            padding: 20px 150px 0px 130px;
        }
        @media screen and (max-width: 1280px) {
            left: -90px;
        }
        @media screen and (max-width: 1040px) {
            right: 0px;
            padding: 20px 50px 0px 70px;
            .paymethods {
                .paymethods-head {
                    font-weight: bold;
                    margin: -20px 0 15px 65px;
                }
                .paymethods-list {
                    display: grid;
                    .paymethods-list--row1 {
                        display: inline-flex;
                        img {
                        width: 65px;
                        height: 45px;
                        padding-right: 10px;
                        }
                    }
                    .paymethods-list--row2 {
                        display: inline-flex;
                        img {
                            width: 65px;
                            height: 45px;
                            padding-right: 10px;
                        }
                    }
                }
            }
        }
        @media screen and (max-width: 992px) {
            left: 0px;
            padding: 20px 30px 0px 50px;
        }
        @media screen and (max-width: 800px) {
            left: 0px;
            padding: 20px 10px 0px 10px;
            .games {
                .games-head{
                    font-weight: bold;
                    margin: -10px 0 15px 40px;
                }
                .games-list {
                    display: flex;
                    a {
                        text-decoration: none;
                        margin-top: 5px;
                        span {
                            color: #404148;
                        }
                    }
                    .games-list--col1 {
                        display: grid;
                    }
                    .games-list--col2 {
                        margin-left: 20px;
                        display: grid;
                    }
                }
            }
            .paymethods {
                .paymethods-head {
                    font-weight: bold;
                    margin: -20px 0 15px 65px;
                }
                .paymethods-list {
                    display: grid;
                    .paymethods-list--row1 {
                        display: inline-flex;
                        img {
                        width: 60px;
                        height: 40px;
                        padding-right: 10px;
                        }
                    }
                    .paymethods-list--row2 {
                        display: inline-flex;
                        img {
                            width: 60px;
                            height: 40px;
                            padding-right: 10px;
                        }
                    }
                }
            }

        }

        @media screen and (max-width: 550px) {
            bottom: -580px;
            height: 580px;
            .footerImg {
                position: absolute;
                left: 0px;
                top: 460px;
                padding: 0px 0px 0px 20px;
                img {
                    width: 70px;
                    height: 50px;
                }

                .footerImg-content{
                    margin-top: 5px;
                    display:grid;
                    width: 140px;
                    height: 26px;

                    span {
                        color: #404148;
                        white-space: nowrap;
                    }
                    .allRights{
                        font-size: 12px;
                    }
                }
            }

            .games {
                margin-left: 20px;
                .games-head{
                    font-weight: bold;
                    margin: -275px 0 15px 0px;
                }
                .games-list {
                    display: flex;
                    flex-direction: column;
                    a {
                        text-decoration: none;
                        margin-top: 5px;
                        span {
                            color: #404148;
                        }
                    }
                    .games-list--col1 {
                        display: grid;
                    }
                    .games-list--col2 {
                        display: grid;
                        margin-left: 0;
                    }
                }
            }

            .info {
                position: absolute;
                left: 250px;
                .info-head {
                    font-weight: bold;
                    margin: -274px 0 15px 30px;
                }
                .info-list {
                    display: grid;
                    a {
                        text-decoration: none;
                        margin-top: 5px;
                        color: #404148;
                    }
                }
            }

            .paymethods {
                position: absolute;
                left: 20px;
                top: 270px;
                .paymethods-head {
                    font-weight: bold;
                    margin: -10px 0 15px 0px;
                }
                .paymethods-list {
                    display: grid;
                    .paymethods-list--row1 {
                        display: inline-flex;
                        img {
                        width: 90px;
                        height: 70px;
                        padding-right: 20px;
                    }
                }
                .paymethods-list--row2 {
                    display: inline-flex;
                        img {
                        width: 90px;
                        height: 70px;
                        padding-right: 20px;
                    }
                }
            }
            }
        }

        @media screen and (max-width: 450px) {

            bottom: -580px;
            height: 580px;
            .footerImg {
                position: absolute;
                left: 0px;
                top: 460px;
                padding: 0px 0px 0px 20px;
                img {
                    width: 70px;
                    height: 50px;
                }

                .footerImg-content{
                    margin-top: 5px;
                    display:grid;
                    width: 140px;
                    height: 26px;

                    span {
                        color: #404148;
                        white-space: nowrap;
                    }
                    .allRights{
                        font-size: 12px;
                    }
                }
            }

            .games {
                margin-left: 20px;
                .games-head{
                    font-weight: bold;
                    margin: -275px 0 15px 0px;
                }
                .games-list {
                    display: flex;
                    flex-direction: column;
                    a {
                        text-decoration: none;
                        margin-top: 5px;
                        span {
                            color: #404148;
                        }
                    }
                    .games-list--col1 {
                        display: grid;
                    }
                    .games-list--col2 {
                        display: grid;
                        margin-left: 0;
                    }
                }
            }

            .info {
                position: absolute;
                left: 150px;
                .info-head {
                    font-weight: bold;
                    margin: -274px 0 15px 30px;
                }
                .info-list {
                    display: grid;
                    a {
                        text-decoration: none;
                        margin-top: 5px;
                        color: #404148;
                    }
                }
            }

            .paymethods {
                position: absolute;
                left: 20px;
                top: 270px;
                .paymethods-head {
                    font-weight: bold;
                    margin: -10px 0 15px 0px;
                }
                .paymethods-list {
                    display: grid;
                    .paymethods-list--row1 {
                        display: inline-flex;
                        img {
                        width: 80px;
                        height: 60px;
                        padding-right: 20px;
                    }
                }
                .paymethods-list--row2 {
                    display: inline-flex;
                        img {
                        width: 80px;
                        height: 60px;
                        padding-right: 20px;
                    }
                }
            }
        }
        @media screen and (max-width: 350px) {
            bottom: -580px;
            height: 580px;
            .footerImg {
                position: absolute;
                left: 0px;
                top: 460px;
                padding: 0px 0px 0px 20px;
                img {
                    width: 70px;
                    height: 50px;
                }

                .footerImg-content{
                    margin-top: 5px;
                    display:grid;
                    width: 140px;
                    height: 26px;

                    span {
                        color: #404148;
                        white-space: nowrap;
                    }
                    .allRights{
                        font-size: 12px;
                    }
                }
            }

            .games {
                margin-left: 10px;
                .games-head{
                    font-weight: bold;
                    margin: -275px 0 15px 0px;
                }
                .games-list {
                    display: flex;
                    flex-direction: column;
                    a {
                        text-decoration: none;
                        margin-top: 5px;
                        span {
                            color: #404148;
                        }
                    }
                    .games-list--col1 {
                        display: grid;
                    }
                    .games-list--col2 {
                        display: grid;
                        margin-left: 0;
                    }
                }
            }

            .info {
                .info-head {
                    font-weight: bold;
                    margin: -274px 0 15px 30px;
                }
                .info-list {
                    display: grid;
                    a {
                        text-decoration: none;
                        margin-top: 5px;
                        color: #404148;
                    }
                }
            }

            .paymethods {
                position: absolute;
                left: 20px;
                top: 270px;
                .paymethods-head {
                    font-weight: bold;
                    margin: -10px 0 15px 0px;
                }
                .paymethods-list {
                    display: grid;
                    .paymethods-list--row1 {
                        display: inline-flex;
                        img {
                        width: 70px;
                        height: 50px;
                        padding-right: 20px;
                    }
                }
                .paymethods-list--row2 {
                    display: inline-flex;
                        img {
                        width: 70px;
                        height: 50px;
                        padding-right: 20px;
                    }
                }
            }
            }
        }
        @media screen and (max-width: 281px) {
            bottom: -580px;
            height: 580px;
            .footerImg {
                position: absolute;
                left: 0px;
                top: 460px;
                padding: 0px 0px 0px 20px;
                img {
                    width: 70px;
                    height: 50px;
                }

                .footerImg-content{
                    margin-top: 5px;
                    display:grid;
                    width: 140px;
                    height: 26px;

                    span {
                        color: #404148;
                        white-space: nowrap;
                    }
                    .allRights{
                        font-size: 12px;
                    }
                }
            }

            .games {
                margin-left: 10px;
                .games-head{
                    font-weight: bold;
                    margin: -275px 0 15px 0px;
                }
                .games-list {
                    display: flex;
                    flex-direction: column;
                    a {
                        text-decoration: none;
                        margin-top: 5px;
                        span {
                            color: #404148;
                        }
                    }
                    .games-list--col1 {
                        display: grid;
                    }
                    .games-list--col2 {
                        display: grid;
                        margin-left: 0;
                    }
                }
            }

            .info {
                position: absolute;
                left: 100px;
                .info-head {
                    font-weight: bold;
                    margin: -274px 0 15px 30px;
                }
                .info-list {
                    display: grid;
                    a {
                        text-decoration: none;
                        margin-top: 5px;
                        color: #404148;
                    }
                }
            }

            .paymethods {
                position: absolute;
                left: 20px;
                top: 270px;
                .paymethods-head {
                    font-weight: bold;
                    margin: -10px 0 15px 0px;
                }
                .paymethods-list {
                    display: grid;
                    .paymethods-list--row1 {
                        display: inline-flex;
                        img {
                        width: 60px;
                        height: 50px;
                        padding-right: 20px;
                    }
                }
                .paymethods-list--row2 {
                    display: inline-flex;
                        img {
                        width: 60px;
                        height: 50px;
                        padding-right: 20px;
                    }
                }
            }
            }
        }
    }
}
</style>

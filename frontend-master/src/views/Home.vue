<template>
    <div class="home">

        <div v-if="games.length" class="games-wrapper">
            <div class="game-wrapper__heading">
                <img src="/images/icons/game.png" alt="">
                <span>{{ $t('home.our_games') }}</span>
            </div>
            <div class="games-wrapper__games-list">
                <template v-for="(itm, idx) in menu">
                    <router-link
                        v-if="games.includes(itm.key)"
                        :key="itm.key"
                        :to="`/${itm.key}`"
                        :class="['game-item', { 'col-2': idx === 2 }]"
                        v-html="itm.content"/>
                </template>
            </div>
        </div>
        <div class="stats">
            <div class="stats-head">
                <div class="game">{{ $t('home.table.game') }}</div>
                <div class="user">{{ $t('home.table.user') }}</div>
                <div class="time">{{ $t('home.table.time') }}</div>
                <div class="bet">{{ $t('home.table.bet') }}</div>
                <div class="win">{{ $t('home.table.win') }}</div>
            </div>
            <div class="stats-container">
                <div v-for="item in bets" :key="item.date" class="stats-item">
                    <div class="game">
                        <div class="game-info">
                            <img :src="typesGame[item.game].image" alt="">
                            <span>{{ typesGame[item.game].name }}</span>
                        </div>
                    </div>
                    <div class="user">
                        <div class="user-item d-flex">
                            <div class="avatar">
                                <img v-lazy="{ id: item.photo, default: '/images/icons/gray-g.png' }" alt="">
                            </div>
                            <div class="username">{{ item.user }}</div>
                        </div>
                    </div>
                    <div class="time">
                        {{ getTime(item.date) }}
                    </div>
                    <div class="bet">
                        <span :class="[ item.prize > 0 ? 'success' : '']">{{ item.bet }}x</span>
                    </div>
                    <div class="win">
                        <span :class="[ item.prize > 0 ? 'success' : '']">{{ Math.floor(item.prize * 100) / 100 }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="gifts">
            <div class="d-flex justify-content-between">
                <div class="gifts__heading">
                    <img src="/images/icons/gifts.png" alt="">
                    <span>{{ $t('home.kwests') }}</span>
                </div>
                <div class="gifts__timer hidden-xs">
                    <div v-if="isOpenQuest" class="timer">
                        <img src="/images/icons/timer-orange.png" alt="">
                        <span>{{
                            lastActivationChest
                            ? `${("0" + lastActivationChest.hours).slice(-2)}:${(
                                "0" + lastActivationChest.minutes
                                ).slice(-2)}:${("0" + lastActivationChest.seconds).slice(-2)}`
                            : ""
                        }}</span>
                    </div>
                    <div class="control-slider">
                        <div class="left" @click="prev">
                            <img src="/images/icons/left-slider.png" alt="">
                        </div>
                        <div class="right" @click="next">
                            <img src="/images/icons/right-slider.png" alt="">
                        </div>
                    </div>
                </div>
            </div>

            <div class="slider-grid">
                <div class="left-lock">
                    <img src="/images/lampa.png" class="lampa" alt="">
                    <div class="w-100">
                        <h2>{{ $t('home.prise') }}</h2>
                        <div class="d-flex justify-content-center" style="margin: 0 -10px">
                            <p>{{ $t('home.need_for_open') }}: </p>
                            <div class="d-flex need-almaz align-items-center">
                                <img src="/images/icons/almaz-2.png" alt="">
                                <span>{{ quest.chest }} {{ $t('home.count') }}.</span>
                            </div>
                        </div>
                    </div>
                    <button
                        v-if="isShowChest"
                        :key="JSON.stringify(lastActivationChest)"
                        :disabled="isDisabledChest"
                        @click="openChest"
                        class="btn btn-open">
                        {{ $t('home.open') }}
                    </button>
                    <div
                        v-else
                        class="open-chest">
                        {{ $t('chest.is_was_open_front') }}
                    </div>
                </div>

                <div class="right-block">
                    <div class="slider">
                        <hooper :itemsToShow="getItemsToShow" pagination="no" ref="hooper">
                            <slide v-for="(itm, idx) in quests[lang]" :key="idx">
                                <div :class="['slide-item', { 'slide-item-disabled': quest.steps.isEnd || (quest.steps.types && quest.steps.types.includes(quests[lang][idx].id)) }]" >
                                    <span>{{ itm.title }}</span>
                                    <div class="progress-body">
                                        <div @click="openBonus(itm.id, quest.steps.isEnd)" :class="['progress-goal', { 'disabled-progress-goal': !isAuth }]">
                                            <img src="/images/icons/almaz-2.png" alt="">
                                            <span>{{ quests.gainIds[itm.gainId] }} {{ $t('home.count') }}.</span>
                                        </div>
                                        <!-- <div class="progress-linear">
                                            <div class="progress-fill"></div>
                                        </div>  -->
                                    </div>
                                </div>
                            </slide>
                        </hooper>
                    </div>
                    <div class="progress">
                        <div class="d-flex align-items-center progress-heading justify-content-between">
                            <div class="d-flex align-items-center">
                                <span>{{ $t('home.you_need') }}:</span>
                                <img src="/images/icons/almaz-2.png" alt="">
                                <em>{{ selectedDiamonds }}/{{ quest.chest }}</em>
                            </div>
                            <div v-if="!isAuth">
                                <div class="not-auth">{{ $t('home.not_auth') }}</div>
                            </div>
                        </div>
                        <div class="progress-linear">
                            <div class="progress-fill" :style="`width: ${ selectedDiamonds / quest.chest * 100 }%;max-width:100%;`"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="gifts-win">
            <div
                v-if="statistics.lucky_day.username"
                class="win-item">
                <img src="/images/icons/lampa.png" alt="" class="dep">

                <div class="win__heading d-flex align-items-center">
                    <img src="/images/icons/smile.png" alt="">
                    <span>{{ $t('home.fine_day') }}</span>
                </div>
                <div class="value-win">
                    <div class="user-win-info">
                        <div class="avatar">
                            <img
                                v-if="statistics.lucky_day.photoUrl"
                                v-lazy="{
                                    id: statistics.lucky_day.photoUrl,
                                    default: '/images/harley-test.png'
                                }"
                                alt="">
                            <div class="avatar-info">
                                <div class="nickname">{{ statistics.lucky_day.username }}</div>
                                <span>{{ $t('home.win') }}</span>
                            </div>
                        </div>
                        <div class="user-win-coin">
                            <img src="/images/icons/coin.png" alt="">
                            <span>{{ statistics.lucky_day.win && statistics.lucky_day.win.toFixed() }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="win-item">
                <img src="/images/icons/kirka.png" alt="" class="dep">

                <div class="win__heading d-flex align-items-center">
                    <img src="/images/icons/cup.png" alt="">
                    <span>{{ $t('home.big_win') }}</span>
                </div>
                <div class="value-win">
                    <div class="user-win-info">
                        <div class="avatar">
                            <img
                                v-if="statistics.much_win.photoUrl"
                                v-lazy="{ id: statistics.much_win.photoUrl,
                                            default: '/images/harley-test.png' }"
                                alt="">
                            <div class="avatar-info">
                                <div class="nickname">{{ statistics.much_win.username }}</div>
                                <span>{{ $t('home.win') }}</span>
                            </div>
                        </div>
                        <div class="user-win-coin">
                            <img src="/images/icons/coin.png" alt="">
                            <span>{{ statistics.much_win.win && statistics.much_win.win.toFixed() }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="win-item">
                <img src="/images/icons/bomba.png" alt="" class="dep">
                <div class="win__heading d-flex align-items-center">
                    <img src="/images/icons/poker.png" alt="">
                    <span>{{ $t('home.game_per_today') }}</span>
                </div>
                <div class="value-win">
                    <div class="count-games">{{ statistics.total.toFixed().toLocaleString() }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {Hooper, Slide} from 'hooper';
    import cookies from 'vue-cookie'
    import 'hooper/dist/hooper.css';
    import { getTime } from '../utils/getTime';
    import { BONUSES } from '../constants/socket';

    export default {
        name: 'Home',
        metaInfo() {
            return cookies.get(this.seo)
        },
        data() {
            return {
                quests: {
                    "en":[
                        {"title":"VK identification","gainId":1,"id":0},
                        {"title":"Subscription to VK group","gainId":2,"id":1},
                        {"title":"Subscribe to VK newsletter","gainId":3,"id":2},
                        {"title":"Subscribing to PUSH notifications","gainId":4,"id":3},
                        {"title":"Subscription to the Telegram channel","gainId":5,"id":4},
                        {"title":"Top up balance for 100 rubles","gainId":6,"id":5},
                        {"title":"Top up balance by 300 rubles","gainId":7,"id":6},
                        {"title":"Top up balance by 500 rubles","gainId":8,"id":7},
                        {"title":"Top up balance by 1000 rubles","gainId":9,"id":8},
                        {"title":"Top up balance by 1500 rubles","gainId":10,"id":9},
                        {"title":"Top up balance by 2000 rubles","gainId":11,"id":10},
                        {"title":"Top up balance by 3000 rubles","gainId":12,"id":11},
                        {"title":"Top up balance by 5000 rubles","gainId":13,"id":12}
                    ],
                    "ru":[
                        {"title":"Идентификация по ВК","gainId":1,"id":0},
                        {"title":"Подписка на группу ВК","gainId":2,"id":1},
                        {"title":"Подписка на рассылку ВК","gainId":3,"id":2},
                        {"title":"Подписка на PUSH уведомления","gainId":4,"id":3},
                        {"title":"Подписка на Телеграм канал","gainId":5,"id":4},
                        {"title":"Пополнить баланс на 100 рублей","gainId":6,"id":5},
                        {"title":"Пополнить баланс на 300 рублей","gainId":7,"id":6},
                        {"title":"Пополнить баланс на 500 рублей","gainId":8,"id":7},
                        {"title":"Пополнить баланс на 1000 рублей","gainId":9,"id":8},
                        {"title":"Пополнить баланс на 1500 рублей","gainId":10,"id":9},
                        {"title":"Пополнить баланс на 2000 рублей","gainId":11,"id":10},
                        {"title":"Пополнить баланс на 3000 рублей","gainId":12,"id":11},
                        {"title":"Пополнить баланс на 5000 рублей","gainId":13,"id":12}
                    ],
                    "gainIds":{
                        1:30,
                        2:30,
                        3:30,
                        4:30,
                        5:30,
                        6:30,
                        7:30,
                        8:30,
                        9:30,
                        10:30,
                        11:30,
                        12:30,
                        13:30
                    }
                },
                speed: 1000,
                timeOutData: null,

                lastActivationChest: null,

                statistics: {
                    total: 0,
                    lucky_day: {},
                    much_win: {}
                },

                seo: { en: {}, ru: {} },

                quest: {
                    chest: null,
                    steps: {},
                },

                full_block: { en: {}, ru: {} }
            }
        },
        computed: {
            getItemsToShow() {
                if(window.innerWidth > 1700) {
                    return 5;
                } else if (window.innerWidth > 1500) {
                    return 4;
                } else if(window.innerWidth > 1250) {
                    return 3;
                } else if(window.innerWidth > 992) {
                    return 2;
                } else if(window.innerWidth > 0) {
                    return 2;
                }

                return 2;
            },
            games() {
                return this.$store.state.games
            },
            isAuth() {
                return this.$store.getters.isAuth
            },
            lang() {
                return this.$store.state.lang
            },
            user() {
                return this.$store.state.user
            },
            isOpenQuest() {
                return this.isAuth && this.lastActivationChest
            },
            isOpenChest() {
                return this.isAuth && this.lastActivationChest
            },
            isShowChest() {
                if (!this.user.lastActivationChest) {
                    return true
                }

                return new Date(this.user.lastActivationChest).setHours(0,0,0,0) !== new Date().setHours(0,0,0,0)
            },
            isDisabledChest() {
                return !this.isAuth || this.selectedDiamonds < this.quest.chest
            },
            selectedDiamonds() {
                return this.$store.state.bonus.selectedDiamonds
            },
            typesGame() {
                return this.$store.state.bets.types
            },
            bets() {
                return this.$store.state.bets.bets
            },
            menu() {
                return [
                    {
                        key: 'roulette',
                        content: `<img src="/images/320/rulette_320.png" alt="">
                                <div class="info">
                                    <img src="/images/icons/roulette-active.png" alt="">
                                    <span>Roulette</span>
                                </div>`
                    },
                    {
                        key: 'crash',
                        content: `<img src="/images/320/krok_320.png" alt="">
                                <div class="info">
                                    <img src="/images/icons/crash-active.png" alt="">
                                    <span>Crash</span>
                                </div>`
                    },
                    {
                        key: 'battle',
                        content: `<img src="/images/320/battle_320.png" alt="">
                                <div class="info">
                                    <img src="/images/icons/battle-active.png" alt="">
                                    <span>Battle</span>
                                </div>`
                    },
                    {
                        key: 'dice',
                        content: `<img src="/images/320/harly_320.png" alt="">
                                <div class="info">
                                    <img src="/images/icons/dice-active.png" alt="">
                                    <span>Dice</span>
                                </div>`
                    },
                    {
                        key: 'jackpot',
                        content: `<img src="/images/320/joker_320.png" alt="">
                                <div class="info">
                                    <img src="/images/icons/jackpot-active.png" alt="">
                                    <span>Jackpot</span>
                                </div>`
                    },
                    {
                        key: 'mine',
                        content: `<img src="/images/320/diablo_320.png" alt="">
                                <div class="info">
                                    <img src="/images/icons/mine-active.png" alt="">
                                    <span>Mine</span>
                                </div>`
                    },
                    {
                        key: 'hilo',
                        content: `<img src="/images/320/enchantress_320.png" alt="">
                                <div class="info">
                                    <img src="/images/icons/hilo-active.png" alt="">
                                    <span>Hilo</span>
                                </div>`
                    },
                ]
            }
        },
        methods: {
            prev() {
                this.$refs['hooper'].slidePrev();
            },
            next() {
                this.$refs['hooper'].slideNext();
            },
            getTime(date) {
                return getTime(date)
            },
            async openChest() {
                const result = await this.$api.bonus.takeChest()

                if (result.error_message) {
                    this.$notify({
                        group: 'foo',
                        title: 'Error',
                        type: 'error',
                        text: this.$t(result.error_message)
                    })
                    return
                }


                this.quest.steps = result
                this.$notify({
                    group: 'foo',
                    title: 'Message',
                    text: this.$t('chest.success_was_open')
                })
                this.$store.commit('updateUser', { lastActivationChest: new Date() })
            },
            async openBonus(id, end) {
                if (!this.isAuth) {
                    return
                }

                if (this.quest.steps.types.includes(id) || end) {
                    return
                }

                const result = await this.$api.bonus.takeBonus(id)

                if (result.error_message) {
                    this.$notify({
                        group: 'foo',
                        title: 'Error',
                        type: 'error',
                        text: this.$t(result.error_message)
                    })
                    return
                }

                this.quest.steps = result

                this.$notify({
                    group: 'foo',
                    title: 'Message',
                    text: this.$t(`quests.success_get_bonus`)
                })
            },
            countdown() {
                let t = (new Date()).valueOf() - new Date().setHours(0,0,0,0).valueOf();
                let dayMiliseconds = 1000 * 60 * 60 * 24

                const diffTime = Math.abs(dayMiliseconds - t);

                let seconds = Math.floor((diffTime / 1000) % 60);
                let minutes = Math.floor((diffTime / 1000 / 60) % 60);
                let hours = Math.floor((diffTime / (1000 * 60 * 60)) % 24);

                if (t > 0) {
                    this.lastActivationChest = {
                        total: t,
                        hours: hours,
                        minutes: minutes,
                        seconds: seconds
                    };

                    setTimeout(this.countdown, this.speed);
                } else {
                    this.lastActivationChest = null;

                    clearTimeout(this.timeOutData);
                }
            }
        },
        async created () {
            const result = await this.$api.admin.getMainPage()
            const quests = await this.$api.bonus.getQuests()
            const statistics = await this.$api.bet.getStats()

            console.log('result ', result);
            console.log('quests ', quests);

            if (!statistics.error) {
                this.statistics = statistics
            }

            if (result.error) {
                console.error('Error get main page data: ', result.message)
                return
            }

            this.seo = result.seo

            this.full_block = result.full_block

            this.quest.chest = result.chest
            this.quest.steps = quests

            console.log('this.quest ', this.quest);
        },
        mounted() {
            this.timeOutData = setTimeout(this.countdown, 1);

            this.$bus.$on(BONUSES.CHANGE_SELECTED_DIAMONDS, (payload) => {
                this.$store.commit('bonus/setDiamonds', { count: +JSON.parse(payload).data })
            })

            window.addEventListener('resize', () => {
                if (this.$refs['hooper']) {
                    this.$refs['hooper'].update();
                }
            });
            const vm = this
            setTimeout(() => {
                if (vm.$refs['hooper']) {
                    vm.$refs['hooper'].update();
                }
            }, 800);
        },
        components: {
            Hooper,
            Slide
        }
    }
</script>
<style lang="scss">
    .hooper {
        outline: none !important;
    }
    .games-wrapper {
        margin-top: 22px;
        background: #202126;
        padding: 25px 23px;
        padding-right: 9px;
        padding-bottom: 11px;
        border-radius: 10px;

        .games-wrapper__games-list {
            margin-top: 22px;
            display: flex;
            flex-wrap: wrap;
        }

        .game-wrapper__heading {
            display: flex;
            align-items: center;

            img {
                margin-right: 14px;
            }

            span {
                font-size: 14px;
                color: #d5d7dd;
            }
        }

        .game-item {
            text-decoration: none;
            display: block;
            height: 225px;
            border-radius: 10px;
            overflow: hidden;
            padding: 20px 18px;
            position: relative;
            box-shadow: 0px 1px 11px 8px #1e1f23;
            background: #26272c;
            margin-right: 14px;
            margin-bottom: 14px;
            width: calc(25% - 14px);

            &.col-2 {
                width: calc(50% - 14px);
            }

            > img {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                height: 100%;
                width: 100%;
                object-fit:cover;
            }

            .info {
                position: relative;
                z-index: 0;
                display: flex;
                align-items: center;

                img {
                    margin-right: 12px;
                }

                span {
                    font-size: 16px;
                    font-weight: 600;
                }
            }
        }
    }
    .stats {
        background: #202126;
        border-radius: 10px;
        padding: 30px 20px;
        padding-bottom: 20px;
        margin-top: 20px;

        .stats-container {
            max-height: 470px;
            overflow: auto;
        }

        .game {
            width: 20%;
        }

        .user {
            width: 36.6%;
        }

        .time {
            width: 16.6%;
        }

        .pari {
            width: 16.6%;
        }

        .bet {
            width: 16.6%;
        }

        .win {
            width: 67px;
            overflow: hidden;
        }

        .stats-head {
            margin-bottom: 28px;
            display: flex;
            align-items: center;

            > div {
                font-size: 14px;
                color: #d5d7dd;
            }
        }

        .stats-item {
            align-items: center;

            padding: 12px 23px;
            padding-left: 0;
            padding-right: 0;

            border-radius: 10px;
            display: flex;
            background: #26272c;

            &:nth-child(odd) {
                background: transparent;
            }

            .user-item {

                align-items: center;
                display: flex;

                .avatar {
                    margin-right: 12px;
                    position: relative;
                    width: 35px;
                    height: 35px;
                    border-radius: 100%;

                    img {
                        width: 100%;
                        height: 100%;
                        border-radius: 100%;
                    }
                }

                .username {
                    font-weight: normal;
                    font-size: 14px;
                    color: #fff
                }
            }

            .game-info {
                display: flex;
                align-items: center;

                img {
                    margin-right: 9px;
                }

                span {
                    font-size: 14px;
                    color: #61626a;
                }
            }

            .game {
                padding-left: 23px;
            }

            .time {
                font-size: 14px;
                color: #61626a;
            }

            .win {
                padding-right: 23px;

                span {
                    color: #61626a;
                    font-size: 14px;

                    &.success {
                        color: #00ba47;
                    }
                }

            }

            .pari {
                font-size: 14px;
                color: #61626a;
            }

            .bet {
                span {
                    color: #61626a;
                    font-size: 14px;

                    &.success {
                        color: #00ba47;

                    }
                }

            }
        }
    }
    .hooper {
        height: 100%;
        border-radius: 0px !important;
    }
    .gifts {
        background: #202126;
        border-radius: 10px;
        margin-top: 15px;
        padding: 22px;

        .gifts__heading {
            display: flex;
            align-items: center;

            img {
                margin-right: 10px;
            }

            span {
                font-size: 14px;
                color: #d5d7dd;
            }

        }

        .gifts__timer {
            display: flex;
            align-items: center;

            .timer {
                display: flex;
                align-items: center;

                img {
                    margin-right: 8px;
                }

                span {
                    font-size: 14px;
                    color: #d5d7dd;

                }

                margin-right: 20px;
            }

            .control-slider {
                display: flex;

                > div {
                    border-radius: 10px;
                    display: flex;
                    height: 30px;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    padding: 11px;
                    background: #26272c;

                    &:first-child {
                        margin-right: 4px;
                    }
                }
            }
        }

        .slider-grid {
            margin-top: 22px;
            display: flex;

            .left-lock {
                width: 305px;
                padding: 30px 40px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                position: relative;

                .lampa {
                    position: absolute;
                    left: -15px;
                    bottom: -10px;
                }

                .open-chest {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 10px;
                    text-align: center;
                    background-color: rgba(0, 0, 0, 0.8);
                    border-radius: 10px;
                }

                align-items: center;
                min-width: 305px;
                height: 330px;
                margin-right: 10px;
                background: url(/images/case_h.png);
                background-size: 100% 100%;

                .btn-open {
                    padding: 18px 44px;
                    background: linear-gradient(90deg, #00ba76 0%, #00ba47 100%);
                    border: none;
                    outline: none;
                    border-radius: 30px;
                    cursor: pointer;

                    &:disabled {
                        opacity: 0.9;
                        cursor: auto;
                    }
                }

                h2 {
                    font-weight: bold;
                    color: #00b947;
                    font-size: 24px;
                    display: block;
                    width: 100%;
                    text-align: center;
                    margin-bottom: 12px;
                }

                p {
                    font-size: 12px;
                    color: #d5d7dd;
                }

                .need-almaz {
                    margin-left: 5px;

                    img {
                        margin-right: 4px;
                    }

                    span {
                        font-size: 12px;
                        color: #d5d7dd;
                    }
                }
            }

            .right-block {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                overflow: hidden;

                .slider {
                    overflow: hidden;
                    display: flex;
                    border-radius: 0px;
                    flex-grow: 1;

                    .slide-item {
                        margin-right: 10px;

                        &:nth-child(5n) {
                            margin-right: 0;
                        }

                        &.slide-item-disabled {
                            opacity: 0.7;

                            .progress-goal {
                                cursor: auto;
                            }
                        }

                        flex: 1;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        align-items: center;

                        > span {
                            font-size: 12px;
                            color: #d5d7dd;
                        }

                        border-radius: 10px;
                        background: #26272c;
                        padding: 25px 22px;

                        .progress-body {
                            width: 100%;
                        }

                        .progress-goal {
                            background: #2f3137;
                            padding: 12px 14px;
                            border-radius: 10px;
                            width: 100%;
                            display: flex;
                            align-items: center;
                            cursor: pointer;

                            &.disabled-progress-goal {
                                opacity: 0.5;
                            }

                            img {
                                margin-right: 12px;
                            }

                            span {
                                font-size: 12px;
                                color: #d5d7dd;
                            }
                        }

                        .progress-linear {
                            height: 4px;
                            width: 100%;
                            background: #1a1b20;
                            border-radius: 2px;
                            position: relative;

                            .progress-fill {
                                height: 150%;
                                top: -25%;
                                position: absolute;
                                left: 0;
                                border-radius: 3px;

                                background: linear-gradient(90deg, #00ba76 0%, #00ba47 100%);
                            }
                        }
                    }
                }

                .progress {
                    min-height: 80px;
                    margin-top: 12px;
                    background: #26272c;
                    border-radius: 10px;
                }
            }
        }

        .progress {
            padding: 20px 18px;

            .progress-linear {
                margin-top: 15px;
                height: 4px;
                width: 100%;
                background: #1a1b20;
                border-radius: 2px;
                position: relative;

                .progress-fill {
                    height: 150%;
                    top: -25%;
                    position: absolute;
                    left: 0;
                    border-radius: 3px;

                    background: linear-gradient(90deg, #00ba76 0%, #00ba47 100%);
                }
            }
        }

        .progress-heading {
            span {
                font-weight: 600;
                font-size: 16px;
                color: #d5d7dd;
            }

            img {
                margin-right: 3px;
                margin-left: 5px;
            }

            .not-auth {
                font-weight: lighter;
                color: #813636;
                font-size: 12px;
            }

            em {
                font-style: normal;
                font-size: 14px;
                color: #d5d7dd;

            }
        }
    }
    .gifts-win {
        margin-top: 20px;
        display: flex;
        .win-item {
            flex: 1;
            margin-right: 22px;
            border-radius: 10px;
            padding: 20px;
            background: #202126;
            &:last-child {
                margin-right: 0;
            }
            .value-win {
                border-radius: 10px;
                background: #2b2c31;
                height: 74px;
                margin-top: 22px;
                padding: 0 25px;
                align-items: center;
                display: flex;
            }

            .count-games {
                font-weight: bold;
                color: #e6e8f4;
                font-size: 24px;
            }
            .win__heading {
                img {
                    margin-right: 12px;
                }
                span {
                    font-size: 14px;
                    color: #d5d7dd;
                }
            }
        }
    }
    .win-item {
        position: relative;
        .dep {
            position: absolute;
            bottom: -10px;
            right: -10px;
            z-index: 999;
        }
    }
    .user-win-info {
        width: 100%;
        display: flex;
        justify-content: space-between;
        max-height: 40px;
        .avatar {
            display: flex;
            img {
                width: 40px;
                height: 40px;
                margin-right: 10px;
                border-radius: 100%;
            }
            .avatar-info {
                .nickname {
                    font-weight: bold;
                    color: #fff;
                    margin-bottom: 0px;
                }
                span {
                    font-size: 12px;
                    color: #98999e;
                }
            }
        }
        .user-win-coin {
            display: flex;
            align-items: center;
            img {
                margin-right: 10px;
            }
            span {
                font-size: 14px;
                color: #fff;
            }
        }
    }
    @media screen and (max-width: 1440px) {
        .games-wrapper {
            .game-item {
                width: calc(50% - 14px) !important;
                &:last-child {
                    margin: auto;
                }
            }
        }
    }
    @media screen and (max-width: 1270px) {
        .not-auth {
            display: none;
        }
        .gifts .progress-heading span {
            font-size: 14px;
        }
        .slider {
            margin-right: -10px;
        }
    }
    @media screen and (max-width: 1170px) {
        .gifts .slider-grid .left-lock {
            min-width: 260px;
            height: 280px;
            width: 260px;
            padding: 24px 30px;
        }
        .gifts .slider-grid .left-lock .w-100 > .d-flex {
            background: rgba(0,0,0, 0.8);
            padding: 5px;
            border-radius: 5px;
        }
    }
    @media screen and (max-width: 992px) {
        .games-wrapper {
            .game-item {
                height: 150px;
                .info span {
                    font-size: 14px;
                    font-weight: 600;
                }
                .info img {
                    width: 20px;
                }
            }
        }
        .gifts-win {
            flex-wrap: wrap;
            .win-item {
                width: 100%;
                flex: unset;
                margin-right: 0;
                margin-bottom: 14px;
            }
        }
    }

    @media screen and (max-width: 768px) {
        .slider section {
            width: calc(100% + 10px);
        }
        .stats {
            padding: 25px 20px;
            .stats-container {
                max-height: 375px;
                overflow: auto;
            }
            .stats-item {
                background: #26272c !important;
                margin-bottom: 5px;
                &:last-child {
                    margin-bottom: 0;
                }
                flex-wrap: wrap;
                padding: 10px 12px;
                justify-content: space-between;
                .game {
                    width: 50%;
                    order: 1;
                    margin-bottom: 15px;
                    display: flex;
                    justify-content: flex-end;
                }
                .user {
                    width: 50%;
                    margin-bottom: 15px;
                    order: 0;
                }
                .time {
                    order: 5;
                    display: flex;
                    justify-content: flex-end;
                }
                .pari {
                    order: 2;
                }
                .bet {
                    order: 3;
                }
                .win {
                    order: 4;
                }
            }
            .stats-head {
                flex-wrap: wrap;
                justify-content: space-between;
                margin-bottom: 22px;
                .game {
                    width: 50%;
                    justify-content: flex-end;
                    order: 1;
                    display: flex;
                    margin-bottom: 10px;
                }
                .user {
                    width: 50%;
                    order: 0;
                    margin-bottom: 10px;
                }
                .time {
                    order: 5;
                    display: flex;
                    justify-content: flex-end;
                }
                .pari {
                    order: 2;
                }
                .bet {
                    order: 3;
                }
                .win {
                    order: 4;
                }
                > div {
                    font-size: 12px;
                    color: #787982;
                }
            }
        }

    }

    @media screen and (max-width: 575px) {
        .gifts .slider-grid .left-lock {
            margin: 0 auto;
            margin-bottom: 18px;
            max-width: 100%;

        }

        .gifts .slider-grid {
            flex-wrap: wrap;
        }
        .gifts .slider-grid .right-block {
            flex-wrap: wrap;
        }
        .gifts .slider-grid .right-block .slider {
            max-width: 100%;
        }
        .gifts .slider-grid .right-block .slider .slide-item {
            height: 188px;
        }

        .games-wrapper .game-item {
            width: 100% !important;
            margin-right: 0;
            &:last-child {
                margin-bottom: 0;
            }
        }
        .games-wrapper {
            padding: 25px 15px;
            padding-bottom: 15px;
            margin-top: 15px;
        }
        .stats {
            padding: 25px 15px;
            margin-top: 15px;
            padding-bottom: 15px;
        }
        .stats .time {
            width: 26.6%
        }
        .gifts {
            padding-right: 15px;
            padding-left: 15px;
        }
        .gifts-win {
            margin-top: 15px;
        }
    }


    @media screen and (max-width: 400px) {
        .gifts .slider-grid .left-lock {
            min-width: 100%;
        }
    }
</style>

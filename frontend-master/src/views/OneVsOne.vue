<template>
    <div class="one-vs-one">
        <div class="left-block">
            <game-stats :settings="settings" type="jackpot"></game-stats>
        </div>
        <div class="right-block">
            <div class="top-indicators d-flex justify-content-between">
                <div class="heading-indicator">Игра: <br> 1 vs 1</div>
                <div class="right-indicators">
                    <div v-if="game.muchWin" class="indicator-block">
                        <span>Возможный<br>выигрыш</span>
                        <div class="maybe-win-block">
                            <img src="/images/icons/coin.png" alt="">
                            <span>{{ game.muchWin.toLocaleString() }}</span>
                        </div>
                    </div>
                    <div v-if="isStarted" class="indicator-block">
                        <span>Новая игра<br>через:</span>
                        <div class="timer">
                            <em>00:{{ secondsToStart }}</em>
                            <span>Сек</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="circle-field">
                <div class="left-player">
                    <template v-if="myBet">
                        <div :class="['avatar', {'winner': win ? win === myBet.userName : false}]">
                            <img v-lazy="{ id: myBet.photo, default: '/images/icons/gray-g.png' }" :alt="myBet.userName">
                        </div>
                        <div class="nickname">{{ myBet.userName }}</div>
                        <div v-if="win" class="status">{{ win === myBet.userName ? 'Победил' : 'Проиграл' }}</div>
                    </template>
                </div>
                <div class="round-status">
                    <div class="center-circle">
                        <div v-if="win" class="circle-result">
                            <img src="/images/icons/check.png" alt="">
                        </div>
                    </div>
                </div>
                <div class="right-player">
                    <template v-if="anotherBet">
                        <div :class="['avatar', {'lose': win ? win !== anotherBet.userName : false}]">
                            <img v-lazy="{ id: anotherBet.photo, default: '/images/icons/gray-g.png' }" :alt="anotherBet.userName">
                        </div>
                        <div class="nickname">{{ anotherBet.userName }}</div>
                        <div v-if="win" class="status">{{ win === anotherBet.userName ? 'Победил' : 'Проиграл' }}</div>
                    </template>
                </div>
            </div>
            <div v-if="win" class="status-span">Раунд завершился</div>
            <div class="control">
                <div class="left-control">
                    <span>Сумма ставки:</span>
                    <div class="indicator-item">
                        <div class="input-block">
                            <img src="/images/icons/coin.png" alt="">
                            <input type="number" placeholder="0" v-model.number="game.amount">
                        </div>
                        <div class="indicator-buttons">
                            <button class="btn-indicator hidden-xs"
                                    @click="game.amount = parseFloat(parseFloat(game.amount) + 1)">+1
                            </button>
                            <button class="btn-indicator hidden-xs"
                                    @click="game.amount = parseFloat(parseFloat(game.amount) + 10)">+10
                            </button>
                            <button class="btn-indicator hidden-xs"
                                    @click="game.amount = parseFloat(parseFloat(game.amount) + 100)">+100
                            </button>
                            <button class="btn-indicator"
                                    @click="game.amount = parseFloat(parseFloat(game.amount) / 2)">1/2
                            </button>
                            <button class="btn-indicator"
                                    @click="game.amount = parseFloat(parseFloat(game.amount) * 2)">x2
                            </button>
                            <button class="btn-indicator" @click="game.amount = parseFloat(balance)">Макс.</button>
                        </div>
                    </div>
                </div>
                <div class="right-control">
                    <span>Изменить шанс:</span>
                    <div class="indicator-item">
                        <div class="input-block">
                            <img src="/images/icons/sale.png" alt="">
                            <input type="number" :min="0" :max="90" v-model.number="game.chance">
                        </div>
                        <div class="indicator-buttons">
                            <button class="btn-indicator"
                                    @click="(game.chance > 1 ? game.chance = game.chance - 1 : '')">-
                            </button>
                            <button class="btn-indicator" @click="game.chance = game.chance + 1">+</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bets-info">
                <div v-if="myBet" class="bets__info-item">
                    <div class="bets__info-label">Ваша ставка:</div>
                    <div class="bets__info-left-item">
                        <div class="left__item-percent">
                            <img src="/images/icons/sale.png" alt="">
                            <span>{{ myBet.chance }}%</span>
                        </div>
                        <div class="left__item-coins">
                            <img src="/images/icons/coin.png" alt="">
                            <span>{{ myBet.amount }}</span>
                        </div>
                        <div class="left__item-user">
                            <div class="username">{{ myBet.userName }}</div>
                            <div class="left__item-user-circle">
                                <img v-lazy="{ id: myBet.photo, default: '/images/icons/gray-g.png' }" :alt="myBet.userName">
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="anotherBet" class="bets__info-item">
                    <div class="bets__info-label">Ставка противника:</div>
                    <div class="bets__info-left-item"
                         style="background: linear-gradient(90deg, rgba(201,3,58, 0.1) 0%, #2b2c31 100%);flex-direction: row-reverse;">
                        <div class="left__item-coins">
                            <img src="/images/icons/coin.png" alt="">
                            <span>{{ anotherBet.chance }}</span>
                        </div>
                        <div class="left__item-percent" style="margin-right: 5px;">
                            <img src="/images/icons/sale.png" alt="">
                            <span>{{ anotherBet.chance }}%</span>
                        </div>

                        <div class="left__item-user" style="margin-right: auto; margin-left: 2px;">
                            <div class="username">{{ anotherBet.chance }}</div>
                            <div class="left__item-user-circle">
                                <img v-lazy="{ id: anotherBet.photo, default: '/images/icons/gray-g.png' }" :alt="anotherBet.userName">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="!isAuth">
                <button @click="$root.$emit('openLogin')" class="btn one-vs-one__play-button">{{ $t('games.auth_button') }}</button>
            </div>
            <div v-else>
                <div @click="play" class="btn one-vs-one__play-button">{{ $t('games.game_button_play_start') }}</div>
            </div>
        </div>
    </div>
</template>
<script>
    import GameStats from "../components/GameStats";
    import { getMeta } from '../utils/getMeta'
    import * as moment from 'moment';
    import { JACKPOT } from '../constants/socket';

    export default {
        name: 'Jackpot',
        metaInfo() {
            return getMeta(this.seo)
        },
        watch: {
            game: function () {
                console.log('game ', this.game);
            },
            'game.chance': function (val) {
                if (+val < 1) {
                    this.game.chance = 1
                }

                if (+val > 90) {
                    this.game.chance = 90
                }
            }
        },
        data() {
            return {
                seo: { en: [], ru: [] },
                settings: {},
                win: null,
                secondsClientServerDiff: 0,
                now: moment(),
                game: {
                    amount: 1.0,
                    chance: 1,
                    bets: [],
                },
            }
        },
        async created() {
            const result = await this.$api.admin.getJackpotSettings()
            const game = await this.$api.jackpot.getGame()
            const settings = await this.$api.jackpot.getStats()

            if (result.error) {
                console.error('Error get jackpot data: ', result.message)
                return
            }

            this.seo = result.seo
            this.settings = settings
            this.game = { ...this.game, ...game }
        },
        methods: {
             async play() {
                if (!this.isAuth) {
                    return
                }

                if (+this.game.bet < 0.1) {
                    this.game.bet = 0.1
                    return
                }

                if (+this.game.bet > this.balance) {
                    this.game.bet = this.balance
                    return
                }

                if (+this.game.chance < 1) {
                    this.game.chance = 1
                    return
                }

                if (+this.game.chance > 90) {
                    this.game.chance = 90
                    return
                }

                this.isBetSending = true

                this.$bus.$emit(JACKPOT.SEND_JACKPOT_GAME_BET, {sum: +this.game.amount, chance: +this.game.chance, gameId: this.game.id});
            },
            async gameEnded() {
                this.win = this.game.winUserName;
                const idxWin = this.game.bets.bets.findIndex(itm => itm.userId === this.game.winUserId)

                if (this.$refs['hooper']) {
                    this.$refs['hooper'].slideTo(idxWin)
                }

                setTimeout(async () => {
                    this.$notify({
                        group: 'foo',
                        title: 'Message',
                        text: `Выйграл ${this.win}`
                    })

                    setTimeout(async () => {
                        this.isBetSending = false;
                        this.game = await this.$api.jackpot.getGame()
                        this.game = { ...this.game, amount: 1, chance: 1 }

                        setTimeout(async () => {
                            this.win = null
                        }, 3000)
                    }, 1000)

                }, 1000);
            }
        },
        mounted() {
            setInterval(() => this.now = moment(), 1000);

            this.$bus.$on(JACKPOT.JACKPOT_GAME_BET, async game => {
                const data = game;

                if (!this.user.id) {
                    return
                }

                console.log(data)

                if (data.bets && data.bets.bets.length > 1 && data.bets.bets.find(itm => itm.userId !== this.user.id)) {
                    this.game = await this.$api.jackpot.getGame()
                    this.game = { ...this.game, amount: 1, chance: 1 }
                    return
                }

                this.game = { ...this.game, ...data };
            })
            this.$bus.$on(JACKPOT.JACKPOT_GAME_START, async game => {
                const data = JSON.parse(game)

                if (!this.user.id) {
                    return
                }

                if (data.bets && data.bets.bets.length > 1 && data.bets.bets.find(itm => itm.userId !== this.user.id)) {
                    this.game = await this.$api.jackpot.getGame()
                    this.game = { ...this.game, amount: 1, chance: 1 }
                    return
                }

                this.secondsClientServerDiff = moment(data.serverDate).diff(moment(), 's');
                this.game = { ...this.game, ...data };
            })
            this.$bus.$on(JACKPOT.JACKPOT_GAME_RESULT, async game => {
                const result = JSON.parse(game)

                if (!this.user.id) {
                    return
                }

                if (result.bets && result.bets.bets.length > 1 && result.bets.bets.find(itm => itm.userId !== this.user.id)) {
                    this.game = await this.$api.jackpot.getGame()
                    this.game = { ...this.game, amount: 1, chance: 1 }
                    return
                }

                this.game = { ...this.game, ...result };
                this.gameEnded();
            })

            this.$bus.$on(JACKPOT.JACKPOT_GAME_BET_ANSWER, betAnswer => {
                this.isBetSending = false;
                const data = JSON.parse(betAnswer);

                if (data.status === 400) {
                    if (data.error === 'NOT_ENOUGH_BALANCE') {
                        this.isShowNotEnoughMoneyModal = true;
                    } else {
                        this.errorText = data.error;
                        this.isShowErrorModal = true;
                    }
                }
            });
        },
        computed: {
            balance() {
                return +this.$store.state.user.balance
            },
            isStarted() {
                return this.game.date !== null;
            },
            myBet() {
                return this.game.bets && this.game.bets.bets && this.game.bets.bets.length ? this.game.bets.bets.find(itm => itm.userId === this.user.id) : null
            },
            anotherBet() {
                return this.game.bets && this.game.bets.bets && this.game.bets.bets.length ? this.game.bets.bets.find(itm => itm.userId !== this.user.id) : null
            },
            user() {
                return this.$store.state.user
            },
            isAuth() {
                return this.$store.getters.isAuth
            },
            secondsToStart() {
                return Math.max(0, moment(this.game.date).diff(moment(this.now).add(this.secondsClientServerDiff, 's'), 'seconds'))
            },
        },
        components: {
            'game-stats': GameStats,
        }
    }
</script>
<style scoped lang="scss">
    .one-vs-one {
        min-width: 0;
        overflow: hidden;
        display: flex;
        align-items: flex-start;

        > div {
            background: #202126;
            border-radius: 10px;
        }

        .left-block {
            flex: 1;
            background: #202126;
            padding: 28px 16px;
            margin-right: 20px;
            padding-bottom: 16px;
        }

        .right-block {
            min-width: 0;
            flex: 2;
            padding: 24px;

            .top-indicators {
                .heading-indicator {
                    font-size: 16px;
                    color: #6d6f7c;
                }

                .right-indicators {
                    display: flex;

                    .indicator-block {
                        &:first-child {
                            margin-right: 38px;
                        }

                        display: flex;
                        align-items: center;

                        span {
                            font-size: 12px;
                            color: #737581;
                            margin-right: 16px;
                            display: block;

                            line-height: 14px;
                        }

                        .maybe-win-block {
                            padding: 17px 21px;
                            background: #2d3a30;
                            border-radius: 5px;
                            display: flex;
                            align-items: center;

                            img {
                                margin-right: 12px;

                            }

                            span {
                                font-weight: bold;
                                color: #00ba47;
                                font-size: 24px;
                                line-height: 0;
                                display: block;
                                margin-right: 0;
                            }
                        }

                        .timer {
                            padding: 14px 21px;
                            background: #2b2c31;
                            border-radius: 5px;
                            display: flex;
                            align-items: flex-end;

                            em {
                                font-weight: bold;
                                font-size: 24px;
                                color: #fff;
                                font-style: normal;
                                line-height: 21px;
                            }

                            span {
                                display: block;
                                margin-left: 4px;
                                font-size: 12px;
                                color: #737581;
                            }
                        }
                    }
                }
            }

            .control {
                margin-top: 35px;
                display: flex;

                .left-control {
                    flex: 2;

                    > span {
                        color: #737581;
                        font-size: 12px;
                        display: block;
                        width: 100%;
                        margin-bottom: 14px;
                    }

                    .indicator-item {
                        margin-right: 15px;
                    }
                }

                .right-control {
                    flex: 1;

                    > span {
                        color: #737581;
                        font-size: 12px;
                        display: block;
                        width: 100%;
                        margin-bottom: 14px;
                    }
                }

                .indicator-item {
                    .input-block {
                        img {
                            margin-right: 8px;
                        }

                        display: flex;
                        padding-left: 13px;
                        align-items: center;

                        input {
                            outline: none;
                            border: none;
                            background: transparent;
                            font-size: 14px;
                            color: #fff;
                            height: 100%;
                            width: 80px;
                        }
                    }

                    background: #2b2c31;
                    padding: 8px;
                    border-radius: 5px;
                    display: flex;
                    justify-content: space-between;

                    .indicator-buttons {
                        display: flex;

                        > button {
                            cursor: pointer;
                            margin-right: 3px;
                            padding: 12px 0;
                            width: 55px;
                            font-size: 12px;
                            color: #fff;
                            outline: none;
                            border: none;
                            border-top: 1px solid #43464f;
                            border-radius: 5px;
                            background: #393c46;
                            transition: 0.2s;

                            &:last-child {
                                margin-right: 0;
                            }

                            &:hover {
                                background: #00ba47;
                            }
                        }
                    }
                }
            }

            .bets-info {
                margin-top: 24px;
                display: flex;

                .bets__info-item {
                    flex: 1;
                }

                .bets__info-item:first-child {
                    margin-right: 12px;
                }

                .bets__info-label {
                    font-size: 12px;
                    color: #737581;
                    margin-bottom: 16px;
                    display: block;
                }

                .bets__info-left-item {
                    padding: 10px;
                    border-radius: 5px;
                    background: linear-gradient(90deg, #2b2c31 0%, rgba(61, 186, 36, 0.15) 100%);
                    display: flex;

                    .left__item-percent {
                        display: flex;
                        align-items: center;
                        padding-left: 10px;

                        img {
                            margin-right: 10px;
                        }

                        span {
                            color: #e6e8f4;
                            font-size: 14px;
                            font-weight: 500;
                        }
                    }

                    .left__item-coins {
                        display: flex;
                        align-items: center;
                        margin-left: 20px;

                        img {
                            margin-right: 10px;
                        }

                        span {
                            color: #e6e8f4;
                            font-size: 14px;
                            font-weight: 500;
                        }
                    }
                }

                .left__item-user {
                    margin-left: auto;
                    display: flex;
                    align-items: center;

                    .username {
                        font-weight: bold;
                        color: #e6e8f4;
                        font-size: 14px;
                        margin-right: 15px;
                    }

                    .left__item-user-circle {
                        border-radius: 100%;
                        background: #5d7360;
                        width: 30px;
                        height: 30px;
                        position: relative;
                        margin-right: 2px;

                        img {
                            border-radius: 100%;
                            width: 100%;
                        }
                    }

                }
            }

            .status-span {
                margin-top: 5px;
                text-align: center;
                font-size: 16px;
                color: #6d6f7c;
            }

            .circle-field {
                margin-top: 40px;
                display: flex;
                align-items: center;
                overflow-x: hidden;
                justify-content: space-between;

                .left-player {
                    background: #202126;
                    width: 88px;
                    text-align: center;
                    padding-left: 20px;
                    margin-top: 60px;
                    position: relative;
                    z-index: 999;
                }

                .avatar {
                    width: 100%;
                    height: 66px;
                    border-radius: 100%;
                    padding: 5px;
                    margin-bottom: 13px;

                    img {
                        width: 100%;
                        border-radius: 100%;
                        height: 100%;
                    }

                    &.winner {
                        background: #4c7751;
                    }

                    &.lose {
                        background: #634545;
                    }
                }

                .nickname {
                    font-size: 16px;
                    font-weight: 500;
                    margin-bottom: 8px;
                }

                .status {
                    font-size: 12px;
                    color: #6d6f7c;
                }

                .round-status {
                    width: 175px;
                    height: 175px;
                    padding: 15px;
                    border-radius: 100%;
                    position: relative;

                    &:after {
                        width: 300%;
                        height: 15px;
                        content: "";
                        background: url(/images/icons/circles.png);
                        background-size: auto 100%;
                        background-repeat: repeat-x;
                        display: block;
                        position: absolute;
                        right: -300%;
                        top: calc(50% - 7.5px);
                    }

                    &:before {
                        width: 300%;
                        height: 15px;
                        content: "";
                        background: url(/images/icons/circles.png);
                        background-size: auto 100%;
                        background-repeat: repeat-x;
                        display: block;
                        position: absolute;
                        left: -300%;
                        transform: scale(-1, -1);
                        top: calc(50% - 7.5px);
                    }

                    .center-circle {
                        width: 100%;
                        height: 100%;
                        border-radius: 100%;
                        border: 5px solid #2b2c31;
                        padding: 22px;

                        .circle-result {
                            width: 100%;
                            height: 100%;
                            border-radius: 100%;
                            background: linear-gradient(90deg, #00ba47 0%, #00ba76 100%);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                    }
                }

                .right-player {
                    background: #202126;
                    position: relative;
                    z-index: 999;
                    margin-top: 60px;
                    text-align: center;
                    width: 88px;
                    padding-right: 20px;

                }
            }
        }

    }

    .one-vs-one__play-button {
        padding: 20px 0;
        outline: none;
        text-align: center;
        border: none;
        cursor: pointer;
        background: #00ba47;
        font-size: 14px;
        margin-top: 40px;
        width: 100%;
        display: block;
        border-radius: 5px;
    }


    @media screen and (max-width: 1750px) {
        .one-vs-one .right-block {
            .control {
                flex-wrap: wrap;

                .left-control {
                    width: 100%;
                    flex: unset;
                    margin-bottom: 15px;

                    .indicator-item {
                        margin-right: 0;
                    }
                }

                .right-control {
                    width: 100%;
                    flex: unset;
                }
            }
        }
    }

    @media screen and (max-width: 1480px) {
        .one-vs-one .right-block {
            .top-indicators {
                flex-wrap: wrap;

                .heading-indicator {
                    width: 100%;
                    margin-bottom: 15px;

                    br {
                        display: none;
                    }
                }

                .right-indicators {
                    width: 100%;
                    justify-content: space-between;
                }

            }
        }
        .one-vs-one .right-block .circle-field {
            margin-top: 30px;
        }
        .one-vs-one .right-block .circle-field .round-status:before {
            height: 10px;
            top: calc(50% - 5px);
        }
        .one-vs-one .right-block .circle-field .round-status:after {
            height: 10px;
            top: calc(50% - 5px);
        }
        .one-vs-one .right-block .circle-field .left-player {
            padding-left: 0;
            width: 68px;
        }
        .one-vs-one .right-block .circle-field .right-player {
            padding-right: 0;
            width: 68px;
        }
        .one-vs-one .right-block .control .indicator-item .indicator-buttons > button {
            width: 49px;
        }
    }

    @media screen and (max-width: 1200px) {
        .one-vs-one {
            flex-wrap: wrap;

            .left-block {
                flex: unset;
                width: 100%;
                margin-right: 0;
                order: 1;
            }

            .right-block {
                order: 0;
                flex: unset;
                margin-bottom: 20px;
                width: 100%;
            }
        }
    }


    @media screen and (max-width: 1550px) {
        .one-vs-one .right-block .bets-info {
            flex-wrap: wrap;

            .bets__info-item {
                flex: unset;
                width: 100%;
                margin-bottom: 15px;
                margin-right: 0 !important;

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }


    @media screen and (max-width: 575px) {
        .one-vs-one .right-block {
            padding: 30px 15px;
        }
        .one-vs-one .right-block .top-indicators .right-indicators {

            .indicator-block {
                &:first-child {
                    margin-right: 15px;
                }

                .timer {
                    span {

                        margin-right: 0;
                    }
                    em {
                        font-size: 18px;
                    }
                }

                flex-wrap: wrap;
                .maybe-win-block {
                    span {
                        font-size: 18px;
                    }
                }
                > span {
                    width: 100%;
                    margin-bottom: 12px;
                }

            }
        }
        .one-vs-one .right-block .circle-field .round-status:before {
            left: -300%;
        }
        .one-vs-one .right-block .circle-field .round-status:after {
            right: -300%;
        }
        .one-vs-one .right-block .circle-field .left-player {
            margin-top: 44px;
            width: 56px !important;
            padding-left: 10px !important;
            .avatar {
                height: 46px;
                margin-bottom: 8px;
            }
            .nickname {
                font-size: 14px;
                margin-bottom: 5px;
            }
            .status {
                font-size: 10px;
            }
        }
        .one-vs-one .right-block .circle-field {
            margin-top: 15px;
        }
        .one-vs-one .right-block .circle-field .right-player {
            margin-top: 44px;
            width: 56px;
            padding-right: 10px;
            .avatar {
                height: 46px;
                margin-bottom: 8px;
            }
            .nickname {
                font-size: 14px;
                margin-bottom: 5px;
            }
            .status {
                font-size: 10px;
            }
        }
        .one-vs-one .right-block .status-span {
            font-size: 14px;
        }
        .one-vs-one .right-block .circle-field .round-status {
            width: 112px;
            height: 112px;
            padding: 8px;
            .center-circle {
                padding: 11px;
                img {
                    max-width: 55%;
                }
            }
        }
        .one-vs-one .right-block .control .indicator-item .indicator-buttons > button {
            width: 46px;
        }
        .one-vs-one .right-block .control .indicator-item .input-block inpu {
            width: 66px;
        }
        .one-vs-one .right-block .bets-info .bets__info-left-item {
            flex-wrap: wrap;
        }
        .one-vs-one .right-block .bets-info {

            .left__item-user {
                width: 100%;
                order: 0;
                margin-bottom: 15px;
            }
            .left__item-percent {
                order: 1;
            }
            .left__item-coins {
                order: 2;
            }
        }
        .one-vs-one .right-block .bets-info .bets__info-item:first-child {
            .left__item-percent {
                padding-left: 0 !important;
            }
        }
        .one-vs-one .right-block .bets-info .bets__info-item:last-child {
            .bets__info-left-item {
                flex-direction: row !important;
            }
            .left__item-percent {
                padding-left: 0 !important;
            }
        }
        .one-vs-one__play-button {
            margin-top: 15px;
            padding: 15px 40px;
        }
        .one-vs-one .right-block .bets-info .bets__info-label {
            margin-bottom: 10px;
        }
        .one-vs-one .right-block {
            padding-bottom: 15px;
        }
    }
</style>

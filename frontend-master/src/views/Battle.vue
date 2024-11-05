<template>
    <div class="battle">
        <div class="left-block">
            <game-stats :settings="settings" type="battle"></game-stats>
        </div>
        <div class="right-block">
            <div class="top-indicators d-flex justify-content-between">
                <div class="heading-indicator">{{ $t('game') }}: <br> Battle</div>
                <div class="right-indicators">
                    <div v-if="game.muchWin" class="indicator-block">
                        <span>{{ $t('battle.maybe') }}<br>{{ $t('battle.winner') }}</span>
                        <div class="maybe-win-block">
                            <img src="/images/icons/coin.png" alt="">
                            <span>{{ game.muchWin.toLocaleString() }}</span>
                        </div>
                    </div>
                    <div v-if="isStarted" class="indicator-block">
                        <span>{{ $t('battle.new_game') }}<br>{{ $t('battle.on') }}:</span>
                        <div class="timer">
                            <em>00:{{ secondsToStart }}</em>
                            <span>{{ $t('battle.sec') }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="game.bets.bets && game.bets.bets.length" class="roulette">
                <div class="roulette__heading">{{ $t('battle.select_winner') }}</div>
                <div class="roulette-slider">
                    <img src="/images/icons/cursor.png" class="cursor" alt="">
                    <hooper
                        :itemsToShow="getCountSlides"
                        :centerMode="true"
                        :initialSlide="8"
                        :mouseDrag="false"
                        :touchDrag="false"
                        :wheelControl="false"
                        :keysControl="false"
                        pagination="no"
                        ref="hooper">
                        <slide v-for="itm in game.bets.bets" :key="itm.id">
                            <div class="roulette-slide">
                                <div class="slide-body">
                                    <img
                                        v-lazy="{ id: itm.photo, default: '/images/icons/gray-g.png' }"
                                        width="62"
                                        height="62"
                                        style="min-width:62px;min-height:62px;max-width:62px;max-height:62px"
                                        :alt="itm.userName">
                                </div>
                            </div>
                        </slide>
                    </hooper>
                </div>
            </div>

            <div class="control">
                <div class="left-control">
                    <span>{{ $t('battle.bet_sum') }}:</span>
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
                            <button class="btn-indicator" @click="game.amount = parseFloat(balance)">{{ $t('battle.max') }}</button>
                        </div>
                    </div>
                </div>
                <div class="right-control">
                    <span>{{ $t('battle.change_chance') }}:</span>
                    <div class="indicator-item">
                        <div class="input-block">
                            <img src="/images/icons/sale.png" alt="">
                            <input type="number" placeholder="0" v-model.number="game.chance">
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
            <div v-if="game.bets.bets && game.bets.bets.length"  class="bets">
                <span>{{ $t('battle.bets_users') }}:</span>
                <div class="bets-list">
                    <div v-for="(itm, idx) in game.bets.bets" :key="idx" class="bet-item">
                        <div class="user-item d-flex">
                            <div class="avatar">
                                <img v-lazy="{ id: itm.photo, default: '/images/icons/gray-g.png' }" alt="">
                            </div>
                            <div class="username">{{ itm.userName }}</div>
                        </div>
                        <div class="bet-info">
                            <div class="bet-percent">
                                <img src="/images/icons/sale.png" alt="">
                                <span>{{ itm.chance }}%</span>
                            </div>
                            <div class="bet-coins">
                                <img src="/images/icons/coin.png" alt="">
                                <span>{{ itm.amount }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="!isAuth">
                <button @click="$root.$emit('openLogin')" class="btn btn-play">{{ $t('games.auth_button') }}</button>
            </div>
            <div v-else>
                <div @click="play" class="btn btn-play">{{ $t('games.game_button_play_start') }}</div>
            </div>
        </div>
    </div>
</template>
<script>
    import GameStats from "../components/GameStats";
    import {Hooper, Slide} from "hooper";
    import * as moment from 'moment';
    import {getMeta} from '../utils/getMeta';
    import { BATTLE } from '../constants/socket'

    export default {
        name: 'Battle',
        metaInfo() {
            return getMeta(this.seo)
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
            const result = await this.$api.admin.getBattleSettings()
            const settings = await this.$api.battle.getStats()
            const game = await this.$api.battle.getGame()

            if (result.error) {
                console.error('Error get battle data: ', result.message)
                return
            }

            this.seo = result.seo
            this.settings = settings
            this.game = { ...this.game, ...game }
        },
        mounted() {
            setInterval(() => this.now = moment(), 1000);

            this.$bus.$on(BATTLE.BATTLE_GAME_BET, game => {
                this.game = { ...this.game, ...JSON.parse(game) };
            })
            this.$bus.$on(BATTLE.BATTLE_GAME_START, game => {
                const data = JSON.parse(game);
                this.secondsClientServerDiff = moment(data.serverDate).diff(moment(), 's');
                this.game = { ...this.game, ...data };
            })
            this.$bus.$on(BATTLE.BATTLE_GAME_RESULT, game => {
                this.game = { ...this.game, ...JSON.parse(game) };
                this.gameEnded();
            })

            this.$bus.$on(BATTLE.BATTLE_GAME_BET_ANSWER, betAnswer => {
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
        methods: {
            async play() {
                if (!this.isAuth) {
                    return
                }

                // if (+this.game.bet < 0.1) {
                //     this.game.bet = 0.1
                //     return
                // }
                //
                // if (+this.game.bet > this.balance) {
                //     this.game.bet = this.balance
                //     return
                // }
                //
                // if (+this.game.chance < 1) {
                //     this.game.chance = 1
                //     return
                // }
                //
                // if (+this.game.chance > 90) {
                //     this.game.chance = 90
                //     return
                // }

                this.isBetSending = true

                this.$bus.$emit(BATTLE.SEND_BATTLE_GAME_BET, {sum: +this.game.amount, chance: +this.game.chance, gameId: this.game.id});
            },
            async gameEnded() {
                const winSide = this.game.winUserName;
                const idxWin = this.game.bets.bets.findIndex(itm => itm.userId === this.game.winUserId)

                if (this.$refs['hooper']) {
                    this.$refs['hooper'].slideTo(idxWin)
                }

                setTimeout(async () => {
                    this.$notify({
                        group: 'foo',
                        title: 'Message',
                        text: `Выйграл ${winSide}`
                    })

                    setTimeout(async () => {
                        this.win = winSide;
                        this.isBetSending = false;
                        this.game = await this.$api.battle.getGame()
                        this.game = { ...this.game, amount: 1, chance: 1 }
                    }, 1000)

                }, 1000);
            }
        },
        computed: {
            getCountSlides() {
                if(window.innerWidth > 1660) {
                    return 11;
                } else if(window.innerWidth > 1540) {
                    return 9;
                } else if(window.innerWidth > 1400) {
                    return 7;
                } else if(window.innerWidth > 1200) {
                    return 5;
                } else if(window.innerWidth > 1150) {
                    return 7;
                } else if(window.innerWidth > 1040) {
                    return 7;
                } else if(window.innerWidth > 760) {
                    return 9;
                } else if(window.innerWidth > 555) {
                    return 7;
                } else if(window.innerWidth > 380) {
                    return 5;
                }
                return 3;
            },
            isAuth() {
                return this.$store.getters.isAuth
            },
            isStarted() {
                return this.game.date !== null;
            },
            balance() {
                return +this.$store.state.user.balance
            },
            secondsToStart() {
                return Math.max(0, moment(this.game.date).diff(moment(this.now).add(this.secondsClientServerDiff, 's'), 'seconds'))
            },
        },
        components: {
            'game-stats': GameStats,
            Hooper,
            Slide
        }
    }
</script>
<style scoped lang="scss">
    .hooper {
        outline: none;
        height: auto;
    }
    .battle {
        margin-top: 70px;
        margin-bottom: 98px;
        min-width: 0;
        overflow: hidden;
        display: flex;

        > div {
            background: #202126;
            border-radius: 10px;
        }

        .left-block {
            flex: 1;
            padding: 28px 16px;

            margin-right: 20px;
            padding-bottom: 16px;
        }

        .right-block {
            min-width: 0;
            padding: 24px;
            flex: 2;
        }
    }

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

    .roulette {
        margin-top: 30px;

        .roulette__heading {
            font-size: 14px;
            color: #737581;
            display: block;
            width: 100%;
            margin-bottom: 12px;
            text-align: center;
        }

        .roulette-slider {
            position: relative;

            .cursor {
                position: absolute;
                bottom: -10px;
                z-index: 999;
                left: calc(50% - 19px);
                filter: drop-shadow(7px 4px 6px black);
            }

            background: #2b2c31;
            border-radius: 10px;
            padding: 18px 20px;
            display: flex;
            justify-content: center;
            align-items: center;

            .is-current {
                .roulette-slide {
                    justify-content: center;
                    .slide-body {
                        border: 3px solid #00ba47;
                    }
                }
            }
            .roulette-slide {
                border-radius: 100%;
                align-items: center;
                display: flex;
                justify-content: center;
                &.active {
                    border: 3px solid #00ba47;
                }

                .slide-body {
                    padding: 0px 4px;
                    border-radius: 100%;

                    img {
                        width: 100%;
                        height: 100%;
                        border-radius: 100%;
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

    .bets {
        margin-bottom: 0px;
        margin-top: 32px;

        span {
            font-size: 12px;
            color: #737581;
            margin-bottom: 14px;
            display: block;
        }

        .bets-list {

            display: flex;
            flex-wrap: wrap;

            .bet-item {
                margin-bottom: 9px;
                background: #2b2c31;
                border-radius: 5px;
                padding: 11px;
                margin-right: 13px;
                width: calc(50% - 7px);

                &:nth-child(2n) {
                    margin-right: 0;
                }

                display: flex;
                justify-content: space-between;

                .user-item {
                    width: 35%;
                    align-items: center;

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
                        font-weight: bold;
                        font-size: 14px;
                        color: #fff
                    }
                }

                .bet-info {
                    align-items: center;
                    display: flex;

                    .bet-percent {
                        display: flex;
                        margin-right: 20px;
                        align-items: center;

                        img {
                            margin-right: 11px;
                        }

                        span {
                            font-weight: 500;
                            margin-bottom: 0;
                            font-size: 14px;
                            color: #fff;
                        }
                    }

                    .bet-coins {
                        display: flex;

                        align-items: center;

                        img {
                            margin-right: 11px;
                        }

                        span {
                            font-weight: 500;
                            font-size: 14px;
                            margin-bottom: 0;
                            color: #fff;
                        }
                    }
                }
            }
        }
    }

    .btn-play {
        text-align: center;
        padding: 20px 0;
        outline: none;
        border: none;
        cursor: pointer;
        background: #00ba47;
        font-size: 14px;
        margin-top: 28px;
        width: 100%;
        display: block;
        border-radius: 5px;
    }


    @media screen and (max-width: 1750px) {
        .control {
            flex-wrap: wrap;
            .left-control {
                flex: unset;
                width: 100%;
                margin-bottom: 15px;
                .indicator-item {
                    margin-right: 0;
                }
            }
            .right-control {
                flex: unset;
                width: 100%;
            }
        }
    }
    @media screen and (max-width: 1570px) {
        .bets .bets-list .bet-item {
            width: 100%;
            margin-right: 0;
        }
        .control .indicator-item .indicator-buttons > button {
            width: 50px;
        }
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
                justify-content: space-between;
                width: 100%;
                .indicator-block {
                    &:first-child {
                        margin-right: 20px;
                    }
                }
            }
        }
    }

    @media screen and (max-width: 1200px) {
        .battle {
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

    @media screen and (max-width: 575px) {
        .top-indicators .right-indicators .indicator-block {
            flex-wrap: wrap;
            > span {
                width: 100%;
                margin-bottom: 12px;
            }
        }
        .top-indicators .heading-indicator {
            margin-bottom: 20px;
        }
        .battle {

            .right-block {
                padding: 30px 15px;
                padding-bottom: 15px;
            }
        }
        .bets {
            margin-top: 15px;
        }
        .control .indicator-item .indicator-buttons > button {
            width: 45px;
        }
        .control .indicator-item .input-block input {
            width: 67px;
        }
        .roulette .roulette-slider {
            padding: 15px 0;
        }
        .btn-play {
            padding: 15px 40px;
        }
    }
    @media screen and (max-width: 420px) {
        .bets .bets-list .bet-item {
            flex-wrap: wrap;
            justify-content: space-between;
            .user-item {
                width: 100%;
            }
            .bet-info {
                width: 100%;
                justify-content: space-between;
                margin-top: 10px;
            }
        }
        .btn-play {
            margin-top: 5px;
        }
        .top-indicators .right-indicators .indicator-block span {
            margin-right: 0;
        }
        .top-indicators .right-indicators .indicator-block .maybe-win-block span {
            font-size: 18px;
        }
        .top-indicators .left-indicators .indicator-block .maybe-win-block span {
            font-size: 18px;
        }
    }
</style>

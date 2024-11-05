<template>
    <div class="roulette">
        <div class="history">
            <div class="last-games">
                <div class="label">{{ $t('roulette.last_100_games') }}</div>
                <div class="items">
                    <div class="last-item">
                        <div class="circle red"></div>
                        <span>{{ statistics.counts.red || 0 }}</span>
                    </div>
                    <div class="last-item">
                        <div class="circle green"></div>
                        <span>{{ statistics.counts.green || 0 }}</span>
                    </div>
                    <div class="last-item">
                        <div class="circle gray"></div>
                        <span>{{ statistics.counts.gray || 0 }}</span>
                    </div>
                </div>
            </div>
            <div v-if="statistics.history && statistics.history.length" class="history-games">
                <div class="label">{{ $t('roulette.history') }}:</div>
                <div class="history-items">
                    <div
                        v-for="(itm, idx) in statistics.history.slice(0, 10)"
                        :key="idx"
                        :class="['history-item', typesName[itm.winSide]]"/>
                </div>
            </div>
        </div>

        <div
            class="slider"
            :class="{ slider__active: isStarted }"
        >
            <img src="/images/icons/cursor-s.png" alt="" class="cursor">
            <hooper
                :itemsToShow="getCountSlides"
                :hoverPause="false"
                :autoPlay="false"
                :playSpeed="100"
                :transition="1"
                :centerMode="true"
                :initialSlide="10"
                :mouseDrag="false"
                :touchDrag="false"
                :wheelControl="false"
                :keysControl="false"
                :infiniteScroll="true"
                pagination="no"
                class="hooper-animate-class"
                ref="hooper"
            >
                <slide v-for="(itm, idx) in slides" :key="idx">
                    <div class="slider-item">
                        <img :src="images[itm]">
                    </div>
                </slide>
            </hooper>
        </div>

        <div class="game__controls">
            <div v-if="isStarted" class="control__heading">
                {{ $t('roulette.start_on') }} <span>{{ secondsToStart }}</span>
            </div>
            <div class="control__progress">
                <div class="progress-fill" :style="`width: ${percent}%`"></div>
            </div>
            <div class="label-sm">{{ $t('roulette.sum_bet') }}:</div>
            <div class="control__buttons-wrapper">
                <div class="bet-sum">
                    <span>{{ $t('roulette.sum_bet') }}:</span>
                    <img src="/images/icons/coin.png" alt="">
                    <input type="text" v-model.number="bet" placeholder="1">
                </div>
                <div class="buttons">
                    <span @click="bet = 1">{{ $t('roulette.clear') }}</span>
                    <button @click="bet = (+bet + 1)" class="hidden-md">+1</button>
                    <button @click="bet = (+bet + 10)" class="hidden-md">+10</button>
                    <button @click="bet = (+bet + 100)" class="hidden-sm">+100</button>
                    <button @click="bet = (+bet + 1000)" class="hidden-sm">+1000</button>
                    <button @click="bet = (+bet / 2).toFixed(2)">1/2</button>
                    <button @click="bet = (+bet) * 2">x2</button>
                    <button @click="bet = +balance">{{ $t('roulette.max') }}</button>
                </div>
            </div>

            <div class="bets-wrapper">
                <div class="bet">
                    <div class="top-item">
                        <div class="bet-img">
                            <img src="/images/icons/red-g.png" alt="">
                        </div>

                        <span class="hidden-xs">{{ $t('roulette.winner') }}</span>

                        <span class="show-xs">x2</span>

                        <button
                            v-if="!isAuth"
                            @click="$root.$emit('openLogin')"
                            class="button red">
                          {{ $t('games.auth_button') }}
                        </button>

                        <div v-else @click="playRed" class="button red">{{ $t('roulette.on_bet') }}</div>
                    </div>
                    <div class="label-top">
                        <span>{{ $t('roulette.all_dep') }}</span>
                        <div class="coin_ship">
                            <img src="/images/icons/coin.png" alt="">
                            <em>{{ game.red.sum }}</em>
                        </div>
                    </div>
                    <div v-if="game.red" class="bet-items">
                        <div v-for="(itm, idx) in game.red.bets" :key="idx" class="bet-item">
                            <div class="avatar">
                                <img v-lazy="{ id: itm.photo, default: '/images/harley-test.png' }" :alt="itm.userName">
                            </div>
                            <div class="nickname">{{ itm.userName }}</div>
                            <div class="coin_ship">
                                <img src="/images/icons/coin.png" alt="">
                                <span>{{ itm.sum }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bet">
                    <div class="top-item">
                        <div class="bet-img">
                            <img src="/images/icons/green-g.png" alt="">
                        </div>

                        <span class="hidden-xs">{{ $t('roulette.winner') }}</span>

                        <span class="show-xs">x6</span>

                        <button
                            v-if="!isAuth"
                            @click="$root.$emit('openLogin')"
                            class="button green"
                        >
                          {{ $t('games.auth_button') }}
                        </button>

                        <div v-else @click="playGreen" class="button green">{{ $t('roulette.on_bet') }}</div>
                    </div>
                    <div class="label-top">
                        <span>{{ $t('roulette.all_dep') }}</span>
                        <div class="coin_ship">
                            <img src="/images/icons/coin.png" alt="">
                            <em>{{ game.green.sum }}</em>
                        </div>
                    </div>
                    <div v-if="game.green" class="bet-items">
                        <div v-for="(itm, idx) in game.green.bets" :key="idx" class="bet-item">
                            <div class="avatar">
                                <img v-lazy="{ id: itm.photo, default: '/images/harley-test.png' }" :alt="itm.userName">
                            </div>
                            <div class="nickname">{{ itm.userName }}</div>
                            <div class="coin_ship">
                                <img src="/images/icons/coin.png" alt="">
                                <span>{{ itm.sum }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bet">
                    <div class="top-item">
                        <div class="bet-img">
                            <img src="/images/icons/gray-g.png" alt="">
                        </div>

                        <span class="hidden-xs">{{ $t('roulette.winner') }}</span>

                        <span class="show-xs">x3</span>

                        <button
                            v-if="!isAuth"
                            @click="$root.$emit('openLogin')"
                            class="button gray">
                          {{ $t('games.auth_button') }}
                        </button>

                        <div v-else @click="playGray" class="button gray">{{ $t('roulette.on_bet') }}</div>
                    </div>
                    <div class="label-top">
                        <span>{{ $t('roulette.all_dep') }}</span>
                        <div class="coin_ship">
                            <img src="/images/icons/coin.png" alt="">
                            <em>{{ game.gray.sum }}</em>
                        </div>
                    </div>
                    <div v-if="game.gray" class="bet-items">
                        <div v-for="(itm, idx) in game.gray.bets" :key="idx" class="bet-item">
                            <div class="avatar">
                                <img v-lazy="{ id: itm.photo, default: '/images/harley-test.png' }" :alt="itm.userName">
                            </div>
                            <div class="nickname">{{ itm.userName }}</div>
                            <div class="coin_ship">
                                <img src="/images/icons/coin.png" alt="">
                                <span>{{ itm.sum }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {Hooper, Slide} from "hooper";
    import * as moment from 'moment';
    import { getMeta } from '../utils/getMeta'
    import { ROULETTE } from '../constants/socket'

    const types = {
        red: 0,
        green: 1,
        gray: 2,
    }

    const typesName = {
        0: 'red',
        1: 'green',
        2: 'gray',
    }

    const typesNameRus = {
        0: 'красные',
        1: 'зелёные',
        2: 'серые',
    }

    export default {
        name: 'Roulette',
        metaInfo() {
            return getMeta(this.seo)
        },
        watch: {
            bet: function(val) {
                if (val < 0.01) {
                    this.bet = 0.01
                    return
                }

                if (val > this.balance) {
                    this.bet = this.balance
                }
            }
        },
        data() {
            return {
                secondsClientServerDiff: 0,
                seo: { en: [], ru: [] },
                slides: [],
                isAnimate: true,
                bet: 1,
                game: { red: { sum: 0, bets: [] }, gray: { sum: 0, bets: [] }, green: { sum: 0, bets: [] } },
                now: moment(),
                statistics: { counts: {}, history: [] }
            }
        },
        async created() {
            const settings = await this.$api.admin.getRouletteSettings()
            const statistics = await this.$api.roulette.getStats()
            const game = await this.$api.roulette.getGame()

            if (settings.error) {
                console.error('Error get roulette data: ', settings.message)
                return
            }

            this.seo = settings.seo
            this.game = game
            this.statistics = statistics
        },
        mounted() {
            const slides = this.getArr(30, this.imagesSlide)
            this.shuffle(slides)
            this.slides = slides

            setInterval(() => this.now = moment(), 1000);

            this.$bus.$on(ROULETTE.TEAM_GAME_BET, game => {
                this.game = JSON.parse(game);
            })
            this.$bus.$on(ROULETTE.TEAM_GAME_START, game => {
                const data = JSON.parse(game);
                this.secondsClientServerDiff = moment(data.serverDate).diff(moment(), 's');
                this.game = data;
            })
            this.$bus.$on(ROULETTE.TEAM_GAME_RESULT, game => {
                this.game = JSON.parse(game);
                this.gameEnded();

            })

            this.$bus.$on(ROULETTE.TEAM_GAME_BET_ANSWER, betAnswer => {
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
            imagesSlide() {
                return  [0, 1, 2]
            },
            percent() {
                if (!this.game.date) {
                    return
                }

                // console.log('moment(this.game.date) ', this.game);
                return 10
            },
            images() {
                return {
                    0: '/images/icons/red-f.png',
                    1: '/images/icons/green-f.png',
                    2: '/images/icons/gray-f.png',
                }
            },
            balance() {
                return +this.$store.state.user.balance
            },
            types() {
                return types
            },
            typesName() {
                return typesName
            },
            isAuth() {
                return this.$store.getters.isAuth
            },
            isStarted() {
                return this.game.date !== null;
            },
            getCountSlides() {
                if(window.innerWidth > 1800) {
                    return 17;
                } else if (window.innerWidth > 1650) {
                    return 15;
                } else if(window.innerWidth > 1466) {
                    return 13;
                }  else if(window.innerWidth > 1440) {
                    return 11;
                } else if (window.innerWidth > 1100) {
                    return 9;
                } else if(window.innerWidth > 1040) {
                    return 7;
                } else if(window.innerWidth > 728) {
                    return 9;
                } else if(window.innerWidth > 560) {
                    return 7;
                } else if(window.innerWidth > 412) {
                    return 5;
                } else if(window.innerWidth > 340) {
                    return 5;
                } else if(window.innerWidth > 0) {
                    return 5;
                }

                return 5;
            },
            secondsToStart() {
                return Math.max(0, moment(this.game.date).diff(moment(this.now).add(this.secondsClientServerDiff, 's'), 'seconds'))
            },
        },
        methods: {
            getArr(leng, value) {
                const arr = []

                for (let i = 0; i < leng; i++) {
                    arr.push(...value)
                }

                return arr
            },
            shuffle(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    let j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            },
            playRed() {
                this.play(0)
            },
            playGreen() {
                this.play(1)
            },
            playGray() {
                this.play(2)
            },
            async play(side) {
                if (!this.isAuth) {
                    return
                }

                this.isBetSending = true;

                this.$bus.$emit(ROULETTE.SEND_TEAM_GAME_BET, {sum: +this.bet, betType: side, gameId: this.game.id});
            },
            async gameEnded() {
                const winSide = this.game.winSide;
                const idx = this.slides.findIndex((itm, idx) => idx > 50 && itm === winSide)

                this.$refs['hooper'].slideTo(idx)

                setTimeout(async () => {
                    this.$notify({
                        group: 'foo',
                        title: 'Message',
                        text: `Выйграли ${typesNameRus[winSide]}`
                    })


                    this.winSide = winSide;
                    this.isBetSending = false;
                    this.isShowColorWinModal = true;
                    this.game = await this.$api.roulette.getGame()

                    setTimeout(() => {
                        this.$refs['hooper'].$el.classList.remove('hooper-animate-class')
                        this.$refs['hooper'].slideTo(10)

                        setTimeout(async () => {
                            this.$refs['hooper'].$el.classList.add('hooper-animate-class')

                            const statistics = await this.$api.roulette.getStats()
                            const gameRes = await this.$api.roulette.getGame()

                            this.game = gameRes
                            this.statistics = statistics
                        }, 100)
                    }, 1000)
                }, 7000);
            }
        },
        components: {
            Hooper,
            Slide
        }
    }
</script>
<style lang="scss">
    .roulette {
        margin-top: 50px;
        .slider {
          opacity: 0;

          &__active {
              opacity: 1;
              transition: all .5s ease-in-out;
           }
        }
    }
    .hooper-animate-class {
        .hooper-track {
            transition: all 6s !important;
        }
    }
    .hooper {
        outline: none;
        height: auto;
        border-radius: 50px;
        overflow: hidden;
    }
    .slider {
        margin-top: 30px;
        margin-bottom: 30px;
        border-radius: 50px;
        position: relative;
        .cursor {
            position: absolute;
            width: 35px;
            z-index: 999;
            left: calc(50% - 18px);
            filter: drop-shadow(2px 3px 6px black);
            bottom: -5px;

        }
    }
    .roulette {
        min-width: 0;
        overflow: hidden;
        .history {
            display: flex;
            width: 100%;
            justify-content: space-between;
            align-items: center;
            .label {
                font-size: 14px;
                color: #6d6f7c;
                margin-bottom: 13px;
            }

            .last-games {
                .items {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    .last-item {
                        display: flex;
                        align-items: center;
                        margin-right: 20px;
                        .circle {
                            height: 16px;
                            width: 16px;
                            border-radius: 100%;
                            margin-right: 4px;
                            &.green {
                                background: #3ebe25;
                            }
                            &.red {
                                background: #a40330;
                            }
                            &.gray {
                                background: #4e5266;
                            }

                        }
                        span {
                            color: #fff;
                            font-weight: bold;
                            font-size: 16px;
                        }
                    }
                }
            }
            .history-games {
                .history-items {
                    display: flex;
                    .history-item {
                        height: 32px;
                        width: 32px;
                        border-radius: 100%;
                        margin-right: 7px;
                        display: flex;
                        align-items: center;
                        background-position: center center;
                        background-repeat: no-repeat;
                        background-size: 16px 16px;
                        cursor: pointer;
                        justify-content: center;
                        &:last-child {
                            margin-right: 0;
                        }
                        &.red {
                            background-color: #a40330;
                            background-image: url(/images/icons/harley.png);
                        }
                        &.green {
                            background-color: #00ba47;
                            background-image: url(/images/icons/harley-green.png);
                        }
                        &.gray {
                            background-color: #393c46;
                            background-image: url(/images/icons/harley-gray.png);
                        }
                    }
                }
            }

        }
        .game__controls {
            .control__heading {
                font-weight: bold;
                font-size: 24px;
                color: #d7d8dc;
                text-align: center;
                margin-bottom: 25px;
                span {
                    color: #02ce50;
                    font-size: 24px;
                    font-weight: bold;
                }
            }
            .control__progress {
                width: 100%;
                height: 4px;
                border-radius: 5px;
                background: #272930;
                margin-bottom: 30px;
                .progress-fill {
                    height: 100%;
                    background: #38ad21;
                    border-radius: 5px;
                }
            }
            .control__buttons-wrapper {
                border-radius: 15px;
                background: rgba(57,60,70, 0.4);
                display: flex;
                margin-bottom: 30px;
                justify-content: space-between;
                align-items: center;
                padding: 8px 7px;
                .bet-sum {
                    display: flex;
                    padding-left: 13px;
                    flex-grow: 1;
                    align-items: center;
                    span {
                        font-size: 12px;
                        white-space: nowrap;
                        color: #737581;
                        margin-right: 17px;
                    }
                    img {
                        margin-right: 8px;
                    }
                    input {
                        width: 50%;
                        font-size: 14px;
                        color: #e6e8f4;
                        outline: none;
                        border: none;
                        height: 100%;
                        background: transparent;
                    }
                }
                .buttons {
                    align-items: center;
                    display: flex;
                    button {
                        padding: 0 10px;
                        height: 35px;
                        box-sizing: content-box;
                        min-width: 40px;
                        background: #393c46;
                        border-radius: 15px;
                        margin-right: 3px;
                        cursor: pointer;
                        outline: none;
                        border: none;
                        transition: 0.2s;
                        border-top: 1px solid #43464f;
                        &:last-child {
                            margin-right: 0;
                        }
                        &:hover {
                            background: #00b846;
                        }
                    }
                    span {

                        font-size: 12px;
                        color: #535561;
                        cursor: pointer;
                        margin-right: 14px;
                        align-items: center;
                        display: block;
                    }
                }
            }
            .bets-wrapper {
                display: flex;
                .bet {
                    flex: 1;
                    margin-right: 40px;
                    overflow: hidden;
                    &:last-child {
                        margin-right: 0;
                    }
                    .top-item {
                        background: rgba(57,60,70, 0.4);
                        padding: 0 10px;
                        padding-right: 0;
                        border-radius: 25px;
                        display: flex;
                        align-items: center;
                        width: 100%;
                        span {
                            color: #e6e8f4;
                            font-weight: bold;
                            font-size: 14px;
                        }
                        .bet-img {
                            width: 32px;
                            height: 32px;
                            img {
                                width: 32px;
                                height: 32px;
                                border-radius: 100%;
                            }

                            margin-right: 12px;
                        }
                        .button {
                            padding: 16px 38px;
                            outline: none;
                            border: none;
                            font-weight: bold;
                            color: #e6e8f4;
                            font-size: 14px;
                            border-radius: 25px;
                            cursor: pointer;
                            margin-left: auto;
                            &.red {
                                background: #a40330;
                            }
                            &.green {
                                background: #00ba47;
                            }
                            &.gray {
                                background: #393c46;
                            }
                        }
                    }
                    .label-top {
                        display: flex;
                        justify-content: space-between;
                        span {
                            color: #525464;
                            font-size: 14px;
                        }
                        padding: 20px 10px;
                        .coin_ship {
                            align-items: center;
                            display: flex;
                            img {
                                margin-right: 10px;
                            }
                            em {
                                font-size: 14px;
                                font-style: normal;
                                color: #e6e8f4;
                            }
                        }
                    }
                    .bet-items {
                        .bet-item {
                            display: flex;
                            border-radius: 25px;

                            align-items: center;
                            &:nth-child(odd) {
                                background: rgba(62,63,67, 0.2);
                            }
                            padding: 10px 15px;
                            .avatar {
                                img {
                                    width: 32px;
                                    border-radius: 100%;
                                }
                                width: 32px;
                                height: 32px;
                                margin-right: 18px;
                            }
                            .nickname {
                                font-size: 14px;
                                font-weight: bold;
                                color: #e6e8f4;
                            }
                            .coin_ship {
                                display: flex;
                                align-items: center;
                                img {
                                    margin-right: 10px;
                                }
                                span {
                                    font-size: 14px;
                                    color: #e6e8f4;
                                }
                                margin-left: auto;
                            }
                        }
                    }
                }
            }
        }
        .slider {
            width: 100%;
            padding: 15px 10px;
            background: rgba(57,60,70, 0.2);
            .slider-item {
                text-align: center;
                padding: 0 5px;
                img {
                    border-radius: 100%;

                }
            }
        }
    }
    .label-sm {
        display: none;
    }
    .show-xs {
        display: none;
    }
    @media screen and (max-width: 1600px) {
        .roulette .game__controls .bets-wrapper .bet .top-item {
            width: 100%;
            flex-wrap: wrap;
            padding-top: 11px;
        }
        .roulette .game__controls .bets-wrapper .bet .top-item .button {
            margin-top: 10px;
            margin-left: -10px;
            width: calc(100% + 10px);
            text-align: center;
        }
    }

    @media screen and (max-width: 992px) {
        .roulette .game__controls .bets-wrapper .bet {
            margin-right: 25px;
            &:last-child {
                margin-right: 0;
            }
        }
    }

    @media screen and (max-width: 1250px) {
        .hidden-md {
            display: none !important;
        }
    }
    @media screen and (max-width: 768px) {
        .roulette .game__controls .bets-wrapper .bet .bet-items .bet-item {
            padding: 8px 10px;
            .avatar {
                width: 26px;
                height: 26px;
                margin-right: 6px;
                img {
                    width: 26px;
                    border-radius: 100%;
                }
            }
            .nickname {
                font-size: 12px;
            }

        }
        .roulette .game__controls .bets-wrapper .bet .bet-items .bet-item .coin_ship img {
            margin-right: 6px;
        }
    }
    @media screen and (max-width: 670px) {
        .roulette .game__controls .control__buttons-wrapper .buttons span {
            display: none !important;
        }
        .hidden-sm {
            display: none !important;
        }
    }

    @media screen and (max-width: 500px) {
        .roulette .game__controls .control__buttons-wrapper .bet-sum span {
            display: none;
        }
        .label-sm {
            display: block;
            font-size: 12px;
            color: #737683;
            margin-bottom: 15px;
        }
        .roulette .game__controls .control__buttons-wrapper .buttons button {
            min-width: 30px;
        }
    }

    @media screen and (max-width: 575px) {
        .roulette .slider {
            width: 100%;
            padding: 10px 10px;
            background: rgba(57, 60, 70, 0.2);
            padding-bottom: 7px;
            .cursor {
                width: 26px;
                left: calc(50% - 9px);
            }
        }
        .roulette .history .history-games .history-items .history-item {
            height: 20px;
            width: 20px;
            background-size: 10px 10px;
        }
        .roulette .history .last-games .items .last-item {
            margin-right: 9px;
        }
        .roulette .history .label {
            font-size: 12px;
        }
        .roulette .history .last-games .items .last-item span {
            font-size: 13px;
        }
        .roulette .game__controls .control__heading {
            font-size: 18px;
            span {
                font-size: 18px;
            }
        }
        .roulette .game__controls .bets-wrapper .bet {
            margin-right: 8px;
            &:last-child {
                margin-right: 0;
            }
        }

        .show-xs {
            display: block;
        }
        .roulette .game__controls .bets-wrapper .bet .top-item .button {
            padding: 15px 10px;
            font-size: 10px;
        }
        .roulette .game__controls .control__buttons-wrapper {
            margin-bottom: 20px;
        }

        .bet-items {
            display: none;
        }
        .roulette .game__controls .bets-wrapper .bet .label-top span {
            display: none;
        }
        .roulette .game__controls .bets-wrapper .bet .label-top .coin_ship {
            width: 100%;
            display: flex;
            justify-content: center;
        }

    }

    @media screen and (max-width: 420px) {
        .roulette .slider .slider-item img {
            width: 45px;
        }
    }

</style>

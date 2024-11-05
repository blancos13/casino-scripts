<template>
    <div class="crash">
        <div class="left-block">
            <game-stats :settings="settings" type="crash"></game-stats>
        </div>
        <div class="right-block">
            <div class="timeout">{{ secondsToStart }}</div>
            <div class="game">
                <div class="crash-panel">
                    <div class="crash-x" :style="{'color': (fail ? '#c9033a' : '')}">
                        {{ x.toFixed(2) }} x
                    </div>
                    <canvas id="chart" ref="chart"></canvas>
                </div>

                <div class="controls">
                    <div class="d-flex">
                        <div class="controls-item">
                            <div class="label">{{ $t('crash.bet') }}</div>
                            <div class="controls-item__content">
                                <div class="item__content-input">
                                    <div @click="bet = (+bet) - 1" :disabled="isBet" class="minus">-</div>
                                    <input type="number" v-model.number="bet" :disabled="isBet" step="2" placeholder="1.0" value="1.0">
                                    <div @click="bet = (+bet) + 1" :disabled="isBet" class="plus">+</div>
                                </div>

                                <div class="controls-item__buttons">
                                    <button @click="bet = (+bet) * 0.1" :disabled="isBet" class="item__buttons-button">0.10x</button>
                                    <button @click="bet = (+bet) * 1" :disabled="isBet" class="item__buttons-button">1.0x</button>
                                    <button @click="bet = (+bet) * 2.5" :disabled="isBet" class="item__buttons-button">2.5x</button>
                                    <button @click="bet = (+bet) * 5" :disabled="isBet" class="item__buttons-button">5.00x</button>
                                </div>
                                <div class="controls-item__buttons">
                                    <button @click="bet = (+bet) * 10" :disabled="isBet" class="item__buttons-button">10x</button>
                                    <button @click="bet = (+bet) * 20" :disabled="isBet" class="item__buttons-button">20x</button>
                                    <button @click="bet = (+bet) * 30" :disabled="isBet" class="item__buttons-button">30x</button>
                                    <button @click="bet = (+bet) * 50" :disabled="isBet" class="item__buttons-button">50x</button>
                                </div>
                            </div>
                        </div>
                        <div class="controls-item">
                            <div class="label">{{ $t('crash.autowithdraw') }}</div>
                            <div class="controls-item__content">
                                <div class="item__content-input">
                                    <div @click="pay = (+pay) - 1" :disabled="isBet" class="minus">-</div>
                                    <input type="number" v-model.number="pay" :disabled="isBet" step="2" placeholder="1.0" value="1.0">
                                    <div @click="pay = (+pay) + 1" :disabled="isBet" class="plus">+</div>
                                </div>

                                <div class="controls-item__buttons">
                                    <button @click="pay = (+pay) * 0.1" :disabled="isBet" class="item__buttons-button">0.10x</button>
                                    <button @click="pay = (+pay) * 1.0" :disabled="isBet" class="item__buttons-button">1.0x</button>
                                    <button @click="pay = (+pay) * 2.5" :disabled="isBet" class="item__buttons-button">2.5x</button>
                                    <button @click="pay = (+pay) * 5" :disabled="isBet" class="item__buttons-button">5.00x</button>
                                </div>
                                <div class="controls-item__buttons">
                                    <button @click="pay = (+pay) * 10" :disabled="isBet" class="item__buttons-button">10x</button>
                                    <button @click="pay = (+pay) * 20" :disabled="isBet" class="item__buttons-button">20x</button>
                                    <button @click="pay = (+pay) * 30" :disabled="isBet" class="item__buttons-button">30x</button>
                                    <button @click="pay = (+pay) * 50" :disabled="isBet" class="item__buttons-button">50x</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="!isAuth">
                            <button @click="$root.$emit('openLogin')" class="btn crash__play-button">{{ $t('auth_for_play') }}</button>
                    </div>
                    <div v-else>
                        <div @click="isStart ? take() : crash()"
                            class="btn crash__play-button"
                            ref="gameButton">{{ $t('games.game_button_play_start') }}</div>
                    </div>
                </div>
            </div>
            <div class="history">
                <div class="label">
                    {{ $t('history.heading') }}
                </div>
                <div class="history-body">
                    <div
                        v-for="(itm, idx) in settings.history"
                        :key="idx"
                        :class="['history-item', { 'red': itm.prize === 0 }]">
                        {{ itm.prize ? itm.prize.toFixed() : 0 }} x
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import GameStats from "../components/GameStats";
    import Chart from 'chart.js';
    import * as moment from 'moment';
    import { getMeta } from '../utils/getMeta';
    import { CRASH } from '../constants/socket';

    export default {
        name: 'Crash',
        metaInfo() {
            return getMeta(this.seo)
        },
        data() {
            return {
                seo: { en: [], ru: [] },
                chart: null,
                isBet: false,
                isStart: false,
                secondsClientServerDiff: 0,
                game: { date: new Date() },
                now: moment(),
                bet: 1,
                pay: 1,
                t: null,
                x: 1.00,
                fail: false,
                settings: {}
            }
        },
        async created() {
            const result = await this.$api.admin.getCrashSettings()
            this.settings = await this.$api.crash.getStats()
            const game = await this.$api.crash.getGame()

            if (result.error) {
                console.error('Error get crash data: ', result.message)
                return
            }

            this.seo = result.seo
            // this.game.id = game.id
        },
        computed: {
            balance() {
                return +this.$store.state.user.balance
            },
            isAuth() {
                return this.$store.getters.isAuth
            },
            secondsToStart() {
                return Math.max(0, moment(this.game.date).diff(moment(this.now).add(this.secondsClientServerDiff, 's'), 'seconds'))
            },
        },
        methods: {
            initChart() {
                if (this.chart != null) {
                    this.chart.destroy();
                    this.chart = null;
                }

                let ctx = this.$refs['chart'];
                ctx.height = 450;

                this.chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['0s', '3s', '6s', '10s'],
                        datasets: [{
                            label: '',
                            data: [0, 0, 0, 0],
                            backgroundColor: 'rgb(0 186 71 / 0.3)',
                            borderColor: '#00ba47',
                            borderWidth: 8}
                        ]
                    },
                    options: {
                        elements: {
                            point:{
                                radius: 0
                            }
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        bezierCurve: false,
                        layout: {
                            padding: {
                                left: 0,
                                right: 0,
                                top: 30,
                                bottom: 20
                            }
                        },
                        legend: {
                            display: false
                        },
                        tooltips: {
                            enabled: false
                        },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    maxTicksLimit: 20,
                                    min: 0,
                                    precision: 0,
                                    callback: function (value) {
                                        return 'x' + parseFloat(value + 1).toFixed(1);
                                    }
                                }
                            }],
                            xAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    display: false,

                                }
                            }]
                        }
                    }
                });
            },
            async take() {
              this.isStart = false;
                if (!this.isAuth) {
                    return
                }

                if (!this.game.id) {
                    return
                }

                const result = await this.$api.crash.take(this.game.id)

                if (result.error_message) {
                    this.$notify({
                        group: 'foo',
                        title: 'Error',
                        type: 'error',
                        text: result.error_message
                    })
                    delete this.game.id
                    this.$refs.gameButton.innerHTML = `Играть`

                    return
                }

                // if (json.error != null) {
                //     if (json.error === -1 || json.error === 0) {
                //         swap();
                //         __id = null;
                //         updateBalance();
                //     }
                //     return;
                // }

                // $('.c_f').toggleClass('c_f-progress', false);
                // $('.c_f').toggleClass('c_f-win', true);

                const profit = parseFloat(result.profit).toFixed(2);
                this.$refs.gameButton.innerHTML = (profit.mul >= 1 ? 'Вы выиграли ' : '') + profit + ' руб.'


                const left = parseInt((result.crash - parseFloat(result.mul).toFixed(2)) / 0.9);
                for (let i = 0; i < left - 2; i++) {
                    this.chart.data.datasets[0].data.unshift(0);
                    this.chart.data.labels[this.chart.data.labels.length] = this.chart.data.labels.length * 3 + 's';
                }

                const length = this.chart.data.datasets[0].data.length;
                this.chart.data.datasets[0].data[length - 1] = parseFloat(result.crash).toFixed(2);

                for (var j = 0; j < length - 1; j++) {
                    if (j < 1) continue;
                    this.chart.data.datasets[0].data[length - 1 - j] = parseFloat(this.chart.data.datasets[0].data[length - 1]) / (1.2 * j);
                }

                this.chart.update();

                delete this.game.id
                this.$refs.gameButton.innerHTML = 'Играть'
            },
            async crash() {
                if (!this.isAuth) {
                    return
                }

                if (+this.bet < 0.1) {
                    this.$notify({
                        group: 'foo',
                        title: 'Error',
                        type: 'error',
                        text: 'Минимальная ставка 0.1'
                    })
                    this.bet = 0.1
                    return
                }

                if (+this.bet > this.balance) {
                    this.$notify({
                        group: 'foo',
                        title: 'Error',
                        type: 'error',
                        text: 'Ставка не может превышать баланс'
                    })
                    this.bet = this.balance
                    return
                }

                this.initChart();

                const result = await this.$api.crash.crash(this.bet)

                if (result.error_message) {
                    this.$notify({
                        group: 'foo',
                        title: 'Error',
                        type: 'error',
                        text: result.error_message
                    })
                    return
                }

                this.game.id = result.id

                this.$bus.$emit(CRASH.SEND_CRASH_GAME_BET, {sum: +this.bet, withdraw: +this.pay, gameId: this.game.id});
                this.isStart = true;

                let __chart = this.chart;
                let __t = this.t;
                let tick = async () => {
                    if (!this.game.id) return;

                    const resTick = await this.$api.crash.tick(this.game.id)

                    if (__t === -1) return

                    if (resTick.error_message) {
                        if (resTick.bet) {
                            this.$notify({
                                group: 'foo',
                                title: 'Error',
                                type: 'error',
                                text: `Вы проиграли ${resTick.bet} руб.`
                            })
                        } else {
                            this.$notify({
                                group: 'foo',
                                title: 'Error',
                                type: 'error',
                                text: this.$t(resTick.error_message)
                            })
                        }
                        this.isStart = false;
                        return;
                    }

                    let mul = resTick.mul.toFixed(2);
                    let profit = (resTick.bet * (mul - 1)).toFixed(2);
                    profit = mul < 1 ? this.bet.toFixed(2) : profit;

                    this.x = resTick.mul
                    this.$refs.gameButton.innerHTML = `Забрать ${profit} руб.`

                    const length = __chart.data.datasets[0].data.length;
                    if (__chart.data.datasets[0].data[length - 1] >= 20) return;
                    __chart.data.datasets[0].data[length - 1] += 0.033;

                    for (let i = 0; i < length - 1; i++) {
                        if (i < 1) continue;
                        __chart.data.datasets[0].data[length - 1 - i] = parseFloat(__chart.data.datasets[0].data[length - i]) / 2.0;
                    }
                    __chart.update();

                    __t += 100;
                    setTimeout(tick, 50);

                    if (__t >= 3000 && __t % 3000 === 0) {
                        if (__chart.data.labels.length * 3 > 60) return;
                        __chart.data.labels[__chart.data.labels.length] = __chart.data.labels.length * 3 + 's';
                        __chart.data.datasets[0].data.unshift(0);

                        __chart.update();
                    }
                    if (parseFloat(mul) > 20) await this.take();
                }
                tick();
            },
        },
        mounted() {
            this.initChart();

            setInterval(() => this.now = moment(), 1000);

            this.$bus.$on(CRASH.CRASH_GAME_BET, game => {
                console.log('TEAM_GAME_BET ', game);
                // this.game = JSON.parse(game);
            })
            this.$bus.$on(CRASH.CRASH_GAME_START, game => {
                console.log('TEAM_GAME_START ', game);
                // const data = JSON.parse(game);
                // this.secondsClientServerDiff = moment(data.serverDate).diff(moment(), 's');
                // this.game = data;
            })
            this.$bus.$on(CRASH.CRASH_GAME_RESULT, game => {
                console.log('TEAM_GAME_RESULT ', game);
                // this.game = JSON.parse(game);
                // this.gameEnded();
            })

            this.$bus.$on(CRASH.CRASH_GAME_BET_ANSWER, betAnswer => {
                console.log('TEAM_GAME_BET_ANSWER ', betAnswer);
                // this.isBetSending = false;
                // const data = JSON.parse(betAnswer);

                // if (data.status === 400) {
                //     if (data.error === 'NOT_ENOUGH_BALANCE') {
                //         this.isShowNotEnoughMoneyModal = true;
                //     } else {
                //         this.errorText = data.error;
                //         this.isShowErrorModal = true;
                //     }
                // }
            })
        },
        components: {
            'game-stats': GameStats,
        }
    }
</script>
<style scoped lang="scss">
    #chart {
        background: url(/images/grid.png);
        background-position-x: 38px;
        background-position-y: -37px;
        background-size: 100% 100%;
        background-repeat: no-repeat;
    }
    .crash-x {
        position: absolute;
        left: 25%;
        font-size: 120px;
        color: #fff;
        top: 30%;
    }
    .crash-panel {
        position: relative;
    }
    .crash {
        min-width: 0;
        overflow: hidden;
        display: flex;
        align-items: flex-start;

        > div {

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
            display: flex;
            flex: 2;
            padding: 24px;

            .game {
                overflow: hidden;
                flex-grow: 1;
                margin-right: 24px;

                .controls {
                    margin-top: 30px;
                    border-radius: 10px;
                    background: #202126;
                    padding: 35px 30px;

                    .controls-item {
                        flex: 1;

                        &:first-child {
                            margin-right: 24px;
                        }

                        .label {
                            font-size: 16px;
                            color: #6d6f7c;
                            margin-bottom: 24px;
                        }

                        .item__content-input {
                            margin-bottom: 14px;
                            background: #2b2c31;
                            border-radius: 5px;
                            padding: 13px 0;
                            align-items: center;
                            display: flex;

                            .minus {
                                padding: 0px 12px;
                                height: 100%;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 18px;
                                color: #6a6d79;
                                border-right: 1px solid #383940;
                            }

                            .plus {
                                padding: 0px 12px;
                                height: 100%;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 18px;
                                color: #6a6d79;
                                border-left: 1px solid #383940;
                            }

                            input {
                                flex-grow: 1;
                                height: 18px;
                                outline: none;
                                border: none;
                                background: transparent;
                                text-align: center;
                                font-size: 18px;
                                display: flex;
                                align-items: center;
                                color: #ebebeb;
                            }
                        }

                        .controls-item__buttons {
                            display: flex;
                            margin-bottom: 9px;

                            &:last-child {
                                margin-bottom: 0;
                            }

                            .item__buttons-button {
                                margin-right: 7px;
                                flex: 1;
                                padding: 0;
                                height: 38px;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                outline: none;
                                background: transparent;
                                border: 1px solid #343539;
                                border-radius: 5px;
                                font-size: 14px;
                                cursor: pointer;
                                color: #6d6f7c;
                                transition: 0.2s;

                                &:hover {
                                    background: #343539;
                                    color: #cecece;
                                }

                                &:last-child {
                                    margin-right: 0;
                                }
                            }
                        }
                    }
                }

                .crash-panel {
                    height: 450px;
                    width: 100%;
                    position: relative;
                    display: flex;
                    background-size: 100% 100%;
                    flex-grow: 1;
                }
            }

            .history {
                min-width: 155px;
                width: 155px;
                border-radius: 10px;
                padding: 20px 18px;
                background: #202126;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                max-height: 820px;

                .label {
                    font-size: 16px;
                    color: #6d6f7c;
                }

                .history-body {
                    overflow-y: auto;
                    margin-top: 20px;
                    width: 100%;
                    flex-grow: 1;
                    padding-right: 17px;

                    &::-webkit-scrollbar {
                        width: 4px;
                    }

                    &::-webkit-scrollbar-track {
                        background: #272930;
                    }

                    &::-webkit-scrollbar-thumb {
                        background-color: #008533;
                        border-radius: 5px;
                    }

                    .history-item {
                        width: 100%;
                        height: 36px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 5px;
                        background: rgba(0, 185, 82, 0.12);
                        margin-bottom: 7px;
                        color: rgba(0, 185, 82, 1);

                        &:last-child {
                            margin-bottom: 0;
                        }

                        &.red {
                            color: rgba(201, 3, 58, 1);
                            background: rgba(201, 3, 58, 0.12);
                        }

                        &.gray {
                            color: rgba(105, 107, 119, 1);
                            background: rgba(105, 107, 119, 0.12);
                        }
                    }
                }
            }
        }

    }

    .crash__play-button {
        padding: 20px 0;
        outline: none;
        text-align: center;
        border: none;
        cursor: pointer;
        background: #00ba47;
        font-size: 14px;
        margin-top: 30px;
        width: 100%;
        display: block;
        border-radius: 5px;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        /* display: none; <- Crashes Chrome on hover */
        -webkit-appearance: none;
        margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
    }

    @media screen and (max-width: 1850px) {
        .crash .right-block .game .controls .controls-item .controls-item__buttons {
            flex-wrap: wrap;

            .item__buttons-button {
                flex: unset;
                width: calc(50% - 3.5px);
                margin-bottom: 7px;

                &:nth-child(2n) {
                    margin-right: 0;
                }
            }
        }
        .crash .right-block {
            flex-wrap: wrap;

            .game {
                width: 100%;
                margin-right: 0;
                margin-bottom: 20px;
            }
        }
        .crash .right-block .history {
            min-width: 100%;
            width: 100%;
        }
    }

    @media screen and (max-width: 1200px) {
        .crash {
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
                padding: 0;
            }
        }
    }


    @media screen and (max-width: 1580px) {
        .crash .right-block .game .controls {
            > .d-flex {
                flex-wrap: wrap;

                .controls-item {
                    margin-right: 0;
                    width: 100%;
                    flex: unset;
                    margin-bottom: 20px;

                    &:last-child {
                        margin-bottom: 0;
                    }
                }
            }
        }
    }

    @media screen and (max-width: 575px) {
        .crash .right-block .game .crash-panel {
            height: 300px;
        }
        .crash .right-block .game .controls {
            padding: 30px 15px;
        }
        .crash .right-block .game .controls .controls-item .item__content-input input {
            overflow: hidden;
        }
        .crash .right-block .game .controls {
            padding-bottom: 15px;
        }
        .crash-x {
            font-size: 64px;
        }
    }

    @media screen and (max-width: 400px) {
        .crash .right-block .game .crash-panel {
            height: unset;

            &:after {
                margin-bottom: 80%;
                content: "";
                display: block;
            }
        }
    }
</style>

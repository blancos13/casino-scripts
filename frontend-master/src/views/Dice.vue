<template>
    <div class="dice">
        <div class="left-block">
            <game-stats :settings="settings" type="dice"></game-stats>
        </div>
        <div class="right-block">
            <div class="dice__heading">
                Игра:<br>
                Dice
            </div>
            <div class="dice__top-indicators">
                <div class="top-indicators__left">
                    <div class="label">Сумма ставки:</div>
                    <div class="top-indicators__content">
                        <div class="top-indicators__content-input">
                            <img src="/images/icons/coin.png" alt="">
                            <input type="text" v-model="bet" placeholder="1" value="1">
                        </div>
                        <div class="top-indicators__content-buttons">
                            <button @click="bet = (+bet) + 1" class="hidden-xs">+1</button>
                            <button @click="bet = (+bet) + 10" class="hidden-xs">+10</button>
                            <button @click="bet = (+bet) + 100" class="hidden-xs">+100</button>
                            <button @click="bet = (+bet / 2).toFixed(2)">1/2</button>
                            <button @click="bet = (+bet) * 2">x2</button>
                            <button @click="bet = balance">Макс.</button>
                        </div>
                    </div>
                </div>
                <div class="top-indicators__right">
                    <div class="label">Возможный выигрыш:</div>
                    <div class="top-indicators__content">
                        <img src="/images/icons/coin.png" alt="">
                        <span>{{ (+winNumber).toLocaleString() }}</span>
                    </div>
                </div>
            </div>
            <div class="dice__controls">
                <div class="dice__controls-heading">
                    <span>Изменить шанс:</span>
                    <span v-if="!directionGame" class="hidden-mobile">Больше</span>
                    <span v-else class="hidden-mobile">Меньше</span>
                </div>
                <div class="d-flex w-100 hidden-mobile">
                    <div class="dice__control">
                        <div class="control__input">
                            <img src="/images/icons/discount.png" alt="">
                            <input v-model="userChance" @keyup="changedUserChance" type="text" value="1" placeholder="1">
                        </div>
                        <div class="control_buttons">
                            <button @click="userChance = Math.max((+userChance) - 1, settings.minChance); changedUserChance();">-</button>
                            <button @click="userChance = Math.min((+userChance) + 1, settings.maxChance); changedUserChance();">+</button>
                        </div>
                    </div>
                    <div @click="refresh" class="dice__middle-refresh hidden-mobile">
                        <img src="/images/icons/refresh.png" alt="">
                    </div>
                    <div class="dice__control">
                        <div class="control__input">
                            <input type="text" :value="(+chance).toFixed(2)" readonly>
                        </div>
                        <!-- <div class="control_buttons">
                            <button @click="setMinWin">-</button>
                            <button @click="setMaxWin">+</button>
                        </div> -->
                    </div>
                </div>

                <div class="d-flex w-100 show-mobile">
                    <div class="left-show">
                        <div class="dice__control">
                            <div class="control__input">
                                <img src="/images/icons/discount.png" alt="">
                                <input type="text" v-model="userChance" @keyup="changedUserChance"  value="1" placeholder="1">
                            </div>
                            <div class="control_buttons">
                                <button @click="userChance = Math.max((+userChance) - 1, settings.minChance); changedUserChance()">-</button>
                                <button @click="userChance = Math.min((+userChance) + 1, settings.maxChance); changedUserChance()">+</button>
                            </div>
                        </div>
                        <span v-if="!directionGame">Больше</span>
                        <span v-else>Меньше</span>
                        <div class="dice__control">
                            <div class="control__input">
                                <input type="text" :value="(+chance).toFixed(2)" placeholder="1" readonly>
                            </div>
                            <!-- <div class="control_buttons">
                                <button @click="setMinWin">-</button>
                                <button @click="setMaxWin">+</button>
                            </div> -->
                        </div>
                    </div>
                    <div @click="refresh" class="dice__middle-refresh">
                        <img src="/images/icons/refresh-2.png" alt="">
                    </div>
                </div>
            </div>

            <div class="dice__panel">
                <div class="panel">
                    <div class="w-100">
                        <div class="panel__heading">Шанс на победу</div>
                        <div class="panel__value">{{ (+winProcent).toFixed(2) }}%</div>
                    </div>
                </div>
                <div class="panel">
                    <div class="w-100">
                        <div class="panel__heading">Выплата</div>
                        <div class="panel__value green">{{ (+winNumber).toFixed(2) }}</div>
                    </div>
                </div>
            </div>
            <div class="dice__indicator-line">
                <vue-slider
                    v-model="chance"
                    class="dice__slider"
                    @change="changedChance"
                    :min="0"
                    :max="100"
                    :interval="1"/>
            </div>
            <div class="dice__indicator-labels">
                <div class="label">0%</div>
                <div class="label">100%</div>
            </div>
            <div v-if="!isAuth">
                <button @click="$root.$emit('openLogin')" class="btn dice__play-button">{{ $t('games.auth_button') }}</button>
            </div>
            <div v-else>
                <div @click="run" class="btn dice__play-button">{{ $t('games.game_button_play_start') }}</div>
            </div>
        </div>
    </div>
</template>
<script>
    import VueSlider from 'vue-slider-component'
    import 'vue-slider-component/theme/antd.css'
    import GameStats from "../components/GameStats";
    import { getMeta } from '../utils/getMeta';
    import { DICE } from '../constants/socket'
    import Vue from 'vue';

    const getWinRate = (direction, chancePercent) => {
      if (direction)
        return 100 / chancePercent - 1;
      return 100 / (100 - chancePercent) - 1;
    }

    const CHANGED_USER_CHANCE = 0;
    const CHANGED_CHANCE = 1;

    const DIRECTION_MORE = false;
    const DIRECTION_LESS = true;

    export default {
        name: 'Dice',
        metaInfo() {
            return getMeta(this.seo)
        },
        watch: {
            winNum(val) {
              if (this.changedStatus !== CHANGED_CHANCE) return;
              this.userChance = val;
            },
            userChance(val) {
              if (this.changedStatus !== CHANGED_USER_CHANCE) return;
              let chance = val;

              if (chance < this.minUserChance) {
                this.userChance = this.minUserChance;
              }

              if (chance > this.maxUserChance) {
                this.userChance = this.maxUserChance;
              }

              const gain = chance / (1 - (this.settings.commission / 100))

              const percent = (100 / gain).toFixed(2);

              this.chance = (this.directionGame) ? percent : 100 - percent;
            },
            bet(val) {
                if (val < 0.1) {
                    this.bet = 0.1
                    return
                }

                if (val > this.balance) {
                    this.bet = this.balance
                }
            },
            chance(val) {
                if (+val < +this.settings.minChance) {
                    this.chance = +this.settings.minChance;
                }

                if (+val > +this.settings.maxChance) {
                    this.chance = +this.settings.maxChance;
                }
            }
        },
        data() {
            return {
                userChance: 85,
                isBetting: false,
                bet: 1,
                chance: 85,
                seo: { en: [], ru: [] },
                settings: {},
                changedStatus: null,
                directionGame: DIRECTION_MORE,
            }
        },
        methods: {
            computedChance(chance) {
                const percent = (!this.directionGame) ? 100 - chance : chance;

                const gain = 100 / percent;

                const commision = gain * (this.settings.commission / 100);

                return (gain - commision).toFixed(2);
            },
            changedUserChance() {
              this.changedStatus = CHANGED_USER_CHANCE;
            },
            changedChance() {
              this.changedStatus = CHANGED_CHANCE;
                if (+this.chance < +this.settings.minChance) {
                    this.chance = +this.settings.minChance;
                }

                if (+this.chance > +this.settings.maxChance) {
                    this.chance = +this.settings.maxChance;
                }
                Vue.set(this, 'chance', this.chance);
            },
            refresh() {
                this.chance = 100 - this.chance;
                this.directionGame = !this.directionGame;
            },
            run() {
                if (!this.isAuth) {
                    return
                }

                // if (this.isBetting) {
                //     return;
                // }

                this.isBetting = true;
                const gameParams = { gameName: 'DICE', bet: +this.bet, value: +this.chance, direction: this.directionGame }
                console.log(gameParams);
                this.$bus.$emit('PLAY_GAME', gameParams);
            },
            gameEnded(result) {
                if (result.result) {
                    this.$notify({
                        group: 'foo',
                        title: 'Message',
                        text: this.$t('dice.win')
                    })

                } else {
                    this.$notify({
                        group: 'foo',
                        type: 'error',
                        title: 'Error',
                        text: this.$t('dice.win')
                    })
                }

                this.isBetting = false;
            },
        },
        computed: {
            winProcent() {
              return (this.directionGame) ? this.chance : 100 - this.chance;
            },
            minUserChance() {
              return this.computedChance(this.settings.minChance)
            },
            maxUserChance() {
              return this.computedChance(this.settings.maxChance)
            },
            winNum() {
                if (this.changedStatus === CHANGED_USER_CHANCE) return this.userChance;

                return this.computedChance(this.chance);
            },
            winNumber() {
              return this.winNum * this.bet - this.bet;
            },
            balance() {
                return +this.$store.state.user.balance
            },
            isAuth() {
                return this.$store.getters.isAuth
            },
        },
        async created() {
            const result = await this.$api.admin.getDiceSettings()
            this.settings = await this.$api.dice.getStats()

            if (result.error) {
                console.error('Error get dice data: ', result.message)
                return
            }

            this.seo = result.seo

            this.settings = {
                ...this.settings,
                ...result
            }

            this.chance = this.settings.defaultChance
            this.userChance = this.settings.defaultChance
        },
        mounted() {
          this.$bus.$addGame('DICE', (data) => {
            console.log('update', data)
          }, (data) => {
            console.log('finish', data)
          })

            this.$bus.$on(DICE.DICE_BET_RESULT, betAnswer => {
                betAnswer = JSON.parse(betAnswer);

                if (betAnswer.status === 200) {
                    this.gameEnded(betAnswer.result)
                } else if (betAnswer.status === 400) {
                    this.isBetting = false;

                    if (betAnswer.error === 'NOT_ENOUGH_BALANCE') {
                        this.$notify({
                            group: 'foo',
                            type: 'info',
                            title: 'Уведомление!',
                            text: this.$t('games.errors.balance')
                        })
                    } else {
                        this.$notify({
                            group: 'foo',
                            type: 'info',
                            title: 'Уведомление!',
                            text: betAnswer.error
                        })
                    }
                }
            });
        },
        components: {
            'game-stats': GameStats,
            'vue-slider': VueSlider
        }
    }
</script>
<style lang="scss">
    .dice {
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
            .dice__top-indicators {
                display: flex;
                margin-top: 26px;
                .label {
                    font-size: 12px;
                    color: #737581;
                    margin-bottom: 15px;
                }
                .top-indicators__left {
                    flex: 2;
                    margin-right: 12px;
                }
                .top-indicators__right {
                    flex: 1;
                }
                .top-indicators__content {
                    background: #2b2c31;
                    height: 50px;
                    padding: 8px;
                    border-radius: 5px;
                    display: flex;
                    justify-content: space-between;
                }
                .top-indicators__left {
                    .top-indicators__content {
                        .top-indicators__content-input {
                            padding-left: 10px;
                            display: flex;
                            align-items: center;
                            img {
                                margin-right: 7px;
                            }
                            input {
                                outline: none;
                                border: none;
                                height: 100%;
                                background: transparent;
                                font-size: 14px;
                                color: #e6e8f4;
                                width: 75px;
                            }
                        }
                        .top-indicators__content-buttons {
                            display: flex;
                            justify-content: stretch;
                            width: 100%;
                            button {
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                background: #393c46;
                                height: 35px;
                                border: none;
                                transition: 0.2s;
                                flex: 1 1 auto;
                                &:hover {
                                    background: #00ba47;
                                }
                                cursor: pointer;
                                margin-right: 3px;
                                &:last-child {
                                    margin-right: 0;
                                }
                                border-radius: 5px;
                                border-top: 1px solid #2b2c31;
                                font-size: 12px;
                                color: #fff;
                                outline: none;
                            }
                        }
                    }
                }
                .top-indicators__right {
                    .top-indicators__content {
                        background: #2d3a30;
                        display: flex;
                        justify-content: flex-start;
                        padding-left: 15px;
                        align-items: center;
                        img {
                            margin-right: 13px;
                        }
                        span {
                            font-weight: bold;
                            color: #00ba47;
                            font-size: 18px;
                        }
                    }
                }

            }
            .dice__controls {
                display: flex;
                flex-wrap: wrap;
                .dice__controls-heading {
                    display: flex;
                    width: 100%;
                    margin-top: 20px;
                    margin-bottom: 15px;
                    justify-content: space-between;
                    span {
                        font-size: 12px;
                        color: #737581;
                    }
                }

                .dice__middle-refresh {
                    width: 64px;
                    min-width: 64px;
                    cursor: pointer;
                    height: 50px;
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #2b2c31;
                    border-top: 1px solid #36373c;
                    margin: 0 8px;
                    transition: 0.2s;
                    &:hover {
                        background: #00ba47;
                    }
                }
                .dice__control {
                    flex: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    height: 50px;
                    background: #2b2c31;
                    border-radius: 5px;
                    padding: 8px;
                    .control__input {
                        display: flex;
                        padding-left: 10px;
                        align-items: center;
                        img {
                            margin-right: 8px;
                        }
                        input {
                            background: transparent;
                            outline: none;
                            border: none;
                            width: 70px;
                            height: 100%;
                        }
                    }
                    .control_buttons {
                        display: flex;
                        align-items: center;
                        button {
                            margin-right: 3px;
                            border-radius: 5px;
                            background: #393c46;
                            outline: none;
                            border: none;
                            border-top: 1px solid #36373c;
                            display: block;
                            height: 35px;
                            cursor: pointer;
                            transition: 0.2s;
                            width: 50px;
                            &:hover {
                                background: #00ba47;
                            }
                            &:last-child {
                                margin-right: 0;
                            }
                        }
                    }
                }
            }
            .dice__panel {
                display: flex;
                background: #2b2c31;
                border-radius: 5px;
                padding: 10px;
                margin-top: 26px;
                .panel {
                    background: #202126;
                    width: calc(50% - 2.5px);
                    height: 150px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 5px;
                    &:first-child {
                        margin-right: 5px;
                        width: calc(50% - 2.5px);
                    }
                    .panel__heading {
                        font-size: 16px;
                        margin-bottom: 17px;
                        text-align: center;
                        color: #6d6f7c;
                        width: 100%;
                    }
                    .panel__value {
                        width: 100%;
                        text-align: center;
                        font-size: 36px;
                        color: #fff;
                        line-height: 30px;
                        font-weight: 600;
                        &.green {
                            color: #08f562;
                        }
                    }
                }
            }
            .dice__play-button {
                background: #3e3f43;
                border-radius: 5px;
                padding: 16px 0;
                width: 100%;
                display: block;
                outline: none;
                border: none;
                font-size: 14px;
                color: #ffffff;
                margin-top: 30px;
                text-align: center;
                cursor: pointer;

                &.active {
                    background: #00ba47;
                }
            }
            .dice__indicator-line {
                width: 100%;
                height: 6px;
                border-radius: 5px;
                display: flex;
                margin-top: 32px;
                position: relative;
                .dice__slider {
                    width: 100% !important;
                    margin-left: 0;
                    margin-right: 0;

                    .vue-slider-rail {
                        height: 6px;

                        background: linear-gradient(173deg, rgba(0,186,118,1) 0%, rgba(0,186,72,1) 100%);
                        border-radius: 5px;
                        box-shadow: 0px 0px 6px 1px rgba(16, 197, 83, 0.6);

                        .vue-slider-process {
                            box-shadow: 0px 0px 6px 1px rgba(244, 49, 58, 0.6);
                            background: linear-gradient(173deg, #f5313a 0%, #ca043a 100%);
                            border-radius: 5px;
                        }
                    }

                    .vue-slider-dot {
                        width: 20px !important;
                        height: 20px !important;

                        .vue-slider-dot-handle {
                            width: 20px;
                            height: 20px;

                            border: 0;
                            background-color: transparent;
                            background-image: url('/images/icons/sep.png');
                            background-size: 20px 20px;
                        }
                    }
                }
                .indicator-sep {
                    position: absolute;
                    height: 21px;
                    width: 21px;
                    border-radius: 100%;
                    top: -7.5px;
                    left: calc(50% - 10.5px);
                    cursor: pointer;
                }
                .reg-indicator {
                    width: 50%;
                    box-shadow: 0px 0px 6px 1px rgba(244, 49, 58, 0.6);
                    height: 100%;
                    background: linear-gradient(173deg, #f5313a 0%, #ca043a 100%);
                    border-radius: 5px;

                }
                .green-indicator {
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(173deg, rgba(0,186,118,1) 0%, rgba(0,186,72,1) 100%);
                    border-radius: 5px;
                    box-shadow: 0px 0px 6px 1px rgba(16, 197, 83, 0.6);

                }
            }
            .dice__indicator-labels {
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 15px;
                .label {
                    font-size: 14px;
                    color: #6d6f7c;
                }
            }
        }
        .dice__heading {
            font-size: 16px;
            color: #6d6f7c;
            margin-bottom: 28px;
            display: block;
        }
    }
    .show-mobile {
        display: none;
    }
    @media screen and (max-width: 1580px) {
        .dice .right-block .dice__top-indicators {
            flex-wrap: nowrap;
            .top-indicators__left {
                flex: 1 1 auto;
                margin-right: 10px;
            }
            .top-indicators__right {
                flex: unset;
                margin-bottom: 20px;
                width: 100%;
                min-width: 140px;
                max-width: 150px;
            }
        }
        .dice__controls > .d-flex {
            flex-wrap: wrap;

            .dice__control {
                /*flex: unset !important;*/
                /*width: 100%;*/
                &:first-child {
                    margin-bottom: 15px;
                }
            }
        }

        .dice .dice__heading {
            br {
                display: none;
            }
        }
    }
    @media screen and (max-width: 1350px) {

    }
    @media screen and (max-width: 1200px) {
        .dice {
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
    @media screen and (max-width: 1260px) {
        .dice .right-block .dice__top-indicators .top-indicators__left .top-indicators__content .top-indicators__content-input input {
            width: 60px;
        }
    }

    @media screen and (max-width: 575px) {
      .hidden-mobile {
            display: none !important;
        }
        .show-mobile {
            display: flex;
            flex-wrap: nowrap !important;
            .left-show {
                flex-grow: 1;
                align-items: center;
                span {
                    font-size: 12px;
                    color: #737683;
                    margin-top: 10px;
                    margin-bottom: 15px;
                    display: block;
                }
            }
            .dice__middle-refresh {
                margin-right: 0 !important;
                height: 100% !important;

                background: #26282e !important;

            }

        }
        .dice .right-block {
            padding: 30px 15px;
        }
        .dice .right-block .dice__controls .dice__control .control_buttons button {
            width: 45px;
        }
        .dice .right-block .dice__controls .dice__control .control__input input {
            width: 55px;
        }
        .dice .right-block .dice__controls .dice__middle-refresh {
            min-width: 56px;
        }
        .dice .right-block .dice__panel {
            margin-top: 15px;
        }
        .dice {
            .right-block {
                .dice__panel {
                    flex-wrap: wrap;
                    .panel {
                        height: 118px;
                        width: 100% !important;
                        margin-right: 0 !important;
                        &:first-child {
                            margin-bottom: 5px;
                        }
                        .panel__value {
                            font-size: 36px;
                        }
                        .panel__heading {
                            font-size: 14px;
                        }
                    }
                }
            }
        }
        .dice__play-button {
            padding: 16px 40px !important;
        }
        .right-block {
            padding-bottom: 15px !important;
        }
    }
</style>

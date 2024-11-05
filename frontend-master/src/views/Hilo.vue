<template>
    <div class="hilo">
        <div class="left-block">
            <game-stats :settings="settings" type="hilo"></game-stats>
        </div>
        <div class="right-block">
            <div class="right-top">
                <div class="hilo__heading">
                    Игра:<br>
                    Hilo
                </div>
                <div class="hilo__top-cards" style="min-height:64px">
                    <div
                        v-for="(itm, idx) in history"
                        :key="idx"
                        class="hilo__top-card"
                        :class="[ (itm.type === 'hearts' || itm.type === 'diamonds') && 'red' ]"
                        style="width:42px;height:64px">
                        <p style="font-weight:bold">{{ itm.value }}</p>
                        <i :class="deck.toIcon(itm)"/>
                    </div>
                </div>
                <div class="hilo__game-panel">
                    <div class="panel-control">
                        <div class="control__top">
                            <div class="top__indicators">
                                <div class="top__indicators-percent">{{ sets.high.percent_first }}.{{ sets.high.percent_second }}%</div>
                            </div>
                            <div class="top__button">
                                <button @click="flip('higher')">{{ buttons.high }}</button>
                            </div>
                            <div class="top__coef">
                                {{ sets.high.value_first }}.{{ sets.high.value_second }}x
                            </div>
                        </div>

                        <div class="control-input">
                            <div class="input__buttons">
                                <button @click="game.bet = 1.0">Сброс</button>
                                <button @click="(game.bet > 0 ? (game.bet = game.bet / 2) : '')">1/2</button>
                                <button @click="game.bet = game.bet * 2">x2</button>
                                <button @click="game.bet = balance">All</button>
                            </div>

                            <div class="input__field">
                                <div class="field__prev" @click="(game.bet > 1 ? game.bet = game.bet - 1 : '')">-</div>
                                <input type="number" step="2" placeholder="1.0" v-model.number="game.bet">
                                <div class="field__next" @click="game.bet++">+</div>
                            </div>
                        </div>

                        <div class="control__bottom">
                            <div class="bottom__indicators">
                                <div class="bottom__indicators-percent">{{ sets.low.percent_first }}.{{ sets.low.percent_second }}%</div>
                            </div>
                            <div class="bottom__button">
                                <button @click="flip('lower')">{{ buttons.low }}</button>
                            </div>
                            <div class="bottom__coef">
                                {{ sets.low.value_first }}.{{ sets.low.value_second }}x
                            </div>
                        </div>
                    </div>
                    <div :class="['panel-cards', { 'panel-cards-red': isRed }]" @click="replace()">
                        <div class="hilo-card-value">{{ card.value }}</div>
                        <i v-if="card.view" :class="card.view"></i>
                        <p v-else style="color:black">Нажмите</p>
                    </div>
                    <div class="panel-bets">
                        <div class="panel-bet red" @click="flip('red')">
                            <div class="panel__bet-name">Красный</div>
                            <div class="panel__bet-indicators">
                                <div class="panel__bet-counter d-flex">
                                    <img src="/images/icons/group.png" alt="">
                                    <span>0</span>
                                </div>
                                <div class="panel__bet-coef">2.00x</div>
                            </div>
                        </div>
                        <div class="panel-bet gray" @click="flip('black')">
                            <div class="panel__bet-name">Черный</div>
                            <div class="panel__bet-indicators">
                                <div class="panel__bet-counter d-flex">
                                    <img src="/images/icons/group.png" alt="">
                                    <span>0</span>
                                </div>
                                <div class="panel__bet-coef">2.00x</div>
                            </div>
                        </div>
                        <div class="panel__bets-group">
                            <div class="panel-bet orange" @click="flip('29')">
                                <div class="panel__bet-name">2-9</div>
                                <div class="panel__bet-indicators">
                                    <div class="panel__bet-counter d-flex">
                                        <img src="/images/icons/group.png" alt="">
                                        <span>0</span>
                                    </div>
                                    <div class="panel__bet-coef">1.50x</div>
                                </div>
                            </div>
                            <div class="panel-bet orange" @click="flip('jqka')">
                                <div class="panel__bet-name">J Q K A</div>
                                <div class="panel__bet-indicators">
                                    <div class="panel__bet-counter d-flex">
                                        <img src="/images/icons/group.png" alt="">
                                        <span>0</span>
                                    </div>
                                    <div class="panel__bet-coef">3.00x</div>
                                </div>
                            </div>
                        </div>
                        <div class="panel__bets-group">
                            <div class="panel-bet orange" @click="flip('ka')">
                                <div class="panel__bet-name">K A</div>
                                <div class="panel__bet-indicators">
                                    <div class="panel__bet-counter d-flex">
                                        <img src="/images/icons/group.png" alt="">
                                        <span>0</span>
                                    </div>
                                    <div class="panel__bet-coef">6.00x</div>
                                </div>
                            </div>
                            <div class="panel-bet orange" @click="flip('a')">
                                <div class="panel__bet-name">A</div>
                                <div class="panel__bet-indicators">
                                    <div class="panel__bet-counter d-flex">
                                        <img src="/images/icons/group.png" alt="">
                                        <span>0</span>
                                    </div>
                                    <div class="panel__bet-coef">12.00x</div>
                                </div>
                            </div>
                        </div>
                        <div class="panel-bet green" @click="flip('joker')">
                            <div class="panel__bet-name">Joker</div>
                            <div class="panel__bet-indicators">
                                <div class="panel__bet-counter d-flex">
                                    <img src="/images/icons/group.png" alt="">
                                    <span>0</span>
                                </div>
                                <div class="panel__bet-coef">25.00x</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="!isAuth">
                    <button @click="$root.$emit('openLogin')" class="btn crash__play-button"
                    style="color:black;width:100%;margin-top:15px;height:50px;cursor:pointer">{{ $t('games.auth_button') }}</button>
                </div>
                <div v-else>
                    <div @click="game.id ? take() : hilo()"
                        class="btn crash__play-button"
                        style="color:black;width:100%;margin-top:15px;height:50px;cursor:pointer"
                        ref="gameButton">{{ $t('games.game_button_play_start') }}</div>
                </div>
            </div>

            <div class="hilo__game-stats">
                <div class="game-stats__heading">
                    <span>Статистика<br>за последние</span>
                    <div>
                        раунды
                    </div>
                </div>
                <div class="game-stats__items">
                    <div
                        v-for="(itm, idx) in settings.history"
                        :key="idx"
                        class="game-stats__item"
                        :class="[ (getCardData(itm).type === 'hearts' || getCardData(itm).type === 'diamonds') && 'red'  ]"
                        >
                        <div class="left__item">
                            <p>{{ getCardData(itm).value }}</p>
                            <i :class="getCardData(itm).view"/>
                        </div>
                        <!-- <div class="right__item"> -->
                            <!-- <div class="item__progress"> -->
                                <!-- <div class="item_progress-put" style="height: 44%"></div> -->
                            <!-- </div> -->
                        <!-- </div> -->
                    </div>
                </div>

                <!-- <div class="progress-bar">
                    <div class="progress-put"></div>
                </div>
                <div class="d-flex progress-labels justify-content-between">
                    <div class="progress-label">60%</div>
                    <div class="progress-label">40%</div>
                </div> -->
            </div>
        </div>
    </div>
</template>
<script>
    import GameStats from "../components/GameStats";
    import { getMeta } from '../utils/getMeta';

    export default {
        name: 'Hilo',
        metaInfo() {
            return getMeta(this.seo)
        },
        data() {
            return {
                seo: { en: [], ru: [] },
                settings: {},
                game: {
                    bet: 1.0
                },
                card: {
                    view: '',
                    value: null,
                    type: null
                },
                sets: {
                    high: {
                        percent_first: 0,
                        percent_second: 0,
                        value_first: 0,
                        value_second: 0,
                    },
                    low: {
                        percent_first: 0,
                        percent_second: 0,
                        value_first: 0,
                        value_second: 0,
                    }
                },
                buttons: {
                    high: 'High',
                    low: 'Low',
                },
                history: [],
                progress: false,
                cancelText: false,
                startingCardIndex: 1,
            }
        },
        async created() {
            const result = await this.$api.admin.getCrashSettings()
            this.settings = await this.$api.hilo.getStats()

            if (result.error) {
                console.error('Error get hilo data: ', result.message)
                return
            }

            this.seo = result.seo
        },
        computed: {
            balance() {
                return +this.$store.state.user.balance
            },
            isRed() {
                return this.card.type === 'hearts' || this.card.type === 'diamonds'
            },
            isAuth() {
                return this.$store.getters.isAuth
            },
            deck() {
                return {
                    1: {type: 'spades', value: 'A', slot: 1},
                    2: {type: 'spades', value: '2', slot: 2},
                    3: {type: 'spades', value: '3', slot: 3},
                    4: {type: 'spades', value: '4', slot: 4},
                    5: {type: 'spades', value: '5', slot: 5},
                    6: {type: 'spades', value: '6', slot: 6},
                    7: {type: 'spades', value: '7', slot: 7},
                    8: {type: 'spades', value: '8', slot: 8},
                    9: {type: 'spades', value: '9', slot: 9},
                    10: {type: 'spades', value: '10', slot: 10},
                    11: {type: 'spades', value: 'J', slot: 11},
                    12: {type: 'spades', value: 'Q', slot: 12},
                    13: {type: 'spades', value: 'K', slot: 13},
                    14: {type: 'hearts', value: 'A', slot: 1},
                    15: {type: 'hearts', value: '2', slot: 2},
                    16: {type: 'hearts', value: '3', slot: 3},
                    17: {type: 'hearts', value: '4', slot: 4},
                    18: {type: 'hearts', value: '5', slot: 5},
                    19: {type: 'hearts', value: '6', slot: 6},
                    20: {type: 'hearts', value: '7', slot: 7},
                    21: {type: 'hearts', value: '8', slot: 8},
                    22: {type: 'hearts', value: '9', slot: 9},
                    23: {type: 'hearts', value: '10', slot: 10},
                    24: {type: 'hearts', value: 'J', slot: 11},
                    25: {type: 'hearts', value: 'Q', slot: 12},
                    26: {type: 'hearts', value: 'K', slot: 13},
                    27: {type: 'clubs', value: 'A', slot: 1},
                    28: {type: 'clubs', value: '2', slot: 2},
                    29: {type: 'clubs', value: '3', slot: 3},
                    30: {type: 'clubs', value: '4', slot: 4},
                    31: {type: 'clubs', value: '5', slot: 5},
                    32: {type: 'clubs', value: '6', slot: 6},
                    33: {type: 'clubs', value: '7', slot: 7},
                    34: {type: 'clubs', value: '8', slot: 8},
                    35: {type: 'clubs', value: '9', slot: 9},
                    36: {type: 'clubs', value: '10', slot: 10},
                    37: {type: 'clubs', value: 'J', slot: 11},
                    38: {type: 'clubs', value: 'Q', slot: 12},
                    39: {type: 'clubs', value: 'K', slot: 13},
                    40: {type: 'diamonds', value: 'A', slot: 1},
                    41: {type: 'diamonds', value: '2', slot: 2},
                    42: {type: 'diamonds', value: '3', slot: 3},
                    43: {type: 'diamonds', value: '4', slot: 4},
                    44: {type: 'diamonds', value: '5', slot: 5},
                    45: {type: 'diamonds', value: '6', slot: 6},
                    46: {type: 'diamonds', value: '7', slot: 7},
                    47: {type: 'diamonds', value: '8', slot: 8},
                    48: {type: 'diamonds', value: '9', slot: 9},
                    49: {type: 'diamonds', value: '10', slot: 10},
                    50: {type: 'diamonds', value: 'J', slot: 11},
                    51: {type: 'diamonds', value: 'Q', slot: 12},
                    52: {type: 'diamonds', value: 'K', slot: 13},
                    toIcon: function(card) {
                        let icons = {
                            'spades': 'fas fa-spade',
                            'hearts': 'fas fa-heart',
                            'clubs': 'fas fa-club',
                            'diamonds': 'fas fa-diamond'
                        };
                        return icons[card.type];
                    },
                    toString: function(card) {
                        return card.value + ' <i class="' + this.deck.toIcon(card) + '"></i>';
                    }
                }
            }
        },
        methods: {
            getCardData(data) {
                const payload = this.deck[data.cell3]
                return {
                    value: payload.value,
                    type: payload.type,
                    view: this.deck.toIcon(payload)
                }
            },
            async hilo() {
                if (this.game.id != null || this.progress === true) return;

                const result = await this.$api.hilo.game(this.game.bet, this.startingCardIndex)

                if (result.error) {
                    return
                }

                if (result.error_message) {
                    // this.$toasted.global.error(this.$t(result.error_message))

                    // if (result.error_message === 'hilo.errors.new_game') {
                        this.replace()
                        this.hilo()
                    // }

                    return
                }

                this.calculateProbability(this.startingCardIndex)

                this.game = { ...this.game, ...result }
            },
            async flip(type) {
                if (this.game.id == null || this.progress === true) return;

                const result = await this.$api.hilo.flip(this.game.id, type)

                if (result.error) {
                    return
                }

                if (result.error_message) {
                    this.$notify({
                        group: 'foo',
                        type: 'error',
                        title: 'Error',
                        text: this.$t(result.error_message)
                    })
                    return
                }

                this.progress = true


                this.startingCardIndex = result.deckIndex;
                this.setCard(this.deck[result.deckIndex]);

                const vm = this

                setTimeout(function () {
                    vm.progress = false;
                    if (result.win === false) {
                        setTimeout(function () {
                            vm.$notify({
                                group: 'foo',
                                type: 'error',
                                title: 'Error',
                                text: 'Вы проиграли ' + vm.game.bet + ' руб.'
                            })

                            vm.clear();
                            vm.clearHistory();
                        }, 400);
                    } else {
                        vm.calculateProbability(result.deckIndex);

                        // $('#games').prop('number', p_n('#games')).animateNumber({number: json.games});
                        // $('#mul').prop('number', p_n('#mul')).animateNumber({number: decimal[0]});
                        // $('#mul_m').prop('number', p_n('#mul_m')).animateNumber({number: decimal[1]});

                        let v = (parseFloat(vm.game.bet) * parseFloat(result.mul)).toFixed(2);
                        if (v < 0) v = '0.00';
                        // if (!vm.cancelText) {
                        vm.$refs['gameButton'].innerText = 'Забрать ' + v + ' руб.'

                            // vm.cancelText = true;
                        // } else {
                            // $('#cf_profit').html(v)
                        // }
                    }
                }, 600);
            },
            async take() {
                if (this.game.id == null || this.progress === true) return;

                const result = await this.$api.hilo.take(this.game.id)

                if (result.error) {
                    return
                }

                if (result.error_message) {
                    this.$notify({
                        group: 'foo',
                        type: 'error',
                        title: 'Error',
                        text: this.$t(result.error_message)
                    })
                    return
                }

                this.clear();
                this.clearHistory();

                if (parseFloat(result.profit) > 0) {
                    this.$notify({
                        group: 'foo',
                        title: 'Message',
                        text: 'Вы выиграли ' + parseFloat(result.profit).toFixed(2) + ' руб.'
                    })
                }
            },
            clear() {
                this.game = { bet: 1.0 };
                this.progress = false;
                this.cancelText = false;
                this.$refs['gameButton'].innerText = 'Играть'

                const { high, low } = this.sets

                high.percent_first = 0
                high.percent_second = 0
                low.percent_first = 0
                low.percent_second = 0

                high.value_first = 0
                high.value_second = 0
                low.value_first = 0
                low.value_second = 0
            },
            setCard(card) {
                if (card === undefined) card = this.deck[1];

                this.card.value = card.value
                this.card.type = card.type
                this.card.view = this.deck.toIcon(card)

                this.addToHistory(card)

                let high = (this.startingCardIndex % 13) + 1 === 1;
                let low = (this.startingCardIndex % 13) + 1 === 2;

                this.buttons.high = high ? 'Та же' : 'Выше или та же'
                this.buttons.low = low ? 'Та же' : 'Ниже или та же'
            },
            clearHistory() {
                this.history = []
            },
            replace() {
                if (this.game.id != null) return

                this.clearHistory()
                const vm = this

                let req = function () {
                    let rng = Math.floor(Math.random() * (Object.keys(vm.deck).length - 1)) + 1;
                    let card = vm.deck[rng];
                    if (card === undefined || card.slot === 1 || card.slot === 13) {
                        req();
                        return;
                    }

                    vm.startingCardIndex = rng;
                    vm.setCard(card);
                };

                req()
            },
            addToHistory(card) {
                this.history.push(card)
            },
            splitDecimal(n) {
                let s = parseFloat(n).toFixed(2).split('.');
                return [
                    parseInt(s[0]),
                    s[1]
                ]
            },
            calculateProbability(cardIndex) {
                let higherProbability = (this.deck[cardIndex].slot / 14) * 100;
                let decimal = this.splitDecimal(higherProbability);
                let lowerProbability = (100 - higherProbability);
                let lowerDecimal = this.splitDecimal(lowerProbability);

                const vm = this

                let calculateMultiplier = function (isHigher) {
                    return !isHigher ? (12.350 / (13 - (vm.deck[cardIndex].slot - 1))) : (12.350 / (vm.deck[cardIndex].slot));
                };
                let higherMultiplier = calculateMultiplier(true), lowerMultiplier = calculateMultiplier(false);
                let higherMultiplierDecimal = this.splitDecimal(higherMultiplier),
                    lowerMultiplierDecimal = this.splitDecimal(lowerMultiplier);

                const { high, low } = this.sets

                high.percent_first = decimal[0]
                high.percent_second = decimal[1]
                low.percent_first = lowerDecimal[0]
                low.percent_second = lowerDecimal[1]

                high.value_first = higherMultiplierDecimal[0]
                high.value_second = higherMultiplierDecimal[1]
                low.value_first = lowerMultiplierDecimal[0]
                low.value_second = lowerMultiplierDecimal[1]
            }
        },
        components: {
            'game-stats': GameStats,
        }
    }
</script>
<style scoped lang="scss">
    .hilo {
        min-width: 0;
        overflow: hidden;
        display: flex;

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

        .right-top {
            padding: 24px;
            background: #202126;
            border-radius: 10px;
            margin-bottom: 20px;
        }

        .right-block {
            min-width: 0;
            flex: 2;
        }

        .hilo__heading {
            font-size: 16px;
            color: #6d6f7c;
            margin-bottom: 28px;
            display: block;
        }
        .crash__play-button {
            padding: 13px 0;
            outline: none;
            text-align: center;
            border: none;
            cursor: pointer;
            background: #00ba47;
            font-size: 14px;
            width: 100%;
            display: block;
            border-radius: 5px;
        }
        .hilo__top-cards {
            display: flex;
            margin-bottom: 35px;
            justify-content: flex-start;

            .hilo__top-card {
                min-width: 42px;
                height: 64px;
                margin-right: 10px;

                * {
                    color: black;
                }

                &:last-child {
                    margin-right: 0;
                }

                background: #ffffff;
                padding: 5px;
                border-radius: 5px;

                &.red * {
                    color: red;
                }

                &.green {
                    background: #01b646;
                }

                .top-card_direction {
                    display: block;
                    margin-bottom: 6px;
                }

                .top-card_image {
                    display: block;
                    margin: 0 auto;
                    max-width: 100%;
                }
            }
        }

        .hilo__game-panel {
            > div {
                overflow: hidden;
            }

            align-items: center;
            display: flex;

            .panel-control {
                flex: 1;
                align-items: center;

                .control__top {
                    background: #2b2c31;
                    border-radius: 5px;
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 18px;
                    padding: 17px 20px;

                    .top__indicators {
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;

                        .top__indicators-counter {
                            display: flex;
                            align-items: center;

                            img {
                                margin-right: 7px;
                            }

                            span {
                                font-weight: bold;
                                font-size: 16px;
                                color: #6d6f7c;
                            }
                        }

                        .top__indicators-percent {
                            font-size: 16px;
                            font-weight: bold;
                            color: #6d6f7c;
                        }
                    }

                    .top__coef {
                        font-weight: bold;
                        font-size: 16px;
                        color: #6d6f7c;
                        display: flex;
                        align-items: center;
                    }

                    .top__button {
                        button {
                            height: 65px;
                            width: 90px;
                            display: flex;
                            cursor: pointer;
                            align-items: center;
                            justify-content: center;
                            outline: none;
                            border: none;
                            background: url(/images/icons/button-hi.png);
                            background-size: 100% 100%;
                            font-weight: bold;
                            font-size: 16px;
                            color: #fff;
                            transition: 0.2s;

                            margin: 5px 0;

                            &:hover {
                                filter: invert(1);
                            }
                        }
                    }
                }

                .control-input {
                    margin-bottom: 23px;

                    .input__buttons {
                        display: flex;
                        margin-bottom: 10px;

                        button {
                            outline: none;
                            border: none;
                            padding: 0 5px;
                            cursor: pointer;
                            font-size: 14px;
                            color: #6d6f7c;
                            background: transparent;
                        }
                    }

                    .input__field {
                        background: #2b2c31;
                        border-radius: 5px;
                        padding: 15px 12px;
                        display: flex;

                        .field__prev {
                            padding-right: 12px;
                            font-size: 18px;
                            cursor: pointer;
                            user-select: none;
                            color: #6d6f7c;
                            border-right: 1px solid rgba(255, 255, 255, 0.05);
                        }

                        .field__next {
                            user-select: none;
                            padding-left: 12px;
                            cursor: pointer;
                            border-left: 1px solid rgba(255, 255, 255, 0.05);
                            color: #6d6f7c;
                            font-size: 18px;
                        }

                        input {
                            flex-grow: 1;
                            font-size: 16px;
                            outline: none;
                            background: transparent;
                            text-align: center;
                            border: none;
                            color: #ebebeb;
                        }
                    }
                }

                .control__bottom {
                    background: #2b2c31;
                    border-radius: 5px;
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0px;
                    padding: 17px 20px;

                    .bottom__indicators {
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;

                        .bottom__indicators-counter {
                            display: flex;
                            align-items: center;

                            img {
                                margin-right: 7px;
                            }

                            span {
                                font-weight: bold;
                                font-size: 16px;
                                color: #6d6f7c;
                            }
                        }

                        .bottom__indicators-percent {
                            font-size: 16px;
                            font-weight: bold;
                            color: #6d6f7c;
                        }
                    }

                    .bottom__coef {
                        font-weight: bold;
                        font-size: 16px;
                        color: #6d6f7c;
                        display: flex;
                        align-items: center;
                    }

                    .bottom__button {
                        button {
                            height: 65px;
                            width: 90px;
                            display: flex;
                            cursor: pointer;
                            align-items: center;
                            justify-content: center;
                            outline: none;
                            border: none;
                            background: url(/images/icons/button-lo.png);
                            background-size: 100% 100%;
                            font-weight: bold;
                            font-size: 16px;
                            color: #fff;
                            transition: 0.2s;
                            margin: 5px 0;

                            &:hover {
                                filter: invert(1);
                            }
                        }
                    }
                }
            }

            .panel-cards {
                position: relative;
                flex: 1;
                min-width: 205px;
                max-width: 200px;
                height: 320px;
                display: flex;
                align-items: center;
                justify-content: center;
                // background-size: 100% 100%;
                background-color: white;
                border: 1px solid #e1e9f5;
                border-radius: 5px;
                margin-right: 35px;

                .hilo-card-value {
                    position: absolute;
                    top: 15px;
                    left: 20px;

                    color: black;
                    font-size: 20px;
                    font-weight: bold;
                }

                i {
                    color: black;
                    font-size: 50px
                }

                &.panel-cards-red i,
                &.panel-cards-red .hilo-card-value {
                    color: red;
                }

                img {
                    max-width: 100%;
                    filter: drop-shadow(7px 3px 13px black);
                }

                margin-left: 70px;
            }

            .panel-control, .panel-bets {
                flex-grow: 1;
            }

            .panel-bets {
                flex: 1;

                .panel-bet {
                    flex: 1;
                    margin-bottom: 9px;
                    padding: 10px 19px;
                    border-radius: 5px;
                    cursor: pointer;

                    &.red {
                        background: #c9033a;
                    }

                    &.gray {
                        background: #2b2c31;
                    }

                    &.orange {
                        background: #d6a129;
                    }

                    &.green {
                        background: #00b947;
                    }

                    .panel__bet-name {
                        font-size: 16px;
                        color: #fff;
                        font-weight: bold;
                        margin-bottom: 3px;
                    }

                    .panel__bet-indicators {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .panel__bet-counter {
                        align-items: center;
                        display: flex;

                        img {
                            margin-right: 4px;
                        }

                        span {
                            font-weight: bold;
                            font-size: 14px;
                            color: #fff;
                        }
                    }

                    .panel__bet-coef {
                        font-weight: bold;
                        font-size: 14px;
                    }

                }

                .panel__bets-group {
                    display: flex;

                    .panel-bet {
                        margin-right: 8px;

                        &:last-child {
                            margin-right: 0;
                        }
                    }
                }
            }

        }

        .hilo__game-stats {
            border-radius: 10px;
            background: #202126;
            padding: 24px;

            .game-stats__heading {
                display: flex;
                justify-content: space-between;

                span {
                    font-size: 16px;
                    color: #6d6f7c;
                }
            }

            .game-stats__items {
                display: flex;
                justify-content: space-between;
                margin-top: 25px;

                .game-stats__item {
                    display: flex;
                    border-radius: 5px;

                    * {
                        color: black
                    }

                    &.red * {
                        color: red
                    }

                    .left__item {
                        background: #fefefe;
                        display: flex;
                        border-radius: 5px;
                        align-items: center;
                        justify-content: center;
                        width: 40px;
                        height: 64px;
                        margin-right: 6px;

                        img {
                            max-width: 100%;
                        }

                        &.green {
                            background: #00b947;
                        }
                    }

                    .right__item {
                        height: 100%;

                        .item__progress {
                            height: 100%;
                            border-radius: 2px;
                            width: 3px;
                            display: flex;
                            position: relative;
                            flex-direction: column;
                            align-items: flex-start;
                            background: #43464c;

                            .item_progress-put {
                                width: 150%;
                                position: absolute;
                                top: 0;
                                left: -25%;
                                border-radius: 5px;
                                background: linear-gradient(173deg, rgba(0, 186, 118, 1) 0%, rgba(0, 186, 72, 1) 100%);
                            }
                        }
                    }
                }
            }

            .progress-bar {
                margin-top: 28px;
                width: 100%;
                height: 4px;
                background: #1a1b20;
                border-radius: 3px;
                position: relative;

                .progress-put {
                    position: absolute;
                    width: 60%;
                    height: 150%;
                    top: -25%;
                    border-radius: 3px;
                    left: 0;
                    box-shadow: 0px 0px 6px 1px rgba(244, 49, 58, 0.6);
                    background: linear-gradient(90deg, #f4313a 0%, #c9033a 100%);
                }
            }

            .progress-labels {
                margin-top: 14px;

                .progress-label {
                    font-size: 14px;
                    color: #6d6f7c;
                }
            }
        }
    }


    @media screen and (max-width: 1700px) {
        .hilo {
            .hilo__top-cards {
                flex-wrap: wrap;
                margin-right: -10px;

                .hilo__top-card {
                    margin-right: 10px;
                    margin-bottom: 10px;

                    &:last-child {
                        margin-right: 10px;
                    }
                }
            }
        }
        .hilo .hilo__heading {
            br {
                display: none;
            }
        }
        .hilo .hilo__game-panel .panel-bets .panel-bet:last-child {
            margin-bottom: 0;
        }
        .hilo .hilo__game-panel .panel-bets .panel__bets-group .panel-bet {
            margin-bottom: 8px;
        }
        .hilo .hilo__game-panel .panel-control {
            width: 100%;
            flex: unset;
            order: 3;
            margin-top: 25px;
        }
        .hilo .hilo__game-panel {
            flex-wrap: wrap;
        }
        .hilo .hilo__game-panel .panel-cards {
            order: 2;
        }
        .hilo .hilo__game-panel .panel-bets {
            order: 1;
            flex: 2;
        }
        .hilo .hilo__game-panel .panel-control .control__top .top__button button {
            height: 50px;
            width: 74px;
        }
        .hilo .hilo__game-panel .panel-control .control__bottom .bottom__button button {
            height: 50px;
            width: 74px;
        }
        .hilo .hilo__game-panel .panel-control .control__top {
            padding: 8px 20px;
        }
        .hilo .hilo__game-panel .panel-control .control__bottom {
            padding: 8px 20px;
        }
        .hilo .hilo__top-cards {
            margin-bottom: 20px;
        }
        .hilo .hilo__game-stats .game-stats__items {
            flex-wrap: wrap;
            .game-stats__item {
                margin-right: 5px;
                margin-bottom: 10px;
            }
        }
    }

    @media screen and (max-width: 1200px) {
        .hilo {
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

    @media screen and (max-width: 768px) {
        .hilo .hilo__game-panel .panel-cards {
            min-width: 180px;
            margin-right: 18px;
            margin-left: 18px;
        }
    }


    @media screen and (max-width: 575px) {
        .hilo .hilo__game-panel .panel-cards {
            width: 100%;
            order: 0;
            min-width: 50%;
            margin-right: 0;
            margin-left: 0;
        }
        .hilo .hilo__game-panel .panel-bets {
            margin-top: 22px;
            flex: unset;
            width: 100%;
            order: 3;
        }
        .hilo .right-top {
            padding: 30px 15px;
        }
        .hilo .hilo__top-cards {
            margin-bottom: 35px;
        }
        .hilo .hilo__game-stats {
            padding: 24px 15px;
        }
        .hilo .hilo__game-stats .progress-bar {
            margin-top: 15px;
        }
        .hilo .hilo__game-stats .progress-labels {
            margin-top: 12px;
        }
        .hilo .hilo__game-stats .game-stats__items .game-stats__item .left__item {
            width: 28px;
            height: 38px;
            img {
                width: 10px;
            }
        }
        .hilo .hilo__game-stats .game-stats__items .game-stats__item .right__item .item__progress {
            width: 2px;
        }
        .hilo .hilo__top-cards .hilo__top-card {
            min-width: 27px;
            max-width: 27px;
            height: 42px;
            .top-card_image {
                height: 15px;
            }
            .top-card_direction {
                width: 6px;
            }
        }
        .hilo .hilo__heading {

            margin-bottom: 24px;
        }
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        /* display: none; <- Crashes Chrome on hover */
        -webkit-appearance: none;
        margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
    }
</style>

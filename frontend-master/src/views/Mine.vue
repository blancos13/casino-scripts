<template>
    <div class="mine">
        <div class="left-block">
            <game-stats :settings="settings" type="mines"></game-stats>
        </div>
        <div class="right-block">
            <div class="game-planet">
                <div class="left-indicator">
                    <div class="content-indicator">
                        <img src="/images/icons/almaz.png" alt="">
                        <span>{{ game.left }}</span>
                    </div>
                </div>
                <div
                    class="game"
                    :class="{ 'game__disabled': !game.isStart }"
                >
                    <div
                        v-for="(item, index) in grid"
                        :key="index"
                        @click="cell(index)"
                        :class="[
                            'game-block',
                            { 'game-block-almaz': item.diamond },
                            { 'game-block-bomb': item.bomb
                        }]"/>
                </div>
                <div class="right-indicator">
                    <div class="content-indicator">
                        <img src="/images/icons/bomb.png" alt="">
                        <span>{{ game.bombs }}</span>
                    </div>
                </div>
            </div>
            <div class="slider">
                <div class="left-arrow" @click="prev">
                    <img src="/images/icons/left-arrow.png" alt="">
                </div>
                <hooper :itemsToShow="getCountSlides" pagination="no" ref="hooper">
                    <slide v-for="(item, index) in steps" :key="item">
                        <div class="slide-item-wrapper">
                            <div class="concatenation"></div>
                            <div
                                class="slide-item"
                                :class="{ 'slide-item__active': index < game.step } "
                            >
                                <strong>{{item}}x</strong>
                                <span>{{ index + 1 }} {{ $t('mines.hit') }}</span>
                            </div>
                            <div class="concatenation"></div>
                        </div>
                    </slide>
                </hooper>
                <div class="right-arrow" @click="next">
                    <img src="/images/icons/right-arrow.png" alt="">
                </div>
            </div>

            <div class="controls">
                <div class="control-left">
                    <span>{{ $t('games.summ_wager') }}</span>
                    <div class="control-block">
                        <div class="input d-flex align-items-center">
                            <img src="/images/icons/coin.png" alt="">
                            <input type="number" placeholder="1" :disabled="game.isStart" v-model="game.amount">
                        </div>
                        <button class="control-btn" :disabled="game.isStart" @click="game.amount = parseFloat(parseFloat(game.amount) + 1)">
                            +1
                        </button>
                        <button class="control-btn hidden-xs" :disabled="game.isStart" @click="game.amount = parseFloat(parseFloat(game.amount) + 10)">
                            +10
                        </button>
                        <button class="control-btn hidden-xs" :disabled="game.isStart" @click="game.amount = parseFloat(parseFloat(game.amount) + 100)">
                            +100
                        </button>
                        <button class="control-btn" :disabled="game.isStart" @click="game.amount = parseFloat(parseFloat(game.amount) / 2)">
                            1/2
                        </button>
                        <button class="control-btn" :disabled="game.isStart" @click="game.amount = parseFloat(balance)">
                            {{ $t('games.max_button_title') }}
                        </button>
                    </div>
                </div>
                <div class="control-right">
                    <span>{{ $t('mines.count_bombs') }}</span>
                    <div class="control-block">
                        <button :disabled="game.isStart" class="control-btn" @click="setBombs(2)">2</button>
                        <button :disabled="game.isStart" class="control-btn" @click="setBombs(4)">4</button>
                        <button :disabled="game.isStart" class="control-btn" @click="setBombs(8)">8</button>
                        <button :disabled="game.isStart" class="control-btn" @click="setBombs(16)">16</button>
                        <button :disabled="game.isStart" class="control-btn" @click="setBombs(24)">24</button>
                    </div>
                </div>
            </div>

            <button
                v-if="isAuth"
                @click="game.isStart ? take() : gameStart()"
                ref="gameButton"
                class="btn btn-play">
                {{ btnText }}
            </button>
            <button
                v-else
                @click="$root.$emit('openLogin')"
                class="btn btn-play">
                {{ $t('games.auth_button') }}
            </button>
        </div>
    </div>
</template>
<script>
    import {Hooper, Slide} from 'hooper';
    import 'hooper/dist/hooper.css';
    import { getEmptyArr } from '../utils/getEmptyArr'
    import { getMeta } from '../utils/getMeta'
    import GameStats from '../components/GameStats';

    export default {
        name: 'Mines',
        metaInfo() {
            return getMeta(this.seo)
        },
        watch: {
            'game.amount': function(val) {
                if (val < 0.01) {
                    this.game.amount = 0.01
                    return
                }

                if (val > this.balance) {
                    this.game.amount = this.balance
                }
            }
        },
        data() {
            return {
                seo: { en: [], ru: [] },
                settings: {},
                steps: [],
                grid: [],
                game: {
                    isStart: false,
                    bombs: 3,
                    left: null,
                    amount: 1.0,
                    profit: null,
                    step: 0,
                    id: null,
                }
            }
        },
        async created() {
            const settings = await this.$api.admin.getMinesSettings()
            const steps = await this.$api.mines.minesMultiplier(this.game.bombs)
            this.settings = await this.$api.mines.getStat()

            console.log('this.settings ', this.settings);

            if (settings.error) {
                console.error('Error get dice data: ', settings.message)
                return
            }

            this.seo = settings.seo
            this.steps = steps.error ? [] : steps

            this.game.left = 25 - this.game.bombs

            this.grid = getEmptyArr(5 * 5, { data: 0, bomb: false, diamond: false })
        },
        computed: {
            getCountSlides() {
                if(window.innerWidth > 1700) {
                    return 8;
                } else if (window.innerWidth > 1550) {
                    return 7;
                } else if(window.innerWidth > 1450) {
                    return 6;
                }  else if(window.innerWidth > 1200) {
                    return 5;
                } else if (window.innerWidth > 1040) {
                    return 6;
                } else if(window.innerWidth > 768) {
                    return 7;
                } else if(window.innerWidth > 620) {
                    return 6;
                } else if(window.innerWidth > 512) {
                    return 6;
                } else if(window.innerWidth > 412) {
                    return 5;
                } else if(window.innerWidth > 340) {
                    return 4;
                } else if(window.innerWidth > 0) {
                    return 3;
                }

                return 2;
            },
            balance() {
                return +this.$store.state.user.balance
            },
            isAuth() {
                return this.$store.getters.isAuth
            },
            btnText() {
                return this.game.profit
                    ? `${this.$t(`mines.button_get_profit`)[0]}${this.game.profit.toFixed(2)} ${this.$t(`mines.button_get_profit`)[1]}`
                    : this.game.isStart ? this.$t('games.game_button_play_cancel') : this.$t('games.game_button_play_start')
            }
        },
        methods: {
            async setBombs(payload) {
                this.game.bombs = payload

                this.steps = await this.$api.mines.minesMultiplier(this.game.bombs)
            },
            async gameStart() {
                this.$refs.hooper.slideTo(0);

                const game = await this.$api.mines.mines(this.game.amount, this.game.bombs)

                if (game.error_message) {
                    this.$notify({
                        group: 'foo',
                        title: 'Error',
                        type: 'error',
                        text: this.$t(game.error_message)
                    })
                }

                if (!this.game.isStart) {
                    this.grid = getEmptyArr(5 * 5, { data: 0, bomb: false, diamond: false })
                }

                this.game = { ...this.game, ...game, isStart: true }
                this.grid = this.grid.map(itm => game.selected.includes(itm.index) ? { ...itm, diamond: true } : itm)
                this.game.left -= game.selected.length
            },
            prev() {
                this.$refs['hooper'].slidePrev();
            },
            next() {
                this.$refs['hooper'].slideNext();
            },
            clear(isUpdate) { // true - update grid
                this.game.isStart = false
                this.game.profit = null
                this.game.step = 0
                this.game.left = 25 - this.game.bombs

                if (isUpdate) {
                    this.grid = getEmptyArr(5 * 5, { data: 0, bomb: false, diamond: false })
                }
            },
            async take() {
                const isOpenCell = this.grid.find(item => item.bomb || item.diamond)

                if (!isOpenCell) {
                    this.game.isStart = false

                    return
                }

                const result = await this.$api.mines.minesTake(this.game.id)

                if (result.error_message) {
                    this.$notify({
                        group: 'foo',
                        title: 'Error',
                        type: 'error',
                        text: this.$t(result.error_message)
                    })
                    return
                }

                this.clear(true)
            },
            async cell(index) {
                if (index === null
                    || index === undefined
                    || this.grid[index].bomb
                    || this.grid[index].diamond
                    || !this.game.isStart
                ) {
                    return
                }

                const result = await this.$api.mines.minesMine(this.game.id, index)

                if (result.error_message) {
                    this.$notify({
                        group: 'foo',
                        title: 'Error',
                        type: 'error',
                        text: this.$t(result.error_message)
                    })
                    return
                }

                if (result.status === 'continue') {
                    this.game.left -= 1
                    this.game.step += 1
                    this.game.profit = result.profit

                    this.grid = this.grid.map(item =>
                        item.index === index
                        || result.selected.includes(item.index)
                            ? { ...item, diamond: true }
                            : item
                    )

                    if (this.game.step % 5 === 0 )
                      this.$refs.hooper.slideTo(this.game.step)

                    if(this.game.left === 0) {
                        await this.take()
                    }
                } else {
                    this.grid = result.grid.map(item =>
                        item === 0
                        ? { data: 0, bomb: false, diamond: true }
                        : { data: 1, bomb: true, diamond: false })

                    this.clear()
                }
            }
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
    }
    .mine {
        min-width: 0;
        overflow: hidden;
        display: flex;

        .game {
          &__disabled {
            opacity: .5;
           }
        }

        > div {
            background: #202126;
            border-radius: 10px;
        }

        .slider {
          border-radius: 0;
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

    .hooper {
        height: auto;
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        /* display: none; <- Crashes Chrome on hover */
        -webkit-appearance: none;
        margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
    }

    .game-planet {
        display: flex;

        .left-indicator, .right-indicator {
            width: 20%;
            display: flex;
            align-items: center;

            .content-indicator {
                padding: 23px 0;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                width: 100%;
                border: 1px solid rgba(255, 255, 255, .05);

                span {
                    display: block;
                    width: 100%;
                    text-align: center;
                    color: #f1f1f1;
                    font-size: 24px;
                    font-weight: 600;
                    margin-top: 10px;
                }
            }
        }

        .left-indicator .content-indicator {
            border-top-left-radius: 10px;
            border-bottom-left-radius: 10px;
            border-right: none;
        }

        .right-indicator .content-indicator {
            border-top-right-radius: 10px;
            border-bottom-right-radius: 10px;
            border-left: 0;
        }

        .game {
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, .05);
            flex-grow: 1;
            display: flex;
            flex-wrap: wrap;
            padding: 20px;
            padding-bottom: 10px;

            .game-block {
                cursor: pointer;
                margin-right: 10px;
                width: calc(20% - 8px);
                &.game-block-almaz {
                    cursor: auto;
                    background-image: url('/images/icons/almaz.png');
                    background-position: 0 0;
                    background-size: contain;
                    background-repeat: no-repeat;
                }
                &.game-block-bomb {
                    cursor: auto;
                    background-image: url('/images/icons/bomb.png');
                    background-position: 0 0;
                    background-size: contain;
                    background-repeat: no-repeat;
                }
                &:after {
                    content: "";
                    display: block;
                    padding-bottom: 100%;
                }
                border-radius: 7px;
                background: rgb(0, 186, 118);
                background: linear-gradient(90deg, rgba(0, 186, 71, 1) 0%, rgba(0, 186, 118, 1) 100%);
                margin-bottom: 10px;

                &:nth-child(5n) {
                    margin-right: 0;
                }
            }
        }
    }

    .slider {


        .left-arrow {
            position: absolute;
            left: 10px;
            cursor: pointer;
        }

        .right-arrow {
            position: absolute;
            right: 10px;
            cursor: pointer;
        }

        margin-top: 30px;
        padding: 0 20px;
        padding-bottom: 20px;
        position: relative;
        width: 100%;
        overflow: hidden;
        align-items: center;
        display: flex;

        .slide-item-wrapper {
            display: flex;
            align-items: center;

            .concatenation {
                width: 15px;
                height: 1px;
                background: rgba(255, 255, 255, 0.05);
            }
        }

        .slide-item {
            padding: 8px 10px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 5px;
            padding-right: 30px;

            &__active {
               border: 1px solid #00ba47;
            }

            strong {
                font-weight: normal;
                font-size: 14px;
                display: block;
                width: 100%;
                color: #cbccd1;
                line-height: 15px;
            }

            span {
                color: #54555d;
                font-size: 11px;
            }
        }
    }

    .controls {
        margin-top: 32px;
        display: flex;

        .control-left {
            margin-right: 10px;
            flex: 6;
        }

        .control-right {
            flex: 5;
        }

        > div span {
            font-size: 12px;
            color: #737581;
            margin-bottom: 14px;
            display: block;
        }

        .control-block {
            .input {
                padding-left: 10px;
                display: flex;

                img {
                    margin-right: 8px;
                }

                input {
                    outline: none;
                    padding: 10px 0;
                    background: transparent;
                    border: none;
                    width: 70px;
                }
            }

            background: #2b2c31;
            border-radius: 5px;
            display: flex;
            padding: 8px 9px;

            .control-btn {
                margin-right: 3px;

                &:last-child {
                    margin-right: 0;
                }

                background: #393c46;
                outline: none;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                border-top: 1px solid #43464f;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 12px;
                color: #fff;
                padding: 12px 0;
                flex: 1;
                transition: 0.2s;

                &:hover {
                    background: #00ba47;
                }

                &:disabled {
                    cursor: auto;
                    background: #393c46;
                }
            }
        }
    }

    .btn-play {
        padding: 20px 0;
        outline: none;
        border: none;
        cursor: pointer;
        background: #00ba47;
        font-size: 14px;
        margin-top: 32px;
        width: 100%;
        display: block;
        border-radius: 5px;
    }
    @media screen and (max-width: 1200px) {
        .mine {
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
    @media screen and (max-width: 1700px) {
        .game-planet .game .game-block {
            height: auto;
            &:after {
                content: "";
                display: block;
                padding-bottom: 100%;
            }
        }
    }

    @media screen and (max-width: 1500px) {
        .game-planet .left-indicator, .game-planet .right-indicator {
            width: 15%;
            img {
                width: 30px;
            }
            span {
                font-size: 18px;
            }
        }
    }
    @media screen and (max-width: 768px) {

        .controls {
            flex-wrap: wrap;
            .control-left {
                margin-right: 0;
                width: 100%;
                flex: unset;
                margin-bottom: 20px;
            }
            .control-right {
                width: 100%;
                flex: unset;
            }

        }

    }
    @media screen and (max-width: 575px) {
        .controls .control-block .input input {
            width: 60px;
        }
        .mine .right-block {
            padding: 30px 15px;
        }
        .right-block {
            padding-bottom: 15px !important;
            margin-bottom: 15px !important;
        }
        .slider .slide-item {
            display: flex;
            flex-wrap: wrap;
            padding: 5px 14px;
            padding-right: 0px;
            strong {
                font-size: 11.8px;
            }
            span {
                font-size: 9.2px;
            }
        }
        .slider {
            padding: 0 5px;
            padding-bottom: 20px;
            .left-arrow {
                left: 0;
            }
            .right-arrow {
                right: 0;
            }
        }
        .slider .slide-item-wrapper .concatenation {
            width: 10px;
        }
        .game-planet {
            flex-wrap: wrap;
            .left-indicator {
                display: flex;
                width: 50%;
                order: 0;
            }
            .right-indicator {
                order: 1;
                display: flex;
                width: 50%;
                .content-indicator {
                    display: flex;
                    flex-wrap: nowrap;
                    padding: 13px 0;

                    border-top-right-radius: 5px;
                    border-bottom-right-radius: 5px;
                    span {
                        order: 0;
                        width: auto;
                        font-size: 18px;
                        margin-top: 0;
                        margin-right: 15px;
                    }
                    img {
                        order: 1;
                        max-width: 20px;

                    }
                    align-items: center;
                }
            }
            .left-indicator {
                order: 1;
                display: flex;
                width: 50%;
                .content-indicator {
                    display: flex;
                    flex-wrap: nowrap;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-top-left-radius: 5px;
                    border-bottom-left-radius: 5px;
                    padding: 13px 0;
                    span {
                        order: 0;
                        width: auto;
                        font-size: 18px;
                        margin-top: 0;
                        margin-right: 15px;
                    }
                    img {
                        order: 1;
                        max-width: 20px;
                    }
                    align-items: center;
                }
            }
            .game {
                width: 100%;
                order: 2;
                margin-top: 15px;
                border: none;
                padding: 0;
            }
        }
        .slider {
            margin-top: 10px;
        }
        .controls {
            margin-top: 15px;
        }
        .btn-play {
            padding: 11px 40px;
            margin-top: 20px;
        }
        .controls .control-block .control-btn {
            padding: 8px 0;
        }
        .controls .control-block .control-btn {
            padding: 8px 0;
        }
    }

    @media screen and (max-width: 400px) {
        .game-planet .game .game-block {
            margin-right: 5px;
            width: calc(20% - 4px);
            margin-bottom: 5px;
        }
    }
</style>

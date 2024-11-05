<template>
    <div>
        <div class="profile">
            <div class="left-block">
                <div class="user-info">
                    <div class="avatar">
                        <img
                            v-lazy="{ id: user.photoUrl, default: '/images/harley-test.png' }"
                            class="avatar-image" width="82" height="82" alt="">
                    </div>
                    <div class="text-part">
                        <div class="nickname">{{ user.username }}</div>
                        <div class="balance">
                            <img src="/images/icons/coin.png" alt="">
                            <span>{{ user.balance && user.balance.toLocaleString() }} P</span>
                        </div>
                    </div>
                </div>

                <div class="descriptions">
                    <div class="label">{{ $t('profile.balance') }}:</div>
                    <div class="descriptions__buttons">
                        <button @click="$root.$emit('openDeposit')">{{ $t('profile.deposit') }}</button>
                        <button @click="$root.$emit('openWithdraw')">{{ $t('profile.withdraw') }}</button>
                        <button @click="showHistoryWallets = true">{{ $t('profile.history') }}</button>
                    </div>
                    <div class="bonuses">
                        <div class="label">{{ $t('profile.bonuses') }}</div>
                        <div class="bonuses-graph">
                            <img src="/images/icons/almaz.png" alt="">
                            <div class="right-graph">
                                <div class="top-indicators">
                                    <span>{{ selectedDiamonds }}</span>
                                    <span>{{ chest }}</span>
                                </div>
                                <div class="progress">
                                    <div class="progress-fill" :style="`width: ${ selectedDiamonds / chest * 100 }%;max-width:100%;`"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="promocode-block">
                        <div class="label">{{ $t('profile.promocode') }}:</div>
                        <div class="input-promo">
                            <input
                                type="text"
                                v-model="promocode"
                                :disabled="!isActivePromoCode"
                                :placeholder="$t('profile.promo')">
                            <button
                                :disabled="!isInputProcomode"
                                @click="activatePromocode">
                                <img src="/images/icons/check-2.png" alt="">
                            </button>
                        </div>
                    </div>
                    <div class="date-registered">
                        <div class="label">{{ $t('profile.date_register') }}:</div>
                        <div class="date">
                           {{ date }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="right-block">
                <div class="right-block-top">
                    <div class="label">{{ $t('profile.settings') }}</div>
                    <div class="inputs-info">
                        <div class="input-item">
                            <div class="label-item">{{ $t('profile.nickname') }}:</div>
                            <div class="input">
                                <input type="text" v-model="userData.username">
                                <button @click="update('username')"><img src="/images/icons/check-2.png" alt=""></button>
                            </div>
                        </div>
                        <div class="input-item">
                            <div class="label-item">{{ $t('profile.email') }}:</div>
                            <div class="input">
                                <input type="email" class="input-default" v-model="userData.email">
                                <button @click="update('email')"><img src="/images/icons/check-2.png" alt=""></button>
                            </div>
                        </div>
                        <div class="input-item">
                            <div class="label-item">{{ $t('register.password') }}:</div>
                            <input type="password" v-model="userData.password" class="input-default">
                        </div>
                        <div class="input-item">
                            <div class="label-item">{{ $t('register.repeat_password') }}:</div>
                            <div class="input">
                                <input type="text" class="input-default" v-model="userData.repeatPassword">
                                <button @click="update('password')"><img src="/images/icons/check-2.png" alt=""></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="stats-tabs hidden-lg">
                    <div class="tab" @click="activeTab = 'self_roulette'" v-if="getTab('self_roulette')" :class="{'active': activeTab == 'self_roulette'}">
                        <img src="/images/icons/roulette.png" v-if="activeTab != 'self_roulette'" alt="">
                        <img src="/images/icons/roulette-active.png" v-if="activeTab === 'self_roulette'" alt="">
                        <span>Roulette</span>
                    </div>
                    <div class="tab" @click="activeTab = 'self_crash'" v-if="getTab('self_crash')" :class="{'active': activeTab == 'self_crash'}">
                        <img src="/images/icons/crash.png" v-if="activeTab != 'self_crash'" alt="">
                        <img src="/images/icons/crash-active.png" v-if="activeTab === 'self_crash'" alt="">
                        <span>Crash</span>
                    </div>
                    <div class="tab" @click="activeTab = 'self_battle'" v-if="getTab('self_battle')" :class="{'active': activeTab == 'self_battle'}">
                        <img src="/images/icons/battle.png" v-if="activeTab != 'self_battle'" alt="">
                        <img src="/images/icons/battle-active.png" v-if="activeTab === 'self_battle'" alt="">
                        <span>Battle</span>
                    </div>
                    <div class="tab" @click="activeTab = 'self_dice'" v-if="getTab('self_dice')" :class="{'active': activeTab == 'self_dice'}">
                        <img src="/images/icons/dice.png" v-if="activeTab != 'self_dice'" alt="">
                        <img src="/images/icons/dice-active.png" v-if="activeTab === 'self_dice'" alt="">
                        <span>Dice</span>
                    </div>
                    <div class="tab" @click="activeTab = 'self_jackpot'" v-if="getTab('self_jackpot')" :class="{'active': activeTab == 'self_jackpot'}">
                        <img src="/images/icons/jackpot.png" v-if="activeTab != 'self_jackpot'" alt="">
                        <img src="/images/icons/jackpot-active.png" v-if="activeTab === 'self_jackpot'" alt="">
                        <span>Jackpot</span>
                    </div>
                    <div class="tab" @click="activeTab = 'self_mines'" v-if="getTab('self_mines')" :class="{'active': activeTab == 'self_mines'}">
                        <img src="/images/icons/mine.png" v-if="activeTab != 'self_mines'" alt="">
                        <img src="/images/icons/mine-active.png" v-if="activeTab === 'self_mines'" alt="">
                        <span>Mine</span>
                    </div>
                    <div class="tab" @click="activeTab = 'self_hilo'" v-if="getTab('self_hilo')" :class="{'active': activeTab == 'self_hilo'}">
                        <img src="/images/icons/hilo.png" v-if="activeTab != 'self_hilo'" alt="">
                        <img src="/images/icons/hilo-active.png" v-if="activeTab === 'self_hilo'" alt="">
                        <span>Hilo</span>
                    </div>
                </div>
                <div class="stats hidden-lg">
                    <div class="stats-head">
                        <div class="game">{{ $t('home.table.game') }}</div>
                        <div class="user">{{ $t('home.table.user') }}</div>
                        <div class="time">{{ $t('home.table.time') }}</div>
                        <div class="bet">{{ $t('home.table.bet') }}</div>
                        <div class="win">{{ $t('home.table.win') }}</div>
                    </div>
                    <div v-for="item in history" :key="item.date" class="stats-item">
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
                            <span :class="[ item.prize > 0 ? 'success' : '']">{{ item.prize }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <transition name="slide-fade">
                <history-wallets @close="showHistoryWallets = false" v-show="showHistoryWallets"></history-wallets>
            </transition>
        </div>
        <div class="stats-tabs show-lg-flex">
            <div class="tab" @click="activeTab = 'roulette'" v-if="getTab('roulette')" :class="{'active': activeTab == 'roulette'}">
                <img src="/images/icons/roulette.png" v-if="activeTab != 'roulette'" alt="">
                <img src="/images/icons/roulette-active.png" v-if="activeTab === 'roulette'" alt="">
                <span>Roulette</span>
            </div>
            <div class="tab" @click="activeTab = 'crash'" v-if="getTab('crash')" :class="{'active': activeTab == 'crash'}">
                <img src="/images/icons/crash.png" v-if="activeTab != 'crash'" alt="">
                <img src="/images/icons/crash-active.png" v-if="activeTab === 'crash'" alt="">
                <span>Crash</span>
            </div>
            <div class="tab" @click="activeTab = 'battle'" v-if="getTab('battle')" :class="{'active': activeTab == 'battle'}">
                <img src="/images/icons/battle.png" v-if="activeTab != 'battle'" alt="">
                <img src="/images/icons/battle-active.png" v-if="activeTab === 'battle'" alt="">
                <span>Battle</span>
            </div>
            <div class="tab" @click="activeTab = 'dice'" v-if="getTab('dice')" :class="{'active': activeTab == 'dice'}">
                <img src="/images/icons/dice.png" v-if="activeTab != 'dice'" alt="">
                <img src="/images/icons/dice-active.png" v-if="activeTab === 'dice'" alt="">
                <span>Dice</span>
            </div>
            <div class="tab" @click="activeTab = 'jackpot'" v-if="getTab('jackpot')" :class="{'active': activeTab == 'jackpot'}">
                <img src="/images/icons/jackpot.png" v-if="activeTab != 'jackpot'" alt="">
                <img src="/images/icons/jackpot-active.png" v-if="activeTab === 'jackpot'" alt="">
                <span>Jackpot</span>
            </div>
            <div class="tab" @click="activeTab = 'mine'" v-if="getTab('mine')" :class="{'active': activeTab == 'mine'}">
                <img src="/images/icons/mine.png" v-if="activeTab != 'mine'" alt="">
                <img src="/images/icons/mine-active.png" v-if="activeTab === 'mine'" alt="">
                <span>Mine</span>
            </div>
            <div class="tab" @click="activeTab = 'hilo'" v-if="getTab('hilo')" :class="{'active': activeTab == 'hilo'}">
                <img src="/images/icons/hilo.png" v-if="activeTab != 'hilo'" alt="">
                <img src="/images/icons/hilo-active.png" v-if="activeTab === 'hilo'" alt="">
                <span>Hilo</span>
            </div>
        </div>
        <div class="stats show-lg">
            <div class="stats-head">
                <div class="game">{{ $t('home.table.game') }}</div>
                <div class="user">{{ $t('home.table.user') }}</div>
                <div class="time">{{ $t('home.table.time') }}</div>
                <div class="pari">{{ $t('home.table.pari') }}</div>
                <div class="bet">{{ $t('home.table.bet') }}</div>
                <div class="win">{{ $t('home.table.win') }}</div>
            </div>
            <div v-for="item in history" :key="item.data" class="stats-item">
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
                <span :class="[ item.prize > 0 ? 'success' : '']">{{ item.prize }}</span>
              </div>
           </div>
        </div>
    </div>
</template>
<script>
    import { getTime } from '../utils/getTime';

    export default {
        data() {
            return {
                activeTab: 'self_mines',
                showHistoryWallets: false,
                lastActivationPromocode: null,
                isActivePromoCode: null,
                chest: 0,
                userData: {
                    username: '',
                    email: '',
                    password: '',
                    repeatPassword: ''
                },
                promocode: ''
            }
        },
        components: {
            'history-wallets': () => import('../components/modals/HistoryWallets'),
        },
        computed: {
            user() {
                return this.$store.state.user
            },
            date() {
                const date = new Date(this.user.registrationDate)
                const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
                const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
                const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
                const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()

                return `${day}.${month} ${this.$t('prepositions.in')} ${hours}:${minutes}, ${date.getFullYear()}`
            },
            selectedDiamonds() {
                return this.$store.state.bonus.selectedDiamonds
            },
            isInputProcomode() {
                return this.promocode || this.promocode.length
            },
            typesGame() {
                return this.$store.state.bets.types
            },
            history() {
                return this.$store.getters[`bets/${this.activeTab}`]
            }
        },
        methods: {
            getTab(name) {
              const data = this.$store.getters[`bets/${name}`];

              return data ? data.length > 0 : false;
            },
            getTime(date) {
                return getTime(date)
            },
            async activatePromocode() {
                const result = await this.$api.bonus.activate(this.promocode)

                if (!result || result.error) {
                    this.$notify({
                        group: 'foo',
                        title: 'Error',
                        type: 'error',
                        text: this.$t('bonus.error_activation')
                    })
                    return
                }

                if (result.error_message) {
                    this.$notify({
                        group: 'foo',
                        title: 'Error',
                        type: 'error',
                        text: this.$t(`bonus.${result.error_message}`)
                    })
                    this.promocode = ''
                    return
                }
                this.$notify({
                    group: 'foo',
                    title: 'Message',
                    text: this.$t('bonus.success_activation')
                })
                this.promocode = ''
            },
            async update(field) {
                let result = null
                const { username, email, password, repeatPassword } = this.userData

                if (field === 'username') {
                    result = await this.$api.user.update({ username })
                }

                if (field === 'email') {
                    result = await this.$api.auth.recovery({ email })
                }

                if (field === 'password') {
                    if (password !== repeatPassword) {
                        this.$notify({
                            group: 'foo',
                            title: 'Error',
                            type: 'error',
                            text: this.$t('user.fields_password_do_not_match')
                        })

                        return
                    }

                    result = await this.$api.user.update({ password })
                }

                if (!result || result.error) {
                    this.$notify({
                        group: 'foo',
                        title: 'Error',
                        type: 'error',
                        text: this.$t('user.error_update_user')
                    })

                    return
                }

                await this.$store.dispatch('auth', { loginOrEmail: email || username, password })
                this.$notify({
                    group: 'foo',
                    title: 'Message',
                    text: this.$t('user.success_update_user')
                })
            },
            countdown() {
                if (!this.user.lastActivationPromocode) {
                    this.isActivePromoCode = true
                    return
                }

                const date = this.user.lastActivationPromocode ? new Date(this.user.lastActivationPromocode) : new Date
                let dayMiliseconds = 1000 * 60 * 60 * 24
                const t = (new Date()).valueOf() - date.valueOf() - dayMiliseconds;

                if (t < 0) {
                    this.isActivePromoCode = false
                    setTimeout(this.countdown, 1000);
                } else {
                    this.isActivePromoCode = true
                }
            }
        },
        async created() {
            this.chest = await this.$api.bonus.getCountChest()
        },
        mounted() {
            if (this.user) {
                this.userData = {
                    ...this.user
                }
            }

            setTimeout(this.countdown, 1)

            this.$root.$on('openDeposit', () => {
                this.showDepositModal = true;
            });
            this.$root.$on('openWithdraw', () => {
                this.showWithdrawModal = true;
            });
        }
    }
</script>
<style scoped lang="scss">
    .stats-tabs {
        display: flex;
        margin-top: 20px;
        background: #202126;
        margin-bottom: 0;
        border-bottom: 1px solid rgba(255,255,255, 0.05);
        padding: 0 20px;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        .tab {
            span {
                font-size: 14px;
                color: #61626a
            }
            img {
                margin-right: 10px;
                max-width: 16px;
            }
            display: flex;

            background: #202126;
            padding: 22px 8px;
            font-size: 14px;
            color: #61626a;
            margin-right: 30px;
            border-bottom: 3px solid transparent;
            &:last-child {
                margin-right: 0;
            }

            cursor: pointer;
            &:hover {
                border-color: #00b846;
            }
            transition: 0.2s;
            &.active {
                border-color: #00b846;
            }
            align-items: center;
        }
    }
    .profile {
        display: flex;
    }
    .left-block {
        min-width: 340px;
        width: 340px;
        margin-right: 20px;
    }
    .stats {
        background: #202126;
        border-radius: 10px;
        padding: 30px 20px;
        padding-bottom: 20px;
        margin-top: 0px;
        border-top-right-radius: 0;
        border-top-left-radius: 0;

        .game {
            width: 20%;
        }

        .user {
            width: 20%;
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
            width: 10%;
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
                    text-transform: capitalize;
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
    .user-info {
        display: flex;
        align-items: center;
        padding: 30px 5px;
        .avatar {
            border-radius: 100%;
            width: 82px;
            height: 82px;
            img {
                width: 100%;
                height: 100%;
            }
            margin-right: 18px;
            .avatar-image {
                border: 4px solid rgba(43, 44, 49, 0.75);
                border: 3px solid #56575a;
                border-radius: 100%;
            }
        }
        .text-part {
            .nickname {
                font-weight: bold;
                font-size: 24px;
                color: #e6e8f4;
                margin-bottom: 8px;
            }
            .balance {
                img {
                    margin-right: 6px;
                }
                span {
                    font-size: 14px;
                    color: #fff;
                }
            }
        }
    }
    .descriptions {
        padding: 30px 15px;
        background: #202126;
        border-radius: 10px;
        .label {
            font-size: 16px;
            color: #6d6f7c;
        }
        .descriptions__buttons {
            display: flex;
            background: #191a1f;
            padding: 5px;
            border-radius: 15px;
            margin-top: 22px;
            > button {
                background: #272931;
                padding: 15px 0;
                border-radius: 15px;
                transition: 0.2s;
                font-size: 14px;
                color: #878997;
                outline: none;
                border: none;
                &:hover {
                    color: #fff;
                    background: #00b846;
                }
                flex: 1;
                cursor: pointer;
                margin-right: 5px;
                &:last-child {
                    margin-right: 0;
                }
            }
        }
        .promocode-block {
            padding-top: 25px;
            padding-bottom: 18px;
            border-top: 1px solid rgba(109,111,124, 0.2);
            border-bottom: 1px solid rgba(109,111,124, 0.2);
            margin-top: 17px;
            .input-promo {
                display: flex;
                padding: 6px;
                border-radius: 15px;
                margin-top: 19px;
                background: #191a1f;
                align-items: center;
                input {
                    flex-grow: 1;
                    outline: none;
                    border: none;
                    background: transparent;
                    height: 100%;
                    padding-left: 15px;
                    &:disabled {
                        opacity: 0.6;
                    }
                }
                button {
                    width: 42px;
                    height: 42px;
                    display: flex;
                    justify-content: center;
                    outline: none;
                    border: none;
                    align-items: center;
                    background: #00ba47;
                    border-radius: 10px;
                    cursor: pointer;
                    &:disabled {
                        cursor: auto;
                        opacity: 0.6;
                    }
                }
            }
        }
        .date-registered {
            margin-top: 24px;
            .label {
                margin-bottom: 14px;
            }
            .date {
                font-size: 16px;
                color: #f0f0f0;
            }
        }
        .bonuses {
            margin-top: 15px;
            padding-top: 20px;
            border-top: 1px solid rgba(109,111,124, 0.2);
            .bonuses-graph {
                display: flex;
                border-radius: 10px;
                background: #272931;
                padding: 12px;
                align-items: center;
                margin-top: 18px;
                img {
                    width: 16px;
                }
                .right-graph {
                    flex-grow: 1;
                    margin-left: 15px;
                    .top-indicators {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 9px;
                        span {
                            font-size: 12px;
                            color: #d5d7dd;
                        }
                    }
                    .progress {
                        height: 4px;
                        width: 100%;
                        position: relative;
                        border-radius: 4px;
                        background: #1a1b20;
                        .progress-fill {
                            width: 25%;
                            position: absolute;
                            border-radius: 4px;
                            height: 150%;
                            top: -25%;
                            left: 0;
                            background: linear-gradient(90deg, #00ba76 0%, #00ba47 100%);
                        }
                    }

                }
            }
        }
    }
    .right-block {
        flex-grow: 1;
        overflow: hidden;
        .right-block-top {
            background: #202126;
            padding: 27px 30px;
            border-radius: 10px;
        }
        .label {
            font-weight: bold;
            font-size: 16px;
            color: #fff;
        }
        .inputs-info {
            display: flex;
            align-items: center;
            margin-top: 27px;
            .input-item {
                flex: 1;
                .label-item {
                    font-size: 14px;
                    color: #6d6f7c;
                    margin-bottom: 15px;
                }
                .input {
                    padding: 5px;
                    height: 48px;
                    border-radius: 10px;
                    background: #191a1f;
                    display: flex;
                    align-items: center;
                    input {
                        flex-grow: 1;
                        height: 100%;
                        padding-left: 15px;
                        outline: none;
                        border: none;
                        background: transparent;
                        font-size: 16px;
                        color: #e6e8f4;
                    }
                    button {
                        width: 44px;
                        height: 100%;
                        border-radius: 10px;
                        outline: none;
                        border: none;
                        background: #272931;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        img {
                            filter: grayscale(1);
                        }
                    }
                }
                .input-default {
                    height: 48px;
                    border-radius: 10px;
                    background: #272931;
                    padding: 0 20px;
                    outline: none;
                    border: none;
                    width: 100%;
                }

                margin-right: 20px;
                &:last-child {
                    margin-right: 0;
                }
            }
        }
    }
    @media screen and (max-width: 1670px) {
        .stats-tabs .tab {
            margin-right: 10px;
            padding: 19px 7px;
        }
    }

    @media screen and (max-width: 1600px) {
        .right-block .inputs-info {
            flex-wrap: wrap;
            .input-item {
                flex: unset;
                width: 100%;
                margin-bottom: 15px;
                margin-right: 0;
            }
        }
    }
    .show-lg-flex {
        display: none !important;
    }
    .show-lg {
        display: none !important;
    }
    @media screen and (max-width: 1520px) {
        .hidden-lg {
            display: none !important;
        }
        .show-lg {
            display: block !important;
        }
        .show-lg-flex {
            display: flex !important;
        }
    }
    @media screen and (max-width: 1200px) {
        .profile {
            flex-wrap: wrap;
            .left-block {
                width: 100%;
                margin-bottom: 20px;
                margin-right: 0;
                min-width: 100%;
            }

        }
        .descriptions {
            padding: 25px 15px;
        }
        .right-block-top {
            padding: 25px 15px;
        }
    }

    @media screen and (max-width: 768px) {
        .stats-tabs {
            justify-content: center;
            flex-wrap: wrap;
            .tab {
                width: 25%;
                margin-right: 0;
                justify-content: center;
            }
        }
        .stats {
            padding: 25px 20px;
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
        .stats {
            padding: 25px 15px;

            padding-bottom: 15px;
        }
        .stats .time {
            width: 26.6%
        }
        .stats-tabs {
            justify-content: center;
            flex-wrap: wrap;
            .tab {
                width: 33.33%;
                margin-right: 0;
                justify-content: center;
            }
        }
    }
</style>

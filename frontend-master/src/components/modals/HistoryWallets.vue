<template>
    <div class="deposit-modal" ref="modal">
        <div class="deposit-body" ref="depModal">
            <img src="/images/icons/close.png" @click="$emit('close')" alt="" class="close">
            <h3>История платежей</h3>

            <div class="stats hidden-lg">
                <div class="stats-head">
                    <div class="user">Тип</div>
                    <div class="time">Дата/Время</div>
                    <div class="pari">Сумма</div>
                    <div class="bet">Статус</div>
                </div>
                <div class="stats-items">
                    <div v-for="item in items" :key="item.date" class="stats-item">
                        <div class="user">
                            {{ types[item.type] }}
                        </div>
                        <div class="time">
                            {{ moment(item.date).format('DD.MM.YYYY h:mm:ss') }}
                        </div>
                        <div class="pari">{{ item.sum }} Р</div>
                        <div class="bet">
                            <span v-if="item.status === 1" class="success">Успешно</span>
                            <span v-if="item.status === 0" class="warn">Ожидает</span>
                            <span v-if="item.status === 2" class="fail">Отменено</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
<script>
    import * as moment from 'moment'

    export default {
        data() {
            return {
                types: {
                    0: 'Вывод',
                    1: 'Пополнение'
                },
                items: []
            }
        },
        async created() {
            const withdraw = await this.$api.payment.getHistory()
            const income = await this.$api.payment.getIncomeHistory()

            if (!withdraw.error) {
                const result = [
                    ...withdraw.map(itm => ({ ...itm, type: 0 })),
                    ...income.map(itm => ({ ...itm, type: 1 }))
                ].sort((a, b) => new Date(b.date) - new Date(a.date))

                this.items = result
            }
        },
        computed: {
            PAYMENT_MAP() {
                return {
                    0: 'Qiwi',
                    1: 'Яндекс.Деньги',
                    2: 'VISA/Mastercard/МИР (RU)',
                    3: 'VISA/Mastercard (UA)',
                    4: 'WebMoney',
                    5: 'Beeline',
                    6: 'Мегафон',
                    7: 'Теле 2',
                    8: 'МТС',
                    9: 'Сбербанк Онлайн'
                }
            }
        },
        methods: {
            moment
        },
        mounted() {
            let specifiedElement = this.$refs['depModal'];
            this.$refs['modal'].addEventListener('click', (event) => {
                let isClickInside = specifiedElement.contains(event.target);
                if (!isClickInside) {
                    this.$emit('close');
                }
            });
        }
    }
</script>
<style scoped lang="scss">
    .deposit-modal {
        background: rgba(0,0,0, 0.5);
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        height: 100vh;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
        .deposit-body {
            max-width: 95%;
            width: 700px;
            position: relative;
            .close {
                position: absolute;
                right: 20px;
                top: 20px;
                cursor: pointer;
            }
            height: auto;
            padding: 32px 20px;
            border-radius: 10px;

            max-height: 80vh;
            background: #202126;
            h3 {
                color: #ffffff;
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 26px;
            }
            .label {
                font-size: 14px;
                color: #6d6f7c;
                margin-bottom: 12px;
            }
            .input {
                display: flex;
                height: 50px;
                padding: 0 15px;
                align-items: center;
                background: #191a1f;
                border-radius: 5px;
                img {
                    margin-right: 8px;
                }
                input {
                    background: transparent;
                    outline: none;
                    border: none;
                    font-size: 14px;
                    color: #fff;
                    flex-grow: 1;
                    &::placeholder {
                        color: #fff;
                    }
                }
            }

            .pay {
                background: #00b846;
                height: 53px;
                padding: 0 38px;
                border-radius: 10px;
                outline: none;
                border: none;
                margin: 0 auto;
                margin-top: 25px;
                display: block;


                cursor: pointer;
            }
        }
    }

    .stats {
        background: #202126;
        border-radius: 10px;
        padding: 15px 0;
        padding-bottom: 20px;
        margin-top: 0px;
        border-top-right-radius: 0;
        border-top-left-radius: 0;


        .stats-head {
            margin-bottom: 28px;
            display: flex;
            padding: 0 20px;
            align-items: center;
            justify-content: space-between;

            > div {
                width: 25%;
                font-size: 14px;
                color: #d5d7dd;
            }
        }

        .stats-items {
            max-height: 100%;
            overflow-y: auto;
            max-height: 50vh;
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
        }

        .stats-item {
            align-items: center;
            justify-content: space-between;
            padding: 12px 23px;
            padding-left: 20px;
            padding-right: 20px;

            border-radius: 10px;
            display: flex;
            background: #26272c;

            &:nth-child(odd) {
                background: transparent;
            }
            > div {
                width: 25%;
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
                    &.fail {
                        color: #c9033a;
                    }
                }

            }

            .pari {
                font-size: 14px;
                color: #fff;
            }

            .bet {
                span {
                    color: #61626a;
                    font-size: 14px;

                    &.success {
                        color: #00ba47;

                    }
                    &.fail {
                        color: #c9033a;
                    }

                    &.warn {
                        color: yellow
                    }
                }

            }
        }
    }


    @media screen and (max-width: 575px) {
        .stats .stats-item > .user {
            padding-bottom: 10px;
        }
        .stats .stats-item > div {
            width: 50%;
        }
        .stats .stats-item {
            padding-left: 10px;
            padding-right: 10px;
            flex-wrap: wrap;
        }
        .stats .stats-head > .user {
            padding-bottom: 10px;
        }
        .stats .stats-head > div {
            width: 50%;
        }
        .stats .stats-items {
            padding-right: 5px;
        }
        .stats .stats-head {
            flex-wrap: wrap;

            padding-left: 10px;
            padding-right: 10px;
        }
        .deposit-modal .deposit-body {
            padding: 20px 15px;
        }
    }
</style>

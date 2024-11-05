<template>
    <div class="game-stats">
        <div class="stats">
            <div class="heading">{{ $t('history.heading') }} <br> {{ $t('history.games') }}</div>
            <div class="players">
                <img src="/images/icons/players.png" alt="">
                <div>
                    <em>{{ settings.gamers }}</em>
                    <span>{{ $t('history.players') }}</span>
                </div>
            </div>
            <div class="bets">
                <img src="/images/icons/bets.png" alt="">
                <div>
                    <em>{{ settings.count && settings.count.toLocaleString() }}</em>
                    <span>{{ $t('history.all_bets') }}</span>
                </div>
            </div>
        </div>
        <div class="bets-table">
            <div class="table-head">
                <div class="user">{{ $t('history.user') }}</div>
                <div class="bet">{{ $t('history.bet') }}</div>
                <div class="chance">{{ $t('history.chance') }}</div>
                <div class="win">{{ $t('history.win') }}</div>
            </div>
            <div
                v-for="item in data"
                :key="item.date"
                :class="['table-item', { 'lose': item.prize === 0 }]"
            >
                <div class="user-item d-flex">
                    <div class="avatar">
                        <img v-lazy="{ id: item.photo, default: '/images/icons/gray-g.png' }" alt="">
                    </div>
                    <div class="username">{{ item.user }}</div>
                </div>
                <div class="bet-item">
                    <div class="bet-block">{{ item.bet }}</div>
                </div>
                <div class="chance-item">{{ item.chance }}</div>
                <div class="win-item">
                    <div :class="['win-block', { 'lose': item.prize === 0 }]">{{ item.prize && (+item.prize).toFixed(2) }}</div>
                    <img :src="item.prize > 0 ? '/images/icons/win.png' : '/images/icons/lose.png'" alt="">
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        type: {
            type: String,
            required: true,
            default: 'all'
        },
        settings: {
            type: Object,
            required: true
        }
    },
    computed: {
        data() {
            return this.$store.getters[`bets/${this.type}`].filter(item => item.chance !== '?')
        }
    }
}
</script>
<style scoped lang="scss">
    .table-item {
        margin-bottom: 5px;
        background: linear-gradient(90deg, #2b2c31 0%, rgba(61, 186, 36, 0.15) 100%);
        padding: 15px;
        display: flex;
        border-radius: 10px;

        &.lose {
            background: linear-gradient(90deg, #2b2c31 0%, rgba(201, 3, 58, 0.15) 100%);
        }

        &:last-child {
            margin-bottom: 0;
        }

        .user-item {
            width: 35%;
            align-items: center;

            .avatar {
                margin-right: 12px;
                position: relative;
                width: 40px;
                height: 40px;
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
                color: #6d6f7c
            }
        }

        .bet-item {
            width: 20%;

            .bet-block {
                background: #36373c;
                border-radius: 5px;
                padding: 10px 15px;
                font-weight: 600;
                font-size: 13px;
                width: fit-content;
            }

        }

        .chance-item {
            width: 15%;
            color: #6d6f7c;
            font-size: 14px;
            display: flex;
            align-items: center;
            padding-left: 4px;
        }

        .win-item {
            width: 30%;
            display: flex;
            align-items: center;

            .win-block {
                background: #2e3f30;
                padding: 10px 0;
                width: 75px;
                color: #3dba24;
                font-size: 14px;
                font-weight: 600;
                text-align: center;
                border-radius: 5px;

                &.lose {
                    background: #402732;
                    color: #c9033a
                }
            }

            img {
                margin-left: 12px;
            }

        }
    }

    .stats {
        align-items: center;
        padding: 0 10px;
        display: flex;

        > div {
            flex: 1;
        }

        .heading {
            color: #6d6f7c;
            font-size: 16px;
        }

        .players, .bets {
            display: flex;
            align-items: center;
            white-space: nowrap;

            img {
                margin-right: 15px;
            }

            em {
                color: #f1f1f1;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 5px;
                font-style: normal;
            }

            span {
                display: block;
                width: 100%;
                font-size: 14px;
                color: #6d6f7c;
            }
        }
    }

    .table-head {
        margin-top: 20px;
        padding: 12px 10px;
        border-top: 1px solid rgba(255, 255, 255, 0.04);
        display: flex;

        > div {
            color: #6d6f7c;
            font-size: 14px;
        }

        justify-content: space-between;

        .user {
            width: 35%;
        }

        .bet {
            width: 20%;
        }

        .chance {
            width: 15%;
        }

        .win {
            width: 30%;
        }
    }

    @media screen and (max-width: 1700px) and (min-width: 1200px) {
        .stats {
            flex-wrap: wrap;
            > div {
                flex: unset;
            }
            .heading {
                width: 100%;
                margin-bottom: 10px;
                br {
                    display: none;
                }
            }
            .players {
                width: 50%;
            }
            .bets {
                width: 50%;
            }
        }
        .table-head {
            flex-wrap: wrap;
            .user {
                width: 50%;
                margin-bottom: 5px;
                order: 0;
            }
            .bet {
                width: 50%;
                display: flex;
                justify-content: flex-end;
                /* margin-bottom: 10px; */
                order: 4;
            }
            .chance {
                width: 50%;
                order: 3;
                display: flex;
            }
            .win {
                width: 50%;
                display: flex;
                justify-content: flex-end;
                order: 1;
                margin-bottom: 5px;
            }
        }
        .table-item {
            flex-wrap: wrap;
            .user-item {
                width: 50%;
                margin-bottom: 15px;
                order: 0;
            }
            .bet-item {
                width: 50%;
                display: flex;
                justify-content: flex-end;
                /* margin-bottom: 10px; */
                order: 4;
            }
            .chance-item {
                width: 50%;
                order: 3;
                display: flex;
            }
            .win-item {
                width: 50%;
                display: flex;
                justify-content: flex-end;
                order: 1;
                margin-bottom: 15px;
            }
        }
        .hilo .left-block {
            padding: 24px 16px;
        }

    }


    @media screen and (max-width: 575px) {
        .stats {
            flex-wrap: wrap;
            > div {
                flex: unset;
            }
            .heading {
                width: 100%;
                text-align: center;
                margin-bottom: 10px;
                br {
                    display: none;
                }
            }
            .players {
                em {
                    font-size: 22px;
                }
                span {
                    font-size: 12px;
                }
                width: 40%;
                justify-content: center;
            }
            .bets {
                em {
                    font-size: 22px;
                }
                span {
                    font-size: 12px;
                }
                justify-content: center;
                width: 60%;
            }
        }
        .table-head {
            flex-wrap: wrap;
            .user {
                width: 50%;
                margin-bottom: 5px;
                order: 0;
            }
            .bet {
                width: 50%;
                display: flex;
                justify-content: flex-end;
                /* margin-bottom: 10px; */
                order: 4;
            }
            .chance {
                width: 50%;
                order: 3;
                display: flex;
            }
            .win {
                width: 50%;
                display: flex;
                justify-content: flex-end;
                order: 1;
                margin-bottom: 5px;
            }
        }
        .table-item {
            flex-wrap: wrap;
            .user-item {
                width: 50%;
                margin-bottom: 15px;
                order: 0;
            }
            .bet-item {
                width: 50%;
                display: flex;
                justify-content: flex-end;
                /* margin-bottom: 10px; */
                order: 4;
            }
            .chance-item {
                width: 50%;
                order: 3;
                display: flex;
            }
            .win-item {
                width: 50%;
                display: flex;
                justify-content: flex-end;
                order: 1;
                margin-bottom: 15px;
            }
        }
        .hilo .left-block {
            padding: 24px 16px;
        }
    }
</style>

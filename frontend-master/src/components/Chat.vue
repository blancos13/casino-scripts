<template>
    <div class="chat" :class="{'unset': (width > 992 && width < 1045) || width < 993}">
        <template class="desktop-chat" v-if="width > 992 && width < 1045" >
            <template class="show-main-chat" v-if="showMainChat">
                <div class="chat-body">
                    <div class="chat__top">
                        <div class="chat__top--heading">
                            <div class="chat__top--heading--left">
                                <img src="/images/icons/chat.png" alt="">
                                <span>{{ $t('chat.title') }}</span>
                            </div>
                            <div class="chat__top--heading--right">
                                <div class="circle--green"></div>
                                <span>{{ $t('chat.online') }}: {{ countOnline }}</span>
                            </div>
                            <div class="down-arrow" @click="
                                showMainChat = false;
                                scrollToBottom()">
                                <img src="/images/icons/down-arrow.png" alt="">
                            </div>
                        </div>
                    </div>
                    <div class="chat-content" ref="chatContent">
                        <div class="chat-item" v-for="item in items" :key="item.date">
                            <div
                                class="options"
                                :style="{'z-index': (openOptions == item.id ? '99999' : '')}"
                                @click="(openOptions != item.id ? openOptions = item.id : openOptions = null)"
                            >
                                <img src="/images/icons/options.png" alt="">
                            </div>
                            <div class="options-body" v-if="openOptions == item.id">
                                <span>{{ $t('chat.user.action') }}</span>
                                <div
                                    v-if="isDelete(item.user)"
                                    @click="deleteItem(item.id)"
                                    class="options-item">
                                    <img src="/images/icons/delete.png" alt="">
                                    <span>{{ $t('chat.user.delete') }}</span>
                                </div>
                                <div
                                    v-if="user.role !== 'user'"
                                    class="options-item"
                                    @click="openBan = true; banUserId = item.user.id">
                                    <img src="/images/icons/ban.png" alt="">
                                    <span>{{ $t('chat.user.ban') }}</span>
                                </div>
                                <div
                                    v-if="user.role !== 'user'"
                                    class="options-item"
                                    @click="openMute = true; muteUserId = item.user.id">
                                    <img src="/images/icons/delete.png" alt="">
                                    <span>{{ $t('chat.user.mute') }}</span>
                                </div>
                            </div>
                            <div class="user-info">
                                <div class="avatar">
                                    <img
                                        v-lazy="{ id: item.user.photoUrl, default: '/images/harley-test.png' }"
                                        alt="">
                                </div>
                            </div>
                            <div class="message">
                                <div class="username">{{ item.user.username }}</div>
                                <div class="text">{{ item.content }}</div>
                            </div>
                        </div>
                    </div>
                    <form @submit.prevent="send" class="send-form">
                        <input v-model="message" :placeholder="$t('chat.text_placeholder')">
                        <button type="submit" class="send">
                            <img src="/images/icons/send.png" alt="">
                        </button>
                    </form>
                </div>
            </template>
            <template v-else>
                <div class="open-chat-panel" @click="showMainChat = true">
                    <span>{{ $t('chat.title') }}</span>
                    <img src="/images/icons/down-arrow.png" alt="">
                </div>
            </template>
        </template>
        <template v-if="width > 1044">
            <div class="chat-body">
                <div class="chat__top">
                    <div class="chat__top--heading">
                        <div class="chat__top--heading--left">
                            <img src="/images/icons/chat.png" alt="">
                            <span>{{ $t('chat.title') }}</span>
                        </div>
                        <div class="chat__top--heading--right">
                            <div class="circle--green"></div>
                            <span>{{ $t('chat.online') }}: {{ countOnline }}</span>
                        </div>
                        <div class="down-arrow" @click="showMainChat = false" v-if="showMobileButton">
                            <img src="/images/icons/down-arrow.png" alt="">
                        </div>
                    </div>
                </div>
                <div class="chat-content jere" ref="chatContent">
                    <div class="chat-item" v-for="item in items" :key="item.id + width">
                        <template v-if="user.role && user.role !== 'user'">
                            <div
                                class="options"
                                :style="{'z-index': (openOptions == item.id ? '99999' : '')}"
                                @click="(openOptions != item.id ? openOptions = item.id : openOptions = null)">
                                <img src="/images/icons/options.png" alt="">
                            </div>
                            <div class="options-body" v-if="openOptions === item.id">
                                <span>{{ $t('chat.user.action') }}</span>
                                <div
                                    v-if="isDelete(item.user)"
                                    @click="deleteItem(item.id)"
                                    class="options-item">
                                    <img src="/images/icons/delete.png" alt="">
                                    <span>{{ $t('chat.user.delete') }}</span>
                                </div>
                                <div
                                    v-if="user.role !== 'user'"
                                    class="options-item"
                                    @click="openBan = true; banUserId = item.user.id">
                                    <img src="/images/icons/ban.png" alt="">
                                    <span>{{ $t('chat.user.ban') }}</span>
                                </div>
                                <div
                                    v-if="user.role !== 'user'"
                                    class="options-item"
                                    @click="openMute = true; muteUserId = item.user.id">
                                    <img src="/images/icons/delete.png" alt="">
                                    <span>{{ $t('chat.user.mute') }}</span>
                                </div>
                            </div>
                        </template>
                        <div class="user-info">
                            <div class="avatar">
                                <img
                                    v-lazy="{ id: item.user.photoUrl, default: '/images/harley-test.png' }"
                                    alt="">
                            </div>
                        </div>
                        <div class="message">
                            <div class="username">{{ item.user.username }}</div>
                            <div class="text">{{ item.content }}</div>
                        </div>
                    </div>
                </div>
                <form @submit.prevent="send" class="send-form">
                    <input v-model="message" :placeholder="$t('chat.text_placeholder')">
                    <button type="submit" class="send">
                        <img src="/images/icons/send.png" alt="">
                    </button>
                </form>
            </div>
        </template>
        <template v-if="width < 993">
            <template v-if="showMainChat">
                <div class="chat-body">
                    <div class="chat__top">
                        <div class="chat__top--heading">
                            <div class="chat__top--heading--left">
                                <img src="/images/icons/chat.png" alt="">
                                <span>{{ $t('chat.title') }}</span>
                            </div>
                            <div class="chat__top--heading--right">
                                <div class="circle--green"></div>
                                <span>{{ $t('chat.online') }}: {{ countOnline }}</span>
                            </div>
                            <div class="down-arrow" @click="showMainChat = false">
                                <img src="/images/icons/down-arrow.png" alt="">
                            </div>
                        </div>
                    </div>
                    <div class="chat-content" ref="chatContent">
                        <div class="chat-item" v-for="item in items" :key="item.id">
                            <div
                                class="options"
                                :style="{'z-index': (openOptions == item.id ? '99999' : '')}"
                                @click="(openOptions != item.id ? openOptions = item.id : openOptions = null)">
                                <img src="/images/icons/options.png" alt="">
                            </div>
                            <div class="options-body" v-if="openOptions == item.id">
                                <span>{{ $t('chat.user.action') }}</span>
                                <div
                                    v-if="isDelete(item.user)"
                                    @click="deleteItem(item.id)"
                                    class="options-item">
                                    <img src="/images/icons/delete.png" alt="">
                                    <span>{{ $t('chat.user.delete') }}</span>
                                </div>
                                <div
                                    v-if="user.role !== 'user'"
                                    class="options-item"
                                    @click="openBan = true; banUserId = item.user.id">
                                    <img src="/images/icons/ban.png" alt="">
                                    <span>{{ $t('chat.user.ban') }}</span>
                                </div>
                                <div
                                    v-if="user.role !== 'user'"
                                    class="options-item"
                                    @click="openMute = true; muteUserId = item.user.id">
                                    <img src="/images/icons/delete.png" alt="">
                                    <span>{{ $t('chat.user.mute') }}</span>
                                </div>
                            </div>
                            <div class="user-info">
                                <div class="avatar">
                                    <img
                                        v-lazy="{ id: item.user.photoUrl, default: '/images/harley-test.png' }"
                                        alt="">
                                </div>
                            </div>
                            <div class="message">
                                <div class="username">{{ item.user.username }}</div>
                                <div class="text">{{ item.content }}</div>
                            </div>
                        </div>
                    </div>
                    <form @submit.prevent="send" class="send-form">
                        <input v-model="message" :placeholder="$t('chat.text_placeholder')">
                        <button type="submit" class="send">
                            <img src="/images/icons/send.png" alt="">
                        </button>
                    </form>
                </div>
            </template>
        </template>
        <transition name="slide-fade">
            <ban v-if="openBan" @submit="ban($event)" @close="openBan = false"></ban>
        </transition>
        <transition name="slide-fade">
            <mute v-if="openMute" @submit="mute($event)" @close="openMute = false"></mute>
        </transition>
    </div>
</template>
<script>
    import { CHAT } from '../constants/socket'

    export default {
        data() {
            return {
                banUserId: null,
                muteUserId: null,
                message: '',
                countOnline: 1,
                showMobileButton: false,
                showMainChat: false,
                openOptions: null,
                showRootChat: false,
                openBan: false,
                openMute: false,
                items: []
            }
        },
        watch: {
            showMainChat() {
                setTimeout(() => {
                    this.scrollToBottom()
                })
            }
        },
        computed: {
            width() {
                return window.innerWidth;
            },
            user() {
                return this.$store.state.user
            }
        },
        components: {
          'ban': () => import('../components/modals/Ban'),
          'mute': () => import('../components/modals/Mute'),
        },
        methods: {
            async send() {
                if (!this.message.length) {
                    return
                }

                const result = await this.$api.chat.create(this.message);

                if (result.error_message) {
                    this.$notify({
                        group: 'foo',
                        type: 'error',
                        title: 'Error',
                        text: this.$t(result.error_message)
                    })
                    return
                }

                if (!result.error) {
                    this.scrollToBottom()
                    this.message = ''
                }
            },
            async deleteItem(id) {
                if (!id) {
                    return
                }

                const result = await this.$api.chat.delete(id)

                if (!result.error) {
                    this.$notify({
                        group: 'foo',
                        title: 'Message',
                        text: 'Удаление прошло успешно'
                    })
                }
            },
            async ban(text) {
                if (!this.banUserId) {
                    return
                }

                if (!text || !text.length) {
                    this.$notify({
                        group: 'foo',
                        type: 'error',
                        title: 'Error',
                        text: 'Необходимо передать причину бана'
                    })
                    return;
                }

                const banId = 2;
                const result = await this.$api.user.update({ id: this.banUserId, status_chat: banId })
                const banResult = await this.$api.ban.set({ id: this.banUserId, reason: text })

                if (!result.error) {
                    this.$store.commit('updateUser', { statusChat: banId })
                    this.$notify({
                        group: 'foo',
                        title: 'Message',
                        text: 'Бан успешен'
                    })
                }
            },
            async mute(time) {
                if (!this.muteUserId) {
                    return
                }

                if (!time) {
                    this.$notify({
                        group: 'foo',
                        title: 'Error',
                        type: 'error',
                        text: 'Необходимо передать время отключения от чата'
                    })
                    return
                }

                const muteId = 1;
                const date = new Date()
                date.setHours(date.getHours() + +time)

                const result = await this.$api.user.update({ id: this.muteUserId, mute_time: date, status_chat: muteId })

                if (!result.error) {
                    this.$store.commit('updateUser', { statusChat: muteId })
                    this.$notify({
                        group: 'foo',
                        title: 'Message',
                        text: 'Бан успешен'
                    })
                }
            },
            isDelete(user) {
                if (this.user.role === '900') {
                    return user.role !== 'admin'
                }

                return this.user.role === 'admin'
            },
            scrollToBottom() {
                if (this.$refs['chatContent']) {
                    this.$refs['chatContent'].scrollTop = this.$refs['chatContent'].scrollHeight
                    return
                }
            }
        },
        async created() {
            const result = await this.$api.chat.get()

            if (!result.error) {
                this.items = result

                setTimeout(() => {
                    this.scrollToBottom()
                })
            }
        },
        mounted() {
            if (window.innerWidth < 1045 && window.innerWidth > 992) {
                this.showMobileButton = true;
            }

            window.addEventListener('resize', () => {
                if (window.innerWidth < 1045 && window.innerWidth > 992) {
                    this.showMobileButton = true;
                }
            });
            this.$root.$on('openChat', () => {
                this.showMainChat = true;
            });

            this.$bus.$on(CHAT.NEW_MESSAGE, (payload) => {
                this.items = payload

                setTimeout(() => {
                    this.scrollToBottom()
                })
            })
            this.$bus.$on(CHAT.UPDATE_COUNT_ONLINE_USERS, payload => this.countOnline = payload)
        }
    }
</script>
<style scoped lang="scss">
    .chat-body {
        background: #202126;
        padding-top: 28px;
        padding-left: 25px;
        padding-bottom: 20px;
        display: flex;
        flex-direction: column;
        padding-right: 10px;
        height: 100vh;
    }

    .chat__top--heading {
        padding: 0 10px;
        padding-right: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .chat__top--heading--left {
            display: flex;
            align-items: center;

            img {
                margin-right: 10px;
            }

            span {
                font-size: 14px;
                color: #9799a6;
            }
        }

        .chat__top--heading--right {
            display: flex;
            align-items: center;

            .circle--green {
                width: 4px;
                height: 4px;
                border-radius: 100%;
                background: #00ba47;
                margin-right: 7px;
            }

            span {
                font-size: 12px;
                color: #5a5b65;
            }
        }
    }

    .chat-content {
        margin-top: 20px;
        flex-grow: 1;
        overflow-y: auto;
        padding-right: 10px;

        &::-webkit-scrollbar {
            width: 4px;
        }

        &::-webkit-scrollbar-track {
            background: #272930;
        }

        &::-webkit-scrollbar-thumb {
            background-color: #008533;
        }

        .chat-item {
            margin-bottom: 5px;
            width: 100%;
            border-radius: 10px;
            background: #2b2c31;
            padding: 15px;
            display: flex;
            align-items: center;
            position: relative;
            justify-content: flex-start;
            .options-body {
                position: absolute;
                right: 0;
                top: 0;
                z-index: 999;
                padding: 20px 30px;
                background: #2b2c31;
                border-radius: 15px;
                box-shadow: 0px 0px 13px 10px rgba(0,0,0, 0.3);
                border-top-right-radius: 0;
                span {
                    font-size: 12px;
                    color: #6d6f7c;
                }
                .options-item {
                    display: flex;
                    cursor: pointer;
                    align-items: center;
                    margin-top: 15px;
                    img {
                        margin-right: 10px;
                    }
                }
            }
            .options {
                position: absolute;
                right: 3px;
                top: 15px;
                cursor: pointer;
                padding: 0 10px;
            }
            &:last-child {
                margin-bottom: 0;
            }

            .user-info {
                margin-right: 10px;

                .avatar {
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
            }

            .message {
                .username {
                    color: #e6e8f4;
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .text {
                    color: #98999e;
                    font-size: 12px;
                }
            }
        }

    }

    .send-form {
        width: 100%;
        background: #1a1b20;
        display: flex;
        border-radius: 10px;
        justify-content: flex-end;
        margin-top: 10px;
        position: relative;

        input {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: transparent;
            outline: none;
            border: none;
            bottom: 0;
            padding: 0 18px;
            height: 100%;
            color: #4b4d56;

            font-size: 12px;
            width: 100%;

            &::placeholder {
                font-size: 12px;
                color: #4b4d56;
            }
        }

        padding: 12px;

        button {
            height: 40px;
            width: 40px;
            display: flex;
            outline: none;
            border: none;
            border-radius: 10px;
            position: relative;
            z-index: 2;
            cursor: pointer;
            background: rgb(0, 186, 118);
            background: linear-gradient(90deg, rgba(0, 186, 71, 1) 0%, rgba(0, 186, 118, 1) 100%);
            justify-content: center;
            align-items: center;
        }
    }

    .open-chat-panel {
        padding: 15px 20px;
        background: #19191e;
        bottom: 0;
        position: fixed;
        right: 20px;
        width: 150px;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;

        img {
            transform: rotate(-180deg);
        }
    }

    @media screen and (max-width: 1200px) {
        .chat-body {
            padding-left: 18px;
        }
    }

    @media screen and (max-width: 1040px) {
        .down-arrow {
            height: 40px;
            width: 40px;
            border-radius: 100%;
            background: #26282e;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
    }
</style>

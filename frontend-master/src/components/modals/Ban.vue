<template>
    <div class="modal" ref="modal">
        <div class="modal-body" ref="depModal">
            <img src="/images/icons/close.png" @click="$emit('close')" alt="" class="close">
            <h3>Блокировака пользователя <em>Drogba</em></h3>
            <div class="label">Причина блокировки</div>
            <input v-model="text" type="text" placeholder="Причина блокировки">

            <div class="d-flex bottom-block align-items-center ">
                <button @click="$emit('submit', text)" class="btn-accent">Заблокировать пользователя</button>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                text: ''
            }
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
    .modal {
        background: rgba(0, 0, 0, 0.5);
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

        .modal-body {
            width: 450px;
            position: relative;
            height: auto;
            padding: 32px 20px;
            z-index: 9999;
            border-radius: 10px;
            background: #202126;
            .label {
                font-size: 14px;
                color: #6d6f7c;
                display: block;
                margin-bottom: 14px;
            }
            .close {
                position: absolute;
                right: 20px;
                top: 20px;
                cursor: pointer;
            }
            h3 {
                color: #ffffff;
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 26px;
                em {
                    font-style: normal;
                    color: #ff2b2b;
                    font-size: 16px;
                }
            }
            input {
                height: 46px;
                background: #191a1f;
                outline: none;
                border: none;
                width: 100%;
                padding: 0 20px;
                border-radius: 10px;
                font-size: 14px;
                color: #6d6f7c;
                margin-bottom: 8px;
                &:last-child {
                    margin-bottom: 0;
                }
            }
            .btn-accent {
                height: 50px;
                padding: 0 24px;
                border-radius: 10px;
                background: #31333b;
                color: #fff;
                width: 100%;
                display: block;
                font-weight: bold;
                outline: none;
                border: none;
                cursor: pointer;
            }
            .or {
                font-size: 12px;
                color: #6d6f7c;
                margin: 0 10px;
            }
            .bottom-block {
                margin-top: 8px;
            }
            .social-items {
                display: flex;
                align-items: center;
                .social-item {
                    height: 50px;
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    img {
                        max-width: 30%;
                        filter: invert(1);
                    }
                    width: 52px;
                    background: #31333b;
                    border-radius: 10px;
                    margin-right: 7px;
                    cursor: pointer;
                    &:last-child {
                        margin-right: 0;
                    }
                }
            }
        }
    }
</style>

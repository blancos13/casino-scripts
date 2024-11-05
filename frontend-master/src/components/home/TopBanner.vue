<template>
    <div v-if="!isAuth" class="top-banner">
        <div class="banner" v-lazy:background="{ id: value.imageId, default: '/images/banner-1.png' }">
            <div class="banner-content">
                <div>
                    <h1 v-html="value.title"/>
                    <p v-html="value.description"></p>
                    <button class="btn btn-login" @click="$root.$emit('openLogin')">{{ $t('header.login') }}</button>
                    <button class="btn btn-reg" @click="$root.$emit('openRegister')">{{ $t('header.register') }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            data: {
                type: Object,
                default: null
            }
        },
        watch: {
            data(val) {
                this.value = val
            }
        },
        data() {
            return {
                value: null
            }
        },
        computed: {
            isAuth () {
                return this.$store.getters.isAuth;
            },
        }
    }
</script>

<style scoped lang="scss">
    .top-banner {
        border-radius: 10px;
        height: 290px;
        overflow: hidden;

        .banner {
            overflow: hidden;
            position: relative;
            background-size: cover;
            height: 100%;
            .banner-content {
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                width: 100%;
                height: 100%;
                padding: 0 40px;
                display: flex;
                align-items: center;

                > div {
                    width: 100%;
                }

                h1 {
                    font-weight: bold;
                    color: #fff;
                    display: block;
                    font-size: 36px;
                    margin-bottom: 25px;
                }

                p {
                    color: #9ac3a9;
                    font-size: 18px;
                    margin-bottom: 42px;
                    display: block;
                    width: 100%;
                }

                .btn-login {
                    border-radius: 30px;
                    outline: none;
                    background: linear-gradient(90deg, #42475a 0%, #272931 100%);
                    padding: 18px 30px;
                    cursor: pointer;
                    border: none;
                }

                .btn-reg {
                    margin-left: 10px;
                    border-radius: 30px;
                    outline: none;
                    background: linear-gradient(90deg, #00ba76 0%, #00ba47 100%);
                    padding: 18px 30px;
                    cursor: pointer;
                    border: none;
                }
            }

            img {
                width: 100%;
            }
        }
    }

    @media screen and (max-width: 1200px) {
        .top-banner .banner .banner-content h1 {
            font-size: 30px;
            margin-bottom: 15px;
        }
        .top-banner {
            height: 250px;
        }
        .top-banner .banner .banner-content p {
            margin-bottom: 30px;
            font-size: 16px;
        }
        .top-banner .banner .banner-content {
            padding: 0 25px
        }
    }


    @media screen and (max-width: 575px) {
        .top-banner {
            height: auto;
        }
        .top-banner .banner .banner-content {
            padding: 25px !important;
            position: static;
        }

    }
</style>

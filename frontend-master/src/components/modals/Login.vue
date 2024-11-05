<template>
    <div class="modal" ref="modal">
        <form @submit.prevent="submit" class="modal-body" ref="depModal">
            <img src="/images/icons/close.png" @click="$emit('close')" alt="" class="close">
            <h3>{{ $t('login.heading') }}</h3>
            <input required v-model="$v.form.loginOrEmail.$model" type="text" :placeholder="$t('login.login_or_email')">
            <input required v-model="$v.form.password.$model" type="password" :placeholder="$t('login.password')">

            <div class="d-flex bottom-block align-items-center ">
                <button class="btn-accent">{{ $t('login.login') }}</button>
                <div class="or">{{ $t('login.or') }}</div>
                <div class="social-items">
                    <a :href="href" class="social-item">
                        <img src="/images/icons/vk.png" alt="">
                    </a>
                    <!-- <div class="social-item">
                        <img src="/images/icons/facebook.png" alt="">
                    </div>
                    <div class="social-item">
                        <img src="/images/icons/telegram.png" alt="">
                    </div> -->
                </div>
            </div>
        </form>
    </div>
</template>
<script>
    import { required } from 'vuelidate/lib/validators'

    export default {
        data () {
            return {
                href: '',
                form: {
                    loginOrEmail: '',
                    password: ''
                }
            }
        },
        validations: {
            form: {
                loginOrEmail: {
                    required
                },
                password: {
                    required
                }
            }
        },
        async mounted() {
            let specifiedElement = this.$refs['depModal'];
            this.$refs['modal'].addEventListener('click', (event) => {
                let isClickInside = specifiedElement.contains(event.target);
                if (!isClickInside) {
                    this.$emit('close');
                }
            });

            const result = await this.$api.auth.getVkUrl()

	        if (!result.error) {
            	this.href = result.url
            }
        },
        methods: {
            async submit () {
                this.$v.$touch()

                if (this.$v.$invalid) {
                    // this.$toasted.global.error(this.$t('error_registration_field'))

                    this.$notify({
                        group: 'foo',
                        type: 'error',
                        title: 'Error',
                        text: this.$t('error_registration_field')
                    })

                    return
                }

                const { loginOrEmail, password } = this.form
                const result = await this.$store.dispatch('auth', { loginOrEmail, password })

                if (result === false) {
                    //this.$toasted.global.error(this.$t('signIn.error'))
                    this.$notify({
                        group: 'foo',
                        type: 'error',
                        title: 'Error',
                        text: this.$t('signIn.error')
                    })
                    return
                }

                this.$v.$reset()

                this.$notify({
                    group: 'foo',
                    title: 'Message',
                    text: this.$t('signIn.success')
                })
                if (window) {
                    window.location.reload()
                }

                this.$emit('close')
            }
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
        z-index: 99999;

        .modal-body {
            width: 450px;
            position: relative;
            height: auto;
            padding: 32px 20px;
            border-radius: 10px;
            background: #202126;
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
                background: #00b846;
                color: #fff;
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
                margin-top: 22px;
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

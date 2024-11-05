<template>
    <div class="modal" ref="modal">
        <form @submit.prevent="submit" class="modal-body" ref="depModal">
            <img src="/images/icons/close.png" @click="$emit('close')" alt="" class="close">
            <h3>{{ $t('register.heading') }}</h3>
            <input v-model="$v.form.login.$model" required type="text" :placeholder="$t('register.login')">
            <input v-model="$v.form.email.$model" required type="email" :placeholder="$t('register.email')">
            <input v-model="$v.form.password.$model" required type="password" :placeholder="$t('register.password')">
            <input v-model="$v.form.repeatPassword.$model" required type="password" :placeholder="$t('register.repeat_password')">

            <div class="d-flex bottom-block align-items-center justify-content-between">
                <button class="btn-accent">{{ $t('register.accent') }}</button>
                <div class="or">{{ $t('register.or') }}</div>
                <div class="social-items">
                    <a :href="href" class="social-item">
                        <img src="/images/icons/vk.png" alt="">
                    </a>
                    <!-- <div class="social-item">
                        <img src="/images/icons/telegram.png" alt="">
                    </div> -->
                </div>
            </div>
        </form>
    </div>
</template>
<script>
    import { required, email, minLength, maxLength } from 'vuelidate/lib/validators'

    const isEqual = (value, parentVm) => value === parentVm.password

    export default {
        data () {
            return {
            	href: '',
                form: {
	                login: '',
	                email: '',
	                password: '',
	                repeatPassword: ''
                }
            }
        },
        validations: {
            form: {
	            login: {
		            required,
		            minLength: minLength(3),
		            maxLength: maxLength(15)
	            },
	            email: {
		            required,
		            email
	            },
	            password: {
		            required,
		            minLength: minLength(3),
		            maxLength: maxLength(15)
	            },
	            repeatPassword: {
		            required,
		            isEqual: isEqual
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

                    this.$notify({
                        group: 'foo',
                        type: 'error',
                        title: 'Error',
                        text: this.$t('error_registration_field')
                    })
                    return
                }

                const result = await this.$api.auth.signUp({ ...this.form })

	            if (result.error || !result) {

                    this.$notify({
                        group: 'foo',
                        type: 'error',
                        title: 'Error',
                        text: this.$t('error_registration')
                    })
                    return
                }

                this.$v.$reset()
                this.$notify({
                    group: 'foo',
                    title: 'Message',
                    text: this.$t('success_registration')
                })
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

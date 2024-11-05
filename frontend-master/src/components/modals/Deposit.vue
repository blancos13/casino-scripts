<template>
    <div class="deposit-modal" ref="modal">
        <div class="deposit-body" ref="depModal">
            <img src="/images/icons/close.png" @click="$emit('close')" alt="" class="close">
            <h3>{{ $t('deposit.deposit_heading') }}</h3>

            <div class="container-sum">
                <div class="sum-item">
                    <div class="label">{{ $t('deposit.sum') }}:</div>
                    <div class="input">
                        <img src="/images/icons/coin.png" alt="">
                        <input v-model="sum" type="text">
                    </div>
                </div>
            </div>

            <button @click="pay" class="pay">{{ $t('deposit.deposit') }}</button>
        </div>
    </div>
</template>
<script>
    const PAYMENT_DIRECTIONS = [
        {
            id: 0,
            name: 'Qiwi',
            img: '/images/svg/qiwi.svg',
            percent: 0,
            fields: [{
                name: 'phone',
                label: 'Номер Qiwi-кошелька',
                placeholder: '79123456789',
                value: '',
                pattern: '^(91|994|82|372|375|374|44|998|972|66|90|81|1|507|7|77|380|371|370|996|9955|992|373|84)[0-9]{6,14}$',
            }]
        },
        {
            id: 1,
            name: 'Яндекс.Деньги',
            img: '/images/svg/Yandex.svg',
            percent: 0,
            fields: []
        },
        {
            id: 2,
            name: 'VISA/Mastercard/МИР (RU)',
            img: '/images/svg/visa.svg',
            percent: 0,
            fields: []
        },
        {
            id: 3,
            name: 'VISA/Mastercard (UA)',
            img: '/images/svg/visa.svg',
            percent: 0,
            fields: []
        },
        {
            id: 4,
            name: 'WebMoney',
            img: '/images/svg/WebMoney_logo.svg',
            percent: 0,
            fields: []
        },
        {
            id: 5,
            name: 'Beeline',
            img: '/images/svg/Beeline.svg',
            percent: 0,
            fields: [{
                name: 'phone',
                label: 'Номер телефона',
                placeholder: '9123456789',
                value: '',
                pattern: '^(9)\\d{9}$',
                prefix: '+'
            }]
        },
        {
            id: 6,
            name: 'Мегафон',
            img: '/images/svg/MegaFon_logo.svg',
            percent: 0,
            fields: [{
                name: 'phone',
                label: 'Номер телефона',
                placeholder: '9123456789',
                value: '',
                pattern: '^(9)\\d{9}$',
                prefix: '+'
            }]
        },
        {
            id: 7,
            name: 'Теле 2',
            img: '/images/svg/Tele2_logo.svg',
            percent: 0,
            fields: [{
                name: 'phone',
                label: 'Номер телефона',
                placeholder: '9123456789',
                value: '',
                pattern: '^(9)\\d{9}$',
                prefix: '+'
            }]
        },
        {
            id: 8,
            name: 'МТС',
            img: '/images/svg/MTS_logo.svg',
            percent: 0,
            fields: [{
                name: 'phone',
                label: 'Номер телефона',
                placeholder: '9123456789',
                value: '',
                pattern: '^(9)\\d{9}$',
                prefix: '+'
            }]
        },
        {
            id: 9,
            name: 'Сбербанк Онлайн',
            img: '/img/sber.svg',
            percent: 0,
            fields: []
        },
        {
            id: 10,
            name: 'Payeer',
            // img: 'https://static.openfintech.io/payment_providers/payeer/icon.png?w=278&c=v0.59.26#w100',
            img: '.26#w100',
            percent: 0,
            commissionAdditionalSum: 0,
            fields: []
        }
    ]

    export default {
        data() {
            return {
                sum: 100,
                payment: 0,
                payments: PAYMENT_DIRECTIONS,
                errorText: '',
                simpleText: ''
            }
        },
        async created() {
            this.payments = (await this.$api.payment.getPaymentPageSettings()).incomeDirections.map(details => {
                const direction = JSON.parse(JSON.stringify(PAYMENT_DIRECTIONS.find(direction => direction.id === details.direction)));
                direction.percent = details.incomeCommissionPercents;
                return direction;
            })

            this.payment = this.payments[0].id
        },
        methods: {
            changePayment(payment) {
                this.sum = 100;
                this.payment = payment;
            },
            async pay() {
                const params = {};
                for (const field of this.selectedPayment.fields) {
                    params[field.name] = field.value
                }

                let formData = await this.$api.payment.getPaymentForm(+this.sum, this.payment, params);
                console.log(formData);

                if (formData.error) {
                    let errorText = formData.error;
                    if (Array.isArray(this.errorText)) {
                        errorText = this.errorText[0];
                    }
                    this.errorText = errorText;
                    return;
                }

                if(formData.method === 'OFFLINE') {
                    this.isShowSimpleModal = true;
                    this.simpleText = formData.params.ru;
                    return
                }

                const form = document.createElement("form");

                form.method = formData.method;
                form.action = formData.url;

                for (const key in formData.params) {
                    const input = document.createElement("input");
                    input.name = key;
                    input.value = formData.params[key];
                    form.appendChild(input);
                }

                document.body.appendChild(form);
                form.submit();
            }
        },
        computed: {
            sumWithComission() {
                return parseFloat(+this.sum * parseFloat(1 + parseFloat(this.selectedPayment.percent / 100))).toFixed(2)
            },
            selectedPayment() {
                return this.payments.find(item => item.id === this.payment)
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
            width: 445px;
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
            .payments-items {
                display: flex;
                flex-wrap: wrap;
                margin-top: 24px;
                input {
                    display: none;
                    &:checked + label{
                        background: #00b846;
                    }
                }
                .payment-item {
                    margin-right: 8px;
                    min-width: 129px;
                    max-width: 129px;
                    margin-bottom: 8px;
                    height: 90px;
                    display: flex;
                    flex: 1;
                    justify-content: center;
                    align-items: center;
                    transition: 0.2s;
                    background: #2b2c31;
                    cursor: pointer;
                    img {
                        max-height: 70px;
                        max-width: 110px;
                    }
                    &:hover {
                        img {
                            filter: none;
                        }
                        background: #00b846;

                    }
                    &.cls:hover {
                        img {
                            filter: none !important;
                        }
                    }
                    border-radius: 10px;
                    &:nth-child(3n) {
                        margin-right: 0;
                    }
                    &:last-child {
                        margin-right: 0;
                    }

                }
            }
            .container-sum {
                display: flex;
                justify-content: space-between;
                margin-top: 15px;

                .sum-item {
                    width: 49%;
                }
            }
            .pay {
                background: #00b846;
                height: 53px;
                padding: 0 38px;
                border-radius: 10px;
                outline: none;
                border: none;
                margin-top: 25px;
                cursor: pointer;
            }
        }
    }
</style>

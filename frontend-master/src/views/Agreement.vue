<template>
    <div class="feedback">
        <h5>{{ $t('agreement.title') }}</h5>

        <template v-if="content[lang]">
            <template v-for="(itm, idx) in content[lang]">
                <div :key="`label_` + idx" class="label">{{ itm.title }}</div>
                <p :key="`content_` + idx">
                    <template v-if="itm.content && itm.content.length">
                        <span v-for="(item, index) in itm.content" :key="index">
                            {{ item }}
                        </span>
                    </template>
                    <template v-else>{{ itm.content[0] }}</template>
                </p>
            </template>
        </template>
    </div>
</template>
<script>
    import { getMeta } from '../utils/getMeta'

    export default {
        metaInfo() {
            return getMeta(this.seo)
        },
        async created() {
            const result = await this.$api.admin.getAgreement()

            if (!result || result.error) {
                console.error('Error get content agreement page: ' + result.error);
            }

            this.seo = result.seo
            this.content = result.content
        },
        computed: {
            lang() {
                return this.$store.state.lang
            }
        },
        data() {
            return {
                seo: { en: [], ru: [] },
                content: { ru: [], en: [] }
            }
        }
    }
</script>
<style scoped lang="scss">
    .feedback {
        background: #202126;
        border-radius: 10px;
        padding: 35px 25px;
        h5 {
            padding-bottom: 25px;
            border-bottom: 1px solid rgba(255,255,255, 0.1);
            font-size: 16px;
            color: #6d6f7c;
            margin-bottom: 25px;
        }
        .label {
            margin-bottom: 25px;
            font-size: 16px;
            color: #01d050;
            text-transform: uppercase;
        }
        p {
            font-size: 14px;
            color: #e6e8f4;
            margin-bottom: 35px;
            &:last-child {
                margin-bottom: 0;
            }
            span {
                display: block;
                margin-bottom: 25px;
                &:last-child {
                    margin-bottom: 0;
                }
            }
        }

    }
</style>

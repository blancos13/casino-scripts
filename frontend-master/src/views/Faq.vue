<template>
    <div class="faq">
        <div class="label">{{ $t('faq.title') }}</div>
        <div v-if="content[lang] && content[lang].length" class="items">
            <div class="item" v-for="(item, index) in content[lang]" :key="index">
                <div class="top-item" @click="(activeTab != index ? activeTab = index : activeTab = null)">
                    <span>{{ item.title }}</span>
                    <img src="/images/icons/plus.png" alt="">
                </div>
                <div class="top-answer" v-show="activeTab == index" v-html="item.content"/>
            </div>
        </div>
    </div>
</template>
<script>
    import { getMeta } from '../utils/getMeta'

    export default {
        metaInfo() {
            return getMeta(this.seo)
        },
        async created() {
            const result = await this.$api.admin.getFaq()

            if (!result || result.error) {
                console.error('Error get content faq page: ' + result.error);
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
                activeTab: null,
                seo: { en: [], ru: [] },
                content: { ru: [], en: [] }
            }
        }
    }
</script>
<style scoped lang="scss">
    .faq {
        background: #202126;
        padding: 30px 25px;
        border-radius: 10px;
        .label {
            font-size: 16px;
            color: #6d6f7c;
            margin-bottom: 26px;
        }
        .items {
            .item {
                .top-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    border-radius: 10px;
                    padding: 25px;
                    background: #272931;
                    span {
                        font-size: 16px;
                        color: #e6e8f4;
                    }
                    
                }
                

                .top-answer {
                    padding: 25px;
                    background: #494a4e;
                    border-radius: 10px;
                    margin-top: 10px;
                    &:not( [style*="display: none"]):last-child {
                        border-bottom-left-radius: 10px;
                        border-bottom-right-radius: 10px;
                    }
                }

                margin-bottom: 10px;
                border-radius: 10px;
            }
        }
    }
</style>

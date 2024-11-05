<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">
    <div class="page">
      <div class="page-block" style="display: flex;align-items: center">
        <img src="~/static/icon/support.png" class="page-title-icon">Помощь
      </div>

      <div class="page-block">
        <div class="d-flex">
          <h2>Русский язык</h2>
        </div>

        <seo-block v-model="seo.ru"></seo-block>

        <div class="admin-section-title mb-3">Основное</div>

        <div v-for="(group, idx) in structure.ru" :key="idx" class="mb-5">
          <b-input-group size="md" class="mb-2">
            <b-form-input v-model="group.title"/>
            <b-button @click="deleteQuestion(idx, 'ru')" style="margin-left:5px">Удалить вопрос</b-button>
          </b-input-group>
          <advanced-area v-model="group.content"></advanced-area>
        </div>

        <b-button @click="addQuestion('ru')">Добавить вопрос</b-button>
      </div>

      <div class="page-block">
        <div class="d-flex">
          <h2>English language</h2>
        </div>

        <seo-block v-model="seo.en"></seo-block>

        <div class="admin-section-title mb-3">Main</div>

        <div v-for="(group, idx) in structure.en" :key="idx" class="mb-5">
          <b-input-group size="md" class="mb-2">
            <b-form-input v-model="group.title"/>
            <b-button @click="deleteQuestion(idx, 'en')" style="margin-left:5px">Delete question</b-button>
          </b-input-group>
          <advanced-area v-model="group.content"></advanced-area>
        </div>

        <b-button @click="addQuestion('en')">Add question</b-button>
      </div>

      <div style="display:flex;justify-content: flex-end;margin-top: 50px; margin-bottom: 100px">
        <b-button variant="primary" @click="save" style="margin-right: 10px">Сохранить</b-button>
      </div>

    </div>
  </b-overlay>
</template>

<script>
  import utilMixin from '../../../mixins/util'
  export default {
    name: "index",
    mixins: [utilMixin],
    data() {
      return {
        seo: [],
        isLoading: false,
        structure: {
          en: [],
          ru: []
        }
      }
    },
    methods: {
      addQuestion(lang) {
        this.structure[lang].push({})
      },
      deleteQuestion(idx, lang) {
        this.structure[lang].splice(idx, 1)
      },
      async save() {
        this.isLoading = true;
        try {
          await this.$axios.$post('/api/admin/faq', { seo: this.seo, content: this.structure })
          this.successSaved()
        } catch (e) {}
        this.isLoading = false;
      },
      async refresh() {
        this.isLoading = true;
        const result = await this.$axios.$get('/api/admin/faq')
        console.log('result ', result);
        this.seo = result.seo
        this.structure = result.content
        this.isLoading = false;
      }
    },
    mounted() {
      this.refresh()
    }
  }
</script>

<style scoped>

</style>

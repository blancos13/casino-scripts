<template>
  <div class="page">
    <div class="page-block" style="display: flex;align-items: center">
      <img src="~/static/icon/news.png" class="page-title-icon">Правила
    </div>

    <div class="page-block">
      <div class="d-flex">
        <h2>Русский язык</h2>
      </div>

      <seo-block v-model="seo.ru"></seo-block>
      <div class="admin-section-title">Правила</div>

      <div v-for="(group, idx) in structure.ru" :key="idx" class="mb-5">
        <b-input-group size="md" class="mb-2">
          <label class="d-block w-100">Заголовок</label>
          <b-form-input v-model="group.title"/>
          <b-button @click="deleteBlock(idx, 'ru')" style="margin-left:5px">Удалить блок</b-button>
        </b-input-group>
        <b-input-group v-for="(item, index) in group.content" :key="index" size="md" class="mb-2 flex-wrap pl-5">
          <label class="d-block w-100">Абзац</label>
          <b-form-input :value="item" @input="updateItem($event, { index, parentIdx: idx, lang: 'ru' })"/>
          <b-button @click="deleteItem(index, idx, 'ru')" style="margin-left:5px">Удалить абзац</b-button>
        </b-input-group>
        <b-button @click="addItem('ru', idx)" class="ml-5">Добавить абзац</b-button>
      </div>

      <b-button @click="addBlock('ru')">Добавить блок</b-button>
    </div>

    <div class="page-block">
      <div class="d-flex">
        <h2>English language</h2>
      </div>

      <seo-block v-model="seo.en"></seo-block>
      <div class="admin-section-title">Rules</div>

      <div v-for="(group, idx) in structure.en" :key="idx" class="mb-5">
        <b-input-group size="md" class="mb-2">
          <label class="d-block w-100">Title</label>
          <b-form-input v-model="group.title"/>
          <b-button @click="deleteBlock(idx, 'en')" style="margin-left:5px">Delete block</b-button>
        </b-input-group>
        <b-input-group v-for="(item, index) in group.content" :key="index" size="md" class="mb-2 flex-wrap pl-5">
          <label class="d-block w-100">Абзац</label>
          <b-form-input :value="item" @input="updateItem($event, { index, parentIdx: idx, lang: 'en' })"/>
          <b-button @click="deleteItem(index, idx, 'en')" style="margin-left:5px">Delete indent</b-button>
        </b-input-group>
        <b-button @click="addItem('en', idx)" class="ml-5">Add article</b-button>
      </div>

      <b-button @click="addBlock('en')">Add block</b-button>
    </div>

     <div style="display:flex;justify-content: flex-end;margin-top: 50px; margin-bottom: 100px">
        <b-button variant="primary" @click="save" style="margin-right: 10px">Сохранить</b-button>
     </div>

  </div>
</template>

<script>

  const OBJECT_TYPES = {
    TEXT: 'TEXT',
    SUBTITLE: 'SUBTITLE',
  };

  import AdvancedArea from "../../components/advanced-area";
  import utilMixin from '../../mixins/util'

  export default {
    name: "new",
    props: ['id'],
    components: {'advanced-area': AdvancedArea},
    mixins: [utilMixin],
    data() {
      return {
        isSaving: false,
        seo: { en: [], ru: [] },
        structure: { en: [], ru: [] },
        isNews: true
      }
    },
    methods: {
      updateItem(value, { index, parentIdx, lang }) {
        this.structure[lang][parentIdx].content[index] = value
      },
      deleteBlock(idx, lang) {
        this.structure[lang].splice(idx, 1)
      },
      deleteItem(idx, parentIdx, lang) {
        this.structure[lang][parentIdx].content.splice(idx, 1)
        this.structure = { ...this.structure }
      },
      addBlock(lang) {
        this.structure[lang].push({})
      },
      addItem(lang, idxBlock) {
        const ctn =  this.structure[lang][idxBlock].content
        if (ctn && ctn.length) {
          this.structure[lang][idxBlock].content.push('')
        } else {
          this.structure[lang][idxBlock].content = ['']
        }

        this.structure = { ...this.structure }
      },
      async refresh() {
        const result = await this.$axios.$get('/api/admin/agreement')

        this.seo = result.seo
        this.structure = result.content
      },
      async save() {
        this.isSaving = true;

        try {
            await this.$axios.$post('/api/admin/agreement', { seo: this.seo, content: this.structure });
        } catch (e) {
        } finally {
          this.isSaving = false;
          this.successSaved();
          await this.refresh();
        }

      }
    },
    async mounted() {
      await this.refresh();
    }
  }
</script>

<style scoped>
  .photo-label {
    width: 100%;
    height: 250px;
    background: #F4F6F9;
    border-radius: 5px;

    color: #9098A6;
    font-size: 15px;

    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .photo-input {
    display: none;
  }

  .textarea-close {
    position: absolute;
    right: 0;
    height: 41px;
    width: 41px;
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #D7DBE7;
    border-radius: 0px 7px 0px 0px;
    background: white;
    cursor: pointer;
  }

  .textarea-close_winners {
    top: -41px;
  }
</style>

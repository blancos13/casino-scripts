<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">
    <div class="page">
      <div class="page-block" style="display: flex;align-items: center">
        <img src="~/static/icon/landing.png" class="page-title-icon">
        Главная
      </div>

      <div class="page-block">
        <h2>Русский язык</h2>
        
        <seo-block v-model="structure.seo['ru']"></seo-block>

        <div class="admin-section-title">Верхний блок</div>

        <label>Заголовок</label>
        <advanced-area v-model="structure.full_block['ru'].title"></advanced-area>

        <label>Текст</label>
        <advanced-area v-model="structure.full_block['ru'].description"></advanced-area>

        <label>Картинка</label>
        <b-input-group size="md">
          <b-form-file accept="image/*" v-model="fileRus"></b-form-file>
        </b-input-group>

        <div class="statistic-title">Статистика</div>
        <!-- <label>Всего игроков + реальное количество (меняется везде)</label>
        <b-input-group size="md">
          <b-form-input v-model="structure.totalGamers" type="number"></b-form-input>
        </b-input-group>

        <label>Всего выведено + реальная сумма (меняется везде)</label>
        <b-input-group size="md">
          <b-form-input v-model="structure.totalOutcomes" type="number"></b-form-input>
        </b-input-group> -->

        <label>Сыграно игр + реальное количество (меняется везде)</label>
        <b-input-group size="md">
          <b-form-input v-model="structure.totalGames" type="number" placeholder="Значение которое будет добавлено к реальному"/>
        </b-input-group>
        <p>Реальное значение: {{ realMeaning }}</p>
      </div>

      <div class="page-block">
        <h2>English language</h2>

        <seo-block v-model="structure.seo['en']"></seo-block>

        <div class="admin-section-title">Up block</div>

        <label>Title</label>
        <advanced-area v-model="structure.full_block['en'].title"></advanced-area>

        <label>Description</label>
        <advanced-area v-model="structure.full_block['en'].description"></advanced-area>

        <label>Bakcground image</label>
        <b-input-group size="md">
          <b-form-file accept="image/*" v-model="fileEn"></b-form-file>
        </b-input-group>

        <div class="statistic-title">statistics</div>
        <!-- <label>Всего игроков + реальное количество (меняется везде)</label>
        <b-input-group size="md">
          <b-form-input v-model="structure.totalGamers" type="number"></b-form-input>
        </b-input-group>

        <label>Всего выведено + реальная сумма (меняется везде)</label>
        <b-input-group size="md">
          <b-form-input v-model="structure.totalOutcomes" type="number"></b-form-input>
        </b-input-group> -->

        <label>Games played + actual number (varies everywhere)</label>
        <b-input-group size="md" class="flex-wrap">
          <b-form-input v-model="structure.totalGames" type="number" placeholder="The value to be added to the real"/>
        </b-input-group>
        <p>Real value: {{ realMeaning }}</p>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 50px;margin-bottom: 100px">
          <b-button variant="primary" @click="save">Сохранить</b-button>
      </div>

    </div>
  </b-overlay>
</template>

<script>
  import AdvancedArea from "../../../components/advanced-area";
  import utilMixin from '../../../mixins/util'

  export default {
    name: "dice",
    components: {AdvancedArea},
    mixins: [utilMixin],
    data() {
      return {
        isLoading: false,
        fileRus: null,
        fileEn: null,
        realMeaning: 0,
        structure: {
          seo: [],
          full_block: { en: {}, ru: {} },
          totalGames: 0
        }
      }
    },
    methods: {
      async refresh() {
        this.isLoading = true;
        this.structure = await this.$axios.$get('/api/admin/main-page');

        console.log('structure ', this.structure);

        this.realMeaning = await this.$axios.$get('/api/admin/settings/landing/count-games');
        this.isLoading = false;
      },
      async save() {
        this.isLoading = true;
        try {
          let fileIdRus = null;
          let fileIdEn = null;

          if (this.fileRus) {
            const formDataRus = new FormData()
            formDataRus.append('file', this.fileRus)

            fileIdRus = await this.$axios.$post('/api/attachment', formDataRus)
            this.structure.full_block['ru'].imageId = fileIdRus
          }

          if (this.fileEn) {
            const formDataEn = new FormData()
            formDataEn.append('file', this.fileEn)

            fileIdEn = await this.$axios.$post('/api/attachment', formDataEn)
            this.structure.full_block['en'].imageId = fileIdEn
          }

          await this.$axios.$post('/api/admin/main-page', {
            full_block: this.structure.full_block,
            totalGames: +this.structure.totalGames,
            seo: this.structure.seo
          });
          this.successSaved();
        } catch (e) {
          console.log('Error: ' + e);
        }

        this.isLoading = false;
      }
    },
    mounted() {
      this.refresh()
    }
  }
</script>

<style scoped>
.statistic-title {
  margin-top: 20px;
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  color: #374059;
}
</style>

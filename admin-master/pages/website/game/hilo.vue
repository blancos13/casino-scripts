<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">

    <div class="page">
      <div class="page-block" style="display: flex;align-items: center">
        Hilo
      </div>

      <div class="page-block">
        <h2>Русский язык</h2>

        <seo-block v-model="settings.seo.ru"></seo-block>
      </div>

      <div class="page-block">
        <h2>English language</h2>

        <seo-block v-model="settings.seo.en"></seo-block>
      </div>
      
      <div class="page-block">
        <h2>Main</h2>
        
        <label>Комиссия от выйгрыша</label>
        <b-input-group size="md" prepend="%" style="width: 280px">
          <b-form-input v-model="settings.commission" type="number"></b-form-input>
        </b-input-group>
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
    name: "hilo",
    mixins: [utilMixin],
    data() {
      return {
        isLoading: false,
        isSaving: false,
        settings: {
          seo: {},
          commission: 0
        }
      }
    },
    methods: {
      async refresh() {
        this.isLoading = true;
        this.settings = await this.$axios.$get('/api/admin/hilo')
        this.isLoading = false;
      },
      async save() {
        this.isSaving = true;
        try {
          await this.$axios.$post('/api/admin/hilo', {
            seo: this.settings.seo,
            commission: this.settings.commission
          });
          this.successSaved();
        } catch (e) {}
        this.isSaving = false;
      }
    },
    mounted() {
      this.refresh()
    }
  }
</script>

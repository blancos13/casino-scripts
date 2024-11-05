<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">

    <div class="page">
      <div class="page-block" style="display: flex;align-items: center">
        Crash
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

        <hr>

        <label>Вероятность <strong>проиграть</strong> с коэффициентом 1.01 - 1.50</label>
        <b-input-group size="md" prepend="%" style="width: 280px">
          <b-form-input v-model="settings.crash_s" type="number"></b-form-input>
        </b-input-group>
        <label>Вероятность <strong>проиграть</strong> с коэффициентом 1.51 - 2.50</label>
        <b-input-group size="md" prepend="%" style="width: 280px">
          <b-form-input v-model="settings.crash_m" type="number"></b-form-input>
        </b-input-group>
        <label>Вероятность <strong>проиграть</strong> с коэффициентом 2.51 - 4.00</label>
        <b-input-group size="md" prepend="%" style="width: 280px">
          <b-form-input v-model="settings.crash_b" type="number"></b-form-input>
        </b-input-group>
        <label>Вероятность <strong>проиграть</strong> с коэффициентом 4.01 - 10.00</label>
        <b-input-group size="md" prepend="%" style="width: 280px">
          <b-form-input v-model="settings.crash_h" type="number"></b-form-input>
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
    name: "dice",
    mixins: [utilMixin],
    data() {
      return {
        isLoading: false,
        isSaving: false,
        settings: {
          seo: {},
          commission: 0,
          crash_s: 0,
          crash_m: 0,
          crash_b: 0,
          crash_h: 0,
        }
      }
    },
    methods: {
      async refresh() {
        this.isLoading = true;
        this.settings = await this.$axios.$get('/api/admin/crash')
        this.isLoading = false;
      },
      async save() {
        this.isSaving = true;
        try {
          await this.$axios.$post('/api/admin/crash', {
            seo: this.settings.seo,
            commission: this.settings.commission,
            crash_s: this.settings.crash_s,
            crash_m: this.settings.crash_h,
            crash_b: this.settings.crash_b,
            crash_h: this.settings.crash_h,
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

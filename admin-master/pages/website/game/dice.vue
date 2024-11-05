<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">

    <div class="page">
      <div class="page-block" style="display: flex;align-items: center">
        Дайс
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
        <div class="admin-section-title">Main</div>

        <label>Комиссия от ставки</label>
        <b-input-group size="md" prepend="%" style="width: 280px">
          <b-form-input v-model="settings.commission" type="number"></b-form-input>
        </b-input-group>

        <label>Cтандартное значение выигрыша</label>
        <b-input-group size="md" prepend="%" style="width: 280px">
          <b-form-input v-model="settings.defaultChance" type="number"></b-form-input>
        </b-input-group>

        <label>Выбор шанса выигрыша в дайсе</label>
        <div style="display:flex;align-items: center">
          <span style="margin-right: 10px">От</span>
          <b-input-group size="md" prepend="%" style="width: 110px">
            <b-form-input v-model="settings.minChance" type="number"></b-form-input>
          </b-input-group>
          <span style="margin-right: 10px;margin-left: 10px">До</span>
          <b-input-group size="md" prepend="%" style="width: 110px">
            <b-form-input v-model="settings.maxChance" type="number"></b-form-input>
          </b-input-group>
        </div>

        <!-- <label>Шанс бонуса 1x</label>
        <b-input-group size="md" prepend="%" style="width: 280px">
          <b-form-input v-model="settings.bonusChance" type="number"></b-form-input>
        </b-input-group>

        <label>Шанс бонуса 2x</label>
        <b-input-group size="md" prepend="%" style="width: 280px">
          <b-form-input v-model="settings.bonus2Chance" type="number"></b-form-input>
        </b-input-group> -->

        <label>Деградация шанса</label>
        <b-input-group size="md" prepend="%" style="width: 280px">
          <b-form-input v-model="settings.degradationChance" type="number"></b-form-input>
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
          defaultChance: 0,
          minChance: 0,
          maxChance: 0,
          bonusChance: 0,
          bonus2Chance: 0,
          degradationChance: 0
        }
      }
    },
    methods: {
      async refresh() {
        this.isLoading = true;
        this.settings = await this.$axios.$get('/api/admin/dice')
        this.isLoading = false;
      },
      async save() {
        this.isSaving = true;
        try {
          await this.$axios.$post('/api/admin/dice', {
            seo: this.settings.seo,
            commission: +this.settings.commission,
            defaultChance: +this.settings.defaultChance,
            minChance: +this.settings.minChance,
            maxChance: +this.settings.maxChance,
            // bonusChance: +this.settings.bonusChance,
            // bonus2Chance: +this.settings.bonus2Chance,
            degradationChance: +this.settings.degradationChance
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

<style scoped>

</style>

<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">
    <div class="page">
      <div class="page-block" style="display: flex;align-items: center"><img src="~/static/icon/ruble.png"
                                                                             class="page-title-icon">Заработать
      </div>
      <div class="page-block">
        <seo-block v-model="structure.seo"></seo-block>
        <div class="admin-section-title">Основное</div>
        <label>Заголовок</label>
        <advanced-area v-model="structure.title" height="100"></advanced-area>

        <label>Текст</label>
        <advanced-area v-model="structure.text"></advanced-area>

        <div class="admin-section-title">Цель 1</div>
        <label>Описание цели</label>
        <advanced-area v-model="structure.firstActiveDescription" height="200"></advanced-area>
        <label>Сумма</label>
        <b-input-group size="md" prepend="₽">
          <b-form-input v-model="structure.firstActiveBonus" type="number"></b-form-input>
        </b-input-group>

        <div class="admin-section-title">Цель 2</div>
        <label>Описание цели</label>
        <advanced-area v-model="structure._10ActiveDescription" height="200"></advanced-area>
        <label>Сумма</label>
        <b-input-group size="md" prepend="₽">
          <b-form-input v-model="structure._10ActiveBonus" type="number"></b-form-input>
        </b-input-group>
        <div style="display: flex;margin-top: 20px">
          <b-button variant="outline" :class="{'btn-outline_pressed' : structure._10ActiveType === 0}" @click="structure._10ActiveType = 0">Цикличный</b-button>
          <b-button variant="outline" :class="{'btn-outline_pressed' : structure._10ActiveType === -1}" @click="structure._10ActiveType = -1">Разовый</b-button>
        </div>

        <div class="admin-section-title">Цель 3</div>
        <label>Описание цели</label>
        <advanced-area v-model="structure._50ActiveDescription" height="200"></advanced-area>
        <label>Сумма</label>
        <b-input-group size="md" prepend="₽">
          <b-form-input v-model="structure._50ActiveBonus" type="number"></b-form-input>
        </b-input-group>
        <div style="display: flex;margin-top: 20px">
          <b-button variant="outline" :class="{'btn-outline_pressed' : structure._50ActiveType === 0}" @click="structure._50ActiveType = 0">Цикличный</b-button>
          <b-button variant="outline" :class="{'btn-outline_pressed' : structure._50ActiveType === -1}" @click="structure._50ActiveType = -1">Разовый</b-button>
        </div>

        <div class="admin-section-title">Дополнительные настройки</div>

        <label>От суммы с каждого пополнения реферала</label>
        <b-input-group size="md" prepend="%">
          <b-form-input v-model="structure.incomePercent" type="number"></b-form-input>
        </b-input-group>

        <label>На баланс за каждого активного реферала</label>
        <b-input-group size="md" prepend="₽">
          <b-form-input v-model="structure.eachActiveBonus" type="number"></b-form-input>
        </b-input-group>

        <label>% от выигрыша реферала</label>
        <b-input-group size="md" prepend="%">
          <b-form-input v-model="structure.winBetPercent" type="number"></b-form-input>
        </b-input-group>

        <div style="display: flex; justify-content: flex-end; margin-top: 100px">
          <b-button variant="primary" @click="save">Сохранить</b-button>
        </div>
      </div>

    </div>
  </b-overlay>
</template>

<script>
  import utilMixin from '../../../mixins/util'
  import AdvancedArea from "../../../components/advanced-area";

  export default {
    name: "dice",
    components: {AdvancedArea},
    mixins: [utilMixin],
    data() {
      return {
        isLoading: false,
        structure: {
          seo: [],
          title: null,
          text: null,
          firstActiveDescription: null,
          firstActiveBonus: null,

          _10ActiveDescription: null,
          _10ActiveBonus: null,
          _10ActiveType: null,

          _50ActiveDescription: null,
          _50ActiveBonus: null,
          _50ActiveType: null,

          incomePercent: null,
          eachActiveBonus: null,
          winBetPercent: null,
        }
      }
    },
    methods: {
      async refresh() {
        this.isLoading = true;
        this.structure = await this.$axios.$get('/api/admin/settings/referral')
        this.isLoading = false;
      },
      async save() {
        this.isLoading = true;
        try {
          await this.$axios.$post('/api/admin/settings/referral', {
            title: this.structure.title,
            text: this.structure.text,
            firstActiveDescription: this.structure.firstActiveDescription,
            firstActiveBonus: +this.structure.firstActiveBonus,

            _10ActiveDescription: this.structure._10ActiveDescription,
            _10ActiveBonus: +this.structure._10ActiveBonus,
            _10ActiveType: +this.structure._10ActiveType,

            _50ActiveDescription: this.structure._50ActiveDescription,
            _50ActiveBonus: +this.structure._50ActiveBonus,
            _50ActiveType: +this.structure._50ActiveType,

            incomePercent: +this.structure.incomePercent,
            eachActiveBonus: +this.structure.eachActiveBonus,
            winBetPercent: +this.structure.winBetPercent,
            seo: this.structure.seo
          });
          this.successSaved();
        } catch (e) {}
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

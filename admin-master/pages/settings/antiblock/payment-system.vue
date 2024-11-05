<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">
    <div class="page">
      <div class="page-block" style="display: flex;align-items: center">
        <img src="~/static/icon/pos-terminal.png" class="page-title-icon">Касса
      </div>
      <div class="page-block">

        <label>Добавить домен</label>

        <b-form-group>
          <b-form-radio v-model="paymentSystem" value="0">Основная касса (Пиастрикс)</b-form-radio>
          <b-form-radio v-model="paymentSystem" value="2">Резервная касса (Payeer)</b-form-radio>
        </b-form-group>

        <div style="display:flex;justify-content: flex-end;margin-top: 50px">
          <b-button variant="primary" @click="save" style="margin-right: 10px">Сохранить</b-button>
        </div>
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
        paymentSystem: 0,
        isLoading: false,
      }
    },
    methods: {
      async save() {
        this.isLoading = true;
        try {
          await this.$axios.$post('/api/admin/settings/payment-system', {paymentSystem: +this.paymentSystem});
          this.successSaved();
        } catch (e) {
        }
        this.isLoading = false;
      },
      async refresh() {
        this.isLoading = true;
        this.paymentSystem = (await this.$axios.$get('/api/admin/settings/payment-system')).paymentSystem;
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

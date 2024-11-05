<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">
    <div class="page">
      <div class="page-block" style="display: flex;align-items: center">
        <img src="~/static/icon/pay_link.png" class="page-title-icon">Домен кассы
      </div>
      <div class="page-block">
        <label>Введите домен</label>
        <b-input-group size="md" style="width: 280px">
          <b-form-input v-model="link"></b-form-input>
        </b-input-group>
      </div>

      <div style="display:flex;justify-content: flex-end;margin-top: 50px">
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
        isLoading: false,
        link: null
      }
    },
    methods: {
      async save() {
        this.isLoading = true;
        try {
          await this.$axios.$post('/api/admin/settings/pay-link', {link: this.link});
          this.successSaved();
        } catch (e) {}
        this.isLoading = false;
      },
      async refresh() {
        this.isLoading = true;
        this.link = (await this.$axios.$get('/api/admin/settings/pay-link')).link;
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

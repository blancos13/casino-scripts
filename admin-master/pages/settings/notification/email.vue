<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">
    <div class="page">
      <div class="page-block" style="display: flex;align-items: center">
        <img src="~/static/icon/email.png" class="page-title-icon">Уведомления о запросе выплаты/E-mail
      </div>
      <div class="page-block">

        <label>Добавить email</label>
        <b-input-group size="md">
          <b-form-input v-model="inputValue" placeholder="Введите email"
                        v-on:keyup.enter="addValue"></b-form-input>
        </b-input-group>

        <b-table :items="list" :fields="[{key: 'email', label: 'E-mail'}]" style="margin-top: 20px">
          <template v-slot:cell(email)="row">
            <div style="display: flex;align-items: center">
              {{list[row.index]}}
              <img src="~/static/icon/minus-row.png" style="margin-left: auto;" @click="list.splice(row.index, 1)">
            </div>
          </template>

        </b-table>
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
    name: "email",
    mixins: [utilMixin],
    data() {
      return {
        isLoading: false,
        inputValue: null,
        list: []
      }
    },
    methods: {
      addValue() {
        if (this.inputValue && !this.list.find(item => item === this.inputValue)) {
          this.list.push(this.inputValue)
        }
      },
      async save() {
        this.isLoading = true;
        try {
          await this.$axios.$post('/api/admin/settings/notification-email', this.list);
          this.successSaved();
        } catch (e) {}
        this.isLoading = false;
      },
      async refresh() {
        this.isLoading = true;
        this.list = await this.$axios.$get('/api/admin/settings/notification-email');
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

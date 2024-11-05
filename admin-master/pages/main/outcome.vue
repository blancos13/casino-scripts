<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">
    <div class="page">
      <div class="page-block" style="display: flex;align-items: center">
        <img src="~/static/icon/ruble.png" class="page-title-icon">Заявки на вывод
      </div>
      <div class="page-block">
        <b-table :items="incomes" :fields="fields">
          <template v-slot:cell(id)="row">
            <div>
              <a :href="row.item.userUrl" target="_blank">{{row.value}}</a>
              <nuxt-link :to="`/main/user/${row.item.userId}`" target="_blank">ADM</nuxt-link>
            </div>
          </template>
          <template v-slot:cell(name)="row">
            <div style="display: flex;align-items: center;cursor: pointer" @click="openTabLink(row.item.userSocialUrl)">
              <img :src="row.item.userPhotoUrl" style="height: 18px;width: 18px;margin-right: 8px;border-radius: 50%">{{row.value}}
            </div>
          </template>

          <template v-slot:cell(direction)="row">
             {{DIRECTION_MAP[row.value]}}
          </template>

          <template v-slot:cell(sum)="row">
            {{row.value}} ₽
          </template>

          <template v-slot:cell(totalOutcome)="row">
            {{row.value}} ₽
          </template>

          <template v-slot:cell(date)="row">
            {{moment(row.value).format('DD.MM.YY HH:mm')}}
          </template>
          <template v-slot:cell(status)="row">
            <div v-if="row.value === 1 || row.value === 2" class="status-indicator" :class="getStatusClass(row.value)"></div>
            <div v-if="row.value === 0" style="display: flex">
              <img src="~/static/icon/accept.png" style="margin-right: 5px" @click="accept(incomes[row.index].id)">
              <img src="~/static/icon/reject.png" @click="reject(incomes[row.index].id)">
            </div>
          </template>
        </b-table>
      </div>

    </div>
  </b-overlay>
</template>

<script>
  import * as moment from 'moment';

  const DIRECTION_MAP = {
    0: 'Qiwi',
    1: 'Яндекс.Деньги',
    2: 'VISA/Mastercard (RU)',
    3: 'VISA/Mastercard (UA)',
    4: 'WebMoney',
    5: 'Beeline',
    6: 'Мегафон',
    7: 'Теле 2',
    8: 'MTC',
    9: 'Сбербанк Онлайн'
  };

  export default {
    name: "index",
    data() {
      return {
        DIRECTION_MAP: DIRECTION_MAP,
        isLoading: false,
        fields: [
          {key: 'userId', label: 'ID', sortable: true },
          {key: 'name', label: 'Пользователь', sortable: true },
          {key: 'direction', label: 'Вывод на', sortable: false},
          {key: 'sum', label: 'Сумма', sortable: true, tdClass: 'right-td',thClass: 'right-td'},
          {key: 'totalOutcome', label: 'В общем', sortable: true, tdClass: 'right-td',thClass: 'right-td'},
          {key: 'date', label: 'Время запроса', sortable: false},
          {key: 'status', label: 'Статус', sortable: false},
        ],
        incomes: []
      }
    },
    methods: {
      openTabLink(url) {
        window.open(url, '_blank')
      },
      async refresh() {
        this.isLoading = true;
        this.incomes = await this.$axios.$get('/api/admin/payment/history/outcome');
        this.isLoading = false;
      },
      async accept(id) {
        this.isLoading = true;
        try {
          await this.$axios.$put('/api/admin/payment/history/outcome/' + id + '/accept');
        } catch (e) {
          this.$bvToast.toast(e.response.data.message, {
            title: 'Ошибка',
            variant: 'danger',
            solid: true
          });
        }
        this.isLoading = false;
        this.refresh();
      },
      async reject(id) {
        this.isLoading = true;
        // await this.$axios.$put('/api/admin/payment/history/outcome/' + id + '/reject');
        this.isLoading = false;
        this.refresh();
      },
      getStatusClass(statusType) {

        let suffix = '';
        if (statusType === 1) {
          suffix = 'green'
        } else if (statusType === 0) {
          suffix = 'orange'
        } else if(statusType === 2){
          suffix = 'red'
        }

        return `status-indicator_${suffix}`
      },
      moment
    },
    mounted() {
      this.refresh()
    }
  }
</script>

<style scoped>
  .competitions-table tr {
    background-color: blue;
    cursor: pointer;
  }

  .status-indicator {
    height: 10px;
    width: 10px;
    border-radius: 50%;
  }

  .status-indicator_green {
    background-color: #3FD395;
  }

  .status-indicator_orange {
    background-color: #F2994A;
  }

  .status-indicator_red {
    background-color: #EB5757;
  }
</style>

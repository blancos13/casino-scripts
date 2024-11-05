<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">
    <div class="page">
      <div class="page-block" style="display: flex;align-items: center">
        <div @click="$router.push('/main/user')"><img src="~/static/icon/mdi_people.png" class="page-title-icon">Пользователи</div>
      </div>
      <div class="page-block">
        <img style="height: 100px;width: 100px;border-radius: 50%" :src="user.photoUrl">
        <div class="admin-section-title">Основная информация</div>
        <div class="user-info-row">
          <label>Имя и фамилия</label>
          <div>{{user.name}}</div>
        </div>
        <div class="user-info-row">
          <label>ID</label>
          <div>{{user.id}}</div>
        </div>
        <div class="user-info-row">
          <label>Регистрация</label>
          <div>{{moment(user.registrationDate).format('DD.MM.YY')}}</div>
        </div>
        <div class="user-info-row">
          <label>Постедняя активность</label>
          <div>{{moment(user.lastActionDate).format('DD.MM.YY')}}</div>
        </div>
        <div class="user-info-row">
          <label>IP</label>
          <div>{{user.ip}}</div>
        </div>

        <!-- <div class="user-info-row">
          <label>Всего рефералов</label>
          <div>{{user.totalReferrals}}</div>
        </div> -->

        <div class="user-info-row">
          <label>Соц сеть</label>
          <a :href="user.socialUrl" target="_blank">{{user.socialUrl}}</a>
        </div>

        <div class="admin-section-title">Платежная информация</div>
        <div class="user-info-row">
          <label>Последнее пополенение</label>
          <div>{{user.lastIncome}}</div>
        </div>
        <div class="user-info-row">
          <label>Всего пополнено</label>
          <div>{{user.totalIncome}}</div>
        </div>
        <div class="user-info-row">
          <label>Всего выведено</label>
          <div>{{user.totalOutcome}}</div>
        </div>
        <div class="user-info-row">
          <label>Сейчас на счету</label>
          <div>{{user.balance}}</div>
        </div>

        <div class="admin-section-title">Игровая информация</div>
        <div class="user-info-row">
          <label>Сиграно в dice</label>
          <div>{{user.diceCount}} раз</div>
        </div>
        <div class="user-info-row">
          <label>Сиграно в mine</label>
          <div>{{user.minesCount}} раз</div>
        </div>
        <div class="user-info-row">
          <label>Сиграно в roulette</label>
          <div>{{user.rouletteCount}} раз</div>
        </div>
        <div class="user-info-row">
          <label>Сиграно в jackpot</label>
          <div>{{user.jackpotCount}} раз</div>
        </div>
        <div class="user-info-row">
          <label>Сиграно в crash</label>
          <div>{{user.crashCount}} раз</div>
        </div>
        <div class="user-info-row">
          <label>Сиграно в hilo</label>
          <div>{{user.hiloCount}} раз</div>
        </div>
        <div class="user-info-row">
          <label>Сиграно в battle</label>
          <div>{{user.battleCount}} раз</div>
        </div>

        <div class="admin-section-title">Чат</div>
        <div class="user-info-row">
          <b-button v-if="isBan" variant="outline" @click="unban" style="margin-right: 10px">
            Разбанить
          </b-button>
          <b-button v-else variant="danger" @click="ban" style="margin-right: 10px">
            Забанить
          </b-button>
        </div>

        <div style="display: flex;justify-content: flex-end;margin-top: 50px">
          <b-button variant="outline" @click="showBalanceModal" style="margin-right: 10px">Установить баланс</b-button>

          <!-- <b-button variant="danger" v-if="!user.isReferralBonusesBlocked"
                    @click="blockReferralBonuses" style="margin-right: 10px">Заблокировать бонусы по рефке
          </b-button>
          <b-button variant="outline" v-if="user.isReferralBonusesBlocked"
                    @click="unblockReferralBonuses" style="margin-right: 10px">Разблокировать бонусы по рефке
          </b-button> -->
        </div>
      </div>


      <b-modal id="balanceModal" title="Установка баланса" hide-footer>
        <div>
          <label>Новый баланс</label>
          <b-input-group size="md" style="width: 280px">
            <b-form-input v-model="newBalance" type="number"></b-form-input>
          </b-input-group>

          <div style="display: flex; justify-content: flex-end; margin-top: 20px">
            <b-button variant="primary" @click="saveNewBalance">Сохранить</b-button>
          </div>
        </div>
      </b-modal>

    </div>
  </b-overlay>
</template>

<script>
  import * as moment from 'moment';

  export default {
    name: "index",
    data() {
      return {
        newBalance: 0,
        isLoading: false,
        fields: [
          {key: 'id', label: 'ID', sortable: true},
          {key: 'name', label: 'Пользователь', sortable: true},
          {key: 'registrationDate', label: 'Регистриация', sortable: true},
          {key: 'lastActionDate', label: 'Последний вход', sortable: true},
          {key: 'balance', label: 'Баланс', sortable: true, tdClass: 'right-td', thClass: 'right-td'},
          {key: 'gamesCount', label: 'Кол. игр', sortable: true, tdClass: 'right-td', thClass: 'right-td'},
          {key: 'ip', label: 'IP', sortable: true},
        ],
        user: {}
      }
    },
    computed: {
      isBan() {
        return this.user.statusChat === 2
      }
    },
    methods: {
      showBalanceModal() {
        this.newBalance = this.user.balance;
        this.$bvModal.show('balanceModal')
      },
      async saveNewBalance() {
        this.isLoading = true;
        await this.$axios.$put('/api/admin/users/' + this.$route.params.id + '/balance', {balance: +this.newBalance});
        this.isLoading = false;
        this.$bvModal.hide('balanceModal');
        this.refresh();
      },
      async ban() {
        await this.$axios.$put('/api/admin/users/' + this.$route.params.id + '/ban');
        this.refresh();
      },
      async unban() {
        await this.$axios.$put('/api/admin/users/' + this.$route.params.id + '/unban');
        this.refresh();
      },
      // async blockReferralBonuses() {
      //   await this.$axios.$put('/api/admin/users/' + this.$route.params.id + '/ref-bonus/block');
      //   this.refresh();
      // },
      // async unblockReferralBonuses() {
      //   await this.$axios.$put('/api/admin/users/' + this.$route.params.id + '/ref-bonus/unblock');
      //   this.refresh();
      // },
      openTabLink(url) {
        window.open(url, '_blank')
      },
      async refresh() {
        this.isLoading = true;
        this.user = await this.$axios.$get('/api/admin/users/' + this.$route.params.id);

        console.log('user ', this.user);

        this.isLoading = false;
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

  .user-info-row {
    display: flex;
    align-items: center;
  }

  .user-info-row label {
    color: #9098A6;
    font-size: 15px;

    width: 300px;
  }
</style>

<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">
    <div class="page">
      <div class="page-block" style="display: flex;align-items: center">
        <img src="~/static/icon/mdi_people.png" class="page-title-icon">Пользователи
      </div>

      <div class="page-block">
        <div style="display: flex;justify-content: flex-end">
          <label style="margin-right: 20px">Поиск</label>
          <b-input-group size="md" style="width: 200px">
            <b-form-input v-model="filter"></b-form-input>
          </b-input-group>
        </div>

        <b-table :items="users"
                 :fields="fields"
                 ref="table"
                 :sort-by="sortBy"
                 :sort-direction="sortType"
                 @sort-changed="sortChanged"
                 :no-provider-sorting="true">

          <template v-slot:cell(id)="row">
            <div class="simple-content">
              <!-- <a :href="row.item.url" target="_blank">{{row.value}}</a> -->
              <nuxt-link :to="`/main/user/${row.item.id}`" target="_blank">{{row.value}}</nuxt-link>
            </div>
          </template>
          <template v-slot:cell(name)="row">
            <div style="display: flex;align-items: center;cursor: pointer" @click="openTabLink(row.item.socialUrl)">
              <img :src="row.item.photoUrl" style="height: 18px;width: 18px;margin-right: 8px;border-radius: 50%">{{row.value}}
            </div>
          </template>

          <template v-slot:cell(registrationDate)="row">
            {{moment(row.value).format('DD.MM.YY')}}
          </template>


          <template v-slot:cell(lastActionDate)="row">
            {{moment(row.value).format('DD.MM.YY')}}
          </template>


          <!-- <template v-slot:cell(referralOwnerId)="row">
            <div v-if="row.value">
              <nuxt-link :to="`/main/user/${row.value}`" target="_blank">{{ row.value }}</nuxt-link>
            </div>
          </template> -->
        </b-table>
      </div>

    </div>
  </b-overlay>
</template>

<script>
  import * as moment from 'moment';

  export default {
    name: "index",
    data() {
      return {
        isLoading: false,
        sortBy: 'id',
        sortType: 'asc',
        skip: 0,
        count: 50,
        filter: '',
        fields: [
          {key: 'id', label: 'ID', sortable: true },
          {key: 'username', label: 'Пользователь', sortable: true },
          {key: 'registrationDate', label: 'Регистриация', sortable: true },
          {key: 'lastActionDate', label: 'Последний вход', sortable: true },
          {key: 'balance', label: 'Баланс', sortable: true, tdClass: 'right-td',thClass: 'right-td' },
          {key: 'gamesCount', label: 'Кол. игр', sortable: true, tdClass: 'right-td',thClass: 'right-td'},
          // {key: 'referralOwnerId', label: 'Пригласивший', sortable: true, tdClass: 'right-td',thClass: 'right-td'},
          {key: 'ip', label: 'IP', sortable: true },
        ],
        users: []
      }
    },
    watch: {
      filter() {
        this.skip = 0;
        this.refresh();
      }
    },
    methods: {
      sortChanged(ctx) {
        this.skip = 0;
        this.refresh(ctx);
      },
      openTabLink(url) {
        window.open(url, '_blank')
      },
      async refresh(ctx, update) {
        if(ctx) {
          this.sortBy = ctx.sortBy;
          this.sortType = ctx.sortDesc ? 'desc' : 'asc';
        }

        this.isLoading = true;
        const users = await this.$axios.$get(`/api/admin/users?skip=${this.skip}&count=${this.count}&sort_field=${this.sortBy}&sort_type=${this.sortType}&filter=${this.filter}`);


        console.log('users ', users);

        if(update) {
          this.users.push(...users)
        } else {
          this.users = users;
        }
        this.isLoading = false;
      },
      moment
    },
    async mounted() {
      await this.refresh();

      let requesting = false;
      addEventListener('scroll', async () => {
        if (requesting) {
          return;
        }

        if (this.$refs.table) {
          const coords = this.$refs.table.$el.getBoundingClientRect()
          let bottomVisible = coords.bottom < window.innerHeight;

          if (bottomVisible) {
            requesting = true;
            this.skip += 50;
            await this.refresh(null, true)
            requesting = false;
          }
        }
      });
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

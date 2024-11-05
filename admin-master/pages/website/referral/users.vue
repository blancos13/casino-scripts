<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">
    <div class="page">
      <div class="page-block" style="display: flex;align-items: center">
        <img src="~/static/icon/mdi_people.png" class="page-title-icon">Инфо пользователей
      </div>
      <div class="page-block">
        <b-table
          ref="table"
          :items="users"
          :fields="fields"
          :sort-by="sortBy"
          :sort-direction="sortType"
          @sort-changed="refresh"
          :no-provider-sorting="true">
          <template v-slot:cell(id)="row">
            <div>
              <a :href="row.item.url" target="_blank">{{ row.value }}</a>
              <nuxt-link :to="`/main/user/${row.item.id}`" target="_blank">ADM</nuxt-link>
            </div>
          </template>
          <template v-slot:cell(name)="row">
            <div style="display: flex;align-items: center;cursor: pointer"
                 @click="openTabLink(users[row.index].socialUrl)">
              <img :src="row.item.photoUrl"
                   style="height: 18px;width: 18px;margin-right: 8px;border-radius: 50%">{{ row.value }}
            </div>
          </template>

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
      fields: [
        {key: 'id', label: 'ID', sortable: true},
        {key: 'name', label: 'Пользователь', sortable: true},
        {key: 'referrals', label: 'Кол-во рефералов', tdClass: 'right-td', thClass: 'right-td', sortable: true},
        {key: 'income', label: 'Заработок', tdClass: 'right-td', thClass: 'right-td', sortable: true},
        {key: 'ip', label: 'IP', tdClass: 'right-td', thClass: 'right-td', sortable: true},
      ],
      users: []
    }
  },
  methods: {
    openTabLink(url) {
      window.open(url, '_blank')
    },
    async refresh(ctx) {
      if(ctx) {
        this.sortBy = ctx.sortBy;
        this.sortType = ctx.sortDesc ? 'desc' : 'asc';
      }
      this.skip = 0;

      this.isLoading = true;
      this.users = await this.$axios.$get(`/api/admin/referral/users?skip=${this.skip}&count=${this.count}&sort_field=${this.sortBy}&sort_type=${this.sortType}`);
      this.isLoading = false;
    },
    getStatusClass(competition) {

      let suffix = '';
      if (competition.dateStatus === 1) {
        suffix = 'green'
      } else if (competition.dateStatus === 2) {
        suffix = 'orange'
      } else if (competition.dateStatus === 0) {
        suffix = 'red'
      }

      console.log(suffix)
      return `status-indicator_${suffix}`
    },
    moment
  },
  async mounted() {
    await this.refresh()

    let requesting = false;
    addEventListener('scroll', async () => {
      if (requesting) {
        return;
      }

      const coords = this.$refs.table.$el.getBoundingClientRect()
      let bottomVisible = coords.bottom < window.innerHeight;

      if (bottomVisible) {
        requesting = true;
        this.skip += 50;
        this.isLoading = true;
        this.users.push(...(await this.$axios.$get(`/api/admin/referral/users?skip=${this.skip}&count=${this.count}&sort_field=${this.sortBy}&sort_type=${this.sortType}`)));
        this.isLoading = false;
        requesting = false;
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

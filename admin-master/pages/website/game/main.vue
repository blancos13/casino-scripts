<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">

    <div class="page">
        <div class="page-block" style="display: flex;align-items: center">
            Игры
        </div>

        <div class="page-block">
            <b-form-group label="Доступные игры:" v-slot="{ ariaDescribedby }">
                <b-form-checkbox-group
                    id="checkbox-group-1"
                    v-model="settings.games"
                    :options="options"
                    :aria-describedby="ariaDescribedby"
                    name="flavour-1"
                />
            </b-form-group>
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
    name: "main",
    mixins: [utilMixin],
    data() {
      return {
        isLoading: false,
        isSaving: false,
        settings: {
          games: []
        }
      }
    },
    computed: {
        options() {
            return [
                { text: 'Mines', value: 'mine' },
                { text: 'Dice', value: 'dice' },
                { text: 'Roulette', value: 'roulette' },
                { text: 'Jackpot', value: 'jackpot' },
                { text: 'Battle', value: 'battle' },
                { text: 'Crash', value: 'crash' },
                { text: 'Hilo', value: 'hilo' },
            ]
        }
    },
    methods: {
      async refresh() {
        this.isLoading = true;
        this.settings.games = await this.$axios.$get('/api/admin/games')
        this.isLoading = false;
      },
      async save() {
        this.isSaving = true;
        try {
          await this.$axios.$post('/api/admin/games', this.settings.games);

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
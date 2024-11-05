<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">
    <div class="page">
      <div class="page-block" style="display: flex;align-items: center">
        Настройки соц сетей
      </div>

      <div class="page-block">
        <label>Vk</label>
        <b-input-group size="md" style="width: 280px">
          <b-form-input v-model="links.vk"></b-form-input>
        </b-input-group>

        <label>Facebook</label>
        <b-input-group size="md" style="width: 280px">
          <b-form-input v-model="links.facebook"></b-form-input>
        </b-input-group>

        <label>Telegram</label>
        <b-input-group size="md" style="width: 280px">
          <b-form-input v-model="links.telegram"></b-form-input>
        </b-input-group>

        <label>Telegram(support)</label>
        <b-input-group size="md" style="width: 280px">
          <b-form-input v-model="links.telegramSupport"></b-form-input>
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
        links: {

        }
      }
    },
    methods: {
      async save() {
        this.isLoading = true;
        try {
          await this.$axios.$post('/api/admin/settings/social', { ...this.link });
          this.successSaved();
        } catch (e) {}
        this.isLoading = false;
      },
      async refresh() {
        this.isLoading = true;
        this.links = await this.$axios.$get('/api/admin/settings/social');
        this.isLoading = false;
      }
    },
    mounted() {
      this.refresh()
    }
  }
</script>

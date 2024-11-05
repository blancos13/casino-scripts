export default {
  methods: {
    successSaved() {
      this.$bvToast.toast('Изменения сохранены!', {
        title: 'Успешно',
        variant: 'success',
        solid: true
      });
    },
    capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  }
}

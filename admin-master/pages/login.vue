<template>
  <div style="display: flex;justify-content: center;align-items: center;height: 100vh;width: 100%">
    <b-button :href="authLink" variant="primary">Войти</b-button>
  </div>
</template>

<script>
  export default {
    name: "login",
    layout: 'empty',
    data() {
      return {
        authLink: ''
      }
    },
    // async mounted() {
    //   this.authLink = (await this.$axios.$get('/api/auth/google/url')).url;
    //   const code = this.$route.query.code;
    //   if(code) {
    //     const token = (await this.$axios.$post(`/api/auth/google/user?code=${code}`)).token;
    //     this.$cookies.set('token', token);
    //     this.$router.push('/')
    //   }
    // }
  }
</script>

<style scoped>

</style>

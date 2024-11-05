<template>
  <div class="layout-screen">
    <div class="layout-wrapper">
      <left-menu class="layout-wrapper__left-menu"></left-menu>
      <Nuxt/>
    </div>
  </div>
</template>

<style scoped>
  .layout-screen {
    padding-top: 30px;
    width: 100%;
    min-height: 100vh;
    background: #F2F6F9;
    display: flex;
    justify-content: center;
  }

  .layout-wrapper {
    width: 90%;
    display: flex;
  }

  .layout-wrapper__left-menu {
    width: 380px;
    margin-right: 20px;
  }
</style>
<script>
  import LeftMenu from "../components/left-menu";

  export default {
    components: {'left-menu': LeftMenu}
  }
</script>

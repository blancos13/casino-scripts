<template>
  <div>
    <b-card no-body class="left-menu-block">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button
          @click="$router.push('/website/game/main')"
          class="left-menu-block__button"
          block
          variant="info">
            Игры
            <img v-b-toggle.games src="~/static/icon/arrow_down.png" @click.prevent.stop class="left-menu-block__button-icon-end">
        </b-button>
      </b-card-header>

      <b-collapse
        id="games"
        accordion="games"
        role="tabpanel">
          <div style="margin-left: 20px">
            <nuxt-link to="/website/game/dice">
              <b-button class="left-menu-block__button" block variant="info">
                Dice
              </b-button>
            </nuxt-link>
            <nuxt-link to="/website/game/mines">
              <b-button class="left-menu-block__button" block variant="info">
                Mine
              </b-button>
            </nuxt-link>
            <nuxt-link to="/website/game/roulette">
              <b-button class="left-menu-block__button" block variant="info">
                Roulette
              </b-button>
            </nuxt-link>
            <nuxt-link to="/website/game/crash">
              <b-button class="left-menu-block__button" block variant="info">
                Crash
              </b-button>
            </nuxt-link>
            <nuxt-link to="/website/game/battle">
              <b-button class="left-menu-block__button" block variant="info">
                Battle
              </b-button>
            </nuxt-link>
            <nuxt-link to="/website/game/jackpot">
              <b-button class="left-menu-block__button" block variant="info">
                Jackpot
              </b-button>
            </nuxt-link>
            <nuxt-link to="/website/game/hilo">
              <b-button class="left-menu-block__button" block variant="info">
                Hilo
              </b-button>
            </nuxt-link>
          </div>
      </b-collapse>
    </b-card>

    <b-card no-body class="left-menu-block">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button
        class="left-menu-block__button"
        block
        v-b-toggle.main-settings
        variant="info">
          Основное
          <img src="~/static/icon/arrow_down.png" class="left-menu-block__button-icon-end">
        </b-button>
      </b-card-header>

      <b-collapse
        id="main-settings"
        accordion="main-settings"
        role="tabpanel">
        <nuxt-link to="/main/user">
          <b-button class="left-menu-block__button" block variant="info">
            <img src="~/static/icon/mdi_people.png" class="left-menu-block__button-icon-start">
            Пользователи
          </b-button>
        </nuxt-link>
        <nuxt-link to="/main/outcome">
          <b-button class="left-menu-block__button" block variant="info">
            <img src="~/static/icon/ruble.png" class="left-menu-block__button-icon-start">
            Заявки на вывод
          </b-button>
        </nuxt-link>
        <nuxt-link to="/main/income">
          <b-button class="left-menu-block__button" block variant="info">
            <img src="~/static/icon/income.png" class="left-menu-block__button-icon-start">
            Пополнение
          </b-button>
        </nuxt-link>
        <nuxt-link to="/website/bonus">
          <b-button class="left-menu-block__button" block variant="info">
            <img src="~/static/icon/bonus.png" class="left-menu-block__button-icon-start">
            Бонусы(Промокоды)
          </b-button>
        </nuxt-link>

        <nuxt-link to="/website/landing">
          <b-button class="left-menu-block__button" block variant="info">
            <img src="~/static/icon/landing.png" class="left-menu-block__button-icon-start">
            Главная
          </b-button>
        </nuxt-link>
        <nuxt-link to="/website/faq">
          <b-button class="left-menu-block__button" block variant="info">
            <img src="~/static/icon/support.png" class="left-menu-block__button-icon-start">
            Помощь
          </b-button>
        </nuxt-link>
        <nuxt-link to="/website/rules">
          <b-button class="left-menu-block__button" block variant="info">
            <img src="~/static/icon/news.png" class="left-menu-block__button-icon-start">
            Правила
          </b-button>
        </nuxt-link>
        <!-- <nuxt-link to="/website/agreement">
          <b-button class="left-menu-block__button" block variant="info">
            <img src="~/static/icon/news.png" class="left-menu-block__button-icon-start">
            Соглашение
          </b-button>
        </nuxt-link> -->
      </b-collapse>
    </b-card>

    <b-card no-body class="left-menu-block mb-5">
      <b-card-header header-tag="header" class="p-1" role="tab">
        <b-button
          class="left-menu-block__button"
          block
          v-b-toggle.accordion-settings
          variant="info">
          Настройки
          <img src="~/static/icon/arrow_down.png" class="left-menu-block__button-icon-end">
        </b-button>
      </b-card-header>

      <b-collapse
        id="accordion-settings"
        accordion="accordion-settings"
        role="tabpanel">
        <b-button class="left-menu-block__button" block v-b-toggle.antiblock variant="info">
          <img src="~/static/icon/anti_block.png" class="left-menu-block__button-icon-start">
          Антиблок
          <img src="~/static/icon/arrow_down.png" class="left-menu-block__button-icon-end">
        </b-button>
        <b-collapse id="antiblock" visible accordion="antiblock" role="tabpanel">
          <div style="margin-left: 20px">
            <nuxt-link to="/settings/antiblock/main-link">
              <b-button class="left-menu-block__button" block variant="info">
                <img src="~/static/icon/main_link.png" class="left-menu-block__button-icon-start">
                Главный домен
              </b-button>
            </nuxt-link>
            <nuxt-link to="/settings/antiblock/pay-link">
              <b-button class="left-menu-block__button" block variant="info">
                <img src="~/static/icon/pay_link.png" class="left-menu-block__button-icon-start">
                Домен кассы
              </b-button>
            </nuxt-link>
            <nuxt-link to="/settings/antiblock/social">
              <b-button class="left-menu-block__button" block variant="info">
                Соц сети
              </b-button>
            </nuxt-link>
            <nuxt-link to="/settings/antiblock/payment-system">
              <b-button class="left-menu-block__button" block variant="info">
                <img src="~/static/icon/pos-terminal.png" class="left-menu-block__button-icon-start">
                Касса
              </b-button>
            </nuxt-link>
          </div>
        </b-collapse>

        <b-button class="left-menu-block__button" block v-b-toggle.notification variant="info">
          <img src="~/static/icon/notification.png" class="left-menu-block__button-icon-start">
          Уведомления
          <img src="~/static/icon/arrow_down.png" class="left-menu-block__button-icon-end">
        </b-button>
        <b-collapse id="notification" visible accordion="notification" role="tabpanel">
          <div style="margin-left: 20px">
            <nuxt-link to="/settings/notification/email">
              <b-button class="left-menu-block__button" block variant="info">
                <img src="~/static/icon/email.png" class="left-menu-block__button-icon-start">
                E-mail
              </b-button>
            </nuxt-link>
          </div>
        </b-collapse>

      </b-collapse>
    </b-card>

    <a href="/" target="_blank">
      <b-button variant="info" style="width: 100%">На сайт</b-button>
    </a>
    <!-- <b-button variant="danger" style="width: 100%;margin-top: 16px;margin-bottom:50px;">Выйти</b-button> -->
  </div>
</template>

<script>
  export default {
    name: "left-menu",
    methods: {
      toggleBlock(block) {
        this.activeBlock = this.activeBlock === block ? null : block;
        return true;
      },
      // async logout() {
      //   try {
      //     await this.$axios.post(this.$router.resolve('/').href, {}, {
      //       auth: {
      //         username: 'not_valid',
      //         password: 'not_valid'
      //       }
      //     });
      //   } finally {
      //     this.$cookies.remove('token');
      //     document.location=this.$router.resolve('/login').href
      //   }
      // }
    }
  }
</script>

<style scoped>
  .left-menu-block {
    background: none;
    border: none;
    border-radius: 13px;
    padding: 20px 16px;
  }

  .left-menu-block > header {
    background: none;
    border: none;
  }

  .left-menu-block_active {
    background: white;
    box-shadow: 0px 3px 8px rgba(233, 240, 245, 0.07), 0px 1px 6px rgba(230, 237, 248, 0.2);
  }

  .left-menu-block_active > header {
    background: white;
  }

  .left-menu-block__button {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    background: none;
    border: none;
    color: #465272;
    font-size: 16px;
    font-weight: 500;
  }

  .left-menu-block__button-icon-start {
    margin-right: 16px;
  }

  .left-menu-block__button-icon-end {
    margin-left: auto;
  }
</style>

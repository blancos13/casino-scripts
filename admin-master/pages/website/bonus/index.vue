<template>
  <b-overlay
    :show="isLoading"
    opacity="0.6"
    spinner-variant="primary"
    class="loader">
    <div class="page">
      <div class="page-block" style="display: flex;align-items: center">
        <img src="~/static/icon/bonus.png" class="page-title-icon">
        Бонусы page
      </div>

      <div class="page-block">
        <h2>Ежедневные квесты</h2>
        <div style="display:flex;align-items: center;flex-wrap: wrap;" v-for="(itm, idx) in structure.quests.ru" :key=idx>
          <p class="mb-0">{{ itm.title }}</p>
          <b-input-group size="md" prepend="Diamond">
            <b-form-input v-model.number="structure.quests.gainIds[itm.gainId]" type="number"></b-form-input>
          </b-input-group>
          <span class="d-block w-100" style="min-height:15px"/>
        </div>
        <span style="margin-right: 10px;margin-left: 10px">Бонус при открытии сундука</span>
        <b-input-group size="md" prepend="руб.">
          <b-form-input v-model.number="structure.chest" type="number"></b-form-input>
        </b-input-group>
        <span style="margin-right: 10px;margin-left: 10px">Количество алмазов необходимых для открытия сундука</span>
        <b-input-group size="md" prepend="кол.">
          <b-form-input v-model.number="structure.countDiamondForChest" type="number"></b-form-input>
        </b-input-group>

        <hr>

        <h2>Доп. бонусы</h2>
        <span style="margin-right: 10px;margin-left: 10px">Бонус за регистрацию</span>
        <b-input-group size="md" prepend="%">
          <b-form-input v-model="structure.registrationBonus" type="number"></b-form-input>
        </b-input-group>

        <hr>

        <h2>Разовые бонусы</h2>
        <div class="d-flex">
            <div v-for="itm in oneTimeTitles" :key="itm.title" style="min-width:150px;max-width:150px;font-weight:bold;text-align:center;margin-right:2px;">
                {{ itm.title }}
            </div>
        </div>

        <b-input-group
          style="display:flex;flex-wrap:nowrap;margin-bottom:5px"
          v-for="(item, idx) in structure.oneTime"
          :key="item.name + Math.random()">
          <div style="max-width:150px;margin-right:2px">
            <b-form-input :value="item.name" @change="changeItem('name', $event, idx)"/>
          </div>
          <div style="max-width:150px;margin-right:2px">
            <b-form-input :value="item.gainDiamond" @change="changeItem('gainDiamond', $event, idx)" type="number"/>
          </div>
          <div style="max-width:150px;margin-right:2px">
            <b-form-input :value="item.gain" @change="changeItem('gain', $event, idx)" type="number"/>
          </div>
          <div style="max-width:150px;margin-right:2px">
            <datetime v-if="!item.indefinitely" type="datetime" v-model="item.date"/>
            <div class="d-flex justify-content-center align-items-center h-100" style="min-width:150px;" v-else>Бессрочно</div>
          </div>
          <div style="max-width:150px;margin-right:2px">
            <b-form-input :value="item.countActivation" @change="changeItem('countActivation', $event, idx)" type="number"/>
          </div>
          <div style="max-width:150px;min-width:150px;margin-right:2px;display:flex;justify-content:center;">
            <b-form-checkbox v-model="item.indefinitely">Бессрочно</b-form-checkbox>
          </div>
          <b-button @click="deleteItem(idx)" style="margin-left:auto;">Удалить</b-button>
        </b-input-group>

        <div style="margin-top:50px">
          <b-button variant="primary" @click="addItem">Добавить</b-button>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 50px; margin-bottom: 100px">
          <b-button variant="primary" @click="save">Сохранить</b-button>
      </div>
    </div>
  </b-overlay>
</template>

<script>
  import utilMixin from '../../../mixins/util'
  import AdvancedArea from "../../../components/advanced-area";
import LogoVue from '../../../components/Logo.vue';
  export default {
    name: "dice",
    components: {AdvancedArea},
    mixins: [utilMixin],
    data() {
      return {
        isLoading: false,
        oneTimeTitles: [
          { title: 'Название' },
          { title: 'Сумма алмазов' },
          { title: 'Сумма рублей' },
          { title: 'Срок действия' },
          { title: 'Количество активация' },
          { title: 'Бессрочно' },
        ],
        structure: {
          quests: { en: [], ru: [] },
          payment: null,
          registrationBonus: null,
          chest: null,
          countDiamondForChest: null,
          oneTime: []
        }
      }
    },
    methods: {
      addItem() {
        this.structure.oneTime.push({})
      },
      deleteItem(index) {
        this.structure.oneTime.splice(index, 1)
      },
      changeItem(name, value, idx) {
        this.structure.oneTime[idx][name] = value
      },
      async refresh() {
        this.isLoading = true;
        this.structure = await this.$axios.$get('/api/admin/settings/bonus')
        console.log('this.structure ', this.structure);
        this.isLoading = false;
      },
      async save() {
        this.isLoading = true;
        try {
          console.log('this.structure ', this.structure);
          await this.$axios.$post('/api/admin/settings/bonus', {
            quests: this.structure.quests,
            payment: this.structure.payment,
            registrationBonus: this.structure.registrationBonus,
            chest: this.structure.chest,
            countDiamondForChest: this.structure.countDiamondForChest,
            oneTime: this.structure.oneTime
          });
          this.successSaved()
        } catch (e) {

        }
        this.isLoading = false;
      },
    },
    mounted() {
      this.refresh()
    }
  }
</script>

<style>
.statistic-title {
  margin-top: 20px;
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  color: #374059;
}

.vdatetime-input {
  background: #F4F6F9;
  border: none;
  border-radius: 7px;

  display: block;
  width: 100%;
  height: calc(1.5em + 0.75rem + 2px);
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

</style>

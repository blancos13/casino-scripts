<template>
  <div>
    <div class="admin-section-title">SEO</div>
    <label>Заголовок (title)</label>
    <b-form-input v-model="title" @change="emitInput"></b-form-input>

    <label>Описание (description)</label>
    <b-form-input v-model="description" @change="emitInput"></b-form-input>


    <b-button variant="outline" @click="metaMounted.push({key: '', content: ''})" style="margin-top: 10px">
      Добавить
    </b-button>
    <b-table :items="metaMounted" :fields="[{key: 'actions', thStyle: 'width: 30px'}, {key: 'key'}, {key: 'content'}]" class="competition-places-table">
      <template v-slot:cell(actions)="row">
        <div style="display: flex;align-items: center;height: 36px">
          <img src="~/static/icon/minus-row.png" style="margin-left: auto;" @click="metaMounted.splice(row.index, 1),emitInput()">
        </div>
      </template>

      <template v-slot:cell(key)="row">
        <div>
          <b-input-group size="md">
            <b-form-input v-model="metaMounted[row.index].key" @change="emitInput"></b-form-input>
          </b-input-group>
        </div>
      </template>

      <template v-slot:cell(content)="row">
        <div>
          <b-input-group size="md" >
            <b-form-input v-model="metaMounted[row.index].content" @change="emitInput"></b-form-input>
          </b-input-group>
        </div>
      </template>
    </b-table>
  </div>
</template>

<script>

import * as _ from 'lodash'
export default {
  name: "seo-block",
  props: ['value'],
  data() {
    return {
      title: '',
      description: '',
      metaMounted: []
    }
  },
  watch: {
    value() {
      if (!this.value || !this.value.length) {
        return
      }

      this.title = _.get(this.value.find(item => item.key === 'title'), 'content', '');
      this.description = _.get(this.value.find(item => item.key === 'description'), 'content', '');
      this.metaMounted = this.value.filter(item => !['title', 'description'].includes(item.key))
    }
  },
  methods: {
    emitInput() {
      const inputValue = this.metaMounted.filter(item => !['title', 'description'].includes(item.key))
      inputValue.push({key: 'title', content: this.title})
      inputValue.push({key: 'description', content: this.description})
      this.$emit('input', inputValue);
    }
  },
  mounted() {
    if (!this.value || !this.value.length) {
      return
    }

    this.title = _.get(this.value.find(item => item.key === 'title'), 'content', '');
    this.description = _.get(this.value.find(item => item.key === 'description'), 'content', '');
    this.metaMounted = this.value.filter(item => !['title', 'description'].includes(item.key))
  }
}
</script>

<style scoped>

</style>

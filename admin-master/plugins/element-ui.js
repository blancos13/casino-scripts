import Vue from 'vue';
import lang from 'element-ui/lib/locale/lang/ru-RU';
import locale from 'element-ui/lib/locale';
import 'element-ui/lib/theme-chalk/index.css';

// configure language
locale.use(lang)

import {Transfer, Select, Option} from 'element-ui';
Vue.component('el-transfer', Transfer);
Vue.component('el-select', Select);
Vue.component('el-option', Option);

import { Datetime } from 'vue-datetime';
import 'vue-datetime/dist/vue-datetime.css'
 
Vue.component('datetime', Datetime);
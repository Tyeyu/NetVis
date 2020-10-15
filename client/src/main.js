// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import axios from 'axios'

import router from './router/index';
import store from "./vuex/store";
Vue.config.productionTip = false
Vue.prototype.$axios = axios;
axios.defaults.baseURL = 'http://localhost:3000/';

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  store
})

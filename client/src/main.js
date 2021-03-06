// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import axios from 'axios'

import $ from 'jquery'
window.$ = $

import * as d3 from 'd3'
window.d3 = d3

import router from './router/index';
import store from "./vuex/store";
Vue.config.productionTip = false
Vue.prototype.$axios = axios;
axios.defaults.baseURL = 'http://localhost:3000/';

import iView from 'iview';
import 'iview/dist/styles/iview.css';
Vue.use(iView);

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start();
  next();
});

router.afterEach(route => {
  iView.LoadingBar.finish();
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  store
})

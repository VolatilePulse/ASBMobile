/** @fileOverview Application entry point */

import 'bootstrap-vue/dist/bootstrap-vue.min.css';
import '@/assets/scss/app.scss';


// Vue and its plugins
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import Router from 'vue-router';
Vue.use(BootstrapVue);
Vue.use(Router);

// Register Vue's router hooks with the class-component system
import Component from 'vue-class-component';
Component.registerHooks([
   'beforeRouteEnter',
   'beforeRouteLeave',
   'beforeRouteUpdate' // for vue-router 2.2+
]);


import App from '@/ui/app.vue';

Vue.config.productionTip = false;

new App().$mount('#app');

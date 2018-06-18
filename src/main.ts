/** @fileOverview Application entry point */

import 'bootstrap-vue/dist/bootstrap-vue.min.css';
import '@/assets/scss/app.scss';
import './registerServiceWorker';


// PouchDB and its plugins
import PouchDB from 'pouchdb-core';
import PouchIDB from 'pouchdb-adapter-idb';
import PouchFind from 'pouchdb-find';
import PouchLiveFind from 'pouchdb-live-find';
PouchDB.plugin(PouchIDB);
PouchDB.plugin(PouchFind);
PouchDB.plugin(PouchLiveFind);

// Vue and its plugins
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import PouchVue from 'pouch-vue';
import Router from 'vue-router';
Vue.use(BootstrapVue);
Vue.use(PouchVue, { pouch: PouchDB });
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

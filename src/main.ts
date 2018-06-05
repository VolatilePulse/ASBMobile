/** @fileOverview Application entry point */

import 'bootstrap-vue/dist/bootstrap-vue.min.css';
import '@/assets/scss/app.scss';
import './registerServiceWorker';


import PouchDB from 'pouchdb-core';
import PouchIDB from 'pouchdb-adapter-idb';
import PouchFind from 'pouchdb-find';
import PouchLiveFind from 'pouchdb-live-find';
PouchDB.plugin(PouchIDB);
PouchDB.plugin(PouchFind);
PouchDB.plugin(PouchLiveFind);


import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import PouchVue from 'pouch-vue';
import Router from 'vue-router';
Vue.use(BootstrapVue);
Vue.use(PouchVue, { pouch: PouchDB });
Vue.use(Router);


import App from '@/ui/app.vue';

Vue.config.productionTip = false;

new App().$mount('#app');

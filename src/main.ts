/** @fileOverview Application entry point */

import 'bootstrap-vue/dist/bootstrap-vue.min.css';
import '@/assets/scss/app.scss';
import './registerServiceWorker';

import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import PouchVue from 'pouch-vue';
import PouchDB from 'pouchdb-core';
import PouchIDB from 'pouchdb-adapter-idb';
import PouchFind from 'pouchdb-find';
import PouchLiveFind from 'pouchdb-live-find';


import App from '@/ui/views/App.vue';
import About from '@/ui/views/About.vue';
import Welcome from '@/ui/views/Welcome.vue';
import Settings from '@/ui/views/Settings.vue';
import Servers from '@/ui/views/Servers.vue';
import Extractor from '@/ui/views/Extractor.vue';
import Library from '@/ui/views/Library.vue';
import Tester from '@/ui/views/Tester.vue';


Vue.config.productionTip = false;
Vue.use(BootstrapVue);

PouchDB.plugin(PouchIDB);
PouchDB.plugin(PouchFind);
PouchDB.plugin(PouchLiveFind);

Vue.use(PouchVue, {
   pouch: PouchDB,
});

new App({
   components: {
      About: About,
      Welcome: Welcome,
      Settings: Settings,
      Servers: Servers,
      Extractor: Extractor,
      Library: Library,
      Tester: Tester,
   },
}).$mount('#app');

import Vue from 'vue';
import Component from 'vue-class-component';
import BootstrapVue from 'bootstrap-vue';
import PouchVue from 'pouch-vue';

import PouchDB from 'pouchdb-core';
import PouchIDB from 'pouchdb-adapter-idb';
import PouchFind from 'pouchdb-find';
import PouchLiveFind from 'pouchdb-live-find';

import { SettingsManager, LibraryManager } from './data';
import * as Servers from './servers';
import theStore from '@/ui/store';

import Shell from './ui/shell/Shell.vue';


Vue.use(BootstrapVue);

PouchDB.plugin(PouchIDB);
PouchDB.plugin(PouchFind);
PouchDB.plugin(PouchLiveFind);

Vue.use(PouchVue, {
   pouch: PouchDB,
});

Vue.config.productionTip = false;


@Component({
   template: '<Shell ref="shell"/>',
   components: { Shell },
})
class App extends Vue {
   store = theStore;

   async created() {
      await this.store.loadStatImages();

      // Initialise sub-systems
      await SettingsManager.initialise();
      await LibraryManager.initialise();
      await Servers.initialise(this.store.devMode);

      // Create a creature to use for extraction, etc
      theStore.currentServerName = 'Official Server';
   }
}


export const app = new App({ el: '#app' });
export const settings = SettingsManager;
export const libraries = LibraryManager;


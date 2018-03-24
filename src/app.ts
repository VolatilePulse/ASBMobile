import Vue from "vue";
import BootstrapVue from 'bootstrap-vue';
import PouchDB from 'pouchdb-browser';
import PouchFind from 'pouchdb-find';
import PouchLiveFind from 'pouchdb-live-find';
import PouchVue from 'pouch-vue';

import { SettingsManager, LibraryManager } from './data';
import * as Servers from "./servers";
import { VueCreature } from "./ark/creature";
import { statNames } from "./consts";

import Shell from "./ui/shell/Shell.vue";
import { Server } from "@/ark/multipliers";
import Component from "vue-class-component";
import theStore from "@/ui/store";

Vue.use(BootstrapVue);

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
      theStore.currentServerName = "Official Server";
   }
}


export const app = new App({ el: "#app" });
export const settings = SettingsManager;
export const libraries = LibraryManager;


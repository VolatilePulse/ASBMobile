import Vue from "vue";
import BootstrapVue from 'bootstrap-vue';

Vue.use(BootstrapVue);

import * as Servers from "./servers";
import { VueCreature } from "./ark/creature";
import { statNames } from "./consts";

import Shell from "./ui/shell/Shell.vue";


Vue.config.productionTip = false;

export const vueApp = new Vue({
   el: "#app",
   template: '<Shell ref="shell" v-bind="status"/>',
   components: { Shell },

   data: {
      status: {
         dataLoaded: false,
         devMode: true,
      },

      // Reference stuff that shouldn't change
      statImages: [],
      speciesNames: [],
      speciesMultipliers: {},

      officialServer: {},
      officialSPMultiplier: {},

      userServers: {},
      preDefinedServers: {},

      valuesJson: {},

      // Things that change
      tempCreature: {},
   },

   computed: {
      currentServerName: {
         get() { return this.tempCreature.serverName; },
         set(name) { this.tempCreature.serverName = name; },
      }
   },

   async created() {
      // Calcualte the paths for each of the stat images
      for (let i = 0; i < statNames.length; i++) {
         let name = statNames[i];
         import("assets/" + name.toLowerCase() + ".svg").then(url => Vue.set(this.statImages, i, url));
      }

      // Load pre-defined and user servers
      await Servers.initialise(this.status.devMode);
      this.userServers = Servers.userServers;
      this.preDefinedServers = Servers.preDefinedServers;

      // Create a creature to use for extraction, etc
      this.tempCreature = new VueCreature();
      this.currentServerName = "Official Server";
   }
});



export const data = vueApp;
export const shell = vueApp.$refs.shell;

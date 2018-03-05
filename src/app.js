import Vue from "vue";
import BootstrapVue from 'bootstrap-vue';

Vue.use(BootstrapVue);

import { VueCreature } from "./ark/creature";
import { statNames } from "./consts";

import Shell from "./ui/shell/Shell.vue";
import { Server } from "./ark/multipliers";
import testServers from "./test_servers";


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
      valuesJson: {},
      speciesNames: [],
      speciesMultipliers: {},
      officialServer: {},
      officialSPMultiplier: {},

      // Things that change
      servers: {},
      tempCreature: {},
   },

   computed: {
      currentServerName: {
         get() { return this.tempCreature.serverName; },
         set(name) { this.tempCreature.serverName = name; },
      }
   },

   created() {
      // Calcualte the paths for each of the stat images
      for (let i = 0; i < statNames.length; i++) {
         let name = statNames[i];
         import("assets/" + name + ".png").then(url => Vue.set(vueApp.statImages, i, url));
      }

      // Generate test servers
      for (let server of testServers) {
         if (this.status.devMode || !server.testOnly)
            this.servers[server.serverName] = new Server(server.multipliers, server.IBM, server.singlePlayer);
      }

      this.tempCreature = new VueCreature();
      this.currentServerName = "Official Server";
   }
});



export const data = vueApp;
export const shell = vueApp.$refs.shell;

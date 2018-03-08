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
      speciesNames: [],
      speciesMultipliers: {},

      officialServer: {},
      officialSPMultiplier: {},

      valuesJson: {},
      preDefinedServers: {},

      // Things that change
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
         import("assets/" + name.toLowerCase() + ".svg").then(url => Vue.set(this.statImages, i, url));
      }

      // Generate pre-defined servers
      for (let testServer of testServers) {
         if (this.status.devMode || !testServer.testOnly) {
            let server = new Server(testServer.multipliers, testServer.IBM, !!testServer['singlePlayer']);
            server.singlePlayer = !!testServer['singlePlayer'];
            server.serverName = testServer.serverName;
            server.testOnly = testServer['testOnly'];
            server.isPreDefined = true;
            this.preDefinedServers[server.serverName] = server;
         }
      }

      // Create a creature to use for extraction, etc
      this.tempCreature = new VueCreature();
      this.currentServerName = "Official Server";
   }
});



export const data = vueApp;
export const shell = vueApp.$refs.shell;

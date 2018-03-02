import Vue from "vue";
import { VueCreature } from "./ark/creature";
import { statNames } from "./consts";

import Shell from "./ui/shell/Shell.vue";
import { Server } from "./ark/multipliers";


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

   async created() {
      // Calcualte the paths for each of the stat images
      for (let i=0; i<statNames.length; i++) {
         let name = statNames[i];
         import("assets/"+name+".png").then(url => Vue.set(vueApp.statImages, i, url));
      }

      this.servers["Official Server"] = new Server(null, 1, false);
      this.servers["Official Single Player"] = new Server(null, 1, true);
      this.servers["kohonac HP.IDM: 2.0"] = new Server([[,, 2, ],,,,,,, ], 1, true);
      this.servers["eldoco87"] = new Server([,,,,,, [2,,, ], ], 1, false);

      this.tempCreature = new VueCreature();
      this.currentServerName = "Official Server";
   }
});



export const data = vueApp.$data;
export const shell = vueApp.$refs.shell;

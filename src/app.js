import Vue from "vue";

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

      statImages: [
         "Health.png", "Stamina.png", "Oxygen.png", "Food.png",
         "Weight.png", "Melee.png", "Speed.png", "Torpor.png",
      ],

      valuesJson: {},
      speciesNames: [],
      speciesMultipliers: {},
      officialServerSettings: {},
      officialSPSettings: {},

      currentServer: {},

   },
});

export const data = vueApp.$data;
export const shell = vueApp.$refs.shell;

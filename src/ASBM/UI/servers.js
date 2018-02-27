"use strict";

var ASBM = ASBM || {};
ASBM.UI = ASBM.UI || {};

/** @namespace ASBM.UI */
ASBM.UI.Servers = {
   Create() {
      return Vue.component("servers", {
         props: [],
         template: "#servers-template",

         data: () => ({
            servers: [],
            server: {
               singlePlayer: false,
               multipliers: Utils.FilledArray(8, () => Utils.FilledArray(4, () => 0)),
            },

            statIndices: Utils.Range(8),
            paramIndices: Utils.Range(4),
         }),

         computed: {
            statImages: () => app.statImages,
            // Correct: app.officialServerSettings[HEALTH].TdM
            // Incorrect: app.officialServerSettings[HEALTH][TDM]
            // I understand where the concern for DeepMerge came from now
            // I recommended using the constant variables instead of numeric constants, not instead of the properties
            // To create a server: new ASBM.Server(array[0-7][0-3], IBM, singlePlayer)
            officialValues: () => app.officialServerSettings,
         },

         methods: {
            valueFor: function (s, p) { return this.server.multipliers[s][p] || this.officialValues[s][p]; },
            toggleStat: function (s, p) { Vue.set(this.server.multipliers[s], p, (!this.server.multipliers[p][s]) ? this.officialValues[s][p] : null); },
         },
      });
   },
};

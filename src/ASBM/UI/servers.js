"use strict";

/** @namespace */
var ASBM = ASBM || {};

/** @namespace */
ASBM.UI = ASBM.UI || {};

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
            officialValues: () => app.officialServerSettings,
         },

         methods: {
            valueFor: function (s, p) { return this.server.multipliers[s][p] || this.officialValues[s][p]; },
            toggleStat: function (s, p) { Vue.set(this.server.multipliers[s], p, (!this.server.multipliers[p][s]) ? this.officialValues[s][p] : null); },
         },
      });
   },
};

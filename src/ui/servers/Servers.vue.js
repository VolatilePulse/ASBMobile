"use strict";

import 'w3-css/w3.css';
import withRender from './Servers.html?style=./Servers.css';

import Vue from 'vue';

import * as app from "../../app";
import * as Utils from "../../utils";


export default withRender({
   props: [],
   template: "#servers-template",

   data: () => ({
      servers: app.data.servers,
      server: {
         singlePlayer: false,
         multipliers: Utils.FilledArray(8, () => Utils.FilledArray(4, () => 0)),
      },

      statIndices: Utils.Range(8),
      paramIndices: Utils.Range(4),
   }),

   computed: {
      statImages: () => app.data.statImages,
      // Correct: app.officialServerSettings[HEALTH].TdM
      // Incorrect: app.officialServerSettings[HEALTH][TDM]
      // I understand where the concern for DeepMerge came from now
      // I recommended using the constant variables instead of numeric constants, not instead of the properties
      // To create a server: new ASBM.Server(array[0-7][0-3], IBM, singlePlayer)
      officialValues: () => app.data.officialServer,
   },

   methods: {
      valueFor: function (s, p) { return this.server.multipliers[s][p] || this.officialValues[s][p]; },
      toggleStat: function (s, p) { Vue.set(this.server.multipliers[s], p, (!this.server.multipliers[p][s]) ? this.officialValues[s][p] : null); },
   },
});

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
      officialValues: () => app.data.officialServer.toArray(),
      currentWorkingServer: () => app.data.servers[app.data.tempCreature.serverName].toArray(),
   },

   methods: {
      valueFor: function (s, p) { return this.currentWorkingServer[s][p] || this.officialValues[s][p]; },
      toggleStat: function (s, p) { Vue.set(this.server.multipliers[s], p, (!this.server.multipliers[s][p]) ? this.officialValues[s][p] : null); },
   },
});

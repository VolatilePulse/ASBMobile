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
      statIndices: Utils.Range(8),
      paramIndices: Utils.Range(4),
   }),

   computed: {
      servers: () => app.data.servers,
      statImages: () => app.data.statImages,
      official: () => app.data.officialServer,

      server: () => app.data.servers[app.data.tempCreature.serverName],
      name: {
         get() { return app.data.tempCreature.serverName; },
         set(value) { app.data.tempCreature.serverName = value; },
      },
   },

   methods: {
      valueFor: function (s, p) { return this.server[s][p] || this.official[s][p]; },
      toggleStat: function (s, p) { Vue.set(this.server.multipliers[s], p, (!this.server.multipliers[s][p]) ? this.officialValues[s][p] : undefined); },
      setValue: function (s, p, v) {
         let num = v ? parseFloat(v) : undefined;
         if (num <= 0) num = undefined;
         this.server[s][p] = num;
      }
   },
});

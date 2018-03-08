"use strict";

import withRender from './Servers.html?style=./Servers.css';

import * as app from "../../app";
import * as Utils from "../../utils";
import { copyServer, setServerByName, onServerChange, deleteServer } from './behaviour';


export default withRender({
   props: [],
   template: "#servers-template",

   data: () => ({
      // Constant things
      newServerId: "___NEW___SERVER___",
      statIndices: Utils.Range(8),
      paramIndices: Utils.Range(4),

      // Reference
      userServers: {},

      // Current state
      isEditable: false,
      server: {},
   }),

   computed: {
      canDelete() { return this.isEditable; },

      statImages() { return app.data.statImages; },
      preDefinedServers() { return app.data.preDefinedServers; },
      official() { return app.data.officialServer; },
      officialSP() { return app.data.officialSPMultiplier; },

      name: {
         get() { return app.data.tempCreature.serverName; },
         set(value) { app.data.tempCreature.serverName = value; },
      },
   },

   methods: {
      formatMult(n) { return Utils.FormatNumber(n, 2, true); },
      valueFor(s, p) { return this.server[s][p] || (this.server['singlePlayer'] && this.officialSP[s][p]) || this.official[s][p]; },
      nameFromServer(server) { return server.serverName + (server.testOnly ? " [TEST]" : ""); },

      setMulti: function (s, p, v) {
         let num = v ? parseFloat(v) : undefined;
         if (num <= 0) num = undefined;
         this.server[s][p] = num;
      },

      copyServer: copyServer,
      deleteServer: deleteServer,
      setServerByName: setServerByName,
      onServerChange: onServerChange,
   },

   created() {
      this.setServerByName(this.name);
   },
});

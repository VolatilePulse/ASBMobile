// @ts-ignore
import withRender from './Servers.html?style=./Servers.css';

import * as app from "../../app";
import * as Utils from "../../utils";
import * as Servers from "../../servers";

import { Server } from '../../ark/multipliers';  // eslint-disable-line no-unused-vars
import { setMult, onServerChange, NEW_SERVER_ID } from './behaviour';


export default withRender({
   props: [],
   template: "#servers-template",

   data: () => ({
      // Constant things
      newServerId: NEW_SERVER_ID,
      statIndices: Utils.Range(8),
      paramIndices: Utils.Range(4),

      // Current state
      /** @type {Server}} */
      server: new Server(),

      editName: "", // temp copy of the server name for editing
   }),

   computed: {
      devMode() { return app.data.status.devMode; },
      isEditable() { return !this.server.isPreDefined; },
      canDelete() { return this.isEditable; },

      statImages() { return app.data.statImages; },
      official() { return app.data.officialServer; },
      officialSP() { return app.data.officialSPMultiplier; },

      userServers() { return Servers.userServers; },
      preDefinedServers() { return Servers.preDefinedServers; },
      testServers() { return Servers.testServers; },

      name: {
         get() { return app.data.tempCreature.serverName; },
         set(value) { app.data.tempCreature.serverName = value; },
      },

      editNameValidity() { return this.editName ? null : false; },
   },

   methods: {
      editNameShown() { this.editName = this.name; },
      editNameOkay() { this.editNameSubmit(); },
      editNameSubmit() {
         if (this.editNameValidity != false) {
            Servers.renameServer(this.name, this.editName); this.$refs.editNameModal.hide();
            this.setServerByName(this.editName);
         }
      },

      formatMult(n) { return Utils.FormatNumber(n, 2, true); },
      valueFor(s, p) { return this.server[s][p] || (this.server['singlePlayer'] && this.officialSP[s][p]) || this.official[s][p]; },
      setMult(s, p, v) { setMult(s, p, v, this.server); },
      onServerChange(name) { onServerChange(name, this); },

      deleteServer() {
         Servers.deleteUserServer(this.name);
         this.setServerByName("Official Server");
         this.$refs.deleteModal.hide();
      },

      setServerByName(name) {
         this.server = Servers.getServerByName(name);
         app.data.currentServerName = this.server.serverName;
      },

      copyServer() {
         this.server = Servers.copyServer(this.server);
         this.name = this.server.serverName;
      },
   },

   created() {
      this.setServerByName(this.name);
   },
});

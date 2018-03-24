import Vue from 'vue';
import Component from 'vue-class-component';

import WithRender from './Servers.html?style=./Servers.css';

// @ts-ignore
import { Modal } from 'bootstrap-vue/es/components';

import theStore from '@/ui/store';
import { Server } from '@/ark/multipliers';  // eslint-disable-line no-unused-vars
import * as Servers from '@/servers';
import * as Utils from '@/utils';


const NEW_SERVER_ID = '___NEW___SERVER___';


@WithRender
@Component({
   name: 'servers',
})
export default class SettingsComponent extends Vue {
   store = theStore;

   // Constant things
   newServerId = NEW_SERVER_ID;
   statIndices = Utils.Range(8);
   paramIndices = Utils.Range(4);

   userServers = Servers.userServers;
   preDefinedServers = Servers.preDefinedServers;
   testServers = Servers.testServers;

   server = new Server();
   editName = '-'; // temp copy of the server name for editing


   get currentServerName() { return theStore.tempCreature.serverName; }
   set currentServerName(value) { theStore.tempCreature.serverName = value; }

   get editNameValidity() { return this.editName ? null : false; }
   get isEditable() { return !this.server.isPreDefined; }
   get canDelete() { return this.isEditable; }


   $refs: Vue['$refs'] & {
      editNameModal: Modal;
      deleteModal: Modal;
   };


   editNameShown() { this.editName = this.currentServerName; }
   editNameSubmit() {
      if (this.editNameValidity !== false) {
         Servers.renameServer(this.currentServerName, this.editName);
         this.$refs.editNameModal.hide();
         this.setServerByName(this.editName);
      }
   }

   formatMult(n: number) { return Utils.FormatNumber(n, 2, true); }
   valueFor(s: number, p: number) {
      return this.server[s][p] || (this.server['singlePlayer'] && theStore.officialSPMultiplier[s][p]) || theStore.officialServer[s][p];
   }

   setMult(s: number, p: number, v: string) {
      let num = v ? parseFloat(v) : undefined;
      if (num <= 0) num = undefined;
      this.server[s][p] = num;
   }

   onServerChange(newName: string) {
      if (newName === NEW_SERVER_ID) {
         this.setServerByName('Official Server');
         this.copyServer();
      }
      else {
         this.setServerByName(newName);
      }
   }

   deleteServer() {
      Servers.deleteUserServer(this.currentServerName);
      this.setServerByName('Official Server');
      this.$refs.deleteModal.hide();
   }

   setServerByName(name: string) {
      this.server = Servers.getServerByName(name);
      theStore.currentServerName = this.server.serverName;
   }

   copyServer() {
      this.server = Servers.copyServer(this.server);
      this.currentServerName = this.server.serverName;
   }

   created() {
      this.setServerByName(this.currentServerName);
   }
}

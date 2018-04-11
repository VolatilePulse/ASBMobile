import { ID_OFFICIAL_SERVER } from '@/ark/servers_predef';
import { LibraryManager } from '@/data';
import { Server } from '@/data/objects';
import * as Servers from '@/servers';
import Common, { catchAsyncErrors } from '@/ui/behaviour/Common';
import theStore from '@/ui/store';
import * as Utils from '@/utils';
// @ts-ignore
import { Modal } from 'bootstrap-vue/es/components';
import { Component, Vue } from 'vue-property-decorator';


const NEW_SERVER_ID = '___NEW___SERVER___';


@Component
export default class ServersTab extends Common {
   // Constant things
   newServerId = NEW_SERVER_ID;
   statIndices = Utils.Range(8);
   paramIndices = Utils.Range(4);

   preDefinedServers = Servers.preDefinedServers;
   testServers = Servers.testServers;

   editName = '-'; // temp copy of the server name for editing

   get isEditNameValid() { return this.editName ? null : false; }


   $refs: Vue['$refs'] & {
      editNameModal: Modal;
      deleteModal: Modal;
   };


   editNameShown() { this.editName = this.store.server.name; }
   async editNameSubmit() {
      if (this.isEditNameValid !== false) {
         this.store.server.name = this.editName;
         await LibraryManager.current.saveServer(this.store.server as PouchDB.Core.ExistingDocument<Server>);
         this.$refs.editNameModal.hide();
      }
   }

   formatMult(s: number, p: number) {
      return Utils.FormatNumber(this.store.officialServer.multipliers[s][p], 2, true);
   }

   userValue(s: number, p: number) {
      const multipliers = theStore.server.multipliers;
      return (multipliers && multipliers[s]) ? multipliers[s][p] : undefined;
   }

   valueFor(s: number, p: number) {
      return theStore.server.multipliers[s][p]
         || (theStore.server.singlePlayer && theStore.officialServerSP.multipliers[s][p])
         || theStore.officialServer.multipliers[s][p];
   }

   setMult(s: number, p: number, v: string) {
      let num = v ? parseFloat(v) : undefined;
      if (num <= 0) num = undefined;
      let multipliers = theStore.server.multipliers[s];
      if (!multipliers) theStore.server.multipliers[s] = multipliers = [];
      multipliers[p] = num;
   }

   @catchAsyncErrors
   async onServerChange(newId: string) {
      if (newId === NEW_SERVER_ID) {
         theStore.setCurrentServer(this.store.officialServer);
         await this.copyServer();
      }
      else {
         this.setServerById(newId);
      }
   }

   deleteServer() {
      if (!theStore.isServerEditable) return;
      LibraryManager.current.deleteServer(theStore.server as PouchDB.Core.ExistingDocument<Server>); // ignore async, letting it complete later
      this.setServerById(ID_OFFICIAL_SERVER);
      this.$refs.deleteModal.hide();
   }

   @catchAsyncErrors
   async copyServer() {
      const newServer = await Servers.copyServer(theStore.server);
      theStore.setCurrentServer(newServer);
   }

   private setServerById(id: string) {
      const server = Servers.getServerById(id);
      theStore.setCurrentServer(server);
   }
}

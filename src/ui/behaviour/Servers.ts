import { ID_OFFICIAL_SERVER } from '@/ark/servers_predef';
import { SAVE_MAX_TIMEOUT, SAVE_TIMEOUT } from '@/consts';
import { LibraryManager } from '@/data';
import { Server } from '@/data/objects';
import * as Servers from '@/servers';
import Common, { catchAsyncErrors } from '@/ui/behaviour/Common';
import theStore from '@/ui/store';
import * as Utils from '@/utils';
// @ts-ignore
import { Modal } from 'bootstrap-vue/es/components';
import debounce from 'lodash/debounce';
import { Component, Vue } from 'vue-property-decorator';

/** @fileOverview Tab containing the UI for server management */


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

   private disableWatcher: boolean = false;
   private currentWatcher: any = undefined;
   private debouncedSave: any = undefined;

   created() {
      this.debouncedSave = debounce(this.saveCurrentServer.bind(this), SAVE_TIMEOUT, { maxWait: SAVE_MAX_TIMEOUT });
      this.startWatcher();
   }

   beforeDestroy() {
      this.debouncedSave.flush();
   }

   editNameShown() { this.editName = this.store.server.name; }
   @catchAsyncErrors
   async editNameSubmit() {
      if (this.isEditNameValid !== false) {
         this.store.server.name = this.editName;
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

   setMult(s: number, p: number, v: string) {
      let num = v ? parseFloat(v) : undefined;
      if (num <= 0) num = undefined;
      let multipliers = theStore.server.multipliers[s];
      if (!multipliers) {
         multipliers = [];
         Vue.set(theStore.server.multipliers, s, multipliers);
      }
      Vue.set(multipliers, p, num);
   }

   /** Called by the template's server <select> change handler */
   @catchAsyncErrors
   async onServerChange(newId: string) {
      // Stop watching for changes in the server
      this.cancelWatcher();

      // Perform any pending debounced saves
      this.debouncedSave.flush();

      // Handle the server change
      if (newId === NEW_SERVER_ID) {
         const newServer = await Servers.copyServer(Servers.getServerById(ID_OFFICIAL_SERVER));
         this.selectServer(newServer);
      }
      else {
         this.setServerById(newId);
      }
   }

   /** Called by the delete confirmation modal */
   deleteServer() {
      if (!theStore.isServerEditable) return;
      this.cancelWatcher();
      LibraryManager.current.deleteServer(theStore.server as PouchDB.Core.ExistingDocument<Server>); // ignore async, letting it complete later
      this.setServerById(ID_OFFICIAL_SERVER);
      this.$refs.deleteModal.hide();
   }

   /** Called by the template to copy the current server, making a new user server */
   @catchAsyncErrors
   async copyServer() {
      const newServer = await Servers.copyServer(theStore.server);
      this.selectServer(newServer);
   }

   /** Make the specified server the current one, both globally and in this tab */
   private setServerById(id: string) {
      const server = Servers.getServerById(id);
      this.selectServer(server);
   }

   private selectServer(server: Server) {
      // Shut down any change watcher on the current server
      this.cancelWatcher();

      // Change the server globally
      theStore.setCurrentServer(server);

      // Set a watcher up on the new server
      this.startWatcher();
   }

   /** Called by the watcher when the contents of the current server change */
   private onWatcherTriggered() {
      if (this.disableWatcher) return;
      if (!this.store.isServerEditable) return;

      this.debouncedSave();
      this.store.changesPending.servers = true;
   }

   /** If this server is editable, setup the change watcher */
   private startWatcher() {
      if (this.store.isServerEditable) {
         this.currentWatcher = this.$watch('store.server', this.onWatcherTriggered, { deep: true });
      }
   }

   /** Shut down existing change watcher, if any */
   private cancelWatcher() {
      if (this.currentWatcher) {
         this.currentWatcher(); // cancels it
         this.currentWatcher = undefined;
      }
   }

   /** Called by the debouncer to actually save changes to the database */
   @catchAsyncErrors
   private async saveCurrentServer() {
      this.store.changesPending.servers = false;

      // Tell the watcher to ignore changes while it saves (because _rev will be updated)
      this.disableWatcher = true;
      try {
         await LibraryManager.current.saveServer(this.store.server);
      }
      finally {
         this.disableWatcher = false;
      }
   }
}

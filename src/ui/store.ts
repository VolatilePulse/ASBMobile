import { SpeciesParameters } from '@/ark/multipliers';
import { statNames } from '@/consts';
import { LibraryManager, SettingsManager } from '@/data';
import { MirrorCache } from '@/data/mirror';
import { Creature, Server } from '@/data/objects';
import { isServerEditable } from '@/servers';
import { Delay } from '@/utils';
import { EventEmitter } from 'events';
import Vue from 'vue';

/** @fileOverview The central data store */


export const EVENT_SERVER_CHANGED = 'server-changed';
export const EVENT_LIBRARY_CHANGED = 'library-changed';

// !!! Everything public in this class should be initialised to a non-undefined value such as null to enable Vue observation !!!
class Store {
   eventListener: EventEmitter = new EventEmitter();

   applicationVersion: string = process.env.VERSION;
   statImages: any[] = [];
   speciesNames: string[] = [];
   speciesMultipliers: { [species: string]: SpeciesParameters } = {};

   officialServer: Server = null;
   officialServerSP: Server = null;

   devMode: boolean = true;
   dataLoaded: boolean = false;
   dataLoadError: string = null;
   libraryReady: boolean = false;
   settingsReady: boolean = false;
   updateAvailable: boolean = false;
   changesPending = { settings: false, servers: false };

   creaturesCache: MirrorCache<Creature> = { content: [] };
   userServersCache: MirrorCache<Server> = { content: [] };
   isServerEditable: boolean = true;
   tempCreature: Creature = new Creature();
   valuesVersion: string = '-';

   loaded = {
      firestore: false,
   };

   private initialised: boolean;
   private _server: Server = null;

   setCurrentServer(server: Server) {
      this._server = server;
      this.tempCreature.serverId = server._id;
      this.isServerEditable = isServerEditable(server);
      if (SettingsManager.current.selectedServerId !== server._id) {
         SettingsManager.current.selectedServerId = server._id;
         SettingsManager.notifyChanged();
      }
      this.eventListener.emit(EVENT_SERVER_CHANGED);
   }

   get server() {
      return this._server;
   }

   async initialise() {
      if (this.initialised) return;

      // Don't await - it can complete in its own time
      this.loadStatImages();

      // Hook into library changes to get updated user servers
      this.eventListener.on(EVENT_LIBRARY_CHANGED, () => this.onLibraryChange());
      this.onLibraryChange();
   }

   async loadStatImages() {
      // Let the rest of the app start first - these aren't urgent
      await Delay(200);

      // Calculate the paths for each of the stat images
      for (let i = 0; i < statNames.length; i++) {
         const name = statNames[i];
         Vue.set(this.statImages, i, require('@/assets/' + name.toLowerCase() + '.svg'));
      }
   }

   private onLibraryChange() {
      if (LibraryManager.current) {
         this.userServersCache = LibraryManager.current.getUserServersCache();
         this.creaturesCache = LibraryManager.current.getCreaturesCache();
      }
   }
}

const theStore = new Store();

export default theStore;

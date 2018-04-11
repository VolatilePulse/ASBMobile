import { SpeciesParameters } from '@/ark/multipliers';
import { statNames } from '@/consts';
import { SettingsManager } from '@/data';
import { Creature, Server } from '@/data/objects';
import { isServerEditable } from '@/servers';
import { Delay } from '@/utils';
import { EventEmitter } from 'events';
import Vue from 'vue';


export const EVENT_SERVER_CHANGED = 'server-changed';
export const EVENT_LIBRARY_CHANGED = 'library-changed';

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
   updateAvailable: boolean = false;
   changesPending = { settings: false };

   isServerEditable: boolean;
   tempCreature: Creature = new Creature();
   valuesVersion: string = '-';

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
}

const theStore = new Store();

export default theStore;

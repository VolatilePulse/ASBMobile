import { SpeciesParameters } from '@/ark/multipliers';
import { statNames } from '@/consts';
import { Creature, Server, User } from '@/data/firestore/objects';
import { LocalSettings } from '@/systems/local_settings';
import { TestDefinition, TestResult } from '@/testing';
import { Delay } from '@/utils';
import ColorHash from 'color-hash';
import { EventEmitter } from 'events';
import firebase from 'firebase/app';
import Vue from 'vue';

/** @fileOverview The central data store */

interface Testing {
   tests: { [id: string]: TestDefinition };
   results: { [id: string]: TestResult };
   numPass: number;
   numPartial: number;
   numFail: number;
}

export const EVENT_SERVER_CHANGED = 'server-changed';
export const EVENT_LIBRARY_CHANGED = 'library-changed';
export const EVENT_LOADED_DATA = 'loaded-data';
export const EVENT_LOADED_AUTH = 'loaded-auth';
export const EVENT_LOADED_FIRESTORE = 'loaded-firestore';
export const EVENT_LOADED_LOCAL_SETTINGS = 'loaded-local-settings';

// !!! Everything public in this class should be initialised to a non-undefined value such as null to enable Vue observation !!!
class Store {
   events: EventEmitter = new EventEmitter();

   messages: Array<{ variant: string, message: string }> = [];

   applicationVersion: string = process.env.VERSION;
   statImages: any[] = [];
   speciesNames: string[] = [];
   speciesMultipliers: { [species: string]: SpeciesParameters } = {};

   officialServer: Server = null;
   officialServerSP: Server = null;

   localSettings: LocalSettings = {};

   dataLoaded: boolean = false;
   dataLoadError: string = null;
   routerAwaitingLoad: boolean = false;
   libraryReady: boolean = false;
   settingsReady: boolean = false;
   updateAvailable: boolean = false;
   changesPending = { settings: false, servers: false };

   tempCreature: Partial<Creature> = {};
   valuesVersion: string = '-';

   loadErrors: string[] = [];
   console: Array<{ type: string, message: string }> = [];

   loaded = {
      data: false,
      firestore: false,
      auth: false,
      localSettings: false,
   };

   get loggedIn() { return this.authUser != null; }
   authUser: firebase.User = null;
   userInfo: User = null;

   testing: Testing = {
      tests: {},
      results: {},
      numPass: null,
      numPartial: null,
      numFail: null,
   };

   private initialised: boolean;

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

   async addDismissableMessage(variant: 'danger' | 'warning' | 'info', msg: string) {
      await Vue.nextTick();
      this.messages.push({ variant, message: msg });
   }

   removeDismissableMessage(index: number) {
      this.messages.splice(index, 1);
   }

   colorForUser() {
      if (this.userInfo && this.userInfo.color) return this.userInfo.color;
      if (this.authUser) return new ColorHash().hex('id:' + this.authUser.uid);
      return 'grey';
   }
}

const theStore = new Store();

export default theStore;

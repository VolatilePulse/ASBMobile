import { SpeciesParameters } from '@/ark/multipliers';
import { Creature, Server, User } from '@/data/firestore/objects';
import { LocalSettings } from '@/systems/local_settings';
import { ScreenState } from '@/systems/resize';
import { TestDefinition, TestResult } from '@/testing';
import { Delay } from '@/utils';
import ColorHash from 'color-hash';
import { EventEmitter } from 'events';
import firebase from 'firebase/app';
import Vue from 'vue';

/** @fileOverview The central data store */


interface Testing {
   servers: { [id: string]: Server };
   tests: { [id: string]: TestDefinition };
   results: { [id: string]: TestResult };
   numPass: number;
   numPartial: number;
   numFail: number;
}

interface DisplayMessage {
   variant: string;
   message: string;
   error?: Error;
}

export const EVENT_SERVER_CHANGED = 'server-changed';
export const EVENT_LIBRARY_CHANGED = 'library-changed';

export const EVENT_LOADED_DATA = 'loaded-data';
export const EVENT_LOADED_AUTH = 'loaded-auth';
export const EVENT_LOADED_FIRESTORE = 'loaded-firestore';
export const EVENT_LOADED_LOCAL_SETTINGS = 'loaded-local-settings';

export const EVENT_SCREEN_RESIZED = 'screen-changed';

// !!! Everything public in this class should be initialised to a non-undefined value such as null to enable Vue observation !!!
class Store {
   events: EventEmitter = new EventEmitter();

   messages: { [index: string]: DisplayMessage } = {};

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
      servers: {},
      tests: {},
      results: {},
      numPass: null,
      numPartial: null,
      numFail: null,
   };

   screen: ScreenState = {
      width: NaN,
      height: NaN,
      breakpoint: null,
      size: NaN,
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

      // Get each of the stat images
      Vue.set(this.statImages, 0, require('@/assets/health.svg'));
      Vue.set(this.statImages, 1, require('@/assets/stamina.svg'));
      Vue.set(this.statImages, 2, require('@/assets/oxygen.svg'));
      Vue.set(this.statImages, 3, require('@/assets/food.svg'));
      Vue.set(this.statImages, 4, require('@/assets/weight.svg'));
      Vue.set(this.statImages, 5, require('@/assets/melee.svg'));
      Vue.set(this.statImages, 6, require('@/assets/speed.svg'));
      Vue.set(this.statImages, 7, require('@/assets/torpor.svg'));
   }

   async addDismissableMessage(variant: 'danger' | 'warning' | 'info', msg: string, error?: Error) {
      await Vue.nextTick();
      // We use timestamped keys on an object rather than an array so keys don't later change confusing Vue's :key VNode caching
      const index = +new Date() + Math.random();
      Vue.set(this.messages as any, index, { variant, message: msg, error: error });
   }

   removeDismissableMessage(index: string) {
      Vue.delete(this.messages, index);
   }

   colorForUser() {
      if (this.userInfo && this.userInfo.color) return this.userInfo.color;
      if (this.authUser) return new ColorHash().hex('id:' + this.authUser.uid);
      return 'grey';
   }
}

const theStore = new Store();

export default theStore;

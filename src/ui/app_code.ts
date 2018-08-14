import { arkDataSystem } from '@/systems/ark_data';
import { authSystem } from '@/systems/auth';
import { firestoreSystem } from '@/systems/firestore';
import { settingsSystem } from '@/systems/local_settings';
import { offlineSystem } from '@/systems/offline';
import { resizeSystem } from '@/systems/resize';
import { testingSystem } from '@/systems/testing';
import Common from '@/ui/common';
import Spinner from '@/ui/components/Spinner.vue';
import theStore from '@/ui/store';
import 'firebase/auth'; // required to load the Auth part of Firebase
import 'firebase/firestore'; // required to load the Firestore part of Firebase
import { Component, Vue, Watch } from 'vue-property-decorator';
import { inspect } from './filters';
import './net_data'; // registers the v-net-data directive
import routerConfig from './router';

/**
 * @fileOverview Vue component that represents the outer app shell.
 * This component also handles initialising the rest of the system and controls
 * which tab is currently displayed.
 */


const subsystems = [
   firestoreSystem,
   authSystem,
   arkDataSystem,
   settingsSystem,
   testingSystem,
   resizeSystem,
   offlineSystem,
];

@Component({
   router: routerConfig,
   components: { spinner: Spinner },
})
export default class AppShell extends Common {
   // Adding the store here makes it observable right from the start
   store = theStore;

   async created() {
      Vue.config.warnHandler = (err, _vm, info) => handleError(err, info);

      // Initialise the central store
      await theStore.initialise();

      // Initialisation of the remaining subsystems
      try {
         await Promise.all(subsystems.map(subsystem => subsystem.initialise()));
      }
      catch (err) {
         handleError(err, 'Sub-system initialisation');
      }

      // Debug event handlers
      window.addEventListener('pageshow', () => console.log('EVT: pageshow'), false);
      window.addEventListener('pagehide', () => console.log('EVT: pagehide'), false);
      window.addEventListener('unload', () => console.log('EVT: unload'), false);
      document.addEventListener('close', () => console.log('EVT: close'), false);
      document.addEventListener('visibilitychange', () => console.log(`EVT: visibilitychange: ${document.visibilityState}`), false);
   }

   // Top-level error catcher for anything involved with Vue
   errorCaptured(err: Error, _vm: Vue, info: string) {
      handleError(err, info);
      return false;  // propagate no further
   }

   @Watch('store.localSettings', { deep: true })
   localSettingsChanged() {
      settingsSystem.notifyChanged();
   }
}

// Capture original console functions then replace them
const oldConsole: { [name: string]: (...args: any[]) => void } = {
   error: console.error,
   warn: console.warn,
   log: console.log,
};

function consoleArgsToString(args: any[]): string {
   return args.map(arg => (arg instanceof Object) ? arg = inspect(arg) : arg).join('\n');
}

console.error = (...args: any[]) => {
   oldConsole.error(...args);
   try {
      Vue.nextTick(() => theStore.console.splice(0, 0, { type: 'error', message: consoleArgsToString(args) }));
   } catch (_) {
      // skip
   }
};

console.warn = (...args: any[]) => {
   oldConsole.warn(...args);
   try {
      Vue.nextTick(() => theStore.console.splice(0, 0, { type: 'warn', message: consoleArgsToString(args) }));
   } catch (_) {
      // skip
   }
};

console.log = (...args: any[]) => {
   oldConsole.log(...args);
   try {
      Vue.nextTick(() => theStore.console.splice(0, 0, { type: 'log', message: consoleArgsToString(args) }));
   } catch (_) {
      // skip
   }
};


export function handleError(err: Error | string, system?: string) {
   if (!theStore) {
      console.error(`Uncaught error: ${system}: ${err}`);
      return;
   }

   system = system ? `: "${system}"` : '';

   if (err instanceof Error)
      theStore.addDismissableMessage('danger', 'An unexpected error occurred' + system, err);
   else
      theStore.addDismissableMessage('danger', 'An unexpected error occurred' + system + ': ' + err);

   console.error('handleError: ', system, err);
}

import { arkDataSystem } from '@/systems/ark_data';
import { authSystem } from '@/systems/auth';
import { firestoreSystem } from '@/systems/firestore';
import { settingsSystem } from '@/systems/local_settings';
import Common, { catchAsyncErrors } from '@/ui/common';
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
];

@Component({
   router: routerConfig,
   components: { spinner: Spinner },
})
export default class AppShell extends Common {
   // Adding the store here makes it observable right from the start
   store = theStore;

   @catchAsyncErrors
   async created() {
      // Register handler for uncaught Promise rejections (i.e. exceptions in async functions)
      window.addEventListener('unhandledrejection', event => this.catchUnhandledRejection(event));
      Vue.config.errorHandler = (err, _vm, info) => handleError(err, info ? info : 'Vue Error');

      // Initialise the central store
      await theStore.initialise();

      // Initialisation of the remaining subsystems
      try {
         await Promise.all(subsystems.map(subsystem => subsystem.initialise()));
      }
      catch (err) {
         handleError(err, 'Sub-system initialisation');
      }
   }

   @Watch('store.localSettings', { deep: true })
   localSettingsChanged() {
      settingsSystem.notifyChanged();
   }


   catchUnhandledRejection(event: any) {
      console.error('Unhandled rejection (promise: ', event.promise, ', reason: ', event.reason, ').');
      handleError(event.reason, 'Unhandled rejection');
      console.log(event);
      if (theStore && theStore.localSettings && theStore.localSettings.devMode)
         // tslint:disable-next-line:no-debugger
         debugger;
   }
}

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
      theStore.console.splice(0, 0, { type: 'error', message: consoleArgsToString(args) });
   } catch (_) {
      // skip
   }
};

console.warn = (...args: any[]) => {
   oldConsole.warn(...args);
   try {
      theStore.console.splice(0, 0, { type: 'warn', message: consoleArgsToString(args) });
   } catch (_) {
      // skip
   }
};

console.log = (...args: any[]) => {
   oldConsole.log(...args);
   try {
      theStore.console.splice(0, 0, { type: 'log', message: consoleArgsToString(args) });
   } catch (_) {
      // skip
   }
};


export function handleError(err: Error | string, system?: string) {
   let msg: string;
   let stack: any;

   const prefix = system ? system + ': ' : '';

   if (err instanceof Error) {
      msg = prefix + err.message;
      stack = err.stack;
   }
   else {
      msg = prefix + err;
   }

   console.error('Unhandled error: ' + msg);
   if (stack) console.error(stack);

   theStore.loadErrors.push(msg);
   if (stack) theStore.loadErrors.push(stack);
}

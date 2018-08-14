import { SubSystem } from '@/systems/common';
import { handleError } from '@/ui/app_code';
import theStore from '@/ui/store';
import { Delay } from '@/utils';
import { register } from 'register-service-worker';


const UPDATE_CHECK_FREQ = 90 * 60 * 1000;      // every 90 minutes
const UPDATE_CHECK_VARIATION = 15 * 60 * 1000; // varied by 15 minutes either way randomly

export interface NetworkState {
   isOnline: boolean;
   isAppCached: boolean;
   isUpdateAvailable: boolean;
}

/**
 * Handles network status including service worker registration and update checking.
 */
class OfflineSystem implements SubSystem {
   private registration: ServiceWorkerRegistration;

   public async initialise() {
      console.log('OfflineSystem: Started');

      // Can't delay before this sadly, else the registration fails
      console.log('OfflineSystem: Registering service worker');
      this.registerServiceWorker();

      window.addEventListener('online', this.networkStateChange.bind(this), false);
      window.addEventListener('offline', this.networkStateChange.bind(this), false);

      // Wait for the app to fully load
      await Delay(2000);

      console.log('OfflineSystem: Sleeping until next update check');
      this.scheduleUpdateCheck();
   }

   public async checkForUpdates(silent?: boolean) {
      console.log('OfflineSystem: Checking for updates');
      if (!this.registration) {
         console.log('OfflineSystem:   ...cancelled - no service worker registration');
         return;
      }

      try {
         // Ask the browser to update if there's a newer service worker
         await this.registration.update();
      }
      catch (err) {
         console.error('Update check failed: ', err);
         if (!silent) handleError(err, 'Update checker');
      }
   }

   private scheduleUpdateCheck() {
      const delay = UPDATE_CHECK_FREQ + Math.random() * UPDATE_CHECK_VARIATION * 2 - UPDATE_CHECK_VARIATION;
      setTimeout(this.regularUpdateCheck.bind(this), delay);
   }

   private async regularUpdateCheck() {
      console.log('OfflineSystem: Scheduled update check beginning');
      await this.checkForUpdates(true);
      this.scheduleUpdateCheck();
   }

   private networkStateChange() {
      console.log('OfflineSystem: Online state: ' + navigator.onLine);
      theStore.network.isOnline = navigator.onLine;
   }

   private registerServiceWorker() {
      if (process.env.NODE_ENV === 'production') {
         register(`${process.env.BASE_URL}service-worker.js`, {
            ready() {
               console.log('OfflineSystem: SW: App is being served from cache by a service worker.');
            },
            registered(registration) {
               console.log('OfflineSystem: SW: Service worker has been registered');
               offlineSystem.registration = registration;
            },
            cached(_registration) {
               console.log('OfflineSystem: SW: Content has been cached for offline use');
               theStore.addDismissableMessage('info', 'Ark Breeder has been cached for offline use');
               theStore.network.isAppCached = true;
            },
            updated(_registration) {
               console.log('OfflineSystem: SW: New content is available; please refresh');
               theStore.network.isUpdateAvailable = true;
            },
            error(error) {
               console.error('OfflineSystem: SW: Error during service worker registration:', error);
            },
            updatefound(_registration) {
               console.log('OfflineSystem: SW: Update found');
            },
         });
      }
   }
}

export const offlineSystem = new OfflineSystem();

import { ParseDatabase } from '@/ark/data';
import { ID_OFFICIAL_SERVER } from '@/ark/servers_predef';
import { LibraryManager, SettingsManager } from '@/data';
import { User } from '@/data/firestore/objects';
import * as Servers from '@/servers';
import Common, { catchAsyncErrors } from '@/ui/common';
import theStore, { EVENT_LIBRARY_CHANGED, EVENT_LOADED_AUTH, EVENT_LOADED_FIRESTORE } from '@/ui/store';
import { Delay } from '@/utils';
import firebase from 'firebase/app';
import 'firebase/auth'; // required to load the Auth part of Firebase
import 'firebase/firestore'; // required to load the Firestore part of Firebase
import { Component } from 'vue-property-decorator';
import './filters'; // registers Vue filters
import './net_data'; // registers the v-net-data directive
import routerConfig from './router';

/**
 * @fileOverview Vue component that represents the outer app shell.
 * This component also handles initialising the rest of the system and controls
 * which tab is currently displayed.
 */


@Component({
   router: routerConfig,
})
export default class AppShell extends Common {
   // Adding the store here makes it observable right from the start
   store = theStore;

   showSidebar = true;
   tab = 'welcome';

   @catchAsyncErrors
   async created() {
      // Register handler for uncaught Promise rejections (i.e. exceptions in async functions)
      window.addEventListener('unhandledrejection', event => this.catchUnhandledRejection(event));

      // Fire off some async behaviours that can complete later on
      loadDataJson();

      // Initialise the central store
      await theStore.initialise();

      // Initialise remaining subsystems
      await Servers.initialise();
      await SettingsManager.initialise();
      await LibraryManager.initialise();

      // Activate last selected server
      activateSelectedServer();

      // Hook important changes
      theStore.eventListener.on(EVENT_LIBRARY_CHANGED, activateSelectedServer);

      // Initialise Firestore
      firebase.firestore().settings({ timestampsInSnapshots: true });
      firebase.firestore().enablePersistence()
         .then(() => {
            theStore.loaded.firestore = true;
            theStore.eventListener.emit(EVENT_LOADED_FIRESTORE);
         })
         .catch(err => {
            console.warn('Firestore offline persistance not enabled: ', err);
            theStore.loaded.firestore = true;
            theStore.eventListener.emit(EVENT_LOADED_FIRESTORE);
         });

      // Initialise Firestore Auth
      // TODO: Decouple this lot into an auth component
      firebase.auth().onAuthStateChanged(async (user: firebase.User) => {
         if (!theStore.loaded.auth) {
            theStore.loaded.auth = true;
            theStore.eventListener.emit(EVENT_LOADED_AUTH);
         }
         theStore.user = user;
         if (user) {
            theStore.loggedIn = true;
            console.dir(`Auth as ${user.uid}:`, user);

            // TODO: Set up a live-writable document for the user data
            const userDocRef = firebase.firestore().collection('user').doc(user.uid);
            let userData: User;
            try {
               userData = (await userDocRef.get()).data() as User;
            }
            catch (err) {
               console.warn('Failed to get user object after authentication', err);
            }

            let changed = false;
            if (!userData) {
               userData = {};
               changed = true;
            }

            if (!userData.photoURL) {
               userData.photoURL = user.providerData.reduce((agg, a) => agg || a.photoURL, '') || user.photoURL;
               changed = true;
            }

            if (!userData.displayName) {
               userData.displayName = user.displayName || user.providerData.reduce((agg, a) => agg || a.displayName, '') || 'Anon E. Mouse';
               changed = true;
            }

            if (changed) {
               console.log('Updating user object');
               try {
                  await userDocRef.set(userData, { merge: true });
               }
               catch (err) {
                  console.warn('Failed to update user object after authentication', err);
               }
            }

            theStore.userData = userData;
            console.log('User data:', userData);
         }
         else {
            theStore.loggedIn = false;
            theStore.user = null;
            theStore.userData = null;
            console.log('No authentication found');
         }
      });
   }

   catchUnhandledRejection(event: any) {
      console.error('Unhandled rejection (promise: ', event.promise, ', reason: ', event.reason, ').');
      console.log(event);
      if (theStore && theStore.devMode)
         // tslint:disable-next-line:no-debugger
         debugger;
   }
}


/** Set the last-selected server as active, or a good default */
function activateSelectedServer() {
   // FIXME: Move last selected server ID to the library's settings
   const selectedServerId = SettingsManager.current.selectedServerId || ID_OFFICIAL_SERVER;
   let selectedServer = Servers.getServerById(selectedServerId);
   if (!selectedServer) {
      console.log(`Last selected server "${selectedServerId}" not found. Defaulting to official.`);
      selectedServer = Servers.getServerById(ID_OFFICIAL_SERVER);
      SettingsManager.current.selectedServerId = ID_OFFICIAL_SERVER;
      SettingsManager.notifyChanged();
   }
   theStore.setCurrentServer(selectedServer);
}

async function loadDataJson() {
   // Let the app become responsive before doing anything
   await Delay(100);

   let response: Response;

   try {
      response = await fetch('/data/data.json');
   }
   catch (ex) {
      console.error(ex);
      theStore.dataLoadError = 'Failed to fetch database: ' + ex;
      return;
   }

   try {
      const json = await response.json();
      ParseDatabase(json);
   }
   catch (ex) {
      console.error(ex);
      theStore.dataLoadError = 'Failed to parse database: ' + ex;
      return;
   }

   theStore.dataLoaded = true;
}

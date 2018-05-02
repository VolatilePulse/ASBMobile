import { ParseDatabase } from '@/ark/data';
import { ID_OFFICIAL_SERVER } from '@/ark/servers_predef';
import { LibraryManager, SettingsManager } from '@/data';
import * as Servers from '@/servers';
import Common, { catchAsyncErrors } from '@/ui/behaviour/Common';
import theStore, { EVENT_LIBRARY_CHANGED } from '@/ui/store';
import { Delay } from '@/utils';
import { Component } from 'vue-property-decorator';

/**
 * @fileOverview Vue component that represents the outer app shell.
 * This component also handles initialising the rest of the system and controls
 * which tab is currently displayed.
 */

// TODO: Change over to vue-router for more capability


@Component
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
      response = await fetch('data/data.json');
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

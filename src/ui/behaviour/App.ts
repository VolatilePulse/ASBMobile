import { Component } from 'vue-property-decorator';
import Common from '@/ui/behaviour/Common';

import theStore from '@/ui/store';
import { AsyncFileRead, Delay } from '@/utils';
import { ParseDatabase } from '@/ark/data';
import { SettingsManager, LibraryManager } from '@/data';
import { initialise as serversInitialise } from '@/servers';


@Component
export default class extends Common {
   showSidebar = true;
   tab = 'welcome';

   async created() {
      // Fire off some async behaviours that can complete later on
      this.loadDataJson();
      this.store.loadStatImages();

      // Initialise sub-systems
      await SettingsManager.initialise();
      await LibraryManager.initialise();
      await serversInitialise(this.store.devMode);

      // Create a creature to use for extraction, etc
      theStore.currentServerName = 'Official Server';
   }

   async loadDataJson() {
      try {
         // Let the app become responsive before doing anything
         await Delay(100);

         const json = await AsyncFileRead('data/data.json');
         ParseDatabase(json);
      }
      catch (ex) {
         theStore.dataLoadError = '' + ex;
         return;
      }
      theStore.dataLoaded = true;
   }
}

import { Component } from 'vue-property-decorator';
import Common from '@/ui/behaviour/Common';

import theStore from '@/ui/store';
import { AsyncFileRead } from '@/utils';
import { LoadData } from '@/ark/data';
import { SettingsManager, LibraryManager } from '@/data';
import { initialise as serversInitialise } from '@/servers';


@Component
export default class extends Common {
   showSidebar = true;
   tab = 'welcome';

   async created() {
      const json = await AsyncFileRead('data/data.json');
      try {
         LoadData(json);
      }
      catch (ex) {
         theStore.dataLoadError = '' + ex;
         return;
      }
      theStore.dataLoaded = true;

      await this.store.loadStatImages();

      // Initialise sub-systems
      await SettingsManager.initialise();
      await LibraryManager.initialise();
      await serversInitialise(this.store.devMode);

      // Create a creature to use for extraction, etc
      theStore.currentServerName = 'Official Server';
   }
}

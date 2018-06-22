import { SubSystem } from '@/systems/common';
import theStore, { EVENT_LOADED_LOCAL_SETTINGS } from '@/ui/store';
import storage from 'local-storage-fallback';
import { merge } from 'lodash';


const KEY_SETTINGS = 'settings';

export interface LocalSettings {
   devMode?: boolean;
}

class SettingsSystem implements SubSystem {
   public async initialise() {
      console.log('SettingsSystem: Started');

      try {
         const asString = storage.getItem(KEY_SETTINGS);
         if (asString) {
            const loadedSettings = JSON.parse(asString) as LocalSettings;
            theStore.localSettings = merge({}, loadedSettings);
            console.log('SettingsSystem: Settings loaded');
         }
         else {
            console.log('SettingsSystem: No existing settings found');
         }
      }
      catch (err) {
         console.error('SettingsSystem: Failed to load local settings:', err);
         theStore.addDismissableMessage('warning', 'Settings were corrupt and have been reset');
      }

      console.log('SettingsSystem: Done');
      theStore.loaded.localSettings = true;
      theStore.events.emit(EVENT_LOADED_LOCAL_SETTINGS);
   }

   public notifyChanged() {
      this.save();
   }

   private save() {
      console.log('SettingsSystem: Saving');
      storage.setItem(KEY_SETTINGS, JSON.stringify(theStore.localSettings));
   }
}

export const settingsSystem = new SettingsSystem();

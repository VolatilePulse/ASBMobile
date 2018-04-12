import { SAVE_MAX_TIMEOUT, SAVE_TIMEOUT } from '@/consts';
import { DatabaseObject } from '@/data/database';
import theStore from '@/ui/store';
import debounce from 'lodash-es/debounce';
import PouchDB from 'pouchdb-core';


const DB_SETTINGS = 'settings';
const ID_SETTINGS = 'the';


class Settings extends DatabaseObject {
   dbVersion = 1;
   libraryNames: { [id: string]: string } = {};
   selectedLibrary?: string = null;

   // FIXME: Move to library settings
   selectedServerId?: string = null;

   /** All user-specific settings with default values. Should not include anything library-specific. */
   constructor() {
      super(ID_SETTINGS);
   }
}


// TODO: Register a database change handler to pick up the latest settings in case the user opens the app in two tabs?


class SettingsManager {
   current: Settings;

   private initialised = false;
   private db!: PouchDB.Database<Settings>;
   private debouncedSave: any;

   /** The SettingsManager manages settings :) */
   constructor() {
      this.current = new Settings();

      // lodash.debounce produces a function we can call whenever a setting changes.
      // It will only call this.save() after a timeout, no matter how often it is called before-hand.
      this.debouncedSave = debounce(this.save.bind(this), SAVE_TIMEOUT, { maxWait: SAVE_MAX_TIMEOUT });
   }

   /** Initialise the settings manager */
   async initialise() {
      if (this.initialised) return;
      this.initialised = true;

      this.db = new PouchDB(DB_SETTINGS, { revs_limit: 20 });

      // Ensure a row exists with the one ID
      let result: Settings | undefined;
      try { result = await this.db.get(ID_SETTINGS); }
      catch (_) { // do nothing
      }

      if (result) {
         // Overwrite our defaults with what's saved
         Object.assign(this.current, result);
      }
      else {
         // No existing settings : save the defaults
         await this.save();
      }
   }

   /** Mark settings as changed (they will be saved later) */
   notifyChanged() {
      theStore.changesPending.settings = true;
      this.debouncedSave();
   }

   saveIfChanged() {
      this.debouncedSave.flush();
   }

   /** Save the current settings to the database immediately */
   async save() {
      const result = await this.db.put(this.current);
      this.current._rev = result.rev;
      theStore.changesPending.settings = false;
   }
}

export default new SettingsManager();

import _debounce from 'lodash.debounce';
import PouchDB from 'pouchdb-browser';


const DB_SETTINGS = "settings";
const ID_SETTINGS = "the";
const SAVE_TIMEOUT = 1000;
const SAVE_MAX_TIMEOUT = 5000;

class Settings {
   /** All user-specific settings with default values. Should not include anything library-specific. */
   constructor() {
      this.dbVersion = 1;
      /** @type {{displayName:string,id:string}[]} */
      this.libraries = [];
      /** @type {string} */
      this.selectedLibrary = undefined;
      /** @type {string} */
      this.dummyText = "Dummy!";
      /** @type {number} */
      this.dummyNumber = 1234;
   }
}


// TODO: Register a database change handler to pick up the latest settings in case the user opens the app in two tabs?


class SettingsManager {
   /** The SettingsManager manages settings :) */
   constructor() {
      /** @type {Settings} */
      this.current = new Settings();

      this._initialised = false;
      /** @type {PouchDB.Database} */
      this._db = undefined;
      /** @type {string} */
      this._rev = undefined;

      // lodash.debounce produces a function we can call whenever a setting changes.
      // It will only call this.save() after a timeout, no matter how often it is called before-hand.
      this._debouncedSave = _debounce(this.save.bind(this), SAVE_TIMEOUT, { maxWait: SAVE_MAX_TIMEOUT });
   }

   /** Initialise the settings manager */
   async initialise() {
      if (this._initialised) return;

      this._db = new PouchDB(DB_SETTINGS);

      // Ensure a row exists with the one ID
      var result = undefined;
      try { result = await this._db.get(ID_SETTINGS); }
      catch (_) { }

      if (result) {
         // Overwrite our defaults with what's saved
         Object.assign(this.current, result);
         this._rev = result._rev;
      }
      else {
         // No existing settings : save the defaults
         await this.save();
      }
   }

   /** Mark settings as changed (they will be saved later) */
   notifyChanged() {
      this._debouncedSave();
   }

   /** Save the current settings to the database immediately */
   async save() {
      /** @type {any} */
      var toStore = this.current;
      toStore._id = ID_SETTINGS;
      toStore._rev = this._rev;

      console.log("Saving settings");
      var result = await this._db.put(toStore);
      this._rev = result.rev;
   }
}

export default new SettingsManager();

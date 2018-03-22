import Vue from 'vue';

import PouchFind from 'pouchdb-find';
import PouchDB from 'pouchdb-browser';
PouchDB.plugin(PouchFind);

import SettingsManager from './settings';


const DEFAULT_LIBRARY_NAME = 'default';
const DB_PREFIX = 'library_';


class Library {
   /**
    * @param {string} id
    */
   constructor(id) {
      this.id = id;

      /** @type {PouchDB.Database} */
      this._db = undefined;
   }

   async load() {
      if (this._db) return;
      this._db = new PouchDB(DB_PREFIX + this.id);

      // TODO: Load all servers

      // TODO: Decide if we should load all creatures
   }

   async unload() {
      if (!this._db) return;
      await this._db.close();
      this._db = undefined;
   }
}

class LibraryManager {
   constructor() {
      /** @type {Library} */
      this.current = undefined;
   }

   /** Initialise the library manager system */
   async initialise() {
      // Ensure Settings system is initialised
      await SettingsManager.initialise();

      // Ensure a library exists, and make one active
      await this._ensureLibraryAndSelect();
   }

   /**
    * Create a new library with the given display name. Does not select the library for use.
    * @param {string} displayName
    * @returns {string} The id of the created library
    */
   createNewLibrary(displayName) {
      // Make an ID that will be used as a the database name
      do {
         var newId = this._makeId();
      } while (newId in SettingsManager.current.libraryNames);

      // We don't need to create the database as it'll be done the first time it's opened

      // Add this library to the list in settings
      Vue.set(SettingsManager.current.libraryNames, newId, displayName);
      SettingsManager.notifyChanged();

      return newId;
   }

   /**
    * Select the specified library as the current one.
    * @param {string} id
    * @param {boolean} force
    */
   async selectLibrary(id, force = false) {
      if (!force && SettingsManager.current.selectedLibrary == id) return;

      // Close existing library
      if (this.current) this.current.unload();

      // Open the new one
      var library = new Library(id);
      await library.load();

      // Save the selection
      SettingsManager.current.selectedLibrary = id;
      SettingsManager.notifyChanged();
      this.current = library;
   }

   /**
    * Delete the specified library complately and without confirmation.
    * @param {string} id
    */
   async deleteLibrary(id) {
      // If we're deleting the current library, clear up first
      if (id == SettingsManager.current.selectedLibrary) {
         await this.current.unload();
      }

      // Open and destroy the database
      var tempDb = new PouchDB(DB_PREFIX + id);
      await tempDb.destroy();
      tempDb = undefined;

      // Remove the library from the list in settings
      Vue.delete(SettingsManager.current.libraryNames, id);
      SettingsManager.notifyChanged();

      // If this was the current library, pick another and make it active (creating a new one if needed)
      if (id == SettingsManager.current.selectedLibrary) {
         SettingsManager.current.selectedLibrary = undefined;
         await this._ensureLibraryAndSelect();
      }
   }

   /**
    * Change the display name of the specified library
    * @param {string} id
    * @param {string} newName
    */
   async renameLibrary(id, newName) {
      if (!(id in SettingsManager.current.libraryNames)) throw "Attempt to rename library that doesn't exist";

      Vue.set(SettingsManager.current.libraryNames, id, newName);
      SettingsManager.notifyChanged();
   }

   /** Ensure a library exists and make one active */
   async _ensureLibraryAndSelect() {
      // If no libraries exist, create a default
      if (Object.keys(SettingsManager.current.libraryNames).length < 1) {
         this.createNewLibrary(DEFAULT_LIBRARY_NAME);
      }

      // Select last used (or first) library and open it
      var selectId = this._pickALibrary();
      await this.selectLibrary(selectId, true);
   }

   /** Pick a library to select, choosing either the user's last choice or the first available one */
   _pickALibrary() {
      var id = SettingsManager.current.selectedLibrary;
      if (!id || !(id in SettingsManager.current.libraryNames)) {
         id = Object.keys(SettingsManager.current.libraryNames)[0];
      }
      return id;
   }

   /** Make a library ID based on the current date and time */
   _makeId() {
      var now = new Date();

      // I hate Javascript
      var datestring = now.getFullYear() + ("0" + (now.getMonth() + 1)).slice(-2) + ("0" + now.getDate()).slice(-2) +
         "-" + ("0" + now.getHours()).slice(-2) + ("0" + now.getMinutes()).slice(-2) + ("0" + now.getSeconds()).slice(-2);

      return datestring;
   }
}


export default new LibraryManager();
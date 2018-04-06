import PouchDB from 'pouchdb-core';
import PouchFind from 'pouchdb-find';
import Vue from 'vue';
import SettingsManager from './settings';

PouchDB.plugin(PouchFind);


const DEFAULT_LIBRARY_NAME = 'default';
const DB_PREFIX = 'library_';


class Library {
   id: string;

   private db!: PouchDB.Database;

   constructor(id: string) {
      this.id = id;
   }

   async load() {
      if (this.db) return;
      this.db = new PouchDB(DB_PREFIX + this.id);

      // TODO: Load all servers

      // TODO: Decide if we should load all creatures
   }

   async unload() {
      if (!this.db) return;
      await this.db.close();
      this.db = undefined;
   }
}

class LibraryManager {
   current: Library;

   constructor() {
      // do nothing
   }

   /** Initialise the library manager system */
   async initialise() {
      // Ensure Settings system is initialised
      await SettingsManager.initialise();

      // Ensure a library exists, and make one active
      await this._ensureLibraryAndSelect();
   }

   /** Create a new library with the given display name. Does not select the library for use */
   createNewLibrary(displayName: string): string {
      // Make an ID that will be used as a the database name
      let newId;
      do {
         newId = this._makeId();
      } while (newId in SettingsManager.current.libraryNames);

      // We don't need to create the database as it'll be done the first time it's opened

      // Add this library to the list in settings
      Vue.set(SettingsManager.current.libraryNames, newId, displayName);
      SettingsManager.notifyChanged();

      return newId;
   }

   /** Select the specified library as the current one */
   async selectLibrary(id: string, force = false) {
      if (!force && SettingsManager.current.selectedLibrary === id) return;

      // Close existing library
      if (this.current) this.current.unload();

      // Open the new one
      const library = new Library(id);
      await library.load();

      // Save the selection
      if (SettingsManager.current.selectedLibrary !== id) {
         SettingsManager.current.selectedLibrary = id;
         SettingsManager.notifyChanged();
      }
      this.current = library;
   }

   /** Delete the specified library complately and without confirmation */
   async deleteLibrary(id: string) {
      // If we're deleting the current library, clear up first
      if (id === SettingsManager.current.selectedLibrary) {
         await this.current.unload();
      }

      // Open and destroy the database
      let tempDb: PouchDB.Database | undefined = new PouchDB(DB_PREFIX + id);
      await tempDb.destroy();
      tempDb = undefined;

      // Remove the library from the list in settings
      Vue.delete(SettingsManager.current.libraryNames, id);
      SettingsManager.notifyChanged();

      // If this was the current library, pick another and make it active (creating a new one if needed)
      if (id === SettingsManager.current.selectedLibrary) {
         SettingsManager.current.selectedLibrary = undefined;
         await this._ensureLibraryAndSelect();
      }
   }

   /** Change the display name of the specified library */
   async renameLibrary(id: string, newName: string) {
      if (!(id in SettingsManager.current.libraryNames)) throw Error("Attempt to rename library that doesn't exist");

      Vue.set(SettingsManager.current.libraryNames, id, newName);
      SettingsManager.notifyChanged();
   }

   /** Ensure a library exists and make one active */
   private async _ensureLibraryAndSelect() {
      // If no libraries exist, create a default
      if (Object.keys(SettingsManager.current.libraryNames).length < 1) {
         this.createNewLibrary(DEFAULT_LIBRARY_NAME);
      }

      // Select last used (or first) library and open it
      const selectId = this._pickALibrary();
      await this.selectLibrary(selectId, true);
   }

   /** Pick a library to select, choosing either the user's last choice or the first available one */
   private _pickALibrary() {
      let id = SettingsManager.current.selectedLibrary;
      if (!id || !(id in SettingsManager.current.libraryNames)) {
         id = Object.keys(SettingsManager.current.libraryNames)[0];
      }
      return id;
   }

   /** Make a library ID based on the current date and time */
   private _makeId() {
      const now = new Date();

      // I hate Javascript
      const datestring = now.getFullYear() + ('0' + (now.getMonth() + 1)).slice(-2) + ('0' + now.getDate()).slice(-2) +
         '-' + ('0' + now.getHours()).slice(-2) + ('0' + now.getMinutes()).slice(-2) + ('0' + now.getSeconds()).slice(-2);

      return datestring;
   }
}


export default new LibraryManager();

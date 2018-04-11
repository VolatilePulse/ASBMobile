import { IAsyncDisposable, NotInitialisedError } from '@/data/database';
import { MirrorCache, TableMirror } from '@/data/mirror';
import { Server } from '@/data/objects';
import { Table } from '@/data/table';
import theStore, { EVENT_LIBRARY_CHANGED } from '@/ui/store';
import PouchDB from 'pouchdb-core';
import PouchFind from 'pouchdb-find';
import Vue from 'vue';
import SettingsManager from './settings';

PouchDB.plugin(PouchFind);


const DEFAULT_LIBRARY_NAME = 'default';
const SERVERS_PREFIX = 'servers_';
const CREATURES_PREFIX = 'creatures_';


class Library implements IAsyncDisposable {
   initialised: boolean;
   id: string;

   private serverMirror!: TableMirror<Server>;
   private serverTable!: Table<Server>;

   /** Create a library database interface with the given library ID */
   constructor(id: string) {
      this.id = id;
   }

   async initialise() {
      if (this.initialised) return;

      // Setup the server database mirror
      this.serverMirror = new TableMirror<Server>(SERVERS_PREFIX + this.id);
      this.serverMirror.setSortOrder(['tag']);
      await this.serverMirror.initialise();

      // Initialise the server database interface
      this.serverTable = new Table<Server>(SERVERS_PREFIX + this.id);
      await this.serverTable.initialise();

      // TODO: Decide if we should load all creatures

      this.initialised = true;
   }

   async dispose() {
      if (!this.initialised) throw new NotInitialisedError();

      if (this.serverMirror) await this.serverMirror.dispose();
      this.serverMirror = undefined;

      if (this.serverTable) await this.serverTable.dispose();
      this.serverTable = undefined;

      this.initialised = false;
   }

   /** Save a new server, giving it a new UUI in the process */
   async addServer(server: Server) {
      if (!this.initialised) throw new NotInitialisedError();

      await this.serverTable.addWithRandomId(server);
   }

   /** Save changes to an existing server */
   async saveServer(server: PouchDB.Core.ExistingDocument<Server>) {
      if (!this.initialised) throw new NotInitialisedError();

      await this.serverTable.update(server);
   }

   /** Delete an existing server */
   async deleteServer(server: PouchDB.Core.ExistingDocument<Server>) {
      if (!this.initialised) throw new NotInitialisedError();

      await this.serverTable.delete(server);
   }

   getUserServersCache(): MirrorCache<Server> {
      if (!this.initialised) throw new NotInitialisedError();

      return this.serverMirror.cache;
   }
}


class LibraryManager implements IAsyncDisposable {
   initialised: boolean;
   current: Library;

   /** Initialise the library manager system */
   async initialise() {
      // Ensure Settings system is initialised
      await SettingsManager.initialise();

      // Need to set this now so we can use our own methods
      this.initialised = true;

      // Ensure a library exists, and make one active
      await this._ensureLibraryAndSelect();
   }

   async dispose() {
      if (this.current) await this.current.dispose();
      this.current = null;
      this.initialised = false;
   }

   /** Create a new library with the given display name. Does not select the library for use */
   createNewLibrary(displayName: string): string {
      if (!this.initialised) throw new NotInitialisedError();

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
      if (!this.initialised) throw new NotInitialisedError();

      if (!force && SettingsManager.current.selectedLibrary === id) return;

      // Close existing library
      if (this.current) await this.current.dispose();

      // Open the new one
      const library = new Library(id);
      await library.initialise();

      // Save the selection
      if (SettingsManager.current.selectedLibrary !== id) {
         SettingsManager.current.selectedLibrary = id;
         SettingsManager.notifyChanged();
      }
      this.current = library;

      // Notify the world
      theStore.eventListener.emit(EVENT_LIBRARY_CHANGED);
   }

   /** Delete the specified library complately and without confirmation */
   async deleteLibrary(id: string) {
      if (!this.initialised) throw new NotInitialisedError();

      // If we're deleting the current library, clear up first
      if (id === SettingsManager.current.selectedLibrary) {
         await this.current.dispose();
      }

      // Open and destroy the database
      let tempDb: PouchDB.Database | undefined = new PouchDB(CREATURES_PREFIX + id);
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
      if (!this.initialised) throw new NotInitialisedError();

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

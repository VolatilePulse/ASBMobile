import PouchFind from 'pouchdb-find';
import PouchDB from 'pouchdb-browser';
PouchDB.plugin(PouchFind);


class LibraryManager {
   constructor() {
      /** @type {PouchDB.Database} */
      this._db = undefined;
   }
}


export default new LibraryManager();

import debounce from 'lodash-es/debounce';

import PouchDB from 'pouchdb-core';
import PouchFind from 'pouchdb-find';
PouchDB.plugin(PouchFind);


type IdMeta = { _id: string };
type RevMeta = { _rev: string };
type DeletedMeta = { _deleted: boolean }

export type Stored<ContentType> = ContentType & IdMeta & RevMeta;

interface IAsyncDisposable {
   initialise(): Promise<void>;
   dispose(): Promise<void>;
}

interface ITable<ContentType extends {}> extends IAsyncDisposable {
   add(item: ContentType & IdMeta): Promise<Stored<ContentType>>;
   addWithoutId(item: ContentType & IdMeta): Promise<Stored<ContentType>>;
   update(item: Stored<ContentType>): Promise<Stored<ContentType>>;
   delete(item: Stored<ContentType>): Promise<Stored<ContentType>>;
}


export class Table<ContentType extends {}> implements ITable<ContentType> {
   name: string;

   private db!: PouchDB.Database<ContentType>;

   /** Represents a single table held in the database */
   constructor(name: string) {
      this.name = name;
   }

   async initialise() {
      if (this.db) return;
      this.db = new PouchDB<ContentType>(this.name);
   }

   async dispose() {
      if (this.db) {
         this.db.close();
         this.db = null;
      }
   }

   /**
    * Add an item that already has an ID to the database.
    * On success the item's _rev is set.
    * */
   async add(item: ContentType & IdMeta): Promise<Stored<ContentType>> {
      if (!this.db) throw new NotInitialisedError('Use before initialisation');
      let result = await this.db.put(item);
      let output = item as Stored<ContentType>;
      output._rev = result.rev;
      return output;
   }

   /**
    * Add an item without an ID to the database. It will be assigned a generated UUID.
    * On success the item's _id and _rev are set.
    * */
   async addWithoutId(item: ContentType): Promise<Stored<ContentType>> {
      if (!this.db) throw new NotInitialisedError('Use before initialisation');
      var result = await this.db.post(item);
      var output = item as Stored<ContentType>;
      output._id = result.id;
      output._rev = result.rev;
      return output;
   }

   /**
    * Update an item in the database. The item must have both _id and _rev.
    * On success the item's _rev is updated.
    */
   async update(item: Stored<ContentType>): Promise<Stored<ContentType>> {
      if (!this.db) throw new NotInitialisedError('Use before initialisation');
      var result = await this.db.put(item);
      item._rev = result.rev;
      return item;
   }

   /**
    * Mark an item as deleted in the database. The item must have both _id and _rev.
    * On success the item's _rev is updated and _deleted is set to true. The object should not be used again.
    */
   async delete(item: Stored<ContentType>): Promise<Stored<ContentType>> {
      if (!this.db) throw new NotInitialisedError('Use before initialisation');
      var result = await this.db.remove(item);
      var output = item as Stored<ContentType> & DeletedMeta;
      output._deleted = true;
      output._rev = result.rev;
      return output;
   }
}


export class TableMonitor<ContentType extends {}> implements IAsyncDisposable {
   public name: string;
   public cache: { content: Stored<ContentType>[] } = { content: [] };

   private maxWait: number;
   private debouncedUpdate: any;
   private initialised: boolean;
   private liveFeed: PouchDB.LiveFind.Controller<ContentType>;
   private db: PouchDB.Database<ContentType>;

   constructor(name: string, maxWait: number = 100) {
      this.name = name;
      this.maxWait = maxWait;
   }

   async initialise() {
      if (this.initialised) return;

      // Setup pouchdb-live-find on this DB
      this.db = new PouchDB<ContentType>(this.name);
      this.liveFeed = this.db.liveFind({
         selector: {}, // e.g. {species: 'Dodo'}
         sort: [], // e.g. [{name:'asc'},{level:'desc'}]
         aggregate: true,
      });

      // Debounce the update handler so it isn't called too often
      this.debouncedUpdate = debounce(this.onUpdate.bind(this), this.maxWait / 2, { leading: false, trailing: true, maxWait: this.maxWait });
      this.liveFeed.on('update', this.debouncedUpdate);
      this.initialised = true;
   }

   async dispose() {
      if (!this.initialised) throw new NotInitialisedError('In TableMonitor.dispose');
      if (this.debouncedUpdate) {
         this.debouncedUpdate.cancel();
      }
      if (this.liveFeed) {
         this.liveFeed.cancel();
         this.liveFeed = null;
      }
      if (this.db) {
         this.db.close();
         this.db = null;
      }
   }

   onUpdate(_update: string, aggregate: Stored<ContentType>[]) {
      this.cache.content = aggregate;
   }
}


class NotInitialisedError extends Error {
   constructor(msg: string) { super(msg); }
};

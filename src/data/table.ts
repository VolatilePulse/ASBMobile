import { NotInitialisedError } from '@/data/database';
import PouchDB from 'pouchdb-core';
import PouchFind from 'pouchdb-find';

PouchDB.plugin(PouchFind);


export class Table<ContentType extends {}> {
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
      if (this.db) await this.db.close();
      this.db = null;
   }

   /**
    * Add an item that already has an ID to the database.
    * On success the item's _rev is set and the item is returned.
    */
   async add(item: PouchDB.Core.NewDocument<ContentType>): Promise<PouchDB.Core.ExistingDocument<ContentType>> {
      if (!this.db) throw new NotInitialisedError('Use before initialisation');
      const result = await this.db.put(item);
      const output = item as PouchDB.Core.ExistingDocument<ContentType>;
      output._rev = result.rev;
      return output;
   }

   /**
    * Add an item without an ID to the database. It will be assigned a generated UUID.
    * On success the item's _id and _rev are set and the item is returned.
    */
   async addWithRandomId(item: ContentType): Promise<PouchDB.Core.ExistingDocument<ContentType>> {
      if (!this.db) throw new NotInitialisedError('Use before initialisation');
      const result = await this.db.post(item);
      const output = item as PouchDB.Core.ExistingDocument<ContentType>;
      output._id = result.id;
      output._rev = result.rev;
      return output;
   }

   /**
    * Update an item in the database. The item must have both _id and _rev.
    * On success the item's _rev is updated and the item is returned.
    */
   async update(item: PouchDB.Core.ExistingDocument<ContentType>): Promise<PouchDB.Core.ExistingDocument<ContentType>> {
      if (!this.db) throw new NotInitialisedError('Use before initialisation');
      const result = await this.db.put(item);
      item._rev = result.rev;
      return item;
   }

   /**
    * Mark an item as deleted in the database. The item must have both _id and _rev.
    * On success the item's _rev is updated and _deleted is set to true.
    * Although the object is returned it should not be used again.
    */
   async delete(item: PouchDB.Core.ExistingDocument<ContentType>): Promise<PouchDB.Core.ExistingDocument<ContentType>> {
      if (!this.db) throw new NotInitialisedError('Use before initialisation');
      const result = await this.db.remove(item);
      const output = item as PouchDB.Core.ExistingDocument<ContentType> & DeletedMeta;
      output._deleted = true;
      output._rev = result.rev;
      return output;
   }
}

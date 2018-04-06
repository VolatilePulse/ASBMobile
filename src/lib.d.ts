// This file is where we declare types for external modules that don't have their own TypeScript type definitions


// Cheap fix: these just resolve as 'any' so they act like untyped Javascript
declare module 'bootstrap-vue';
declare module 'pouch-vue';
declare module 'pouchdb-live-find';
<<<<<<< HEAD

// Common for PouchDB
declare interface DeletedMeta { _deleted: boolean; }

// Home-made type completion for pouchdb-live-find
// tslint:disable-next-line:no-namespace
declare namespace PouchDB {
   namespace LiveFind {
      interface CreateOptions<Content extends {}> extends PouchDB.Find.FindRequest<Content> {
         aggregate?: boolean;
      }

      interface PaginateOptions {
         sort?: Array<string | { [propName: string]: 'asc' | 'desc' }>;
         skip?: number;
         limit?: number;
      }

      interface Change<Content extends {}> {
         action: 'ADD' | 'UPDATE' | 'REMOVE';
         id: string;
         rev: string;
         doc: Content;
      }

      interface Controller<Content extends {}> {
         on(event: 'update', fn: (update: Change<Content>, aggregate: Array<PouchDB.Core.ExistingDocument<Content>>) => void): void;
         on(event: 'ready' | 'cancelled', fn: () => void): void;
         on(event: 'error', fn: (err: Error) => void): void;

         cancel(): void;
         then<T>(fn: (result: { docs: Array<PouchDB.Core.ExistingDocument<Content>> }) => any | Promise<T>): Promise<T>;
         // catch():Promise<void>;
         sort(sort: Array<string | { [propName: string]: 'asc' | 'desc' }>): Array<PouchDB.Core.ExistingDocument<Content>>;
         paginate(options: PaginateOptions): Array<PouchDB.Core.ExistingDocument<Content>>;
      }
   }

   interface Database<Content extends {}= {}> {
      liveFind(options: LiveFind.CreateOptions<Content>): LiveFind.Controller<Content>;
   }
}

// Vue shim to support *.vue imports
declare module '*.vue' {
   import Vue from 'vue';
   export default Vue;
}
=======
declare module 'interval-arithmetic';
declare module 'interval-arithmetic-eval';
>>>>>>> Initial Interval Arithmetic implementation

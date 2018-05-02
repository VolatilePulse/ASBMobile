// Custom type definitions for pouchdb-live-find as none are available

// Cheap fix: these just resolve as 'any' so they act like untyped Javascript
declare module 'pouchdb-live-find' {
   const plugin: PouchDB.Plugin;
   export = plugin;
}

// Common for PouchDB
declare interface DeletedMeta { _deleted: boolean; }

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

// This file is where we declare types for external modules that don't have their own TypeScript type definitions


// Cheap fix: these just resolve as 'any' so they act like untyped Javascript
declare module 'bootstrap-vue';
declare module 'pouch-vue';
declare module 'pouchdb-live-find';

// Home-made type completion for pouchdb-live-find
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
         on(event: 'update', fn: (update: Change<Content>, aggregate: Content[]) => void): void;
         on(event: 'ready' | 'cancelled', fn: () => void): void;
         on(event: 'error', fn: (err: Error) => void): void;

         cancel(): void;
         then<T>(fn: (result: { docs: Content[] }) => any | Promise<T>): Promise<T>;
         //catch():Promise<void>;
         sort(sort: Array<string | { [propName: string]: 'asc' | 'desc' }>): void;
         paginate(options: PaginateOptions): void;
      }
   }

   interface Database<Content extends {}={}> {
      liveFind(options: LiveFind.CreateOptions<Content>): LiveFind.Controller<Content>;
   }
}

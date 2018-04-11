import { IAsyncDisposable, NotInitialisedError } from '@/data/database';
import debounce from 'lodash-es/debounce';
import PouchDB from 'pouchdb-core';


export interface MirrorCache<ContentType extends {}> {
   content: Array<PouchDB.Core.ExistingDocument<ContentType>>;
}

export class TableMirror<ContentType extends {}> implements IAsyncDisposable {
   public name: string;

   /** Cache object, isolated so it can be observed for changes. */
   public cache: MirrorCache<ContentType> = { content: [] };

   private maxWait: number;
   private debouncedUpdate: any;
   private initialised: boolean;
   private liveFeed: PouchDB.LiveFind.Controller<ContentType>;
   private db: PouchDB.Database<ContentType>;
   private options: PouchDB.LiveFind.PaginateOptions = { sort: [] };
   private filter: PouchDB.Find.Selector = {};

   private firstDataPromise: Promise<void>;
   private firstDataPromiseResolver: (value?: void | PromiseLike<void>) => void;

   /**
    * Create a table/database mirror. Maintains an array of the contents of the database, updated live when the database changes.
    * @param name Database name to mirror.
    * @param maxWait Milliseconds of debounce before updating.
    */
   constructor(name: string, maxWait: number = 100) {
      this.name = name;
      this.maxWait = maxWait;
   }

   async initialise() {
      if (this.initialised) return;

      // Setup to capture the first results
      this.firstDataPromise = new Promise(resolve => this.firstDataPromiseResolver = resolve);

      // Setup pouchdb-live-find on this DB
      this.db = new PouchDB<ContentType>(this.name);
      this.liveFeed = this.db.liveFind({
         selector: this.filter, // e.g. {species: 'Dodo'}
         sort: this.options.sort || [], // e.g. [{name:'asc'},{level:'desc'}]
         aggregate: true,
      });

      // Debounce the update handler so it isn't called too often
      this.debouncedUpdate = debounce(this.onUpdate.bind(this), this.maxWait / 2, { leading: false, trailing: true, maxWait: this.maxWait });
      this.liveFeed.on('update', this.debouncedUpdate);
      this.initialised = true;
   }

   /** Wait for the first initial data fetch to complete */
   async waitForInitialData() {
      if (!this.initialised) throw new NotInitialisedError();
      if (!this.firstDataPromise) return;

      await this.firstDataPromise;
   }

   /**
    * @example setSortOrder([{name:'asc'},{level:'desc'}])
    * @example setSortOrder(['name','level'])
    * @param sort An array of fields to sort on.
    */
   setSortOrder(sort?: Array<string | { [propName: string]: 'asc' | 'desc' }>) {
      this.options.sort = sort;
      if (this.liveFeed) this.cache.content = this.liveFeed.sort(sort);
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

   private onUpdate(_: string, aggregate: Array<PouchDB.Core.ExistingDocument<ContentType>>) {
      if (this.firstDataPromise) {
         this.firstDataPromiseResolver();
         this.firstDataPromiseResolver = undefined;
         this.firstDataPromise = undefined;
      }
      this.cache.content = aggregate;
   }
}

/** Everything object in the database needs these fields */
export class DatabaseObject {
   public _id: string;
   public _rev?: string;

   constructor(id?: string) {
      this._id = id;
   }
}

export class NotInitialisedError extends Error {
   constructor(msg?: string) { super(msg); }
}

export interface IAsyncDisposable {
   initialise(): Promise<void>;
   dispose(): Promise<void>;
}

import firebase from 'firebase/app';


export interface DocumentData<T> {
   data: T;
   ref: firebase.firestore.DocumentReference;
}

/** Encapsulates a collection from the database that is automatically updated with remote changes */
export interface LiveCollection<T> {
   collection: ReadonlyArray<DocumentData<T>>;
   error: string;
   isActive: boolean;

   close(): void;
}

/** Encapsulates a document from the database that is automatically updated with remote changes */
export interface LiveDocument<T> {
   error: string;
   isActive: boolean;
   data: T;
   ref: firebase.firestore.DocumentReference;

   close(): void;
}


/**
 * Create an observable collection that mirrors a collection in firestore, updating live when it changes.
 * @param path Database path to the collection
 * @returns Cache object containing the live `collection`, `error` and a `close` method for cleanup.
 */
export function CreateLiveCollection<T>(path: string): Readonly<LiveCollection<T>> {
   const pathRef = firebase.firestore().collection(path);
   let unsubscribe: () => void;

   const collection: Array<DocumentData<T>> = [];

   const cache: LiveCollection<T> = {
      collection: collection,
      error: null,
      isActive: false,

      close() { unsubscribe(); }
   };

   unsubscribe = pathRef.onSnapshot(change => {
      cache.isActive = true;
      console.log(`LiveCollection: Active @ ${new Date().toISOString()}`);
      console.log(`  change.metadata.fromCache: ${change.metadata.fromCache}`);
      console.log(`  change.size: ${change.size}`);
      updateCollectionFromSnapshotChanges(collection, change.docChanges());
   }, error => cache.error = error.message);

   return cache;
}

/**
 * Create an observable object that mirrors a single document in firestore, updating live when it changes.
 * @param path Database path to the collection
 * @returns Cache object containing the live `data`, `error` and a `close` method for cleanup.
 */
export function CreateLiveDocument<T>(path: string): Readonly<LiveDocument<T>> {
   const pathRef = firebase.firestore().doc(path);
   let unsubscribe: () => void;

   const cache: LiveDocument<T> = {
      data: null,
      error: null,
      isActive: false,
      ref: pathRef,

      close() { unsubscribe(); }
   };

   unsubscribe = pathRef.onSnapshot(change => {
      cache.isActive = true;
      cache.data = change.data() as T;
   }, error => cache.error = error.message);

   return cache;
}

function updateCollectionFromSnapshotChanges(cache: any[], changes: firebase.firestore.DocumentChange[]) {
   console.log(`updateCollection: with ${changes.length} changes @ ${new Date().toISOString()}`);
   for (const change of changes) {
      console.log(`  change.type: ${change.type}, change.doc.metadata.fromCache: ${change.doc.metadata.fromCache}`);
      switch (change.type) {
         case 'added':
            cache.splice(change.newIndex, 0, normalize(change));
            break;
         case 'removed':
            cache.splice(change.oldIndex, 1);
            break;
         case 'modified':
            if (change.oldIndex !== change.newIndex) {
               cache.splice(change.oldIndex, 1);
               cache.splice(change.newIndex, 0, normalize(change));
            } else {
               cache.splice(change.newIndex, 1, normalize(change));
            }
            break;
      }
   }
}

function normalize<T>(snapshot: firebase.firestore.DocumentChange): DocumentData<T> {
   const value = snapshot.doc.data() as T;
   // We use Object.preventExtensions to prevent Vue adding observers into the reference
   const result: DocumentData<T> = { ref: Object.preventExtensions(snapshot.doc.ref), data: value };
   return result;
}

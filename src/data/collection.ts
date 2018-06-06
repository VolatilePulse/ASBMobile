import firebase from 'firebase/app';
import { isObject } from 'util';


export interface IObservableLiveCache<T> {
   collection: T[];
   error: string;
   isActive: boolean;

   close(): void;
}

export interface DocData {
   id: string;
   ref: firebase.firestore.DocumentReference;
   data: any;
}

export function CreateLiveCollection<T>(path: string): IObservableLiveCache<T> {
   const pathRef = firebase.firestore().collection(path);
   let finish = false;

   const cache: IObservableLiveCache<T> = {
      collection: [],
      error: null,
      isActive: false,

      close() {
         finish = true;
      }
   };

   console.log('Creating live collection for: ' + path);

   let unsubscribe: () => void;
   unsubscribe = pathRef.onSnapshot(change => {
      if (finish) unsubscribe();
      cache.isActive = true;
      updateCacheFromSnapshotChanges(cache.collection, change.docChanges());
   }, error => cache.error = error.message);

   return cache;
}

function updateCacheFromSnapshotChanges(cache: any[], changes: firebase.firestore.DocumentChange[]) {
   for (const change of changes) {
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

function normalize(snapshot: firebase.firestore.DocumentChange): DocData {
   const value = snapshot.doc.data();
   const out = isObject(value) ? value : { '.value': value };
   const result = { id: snapshot.doc.id, ref: snapshot.doc.ref, data: out };
   return result;
}

import firebase from 'firebase/app';
import debounce from 'lodash/debounce';


const DELAY_UPDATE_MIN = 5000;
const DELAY_UPDATE_MAX = 10000;

export interface DocumentWriter<T> {
   data: T;
   error: string;
   isActive: boolean;
   ref: firebase.firestore.DocumentReference;

   /** Stop processing writes for this document. This writes any outstanding changes to the database. */
   close(): void;

   /** Call this when Vue detects a change in `data` */
   notifyChanged(): void;
}

export function CreateDocumentWriter<T>(path: string): Readonly<DocumentWriter<T>> {
   let unsubscribe: () => void;
   let cache: DocumentWriter<T>;

   function saveData() {
      if (!cache.data) {
         console.warn('CreateDocumentWriter::saveData: with no cached data!', cache.ref.path);
         return;
      }
      cache.ref.update(cache.data).catch(err => {
         console.error('CreateDocumentWriter::saveData: failed to write data', err);
         cache.error = err.message;
      });
   }

   const changeDebounce = debounce(saveData, DELAY_UPDATE_MIN, { maxWait: DELAY_UPDATE_MAX });

   cache = {
      data: null,
      ref: firebase.firestore().doc(path),
      error: null,
      isActive: false,

      notifyChanged() {
         changeDebounce();
      },

      close() {
         unsubscribe();
         changeDebounce.flush();
         this.ref = null;
      },
   };

   unsubscribe = cache.ref.onSnapshot(change => {
      if (!cache.isActive) {
         cache.isActive = true;
         cache.data = change.data() as T;
         console.log('CreateDocumentWriter::onSnapshot: got initial data');
      }
      else {
         console.log('CreateDocumentWriter::onSnapshot: data received during edit');
      }
   }, error => cache.error = error.message);

   return cache;
}

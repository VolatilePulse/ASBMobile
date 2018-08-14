import firebase from 'firebase/app';


/**
 * Fetch a Firestore document.
 * Requests the document from the network first but returns a value from the cache when offline if available.
 * Does not catch errors - you must handle then.
 */
export async function getFromNetworkFirst<T>(docRef: firebase.firestore.DocumentReference) {
   const result = await docRef.get();
   return result.data() as T;
}

/**
 * Fetch a Firestore document.
 * Requests the document from the network only, ignoring the cache.
 * Does not catch errors - you must handle then.
 */
export async function getFromNetworkOnly<T>(docRef: firebase.firestore.DocumentReference) {
   const result = await docRef.get({ source: 'server' });
   return result.data() as T;
}

/**
 * Fetch a Firestore document.
 * Requests the document from the cache only, ignoring the network.
 * Does not catch errors - you must handle then.
 */
export async function getFromCacheOnly<T>(docRef: firebase.firestore.DocumentReference) {
   const result = await docRef.get({ source: 'cache' });
   return result.data() as T;
}

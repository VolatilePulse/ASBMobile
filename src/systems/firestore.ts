import theStore, { EVENT_LOADED_FIRESTORE } from '@/ui/store';
import { Delay } from '@/utils';
import firebase from 'firebase/app';
import { SubSystem } from './common';


/**
 * Subsystem that handles initialising Firestore.
 * TODO: Consider how to handle pagehide and Firestore subscription cancelling
 */
class FirestoreSystem implements SubSystem {
   async initialise() {
      console.log('FirestoreSystem: Setting settings');
      try {
         // Set settings
         firebase.firestore().settings({ timestampsInSnapshots: true });
      }
      catch (err) {
         console.warn('Firestore settings cannot be applied - probably already started: ', err);
         theStore.addDismissableMessage('warning', 'Firestore settings cannot be applied: ' + err);
      }

      await Delay(100);

      // Try enabling persistence, but don't worry if it doesn't work
      console.log('FirestoreSystem: Attempting to enable persistence');
      try {
         await firebase.firestore().enablePersistence();
         console.log('FirestoreSystem: Persistence enabled');
      }
      catch (err) {
         console.warn('Firestore offline persistance not enabled: ', err);
         theStore.addDismissableMessage('warning', 'Firestore offline persistance not enabled: ' + err);
      }

      console.log('FirestoreSystem: Marking loaded');
      theStore.loaded.firestore = true;
      theStore.events.emit(EVENT_LOADED_FIRESTORE);
   }
}

export const firestoreSystem = new FirestoreSystem();

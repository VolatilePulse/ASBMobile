import theStore, { EVENT_LOADED_FIRESTORE } from '@/ui/store';
import { Delay } from '@/utils';
import firebase from 'firebase/app';
import { SubSystem } from './common';


/** Subsystem that handles initialising Firestore */
export class FirestoreSystem implements SubSystem {
   async initialise() {
      console.log('FirestoreSystem: Setting settings');
      // Initialise Firestore
      firebase.firestore().settings({ timestampsInSnapshots: true });

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

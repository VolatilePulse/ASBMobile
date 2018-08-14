import { User } from '@/data/firestore/objects';
import theStore, { EVENT_LOADED_AUTH, EVENT_LOADED_FIRESTORE } from '@/ui/store';
import ColorHash from 'color-hash';
import firebase from 'firebase/app';
import { eventWaiter, SubSystem } from './common';


/** Subsystem that handles user authentication changes from Firebase */
class AuthSystem implements SubSystem {
   async initialise() {
      console.log('AuthSystem: Waiting for Firestore to load');
      if (!theStore.loaded.firestore)
         await eventWaiter(theStore.events, EVENT_LOADED_FIRESTORE);

      console.log('AuthSystem: Beginning');

      // Initialise Firestore authentication monitoring
      firebase.auth().onAuthStateChanged(async (authUser: firebase.User) => {
         theStore.authUser = authUser;

         if (authUser) {
            console.dir(`AuthSystem: Auth as ${authUser.uid}:`, authUser);
            await this.setupUserInfo(authUser);
         }
         else {
            theStore.authUser = null;
            theStore.userInfo = null;
            console.log('AuthSystem: No authentication found');
         }

         if (!theStore.loaded.auth) {
            console.log('AuthSystem: First onAuthStateChanged - marking loaded');
            theStore.loaded.auth = true;
            theStore.events.emit(EVENT_LOADED_AUTH);
         }
      });
   }

   async setupUserInfo(user: firebase.User) {
      // TODO: Use a live-writable document for the user data?
      const userDocRef = firebase.firestore().collection('user').doc(user.uid);
      let userInfo: User;
      try {
         userInfo = (await userDocRef.get()).data() as User;
      }
      catch (err) {
         console.warn('AuthSystem: Failed to get user object after authentication', err);
      }

      let changed = false;
      if (!userInfo) {
         userInfo = {};
         changed = true;
      }

      if (!userInfo.photoURL) {
         userInfo.photoURL = user.providerData.reduce((agg, a) => agg || a.photoURL, '') || user.photoURL;
         changed = true;
      }

      if (!userInfo.displayName) {
         userInfo.displayName = user.displayName || user.providerData.reduce((agg, a) => agg || a.displayName, '') || 'Anon E. Mouse';
         changed = true;
      }

      if (!userInfo.color) {
         userInfo.color = new ColorHash().hex('id:' + user.uid);
         changed = true;
      }

      if (!userInfo.libraries) {
         userInfo.libraries = {};
         changed = true;
      }

      console.log('AuthSystem: User data:', userInfo);
      theStore.userInfo = userInfo;

      if (changed) {
         console.log('AuthSystem: Updating user object');

         // This set never resolves it's promise if we're offline so we don't wait for it and use .catch to error check
         userDocRef.set(userInfo, { merge: true }).catch(err => {
            console.warn('AuthSystem: Failed to update user object after authentication', err);
            theStore.addDismissableMessage('warning', 'AuthSystem: Failed to update user object after authentication', err);
         });
      }
   }
}

export const authSystem = new AuthSystem();

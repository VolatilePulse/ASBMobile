/// <reference types="webpack-env" />

import Common from '@/ui/behaviour/Common';
import theStore from '@/ui/store';
import firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';
import { Component, Vue } from 'vue-property-decorator';


@Component
export default class FireauthTab extends Common {
   firebaseui: firebaseui.auth.AuthUI = null;
   authUIVisible = false;

   newDisplayName: string = '';
   showDisplayNameEdit = false;

   get isDisplayNameValid() {
      if (theStore.user && this.newDisplayName === theStore.user.displayName) return null;
      return !!this.newDisplayName && this.newDisplayName.length >= 2;
   }

   async submitDisplayName() {
      const validity = this.isDisplayNameValid;
      if (!validity && validity !== null) return;

      if (validity !== null) {
         try {
            await firebase.auth().currentUser.updateProfile({ displayName: this.newDisplayName } as any); // work around bad TS defs
         }
         catch (err) {
            console.error(err);
            // FIXME: Tell the user it failed
         }
      }

      this.showDisplayNameEdit = false;
   }

   async mounted() {
      console.log('FireauthTab.mounted');
      if (!this.firebaseui) {
         this.firebaseui = new firebaseui.auth.AuthUI(firebase.auth());
      }
      if (this.firebaseui.isPendingRedirect()) {
         console.log('FireauthTab.mounted : pending redirect : starting UI');
         await Vue.nextTick();
         this.startFirebaseAuthUI();
      }
      else {
         console.log('FireauthTab.mounted : no pending redirect');
      }
   }

   startFirebaseAuthUI() {
      console.log('FireauthTab.startFirebaseAuthUI');
      if (!this.authUIVisible) {
         const config = makeAuthConfig(this);
         this.firebaseui.start('#firebaseui-div', config);
         this.authUIVisible = true;
      }
   }

   destroyed() {
      if (this.authUIVisible) {
         this.firebaseui.reset();
         this.authUIVisible = false;
      }
   }

   signIn() {
      console.log('FireauthTab.signIn : starting UI');
      this.startFirebaseAuthUI();
   }

   async signOut() {
      console.log('FireauthTab.signOut');
      await firebase.auth().signOut();
      this.startFirebaseAuthUI();
   }
}

function makeAuthConfig(_page: FireauthTab): firebaseui.IConfig {
   const callbacks: firebaseui.ICallbacks = {
      signInSuccessWithAuthResult(authResult, redirectUrl) {
         console.log('fireauth ui callback:signInSuccessWithAuthResult:');
         console.log('Auth result:', authResult);
         console.log('Redirect:', redirectUrl);
         // Return type determines whether we continue the redirect automatically
         return false;
      },
      uiShown() {
         console.log('fireauth ui callback:uiShown');
      },
   };

   return { callbacks: callbacks, ...staticAuthConfig };
}


const staticAuthConfig: firebaseui.IConfig = {
   signInOptions: [
      // List of OAuth providers supported  (must be registered as an app for each provider first)
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      // firebase.auth.GithubAuthProvider.PROVIDER_ID,
   ],

   // Choose UI method based on whether we're in standalone mode (installed app)
   signInFlow: ('matchMedia' in window && window.matchMedia('(display-mode: standalone)').matches) ? 'popup' : 'redirect',

   credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,

   tosUrl: '/nothing',
};


// Mark this module as not HMR compatible due to the way firebaseui keeps a reference to the auth() object
if (module.hot) module.hot.decline();

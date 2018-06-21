/// <reference types="webpack-env" />

import Common from '@/ui/common';
import theStore from '@/ui/store';
import firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';
import { Component, Vue } from 'vue-property-decorator';


// We keep a global instance of this as it needs to be used as a singleton from dynamically created Vue components
let firebaseuiInstance: firebaseui.auth.AuthUI = null;


@Component
export default class UserTab extends Common {
   firebaseui: firebaseui.auth.AuthUI = null;
   authUIVisible = false;

   newDisplayName: string = '';
   showDisplayNameEdit = false;

   get isDisplayNameValid() {
      if (theStore.authUser && this.newDisplayName === theStore.authUser.displayName) return null;
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
      await Vue.nextTick();

      // Ensure the singleton is created
      if (!firebaseuiInstance) {
         console.log('FireauthTab.mounted : creating firebaseui instance');
         firebaseuiInstance = new firebaseui.auth.AuthUI(firebase.auth());
      }

      await Vue.nextTick();

      if (firebaseuiInstance.isPendingRedirect()) {
         console.log('FireauthTab.mounted : pending redirect : starting UI');
         this.startFirebaseAuthUI();
      }
      else {
         console.log('FireauthTab.mounted : no pending redirect');
      }
   }

   beforeDestroy() {
      if (this.authUIVisible) {
         console.log('FireauthTab.beforeDestroy : cleaning up UI');
         firebaseuiInstance.reset();
         this.authUIVisible = false;
      }
   }

   startFirebaseAuthUI() {
      console.log('FireauthTab.startFirebaseAuthUI');
      if (!this.authUIVisible) {
         const config = makeAuthConfig(this);
         firebaseuiInstance.start('#firebaseui-div', config);
         this.authUIVisible = true;
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

   authCompleted() {
      if (this.$route.query['redirect']) {
         console.log('Auth complete and redirect detected to:', this.$route.query['redirect']);
         setTimeout(() => this.$router.replace(this.$route.query['redirect']), 500);
      }
   }
}

function makeAuthConfig(_page: UserTab): firebaseui.IConfig {
   const callbacks: firebaseui.ICallbacks = {
      signInSuccessWithAuthResult(authResult, _redirectUrl) {
         console.log('fireauth ui callback:signInSuccessWithAuthResult:');
         console.log('Auth result:', authResult);

         _page.authCompleted();

         // Do not redirect - we do this ourselves
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
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
   ],

   // Choose UI method based on whether we're in standalone mode (installed app)
   signInFlow: ('matchMedia' in window && window.matchMedia('(display-mode: standalone)').matches) ? 'popup' : 'redirect',

   credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,

   tosUrl: '/info/about',
};


// Mark this module as not HMR compatible due to the way firebaseui keeps a reference to the auth() object
if (module.hot) module.hot.decline();

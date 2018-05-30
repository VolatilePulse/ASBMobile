declare module "firebaseui" {

   import firebase from 'firebase';

   interface IConfig {
      callbacks?: ICallbacks;
      credentialHelper?: auth.CredentialHelper;
      queryParameterForSignInSuccessUrl?: string;
      queryParameterForWidgetMode?: string;
      signInFlow?: 'redirect' | 'popup';
      signInOptions: Array<ISignInOption | string>;
      signInSuccessUrl?: string;
      tosUrl: string;
   }
   interface ICallbacks {
      signInSuccessWithAuthResult?: (authResult: firebase.auth.UserCredential, redirectUrl: string) => boolean;
      signInSuccess?: (currentUser: firebase.User, credential?: firebase.auth.AuthCredential, redirectUrl?: string) => boolean;
      signInFailure?: (error: { code: string, credential: firebase.auth.AuthCredential }) => Promise<void>;
      uiShown?: () => void;
   }
   interface ISignInOption {
      provider: string;
      scopes?: Array<string>;
      requireDisplayName?: boolean;
   }

   namespace auth {
      enum CredentialHelper { ACCOUNT_CHOOSER_COM, NONE }
      class AuthUI {
         constructor(auth: firebase.auth.Auth);
         start(containerCSSselector: string, config: IConfig): void;
         reset(): void;
         isPendingRedirect(): boolean;
      }
   }
}

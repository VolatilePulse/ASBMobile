import Common from '@/ui/behaviour/Common';
import { Component } from 'vue-property-decorator';

// import ui from 'firebaseui';


@Component
export default class FireauthTab extends Common {
   pathTree = {
      users:
         {
            libraries:
               {
                  servers: null as any,
                  creatures: null as any,
               }
         }
   };
}

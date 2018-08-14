import Common from '@/ui/common';
import FirestoreCollection from '@/ui/components/FirestoreCollection.vue';
import { Component } from 'vue-property-decorator';

@Component({
   components: {
      'fs-collection': FirestoreCollection,
   }
})
export default class FirestoreTab extends Common {
   pathTree = {
      user:
      {
      },
      library:
      {
         server: null as any,
         creature: null as any,
      }
   };
}

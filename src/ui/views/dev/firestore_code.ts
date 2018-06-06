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
      users:
      {
      },
      libraries:
      {
         servers: null as any,
         creatures: null as any,
      }
   };
}

import { Component } from 'vue-property-decorator';
import Common from '@/ui/behaviour/Common';
import FirestoreCollection from '@/ui/components/FirestoreCollection.vue';

@Component({
   components: {
      'fs-collection': FirestoreCollection,
   }
})
export default class FirestoreTab extends Common {
}

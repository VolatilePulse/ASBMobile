import { Creature } from '@/data/firestore/objects';
import { CreateDocumentWriter, DocumentWriter } from '@/data/firestore/writer';
import Common from '@/ui/common';
import { Component, Watch } from 'vue-property-decorator';


@Component({ name: 'CreatureEdit' })
export default class CreatureEditTab extends Common {
   cache: DocumentWriter<Creature> = {} as any;

   mounted() {
      this.cache = CreateDocumentWriter(`/library/${this.$route.params.library_id}/creature/${this.$route.params.creature_id}`);
   }

   destroyed() {
      this.cache.close();
   }

   @Watch('cache.data', { deep: true })
   dataChanged() {
      if (this.cache) this.cache.notifyChanged();
   }
}

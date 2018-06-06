<template>
   <b-container fluid>
      <h2>Creatures</h2>
      <ul v-if="cache">
         <li v-for="item in cache.collection" :key="item.ref.id">
            <b-button :to="`/library/${$route.params.library_id}/creature/${item.ref.id}`" variant="link">{{item.data.name || '&lt;blank&gt;'}}</b-button> (ID: {{item.ref.id}})
         </li>
      </ul>
   </b-container>
</template>


<style lang="scss" scoped>
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '../common';
import { LiveCollection, CreateLiveCollection } from '@/data/firestore/live';
import { Creature } from '@/data/firestore/objects';

@Component({ name: 'Creatures' })
export default class extends Common {
   cache: LiveCollection<Creature> = null;

   mounted() {
      this.cache = CreateLiveCollection<Creature>(`/library/${this.$route.params.library_id}/creature`);
   }

   beforeDestroy() {
      this.cache.close();
   }
}
</script>

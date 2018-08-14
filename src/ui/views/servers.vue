<template>
   <b-container fluid>
      <h2>Servers</h2>
      <ul v-if="cache">
         <li v-for="item in cache.collection" :key="item.ref.id">
            <b-button :to="`/library/${$route.params.library_id}/server/${item.ref.id}`" variant="link">{{item.data.name || '&lt;blank&gt;'}}</b-button> (ID: {{item.ref.id}})
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
import { Server } from '@/data/firestore/objects';

@Component({ name: 'Servers' })
export default class extends Common {
   cache: LiveCollection<Server> = null;

   mounted() {
      this.cache = CreateLiveCollection<Server>(`/library/${this.$route.params.library_id}/server`);
   }

   beforeDestroy() {
      this.cache.close();
   }
}
</script>

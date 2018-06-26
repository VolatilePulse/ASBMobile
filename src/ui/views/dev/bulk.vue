<template>
   <b-container fluid>
      <h2>Bulk Items</h2>
      <ul v-if="cache && cache.collection && cache.collection.length > 0">
         <li v-for="item in cache.collection" :key="item.ref.id" style="list-style:none">
            <i class="text-secondary">{{item.ref.id}})</i> {{item.data | inspect}}</li>
      </ul>
      <p v-else>...nothing here...</p>
   </b-container>
</template>


<style lang="scss" scoped>
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '../../common';
import { LiveCollection, CreateLiveCollection } from '@/data/firestore/live';

@Component({ name: 'Bulk' })
export default class extends Common {
   cache: LiveCollection<any> = null;

   mounted() {
      this.cache = CreateLiveCollection('/dev/bulk/items');
   }

   beforeDestroy() {
      this.cache.close();
   }
}
</script>

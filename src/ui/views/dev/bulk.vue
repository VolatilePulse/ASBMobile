<template>
   <b-container fluid>
      <h2>Bulk Items</h2>
      <div class="text-right py-2">
         Collection:
         <b-button-group>
            <b-button @click="select10">10</b-button>
            <b-button @click="select100">100</b-button>
            <b-button @click="select1000">1000</b-button>
         </b-button-group>
      </div>
      <p v-if="!cache">...select a collection...</p>
      <p v-else-if="!cache.collection">...waiting...</p>
      <p v-else-if="cache.collection.length === 0">...empty collection...</p>
      <ul v-else>
         <li v-for="item in cache.collection" :key="item.ref.id" style="list-style:none">
            <i class="text-secondary">{{item.ref.id}})</i> {{item.data | inspect}}
         </li>
      </ul>
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

   beforeDestroy() {
      if (this.cache) {
         this.cache.close();
         this.cache = null;
      }
   }

   select10() {
      if (this.cache) this.cache.close();
      this.cache = CreateLiveCollection('/dev/bulk/items10');
   }

   select100() {
      if (this.cache) this.cache.close();
      this.cache = CreateLiveCollection('/dev/bulk/items100');
   }

   select1000() {
      if (this.cache) this.cache.close();
      this.cache = CreateLiveCollection('/dev/bulk/items');
   }
}
</script>

<template>
   <b-container fluid>
      <h2>Libraries</h2>
      <ul v-if="cache">
         <li v-for="item in cache.collection" :key="item.ref.id">
            <b-button :to="`library/${item.ref.id}`" variant="link">{{item.data.name || '&lt;blank&gt;'}}</b-button> (ID: {{item.ref.id}})
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
import { Library } from '@/data/firestore/objects';

@Component({ name: 'Libraries' })
export default class extends Common {
   cache: LiveCollection<Library> = null;

   mounted() {
      this.cache = CreateLiveCollection<Library>('/library');
   }

   beforeDestroy() {
      this.cache.close();
   }
}
</script>

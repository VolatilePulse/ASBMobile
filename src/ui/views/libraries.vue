<template>
   <b-container fluid>
      <h2>Libraries</h2>
      <ol v-if="cache">
         <li v-for="item in cache.collection" :key="item.id">
            <b-button :to="'/library/'+item.id" variant="link">{{item.id}}</b-button>
         </li>
      </ol>
   </b-container>
</template>


<style lang="scss" scoped>
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../common';
import { IObservableLiveCache, CreateLiveCollection } from '@/data/collection';

interface ILibrary {
   name: string;
}

@Component({ name: 'Libraries' })
export default class extends Behaviour {
   cache: IObservableLiveCache<ILibrary> = null;

   mounted() {
      this.cache = CreateLiveCollection<ILibrary>('/library');
   }

   beforeDestroy() {
      if (this.cache) {
         this.cache.close();
         this.cache = null;
      }
   }
}
</script>

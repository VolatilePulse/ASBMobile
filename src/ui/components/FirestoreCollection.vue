<template>
   <div v-if="store.loaded.firestore">
      <div>
         <span v-if="path" class="text-warning">{{leafname(path)}} </span>
         <span v-if="cache && cache.collection.length > 0">({{cache.collection.length}}) </span>
         <span v-if="cache && cache.error" class="text-danger">{{cache.error}} </span>
      </div>
      <ul v-if="cache && cache.isActive">
         <li v-for="item in cache.collection" :key="item.ref.path">
            <b-btn variant="link" v-b-toggle="'collapse'+item.ref.path">{{item.ref.id}}</b-btn>
            <b-collapse :id="'collapse'+item.ref.path">
               <pre>{{stringifyData(item)}}</pre>
               <FirestoreCollection v-for="sub in subCollections(tree, item.ref.id)" :key="sub.path" :path="sub.path" :tree="sub.tree"></FirestoreCollection>
            </b-collapse>
         </li>
      </ul>
      <ul v-if="!path && tree" v-for="sub in subCollections(tree)" :key="sub.path">
         <li>
            <FirestoreCollection :path="sub.path" :tree="sub.tree"></FirestoreCollection>
         </li>
      </ul>
   </div>
</template>


<style lang="scss" scoped>
</style>


<script lang="ts">
import { isObject } from 'util';
import { Component, Prop } from 'vue-property-decorator';
import Common from '@/ui/common';
import { CreateLiveCollection, LiveCollection } from '@/data/firestore/live';

interface DocData {
   id: string;
   data: any;
}

interface PathTree {
   [name: string]: null | PathTree;
}

@Component({ name: 'FirestoreCollection' })
export default class FirestoreCollection extends Common {
   @Prop() path: string;
   @Prop() tree: PathTree;

   cache: LiveCollection<any> = null;
   error: string = null;

   mounted() {
      if (this.path) {
         console.log('mounted: ' + this.path);
         this.cache = CreateLiveCollection<any>(this.path);
      }
   }

   beforeDestroy() {
      if (this.cache) {
         console.log('beforeDestroy: ' + this.path);
         this.cache.close();
         this.cache = null;
      }
   }

   leafname(path: string) {
      if (!path) return '/';
      const parts = path.split('/');
      return parts[parts.length - 1];
   }

   combine(...parts: string[]): string {
      const path = parts.filter(p => p).join('/');
      return path;
   }

   subCollections(tree: PathTree, itemId: string) {
      if (!isObject(tree)) return [];
      return Object.entries(tree).map(kvp => ({ path: this.combine(this.path, itemId, kvp[0]), tree: kvp[1] }));
   }

   stringifyData(item: DocData) {
      let text = JSON.stringify(item.data, undefined, 2);
      let lines = text.split('\n');
      lines = lines.map(line => line.replace(/[{}]/, '').replace(/,$/, ''));
      lines = lines.filter(line => line.trim());
      text = lines.join('\n');
      return text;
   }
}
</script>

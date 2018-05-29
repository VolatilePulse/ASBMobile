<template>
   <div v-if="store.loaded.firestore">
      <div>
         <span v-if="path" class="text-warning">{{leafname(path)}} </span>
         <span v-if="size > 0">({{size}}) </span>
         <span v-if="error" class="text-danger">{{error}} </span>
      </div>
      <ul v-if="loaded">
         <li v-for="item in cache" :key="item.id">
            <b-btn variant="link" v-b-toggle="'collapse'+item.id">{{item.id}}</b-btn>
            <b-collapse :id="'collapse'+item.id">
               <pre>{{stringifyData(item)}}</pre>
               <FirestoreCollection v-for="sub in subCollections(tree, item.id)" :key="sub.path" :path="sub.path" :tree="sub.tree"></FirestoreCollection>
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
import Common from '@/ui/behaviour/Common';
import firebase from 'firebase/app';

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

   pathRef: firebase.firestore.CollectionReference;
   cache: DocData[] = [];
   error: string = null;
   loaded = false;
   closing = false;
   size: number = null;

   mounted() {
      if (this.path) {
         this.pathRef = firebase.firestore().collection(this.path);
         this.pathRef.onSnapshot(change => this.receiveSnapshotChanges(change), error => this.receiveError(error));
      }
   }

   beforeDestroy() {
      this.closing = true;
      this.pathRef = null;
      this.cache = [];
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

   receiveError(error: Error) {
      console.log(`receiveError: ${error.message}`);
      console.dir(error);
      this.error = error.message;
   }

   receiveSnapshotChanges(changes: firebase.firestore.QuerySnapshot) {
      if (this.closing) return;
      this.loaded = true;
      this.size = changes.size;
      changes.docChanges().forEach(change => {
         switch (change.type) {
            case 'added':
               this.cache.splice(change.newIndex, 0, normalize(change));
               break;
            case 'removed':
               this.cache.splice(change.oldIndex, 1);
               break;
            case 'modified':
               if (change.oldIndex !== change.newIndex) {
                  this.cache.splice(change.oldIndex, 1);
                  this.cache.splice(change.newIndex, 0, normalize(change));
               } else {
                  this.cache.splice(change.newIndex, 1, normalize(change));
               }
               break;
         }
      });
   }
}

function normalize(snapshot: firebase.firestore.DocumentChange): DocData {
   const value = snapshot.doc.data();
   const out = isObject(value) ? value : { '.value': value };
   const result = { id: snapshot.doc.id, data: out };
   return result;
}
</script>

<template>
   <div>
      <h6>{{path}}</h6>
      <ul v-if="loaded">
         <li v-for="item in cache" :key="item.id">
            <span>{{item.id}}</span>
            <pre>{{JSON.stringify(item.data, undefined, 2)}}</pre>
         </li>
      </ul>
      <p v-else>...loading...</p>
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

@Component({ name: 'FirestoreCollection' })
export default class FirestoreCollection extends Common {
   @Prop() path: string;
   @Prop() title: string;

   loaded = false;
   pathRef: firebase.firestore.CollectionReference;
   cache: DocData[] = [];

   async mounted() {
      console.log('mounted');

      this.pathRef = firebase.firestore().collection(this.path);
      this.pathRef.onSnapshot(change => this.receiveSnapshotChanges(change));
   }

   receiveSnapshotChanges(changes: firebase.firestore.QuerySnapshot) {
      this.loaded = true;
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

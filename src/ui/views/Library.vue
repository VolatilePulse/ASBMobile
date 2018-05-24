<template>
   <b-container fluid id="library">
      <b-table dark striped small hover responsive="sm" :items="entries" :fields="fields">
         <template slot="species"></template>
         <template slot="name"></template>
         <template slot="tribe"></template>
         <template slot="level"></template>

         <template v-for="i in range(7)" :slot="'stat'+i" slot-scope="row">{{row.item.stats[i].Lw}}</template>

         <template v-for="i in range(7)" :slot="'HEAD_stat'+i" scope="header">
            <b-img :src="store.statImages[i]" :key="i" style="width:18px;height:18px"></b-img>
         </template>
      </b-table>
   </b-container>
</template>

<style lang="scss">
div#library table {
  font-size: 90%;
}
div#library table td {
  vertical-align: middle;
}
div#library table .stat {
  text-align: center;
  font-size: 90%;
  padding: 0;
  margin: 0;
}
</style>


<script lang='ts'>
import { Component } from 'vue-property-decorator';
import Behaviour from '../behaviour/Library';
@Component({ name: 'Library' })
export default class extends Behaviour { }
</script>

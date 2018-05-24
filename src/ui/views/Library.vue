<template>
   <b-container fluid>
      <b-table stacked='md' :items='entries' :fields='fields'>
         <template slot='species'></template>
         <template slot='name'></template>
         <template slot='tribe'></template>
         <!-- List of Stats -->
         <template slot='stats[0]' slot-scope="row">{{row.value.Lw}}</template>
         <!-- End of Stats -->
      </b-table>
   </b-container>
</template>

<style scoped>
</style>


<script lang='ts'>
import { Component } from 'vue-property-decorator';
import Behaviour from '../behaviour/Library';
@Component({ name: 'Library' })
export default class extends Behaviour { }
</script>

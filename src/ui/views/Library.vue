<template>
   <b-container fluid>
      <b-table :items="store.creaturesCache.content"></b-table>
   </b-container>
</template>

<style scoped>

</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../behaviour/Library';
@Component({ name: 'Library' })
export default class extends Behaviour { }
</script>

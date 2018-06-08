<template>
   <b-container fluid>
      <h2>Creature</h2>
      <b-alert v-if="cache && cache.error" variant="danger">{{cache.error}}</b-alert>
      <b-btn :to="$route.path+'/edit'" variant="link">edit</b-btn>
      <pre v-if="cache">{{stringifyData(cache.data)}}</pre>
   </b-container>
</template>


<style lang="scss" scoped>
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '../common';
import { LiveDocument, CreateLiveDocument } from '@/data/firestore/live';
import { Creature } from '@/data/firestore/objects';

@Component({ name: 'Creature' })
export default class extends Common {
   cache: LiveDocument<Creature> = null;

   mounted() {
      this.cache = CreateLiveDocument<Creature>(`/library/${this.$route.params.library_id}/creature/${this.$route.params.creature_id}`);
   }

   beforeDestroy() {
      this.cache.close();
   }
}
</script>

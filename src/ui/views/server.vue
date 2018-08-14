<template>
   <b-container fluid>
      <h2>Server</h2>
      <b-alert v-if="cache && cache.error" variant="danger">{{cache.error}}</b-alert>
      <pre v-if="cache">{{cache.data | inspect}}</pre>
   </b-container>
</template>


<style lang="scss" scoped>
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '../common';
import { LiveDocument, CreateLiveDocument } from '@/data/firestore/live';
import { Server } from '@/data/firestore/objects';

@Component({ name: 'Server' })
export default class extends Common {
   cache: LiveDocument<Server> = null;

   mounted() {
      this.cache = CreateLiveDocument<Server>(`/library/${this.$route.params.library_id}/server/${this.$route.params.server_id}`);
   }

   beforeDestroy() {
      this.cache.close();
   }
}
</script>

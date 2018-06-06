<template>
   <b-container fluid>
      <h2>Library</h2>
      <div v-if="cache">
         <pre>{{stringifyData(cache.data)}}</pre>
         <b-btn :to="`/library/${cache.ref.id}/servers`" variant="link">servers</b-btn>
         <b-btn :to="`/library/${cache.ref.id}/creatures`" variant="link">creatures</b-btn>
      </div>
   </b-container>
</template>


<style lang="scss" scoped>
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '../common';
import { LiveDocument, CreateLiveDocument } from '@/data/firestore/live';
import { Library } from '@/data/firestore/objects';

@Component({ name: 'Library' })
export default class extends Common {
   cache: LiveDocument<Library> = null;

   mounted() {
      this.cache = CreateLiveDocument<Library>('/library/' + this.$route.params.library_id);
   }

   beforeDestroy() {
      this.cache.close();
   }
}
</script>

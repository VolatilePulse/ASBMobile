<template>
   <b-container fluid>
      <div>
         <b-checkbox v-model="showError">Errors</b-checkbox>
         <b-checkbox v-model="showWarn">Warnings</b-checkbox>
         <b-checkbox v-model="showLog">Logs</b-checkbox>
      </div>
      <hr/>
      <div v-for="({type, message}, index) in store.console" :key="index">
         <pre v-if="type==='error' && showError" class="text-danger">{{message}}</pre>
         <pre v-if="type==='warn' && showWarn" class="text-warning">{{message}}</pre>
         <pre v-if="type==='log' && showLog" class="text-light">{{message}}</pre>
      </div>
   </b-container>
</template>


<style lang="scss" scoped>
pre {
   white-space: pre-wrap;
   word-wrap: break-word;
}
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '../../common';
@Component({ name: 'LayoutTest' })
export default class extends Common {
   showError = true;
   showWarn = true;
   showLog = true;
}
</script>

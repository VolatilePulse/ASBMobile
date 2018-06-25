<template>
   <b-container fluid>
      <h4>Test</h4>
      <pre>{{store.testing.tests[$route.params.test_id] || {} | inspect}}</pre>

      <h4>Results</h4>
      <pre>{{store.testing.results[$route.params.test_id] || {} | inspect}}</pre>
   </b-container>
</template>


<style lang="scss" scoped>
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '../../common';
@Component({ name: 'TestDetail' })
export default class extends Common { }
</script>

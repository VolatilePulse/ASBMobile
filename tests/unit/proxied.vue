<template>
   <div>
      <p id="output_a">{{data.a}}</p>
      <button id="change_a" @click="data.a += 1">Add</button>
      <p id="output_c">{{data.b.c}}</p>
      <button id="change_c" @click="data.b.c += 1">Add</button>
   </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class extends Vue {
   @Prop() data: any;
}
</script>

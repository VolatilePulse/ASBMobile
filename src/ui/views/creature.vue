<template>
   <b-container fluid v-if='cache'>
      <h2>Creature</h2>
      <b-alert v-if="cache && cache.error" variant="danger">{{cache.error}}</b-alert>
      <b-btn :to="$route.path+'/edit'" variant="link">edit</b-btn>
      <div>Name: {{cache.data.name}}</div>
      <div>Species: {{cache.data.speciesName}}</div>
      <div>Tribe: {{cache.data.tribe}}</div>
      <div>{{cache.data.TE}}</div>
      <div>{{cache.data.WL}}</div>
      <div>{{cache.data.level}}</div>
      <div>{{cache.data.isTamed}}</div>
      <div>{{cache.data.isFemale}}</div>
      <div>{{cache.data.inputSource}}</div>
      <div>{{cache.data.father}}</div>
      <div>{{cache.data.currentServer}}</div>
      <div>{{cache.data.colors}}</div>
      <canvas ref="creatureColors" width="150" height="150"></canvas>
      <div>{{cache.data.breedingValues}}</div>
      <div>{{cache.data.levelsDom}}</div>
      <div>{{cache.data.levelsWild}}</div>
      <div>{{cache.data.mother}}</div>
      <div>{{cache.data.mutations}}</div>
      <div>{{cache.data.mutationsMaternal}}</div>
      <div>{{cache.data.mutationsPaternal}}</div>
      <div>{{cache.data.originServer}}</div>
      <div>{{cache.data.owner}}</div>
      <div>{{cache.data.speciesBP}}</div>
      <div>{{cache.data.statValues}}</div>
      <div>{{cache.data.status}}</div>
      <div>{{cache.data.tags}}</div>
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
   colors: number[] = [];
   content: string = '';

   mounted() {
      this.cache = CreateLiveDocument<Creature>(`/library/${this.$route.params.library_id}/creature/${this.$route.params.creature_id}`);
      while (!this.$refs.creatureColors);
      this.createCanvas();
   }

   beforeDestroy() {
      this.cache.close();
   }
   createCanvas() {
      const c = this.$refs.creatureColors;
      const ctx = c.getContext('2d');
      console.log(c);
      console.log(ctx);
      ctx.beginPath();
      ctx.arc(100, 75, 50, 0, 1 / 3 * Math.PI);
      ctx.lineTo(100, 75);
      ctx.closePath();
      ctx.lineWidth = 20;
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = 'blue';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(100, 75, 50, 1 / 3 * Math.PI, 2 / 3 * Math.PI);
      ctx.lineTo(100, 75);
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(100, 75, 50, 2 / 3 * Math.PI, Math.PI);
      ctx.lineTo(100, 75);
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(100, 75, 50, Math.PI, 4 / 3 * Math.PI);
      ctx.lineTo(100, 75);
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(100, 75, 50, 4 / 3 * Math.PI, 5 / 3 * Math.PI);
      ctx.lineTo(100, 75);
      ctx.closePath();
      ctx.beginPath();
      ctx.arc(100, 75, 50, 5 / 3 * Math.PI, 2 * Math.PI);
      ctx.lineTo(100, 75);
      ctx.closePath();
      ctx.stroke();
   }
}
</script>

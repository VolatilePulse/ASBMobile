<template>
   <svg :width="size" :height="size">
      <path :id="index" :d="d" :transform="transform" :fill="colorCodes[regions[index]]" v-for="(transform, index) in transforms" :key="index">
      </path>
   </svg>
</template>

<style scoped>
</style>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import Common from '@/ui/common';

@Component({ name: 'Wheel' })
export default class Wheel extends Common {
   @Prop({ type: Number, default: 100 }) size: number;
   @Prop({ type: Array }) colors: number[];

   colorCodes = ['#808080', // Fallback Color
      '#ff0000', '#0000ff', '#00ff00', '#ffff00', '#00ffff', '#ff00ff', '#c0ffba', '#c8caca',
      '#786759', '#ffb46c', '#fffa8a', '#ff756c', '#7b7b7b', '#3b3b3b', '#593a2a', '#224900',
      '#812118', '#ffffff', '#ffa8a8', '#592b2b', '#ffb694', '#88532f', '#cacaa0', '#94946c',
      '#e0ffe0', '#799479', '#224122', '#d9e0ff', '#394263', '#e4d9ff', '#403459', '#ffe0ba',
      '#948575', '#594e41', '#595959', '#ffffff', '#b79683', '#eadad5', '#d0a794', '#c3b39f',
      '#887666', '#a0664b', '#cb7956', '#bc4f00', '#79846c', '#909c79', '#a5a48b', '#74939c',
      '#787496', '#b0a2c0', '#6281a7', '#485c75', '#5fa4ea', '#4568d4', '#ededed', '#515151'
   ];

   // If no color regions, give it 1 default region
   regions = (this.colors.length) ? this.colors.filter(num => num !== 0) : [0];

   r = (this.size - 10) / 2;
   degree = 360 / this.regions.length;
   coords = this.coordinatesFromDegree(this.degree, this.r);
   d = `M 0,0 l ${this.r},0 A ${this.r},${this.r},0,0,0,${this.coords.x},${-this.coords.y} L 0,0`;

   transforms = this.generateRegions(this.degree, this.r, this.regions);

   coordinatesFromDegree(degree: number, radius: number) {
      // TODO: check if degree is valid
      const angleInRadians = degree * (Math.PI / 180);
      const y = Math.round(Math.sin(angleInRadians) * radius);
      const x = Math.round(Math.cos(angleInRadians) * radius);
      return { x, y };
   }

   generateRegions(degree: number, r: number, regions: number[]) {
      const transforms: string[] = [];

      for (let i = 0; i < regions.length; i++)
         transforms.push(`rotate (${(i * degree) + degree / parseFloat('2')} ${r} ${r}) translate (${r}, ${r})`);

      return transforms;
   }
}
</script>

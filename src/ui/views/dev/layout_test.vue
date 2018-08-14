<template>
   <b-container fluid>
      <b-container fluid>
         <b-row>
            <b-col>
               <h2 class="text-center">Guardian (Giganotosaurus)</h2>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <h4 class="text-center">Untamed</h4>
            </b-col>
         </b-row>
         <b-row>
            <b-col>
               <h6 class="text-center">Alive</h6>
            </b-col>
         </b-row>
         <b-row>
            <b-col sm>
               <b-row class="align-content-center">
                  <wheel :size="200" :colors="[31,22,38,14,45,36]"></wheel>
               </b-row>
               <b-row class="color4">Tamed @ 150 w/ 99.85% TE</b-row>
            </b-col>
            <b-col sm>
               <b-row class="color5">Stats</b-row>
               <b-row>
                  <b-col cols="2"></b-col>
                  <b-col>Value</b-col>
                  <b-col cols="2">Wild</b-col>
                  <b-col cols="2">Dom</b-col>
               </b-row>
               <b-row v-for="i in range(8)" :key="i">
                  <b-col cols="2">
                     <b-img :src="store.statImages[i]" fluid-grow class="align-items-center" style="max-height:28px;min-height:22px"></b-img>
                  </b-col>
                  <b-col>Stat {{i}}</b-col>
                  <b-col cols="2" class="bg-primary">Lw{{i}}</b-col>
                  <b-col cols="2">Ld{{i}}</b-col>
               </b-row>
            </b-col>
         </b-row>
      </b-container>
   </b-container>
</template>


<style lang="scss" scoped>
div { font-size: 105% }
.color1  { background-color: #B71C1C; }
.color2  { background-color: #880E4F; }
.color3  { background-color: #4A148C; }
.color4  { background-color: #311B92; }
.color5  { background-color: #1A237E; }
.color6  { background-color: #0D47A1; }
.color7  { background-color: #01579B; }
.color8  { background-color: #006064; }
.color9  { background-color: #004D40; }
.color10 { background-color: #1B5E20; }
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '../../common';
import Wheel from '@/ui/components/wheel.vue';
@Component({ name: 'LayoutTest', components: { wheel: Wheel } })
export default class extends Common { }
</script>

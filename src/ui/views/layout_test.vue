<template>
   <b-container fluid>
      <b-container fluid>
         <b-row>
            <b-col class="color7">1/3</b-col>
            <b-col class="color8">1/3</b-col>
            <b-col class="color9">1/3</b-col>
         </b-row>
         <hr/>
         <b-row>
            <b-col sm="4" class="color1">full width @ xs<br/>4 cols @ sm+</b-col>
            <b-col class="color2">all remaining space</b-col>
         </b-row>
         <hr/>
         <b-row>
            <b-col sm="6" class="color3">full width @ xs<br/>6 cols @ sm+</b-col>
            <b-col class="color4">shares space equally</b-col>
            <b-col class="color5">shares space equally</b-col>
         </b-row>
         <hr/>
         <b-row>
            <!-- 12 cols at xs and equal spacing at sm and above -->
            <b-col sm class="color6">full width @ xs<br/>equal @ sm+</b-col>
            <b-col sm class="color7">full width @ xs<br/>equal @ sm+</b-col>
            <b-col class="color8">shares space equally</b-col>
            <b-col class="color9">shares space equally</b-col>
         </b-row>
      </b-container>
   </b-container>
</template>


<style lang="scss" scoped>
div { font-size: 105% }
.color1  { background-color: #B71C1C; min-height: 4.3rem }
.color2  { background-color: #880E4F; min-height: 4.3rem }
.color3  { background-color: #4A148C; min-height: 4.3rem }
.color4  { background-color: #311B92; min-height: 4.3rem }
.color5  { background-color: #1A237E; min-height: 4.3rem }
.color6  { background-color: #0D47A1; min-height: 4.3rem }
.color7  { background-color: #01579B; min-height: 4.3rem }
.color8  { background-color: #006064; min-height: 4.3rem }
.color9  { background-color: #004D40; min-height: 4.3rem }
.color10 { background-color: #1B5E20; min-height: 4.3rem }
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '../common';
@Component({ name: 'LayoutTest' })
export default class extends Common { }
</script>

<template>
   <b-container fluid>
      <div>
         <h1>Not Found!</h1>
         <div v-if="store.localSettings.devMode">
            <p>Path: {{$route.path}}</p>
            <p>Params: {{JSON.stringify($route.params)}}</p>
            <p>Query: {{JSON.stringify($route.query)}}</p>
         </div>
      </div>
      <div class="glitches">
         <b-img v-for="n in [1,2,3,4,5,6,7,8]" :key="n" :src="require('@/assets/face.svg')"></b-img>
      </div>
   </b-container>
</template>


<style lang="scss" scoped>
.glitches img  {
   animation: glitch .203s cubic-bezier(.25, .46, .45, .94) both infinite;
   position: fixed;
   bottom: 0;
   left: 0;
   right: 0;
   margin: 0 auto;
   max-width: 400px;
   max-height: 90%;
}
.glitches :nth-child(2n) {
   animation-delay: 50ms;
}
.glitches :nth-child(3n) {
   animation-duration: .359s;
}
.glitches :nth-child(3n+1) {
   animation-duration: .2433s;
   animation-direction: reverse;
}
.glitches :nth-child(3n+2) {
   animation-direction: reverse;
}

@keyframes glitch {
    0% {
        transform: translate(0);
    }
    20% {
        transform: translate(-5px, 5px);
    }
    40% {
        transform: translate(-5px, -5px);
    }
    60% {
        transform: translate(5px, 5px);
    }
    80% {
        transform: translate(5px, -5px);
    }
    to {
        transform: translate(0);
    }
}
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../common';
@Component({ name: 'NotFound' })
export default class extends Behaviour { }
</script>

<template>
   <b-container fluid>
      <header>
         <h3 class="text-center">Welcome!!!</h3>
      </header>
      <section class="pt-3">
         Someone should really write a short description of the app and some instructions here.
      </section>
   </b-container>
</template>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../behaviour/Common';
@Component({ name: 'Welcome' })
export default class extends Behaviour { }
</script>

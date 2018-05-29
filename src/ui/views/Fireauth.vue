<template>
   <b-container fluid>
      <header>
         <h3 class="text-center">Firebase Auth</h3>

         <section>
         </section>
      </header>
   </b-container>
</template>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../behaviour/Fireauth';
@Component({ name: 'Fireauth' })
export default class extends Behaviour { }
</script>

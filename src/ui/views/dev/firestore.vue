<template>
   <b-container fluid>
      <header>
         <h3 class="text-center">Firestore</h3>

         <section>
            <fs-collection :tree="pathTree"></fs-collection>
         </section>
      </header>
   </b-container>
</template>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from './firestore_code';
@Component({ name: 'Firestore' })
export default class extends Behaviour { }
</script>

<template>
   <b-container fluid>
      <header>
         <h3 class="text-center">Firestore</h3>

         <section>
            <fs-collection title="Users" path="users"></fs-collection>
         </section>

         <section>
            <fs-collection title="Me" path="users/alikKrDd4lSxoWglV77inzUHXgD2/libraries"></fs-collection>
         </section>
      </header>
   </b-container>
</template>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../behaviour/Firestore';
@Component({ name: 'Firestore' })
export default class extends Behaviour { }
</script>

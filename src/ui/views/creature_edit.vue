<template>
   <b-container fluid>
      <h2>Creature (edit)</h2>
      <b-alert v-if="cache && cache.error" variant="danger">{{cache.error}}</b-alert>
      <b-form v-if="cache && cache.data">
         <b-row>
            <b-col sm="3">
               <label for="input-name">Name:</label>
            </b-col>
            <b-col sm="9">
               <b-form-input id="input-name" v-model="cache.data.name" type="text" placeholder=""></b-form-input>
            </b-col>
         </b-row>
      </b-form>
   </b-container>
</template>


<style lang="scss" scoped>
</style>


<script lang="ts">
export { default as default } from './creature_edit_code';
</script>

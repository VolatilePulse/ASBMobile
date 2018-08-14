<template>
   <b-container fluid>
      <div v-if="store && store.localSettings">
         <b-form-group label="Enable developer options (not useful to most)">
            <b-form-checkbox v-model="store.localSettings.devMode">Dev mode</b-form-checkbox>
         </b-form-group>
      </div>
   </b-container>
</template>


<style lang="scss" scoped>
</style>


<script lang="ts">
export { default as default } from './settings_code';
</script>

<template>
   <b-container fluid>
      <!-- progress bar -->
      <transition name="fade">
         <b-progress v-if="showProgress" :value="progress" class="mt-5 fixed-top" striped variant="secondary" style="height: 0.4rem"></b-progress>
      </transition>

      <!-- control buttons -->
      <div class="d-flex align-items-center mb-4 mx-1">
         <b-button-toolbar>
            <b-button-group>
               <b-button variant="dark" v-b-tooltip.hover.focus title="Update test data from network" @click="fetchFromNetwork" :disabled="fetching">
                  <b-img :src="require('@/assets/reload.svg')" style="width:20px"></b-img>
               </b-button>
            </b-button-group>
         </b-button-toolbar>

         <div class="flex-spacer"></div>

         <b-button-toolbar>
            <b-button-group v-if="running" class="mr-2">
               <b-button v-show="running" variant="link" disabled>...running...</b-button>
            </b-button-group>
            <b-button-group v-else class="mr-2">
               <b-button v-if="passes" size="sm" variant="success" title="Click to re-run passes" :disabled="running" @click="runPasses" v-b-tooltip.hover.focus>
                  {{passes}} pass{{passes==1?'':'es'}}
               </b-button>
               <b-button v-if="partials" size="sm" variant="warning" title="Click to re-run partial fails" :disabled="running" @click="runPartials" v-b-tooltip.hover.focus>
                  {{partials}} partial
               </b-button>
               <b-button v-if="fails" size="sm" variant="danger" title="Click to re-run fails" :disabled="running" @click="runFails" v-b-tooltip.hover.focus>
                  {{fails}} fail{{fails==1?'':'s'}}
               </b-button>
            </b-button-group>
            <b-button @click="runAllTests" variant="dark" :disabled="running" title="Run all tests" v-b-tooltip.hover.focus>Run All</b-button>
         </b-button-toolbar>
      </div>

      <!-- tests list -->
      <div v-if="tests && Object.keys(tests).length > 0" class="d-flex flex-wrap">
         <test-summary v-for="([id,test]) in Object.entries(tests)" :key="id" :test="test" :id="id" class="test"></test-summary>
      </div>
      <div v-else class="text-center mt-5">
         <p>Nothing here. Hit refresh to fetch tests.</p>
      </div>
   </b-container>
</template>


<style lang="scss" scoped>
div.test {
   flex-grow: 1;
   align-self: stretch;
}

.progress {
   background-color: transparent;
}
</style>


<script lang="ts">
export { default as default } from './tester_code';
</script>

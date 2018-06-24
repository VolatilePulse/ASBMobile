<template>
   <b-card no-body class="m-1 p-0">
      <div class="d-flex flex-row flex-nowrap m-1">
         <!-- Run/Perf buttons -->
         <div class="d-flex flex-column mt-0 mr-1">
            <b-img @click.prevent="runTest" :src="require('@/assets/play.svg')" style="height:22px" title="Run this test" pointer="hand"></b-img>
            <div style="margin-top:0.4rem"></div>
            <b-img @click.prevent="runPerfTest" :src="require('@/assets/timer.svg')" style="height:16px" title="Evaluate this test's performane over 5 seconds"></b-img>
         </div>

         <!-- Info -->
         <div class="py-0 test-info">
            <div class="header">
               <span class="text-muted">L </span>
               <span class="level">{{test.creature.level}} </span>
               <span class="mode" :class="modeClass"></span>
               <span class="species"> {{test.creature.species}}</span>
               <span class="imprint" v-if="test.creature.imprintingBonus" v-b-tooltip.focus.hover title="Imprint"> {{test.creature.imprintingBonus | pct}}%</span>
            </div>
            <div class="server">
               <span class="text-muted">Server:</span>
               <span style="color:#EC7C32"> {{test.creature.originServer || test.creature.currentServer}}</span>
            </div>
            <div v-if="test.tag || test.description" class="description">
               <span class="text-muted">Note:</span> {{test.tag || test.description}}
            </div>
         </div>

         <div class="flex-spacer"></div>

         <!-- Status and link -->
         <div class="d-flex flex-column mx-2 mt-1">
            <b-badge pill>State</b-badge>
            <b-button :to="`/dev/test/${id}`" variant="link" class="m-0 p-1">Details</b-button>
         </div>
      </div>
   </b-card>
</template>


<style lang="scss" scoped>
span.bred {
  color: rgb(201, 94, 237);
}
span.tamed {
  color: aqua;
}
span.wild {
  color: rgb(16, 204, 72);
}

span.bred::before {
   content: 'bred';
}
span.tamed::before {
   content: 'tamed';
}

span.wild::before {
   content: 'wild';
}

.test-info {
   .header {
      margin-top: 0;
      font-size: 92%;
      font-weight: bold;

      .species { color:#DCA838 };
      .imprint { color:#EE536D }
   }

   .server {
      font-size: 95%;
   }
}
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '@/ui/common';
import theStore from '@/ui/store';
import { TestDefinition } from '@/testing';
import { testingSystem } from '@/systems/testing';

@Component({
   props: {
      test: { type: Object, required: true },
      id: { type: String, required: true },
   }
})
export default class TestSummary extends Common {
   test: TestDefinition;
   id: string;

   get modeClass() {
      if (this.test.creature.isBred) return 'bred';
      if (this.test.creature.isTamed) return 'tamed';
      return 'wild';
   }

   get result() { return theStore.testing.results[this.id]; }

   runTest() {
      testingSystem.runTestById(this.id);
   }

   runPerfTest() {
      testingSystem.runPerfTestById(this.id);
   }
}
</script>

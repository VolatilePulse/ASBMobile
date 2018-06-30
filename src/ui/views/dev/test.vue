<template>
   <b-container fluid v-if="test">
      <b-container fluid class="py-0 test-info px-0">
         <div class="header">
            <span class="text-muted">L</span>
            <span class="level"> {{test.creature.level}}</span>
            <span class="mode" :class="modeClass"> {{modeClass}} </span>
            <span class="species"> {{test.creature.species}}</span>
            <span class="imprint" v-if="test.creature.imprintingBonus" v-b-tooltip.focus.hover title="Imprint"> {{test.creature.imprintingBonus | pct}}%</span>
         </div>
         <b-row>
            <b-col sm="6" md="4" lg="3">
               <b-row>
                  <b-col cols="3" class="text-right text-muted">Server:</b-col>
                  <b-col style="color:#EC7C32">{{test.creature.originServer || test.creature.currentServer}}</b-col>
               </b-row>
            </b-col>
            <b-col sm="6" md="4" lg="3" xl="2">
               <b-row>
                  <b-col cols="3" class="text-right text-muted">Note:</b-col>
                  <b-col>{{test.tag || test.description || '-'}}</b-col>
               </b-row>
            </b-col>
            <b-col sm="6" md="4" lg="3" xl="2">
               <b-row>
                  <b-col cols="3" class="text-right text-muted">Source:</b-col>
                  <b-col>
                     <i>{{test.creature.inputSource || '-'}}</i>
                  </b-col>
               </b-row>
            </b-col>
            <b-col sm="6" md="4" lg="3" xl="2">
               <b-row>
                  <b-col cols="3" class="text-right text-muted">Criteria:</b-col>
                  <b-col>
                     <div v-for="(criteria,i) in test.criteria" :key="i">
                        <b-button v-b-toggle="'criteria'+i" variant="link" class="p-0 m-0">{{test.criteria[i].test}}</b-button>
                        <b-collapse :id="'criteria'+i" accordion="criteriaAccordion">
                           <pre>{{criteria | inspect}}</pre>
                        </b-collapse>
                     </div>
                  </b-col>
               </b-row>
            </b-col>
         </b-row>

         <hr/>

         <!-- Stats and options -->
         <b-row class="stat-table mx-1">
            <!-- Icons -->
            <b-col cols="auto" class="icons">
               <div>WL</div>
               <div>TE</div>
               <div v-for="statIndex in range(8)" :key="statIndex">
                  <b-img :src="store.statImages[statIndex]"></b-img>
               </div>
            </b-col>

            <!-- Stats -->
            <b-col cols="auto" class="stats mx-1">
               <div>&nbsp;</div>
               <div>&nbsp;</div>
               <div v-for="statIndex in range(8)" :key="statIndex">{{test.creature.values[statIndex] | testValue(statIndex)}}</div>
            </b-col>

            <!-- Options -->
            <b-col v-if="result && result.output.options && result.output.options.length" class="mr-auto option-cols m-0 p-0">
               <div v-for="optionIndex in Object.keys(result.output.options)" :key="optionIndex" class="mx-1">
                  <div>{{wildLevel(optionIndex)}}</div>
                  <te-value :value="result.output.optionTEs[optionIndex]" placeholder="-"></te-value>
                  <div v-for="statIndex in range(8)" :key="statIndex">
                     <stat-value :stat="result.output.options[optionIndex][statIndex]"></stat-value>
                  </div>
               </div>
            </b-col>
            <b-col v-else class="w-100"> </b-col>
         </b-row>
      </b-container>

      <hr/>

      <b-button v-b-toggle.fulltest variant="link">Full Defintion</b-button>
      <b-collapse id="fulltest">
         <pre>{{test || {nothing:'here'} | inspect}}</pre>
      </b-collapse>

      <br/>

      <b-button v-b-toggle.fulldata variant="link">Full Result</b-button>
      <b-collapse id="fulldata">
         <pre>{{result || {nothing:'here'} | inspect}}</pre>
      </b-collapse>
   </b-container>
</template>


<style lang="scss" scoped>
.test-info {
   .header {
      font-size: 145%;
      font-weight: 600;

      .species { color:#DCA838 };
      .imprint { color:#EE536D }
   }

   .server {
      font-size: 95%;
   }

   span.bred {
      color: rgb(201, 94, 237);
   }
   span.tamed {
      color: aqua;
   }
   span.wild {
      color: rgb(16, 204, 72);
   }
}

.stat-table {
   font-size: 94%;

   div {
      display: flex;
   }

   .icons {
      align-items: center;
      flex-direction: column;
      justify-content: space-around;

      & > div {
         flex: 0 0 28px;
         margin-bottom: 1px;

         img {
            width: 28px;
         }
      }
   }

   .stats {
      align-items: center;
      flex-direction: column;
      justify-content: space-around;

      & > div {
         flex: 0 0 28px;
         margin-top: 1px;
      }
   }

   .option-cols {
      overflow-x: scroll;
      white-space: nowrap;
      flex-direction: row;
      justify-content: flex-start;

      & > div {
         align-items: center;
         flex-direction: column;
         justify-content: space-around;

         & > div {
            flex: 0 0 28px;
            margin-top: 1px;
         }
      }
   }
}
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Common from '../../common';
import { TestDefinition, TestResult } from '@/testing';
import { testingSystem } from '@/systems/testing';
import { DAMAGE, SPEED, PRE_TE } from '@/consts';
import { intervalAverage } from '@/number_utils';
import { formatDisplayValue } from '@/ark';
import TEValue from '@/ui/components/te_value.vue';
import StatValue from '@/ui/components/stat_value.vue';

@Component({
   name: 'TestDetail',
   filters: {
      testValue: (value: number, statIndex: number) => value + (statIndex === DAMAGE || statIndex === SPEED ? '%' : ''),
   },
   components: {
      'te-value': TEValue,
      'stat-value': StatValue,
   },
})
export default class extends Common {
   test: TestDefinition = null;
   result: TestResult = null;

   criteriaAccordion: 0;

   async created() {
      await testingSystem.fetchFromCache();
      this.test = this.store.testing.tests[this.$route.params.test_id];
      this.result = this.store.testing.results[this.$route.params.test_id];
   }

   get modeClass() {
      if (this.test.creature.isBred) return 'bred';
      if (this.test.creature.isTamed) return 'tamed';
      return 'wild';
   }

   wildLevel(optionIndex: number) { return this.result.output.optionWLs[optionIndex]; }
   teRange(optionIndex: number) {
      const TE = this.result.output.optionTEs[optionIndex];
      if (!TE) return 'No TE-based stats';
      return `${formatDisplayValue(TE.lo, PRE_TE)}% >= TE >= ${formatDisplayValue(TE.hi, PRE_TE)}%`;
   }
   teAvg(optionIndex: number) { return formatDisplayValue(intervalAverage(this.result.output.optionTEs[optionIndex]), PRE_TE) + '%'; }
}
</script>

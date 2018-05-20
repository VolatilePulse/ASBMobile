<template>
   <b-container fluid>
      <!-- control buttons -->
      <div class="clearfix">
         <b-button-toolbar class="float-right mb-3">
            <b-button-group v-if="running" class="mr-2">
               <b-button v-show="running" variant="link" disabled>...running...</b-button>
            </b-button-group>
            <b-button-group v-else class="mr-2">
               <b-button v-if="passes" size="sm" variant="success" title="Click to re-run passes" :disabled="running" @click="runPasses">
                  {{passes}} pass{{passes==1?'':'es'}}
               </b-button>
               <b-button v-if="partials" size="sm" variant="warning" title="Click to re-run partials" :disabled="running" @click="runPartials">
                  {{partials}} with options
               </b-button>
               <b-button v-if="fails" size="sm" variant="danger" title="Click to re-run fails" :disabled="running" @click="runFails">
                  {{fails}} fail{{fails==1?'':'s'}}
               </b-button>
            </b-button-group>
            <b-button @click="runAllTests" variant="dark" :disabled="running">Run All</b-button>
         </b-button-toolbar>
      </div>

      <!-- tests list -->
      <div class="">
         <b-list-group class="m-0 p-0" dark>
            <b-list-group-item v-for="(data,testIndex) in testData" class="p-0" :class="{'bg-dark':!results[testIndex],'bg-temp':data.temporary}" :key="testIndex">
               <div class="px-0 p-0 m-0">
                  <b-row class="p-1">
                     <b-col class="col">
                        <!-- header / info -->
                        <div class="float-left text-center">
                           <b-img @click.prevent="runTest(testIndex)" :src="require('@/assets/play.svg')" style="height:22px" title="Run this test" pointer="hand"></b-img>
                           <br/>
                           <b-img @click.prevent="runPerfTest(testIndex)" :src="require('@/assets/timer.svg')" style="height:16px" title="Evaluate this test's performane over 5 seconds"></b-img>
                        </div>
                        <div @click.prevent="openResults(testIndex)">
                           <h6 class="mb-0 mt-1" style="font-size:95%">
                              Lvl {{data.level}}
                              <span :class="data.mode.toLowerCase()"> {{data.mode.toLowerCase()}}</span>
                              <span style="color:#DCA838"> {{data.species}}</span>
                              <span v-if="data.imprint" style="color:#EE536D" v-b-tooltip.focus.hover title="Imprint"> {{data.imprint}}%</span>
                           </h6>
                           <p class="test-info">
                              <span class="text-muted">Server:</span>
                              <span style="color:#EC7C32"> {{testServers[testIndex] ? testServers[testIndex].name : data.serverId}}</span>
                              <span v-if="testServers[testIndex] && testServers[testIndex].singlePlayer" style="color:#86EC62"> [Single Player]</span><br/>
                              <span v-if="data.tag">
                                 <span class="text-muted">Note:</span> {{data.tag}}<br/>
                              </span>
                           </p>
                        </div>
                     </b-col>

                     <!-- status badge -->
                     <div class="float-right mr-3 pr-0">
                        <span v-if="results[testIndex]" class="badge badge-pill" :class="badgeClasses(testIndex)">
                           <span v-if="results[testIndex]['duration']">{{formatNumber(results[testIndex]['duration'], 1)}}
                              <span style="font-size:85%">ms</span>
                           </span>
                           <template v-else-if="isPass(testIndex)">PASS</template>
                           <template v-else-if="isPartial(testIndex)">PART</template>
                           <template v-else-if="isFail(testIndex)">FAIL</template>
                        </span>
                     </div>
                  </b-row>
               </div>

               <!-- result details -->
               <b-tabs v-if="testIndex in results && openTestIndex==testIndex">

                  <!-- options -->
                  <b-tab v-if="results[testIndex]['options']" :title="'Options'+(results[testIndex] && results[testIndex]['options'] && ' ('+results[testIndex].options.length+')')" style="overflow-x:auto">
                     <div class="options-grid">
                        <div class="col">
                           <div>WL</div>
                           <div>TE</div>
                           <b-img v-for="(statImage,i) in store.statImages" :key="i" :src="statImage"></b-img>
                        </div>
                        <div class="col" v-for="(options,optionIndex) in results[testIndex].options" :key="optionIndex">
                           <div>{{optionWildLevel(testIndex,optionIndex)||'-'}}</div>
                           <div>{{optionTE(testIndex,optionIndex)||'-'}}</div>
                           <div v-for="(stat,statIndex) in options" :key="optionIndex+','+statIndex">
                              <!-- {{formattedStat(stat, true)}} -->
                              {{results[testIndex].options[optionIndex][statIndex].Lw}}<br/>{{results[testIndex].options[optionIndex][statIndex].Ld}}
                           </div>
                        </div>
                     </div>
                  </b-tab>
                  <!-- results / expected -->
                  <b-tab v-if="results[testIndex] && results[testIndex]['stats']" title="Results">
                     <b-container fluid class="py-1">
                        <b-row class="">
                           <h6 class="col-6">Results</h6>
                           <h6 class="col-6 mb-0">Expected
                              <b-button variant="success" class="p-0 px-2 m-0 float-right" style="margin-top:-0.15rem!important" v-b-tooltip title="Print to console" @click="displayResults(results[testIndex].stats)">P</b-button>
                           </h6>
                        </b-row>
                        <b-row class="">
                           <pre class="col-6 py-0 my-0 small" @scroll.passive="scrollSync" style="border-right: 1px solid #8ac8; border-top: 1px solid #8ac8">{{formattedStats(results[testIndex].stats)}}</pre>
                           <pre class="col-6 py-0 my-0 small" @scroll.passive="scrollSync" style="border-top: 1px solid #8ac8">{{formattedStats(testData[testIndex].results)}}</pre>
                        </b-row>
                     </b-container>
                  </b-tab>
                  <!-- debug values -->
                  <b-tab title="Debug">
                     <b-container fluid class="py-1">
                        <b-row v-if="results[testIndex].extra['IB'] != undefined">
                           <div class="col-4 m-0 py-0 small">IB</div>
                           <pre class="col-8 m-0 py-0">{{JSON.stringify(results[testIndex].extra.IB)}} %</pre>
                        </b-row>

                        <hr v-if="Object.keys(results[testIndex].extra).length" class="my-0" />

                        <b-row v-for="key in dbgKeys(testIndex)" class="py-0 my-0" :key="key">
                           <div class="col-4 m-0 py-0 small">{{key}}</div>
                           <pre class="col-8 m-0 py-0">{{JSON.stringify(results[testIndex].dbg[key])}}</pre>
                        </b-row>
                     </b-container>
                  </b-tab>
                  <!-- pre-filtered stats -->
                  <b-tab v-if="results[testIndex]['dbg'] && results[testIndex].dbg['preFilterStats']" title="Pre-Filter">
                     <pre class="p-1 mb-0 small">{{formattedStats(results[testIndex].dbg['preFilterStats'])}}</pre>
                  </b-tab>

               </b-tabs>
            </b-list-group-item>
         </b-list-group>
      </div>

      <TestImporter></TestImporter>
   </b-container>
</template>


<style lang="scss" scoped>
.resultpill {
  font-size: 75%;
  width: 3rem;
}
.timepill {
  font-size: 65%;
  width: 3rem;
}

.wild {
  color: rgb(16, 204, 72);
}
.tamed {
  color: aqua;
}
.bred {
  color: rgb(201, 94, 237);
}

.bg-grey {
  background-color: #ddd;
}

.bg-temp {
  background-color: rgb(68, 58, 58) !important;
}

.test-info {
  font-size: 80%;
  margin-top: 0.2rem;
  margin-bottom: 0;
  line-height: 160%;
}

.options-grid {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: start;
  overflow-x: auto;
  overflow-y: hidden;
}

.options-grid img {
  padding-top: 0.4rem;
  padding-bottom: 0.4rem;
}

.options-grid .col {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 0.6rem;
  padding-right: 0.6rem;
  flex-wrap: nowrap;
  text-align: center;
}

.options-grid .col:first-child {
  font-weight: bold;
}

.options-grid .col * {
  flex-basis: 4rem;
  max-height: 2.5rem;
  display: flex;
  align-items: center;
  line-height: 1rem;
}

.options-grid .col *:nth-child(1) {
  flex-basis: 1.2rem;
}

.options-grid .col *:nth-child(2) {
  flex-basis: 3em;
  font-size: 90%;
  text-align: center;
  border-bottom: 1px solid rgb(29, 25, 26);
}
</style>


<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../behaviour/Tester';
import TestImporter from '../components/TestImporter.vue';
@Component({
   name: 'Tester',
   components: { TestImporter: TestImporter },
})
export default class extends Behaviour { }
</script>

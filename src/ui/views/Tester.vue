<template>
   <b-container fluid>
      <!-- control buttons -->
      <div class="clearfix">
         <b-button-toolbar class="float-right mb-3">
            <b-button-group class="mr-2">
               <b-button v-show="running" variant="link" disabled>...running...</b-button>
            </b-button-group>
            <b-button-group class="mr-2">
               <b-button v-if="passes" variant="success" title="Click to re-run passes" :disabled="running" @click="runPasses">
                  {{passes}} pass{{passes==1?'':'es'}}
               </b-button>
               <b-button v-if="fails" variant="danger" title="Click to re-run fails" :disabled="running" @click="runFails">
                  {{fails}} fail{{fails==1?'':'s'}}
               </b-button>
            </b-button-group>
            <b-button @click="runAllTests" variant="dark" :disabled="running">Run All</b-button>
         </b-button-toolbar>
      </div>

      <!-- tests list -->
      <div class="">
         <b-list-group class="m-0 p-0" dark>
            <b-list-group-item v-for="(data,index) in testData" class="p-0" :class="{'bg-dark':!results[index]}" :key="data.tag">
               <div class="px-0 p-0 m-0">
                  <b-row class="p-1">
                     <b-col class="col">
                        <!-- header / info -->
                        <div class="float-left text-center">
                           <b-img @click.prevent="runTest(index)" :src="require('@/assets/play.svg')" style="height:22px" title="Run this test" pointer="hand"></b-img>
                           <br/>
                           <b-img @click.prevent="runPerfTest(index)" :src="require('@/assets/timer.svg')" style="height:16px" title="Evaluate this test's performane over 5 seconds"></b-img>
                        </div>
                        <div @click.prevent="openResults(index)">
                           <h6 class="mb-0">
                              {{data.tag}}</h6>
                           <small>
                              Level {{data.level}} {{data.species}} from
                              <em>{{data.serverName}}</em>
                           </small>
                        </div>
                     </b-col>

                     <div class="float-right mr-3 pr-0">
                        <!-- pass/fail -->
                        <span v-if="isPass(index)" class="badge badge-success testpill">PASS</span>
                        <span v-if="isFail(index)" class="badge badge-danger testpill">FAIL</span>

                        <br/>

                        <!-- timing -->
                        <span v-if="results[index] && results[index]['duration'] != undefined" class="badge badge-info badge-pill testpill">
                           {{formatNumber(results[index]['duration'], 1)}}ms
                        </span>
                     </div>
                  </b-row>
               </div>

               <!-- result details -->
               <b-tabs v-if="index in results && openTestIndex==index">

                  <!-- options -->
                  <b-tab v-if="results[index]['options']" :title="'Options'+(results[index] && results[index]['options'] && ' ('+results[index].options.length+')')">
                     <div class="d-flex flex-row options-flex">
                        <div class="flex-column font-weight-bold px-2 text-right">
                           <div>Wild&nbsp;lvl</div>
                           <div>Tame&nbsp;Eff</div>
                           <div class="option-break"></div>
                           <div v-for="statName in statNames" :key="statName">{{statName}}</div>
                        </div>
                        <div v-for="(options,optionIndex) in results[index].options" :key="optionIndex" class="flex-column text-center px-2">
                           <div>{{optionWildLevel(index,optionIndex)||'-'}}</div>
                           <div>{{optionTE(index,optionIndex)||'-'}}</div>
                           <div class="option-break"></div>
                           <div v-for="(stat,statIndex) in options" :key="optionIndex+','+statIndex">{{formattedStat(stat, true)}}</div>
                        </div>
                     </div>
                  </b-tab>
                  <!-- results / expected -->
                  <b-tab v-if="results[index]['stats']" title="Results">
                     <b-container fluid class="py-1">
                        <b-row class="">
                           <h6 class="col-6">Results</h6>
                           <h6 class="col-6 mb-0">Expected
                              <b-button variant="success" class="p-0 px-2 m-0 float-right" style="margin-top:-0.15rem!important" v-b-tooltip title="Print to console" @click="displayResults(results[index].stats)">P</b-button>
                           </h6>
                        </b-row>
                        <b-row class="">
                           <pre class="col-6 py-0 my-0 small" @scroll.passive="scrollSync" style="border-right: 1px solid #8ac8; border-top: 1px solid #8ac8">{{formattedStats(results[index].stats)}}</pre>
                           <pre class="col-6 py-0 my-0 small" @scroll.passive="scrollSync" style="border-top: 1px solid #8ac8">{{formattedStats(testData[index].results)}}</pre>
                        </b-row>
                     </b-container>
                  </b-tab>
                  <!-- debug values -->
                  <b-tab title="Debug">
                     <b-container fluid class="py-1">
                        <b-row v-if="results[index].extra['IB'] != undefined">
                           <div class="col-4 m-0 py-0 small">IB</div>
                           <pre class="col-8 m-0 py-0">{{JSON.stringify(results[index].extra.IB)}} %</pre>
                        </b-row>

                        <hr v-if="Object.keys(results[index].extra).length" class="my-0" />

                        <b-row v-for="key in dbgKeys(index)" class="py-0 my-0" :key="key">
                           <div class="col-4 m-0 py-0 small">{{key}}</div>
                           <pre class="col-8 m-0 py-0">{{JSON.stringify(results[index].dbg[key])}}</pre>
                        </b-row>
                     </b-container>
                  </b-tab>
                  <!-- pre-filtered stats -->
                  <b-tab v-if="results[index]['dbg'] && results[index].dbg['preFilterStats']" title="Pre-Filter">
                     <pre class="p-1 mb-0 small">{{formattedStats(results[index].dbg['preFilterStats'])}}</pre>
                  </b-tab>

               </b-tabs>
            </b-list-group-item>
         </b-list-group>
      </div>
   </b-container>
</template>

<style lang="scss">
.testpill {
  width: 5.5em;
}

.bg-grey {
  background-color: #ddd;
}

.options-flex {
  overflow-x: scroll;
}

.option-break {
  height: 2px;
  background-color: #555;
}
</style>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from '../behaviour/Tester';
@Component
export default class extends Behaviour { }
</script>

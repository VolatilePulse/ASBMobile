<template>
   <b-container fluid>
      <b-form-group label="Species:">
         <b-form-select v-model="store.tempCreature.species" :options="store.speciesNames"></b-form-select>
      </b-form-group>
      <b-form-group label="Level:">
         <b-form-input type="number" v-model.number="store.tempCreature.level"></b-form-input>
      </b-form-group>
      <b-form inline>
         <b-form-radio-group v-model="mode">
            <b-form-radio value="Wild">Wild</b-form-radio>
            <b-form-radio value="Tamed" checked>Tamed</b-form-radio>
            <b-form-radio value="Bred">Bred</b-form-radio>
         </b-form-radio-group>
      </b-form>
      <b-form-group v-show="mode=='Wild'" label="Auto-Extract Levels:">
         <b-form-checkbox v-model="autoExtract"></b-form-checkbox>
      </b-form-group>
      <b-form-group v-show="mode=='Tamed'" label="Taming Effectiveness:">
         <b-form-input type="number" v-model.number="store.tempCreature.TE"></b-form-input>
      </b-form-group>
      <b-form-group v-show="mode=='Bred'" label="Imprint:">
         <b-form-input type="number" v-model.number="imprint"></b-form-input>
      </b-form-group>

      <b-form-group label="Stats">
         <b-row v-for="i in range(8)" class="mb-1 align-items-center" :key="i">
            <div class="col-1 m-0 p-1 h-100">
               <b-img :src="store.statImages[i]" fluid-grow class="align-items-center" style="max-height:28px;min-height:22px"></b-img>
            </div>
            <b-form-input type="number" v-model.number="values[i]" :placeholder="statNames[i]" class="col-3"></b-form-input>
            <div v-if="success" class="col-2">
               <span v-if="extractor">
                  <span>({{extractor.options[selectedOption][i].Lw}},</span>
                  <span> {{extractor.options[selectedOption][i].Ld}})</span>
                  <span> = {{formatFloat(debugStatValue(i))}}</span>
               </span>
            </div>
         </b-row>
         <b-button @click="extract">Extract</b-button>
         <b-button v-b-modal.optionPicker v-if="success && options.length > 1">Options</b-button>
         <b-button :disabled="!options || !options.length" @click="addCreature">Save</b-button>
      </b-form-group>

      <b-form-group v-if="store.devMode" label="Test Data:">
         <b-button v-for="data in testData" variant="link" @click.prevent="insertTestData(data)" :key="data._id">{{data.tag}}</b-button>
      </b-form-group>

      <!-- Option Picker Modal -->
      <b-modal id="optionPicker" title="Stat Option Picker" size="lg" centered>
         <b-form-select v-model="selectedOption" class="mb-3" :select-size="options.length">
            <option v-for="(option, index) in options" v-bind:key="index" :value=index>{{option}}</option>
         </b-form-select>
      </b-modal>

   </b-container>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import Behaviour from './extractor_code';
@Component({ name: 'Extractor' })
export default class extends Behaviour { }
</script>

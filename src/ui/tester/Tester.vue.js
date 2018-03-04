"use strict";

import withRender from './Tester.html?style=./Tester.css';

import Vue from 'vue';

import * as app from "../../app";
import * as Ark from '../../ark';
import * as Utils from '../../utils';
import { Extractor } from '../../ark/extractor';
import { VueCreature } from '../../ark/creature';

import testData from '../../test_data';


export default withRender({
   name: "Tester",

   data: () => ({
      openTestIndex: null,
      testData: testData,
      results: [],
   }),

   computed: {
      speciesNames: () => app.data.speciesNames,
      statImages: () => app.data.statImages,
   },

   methods: {
      runTest(data) { RunTest(this, data); },
      async runAllTests() { await RunAllTests(this); },
      openResults: function (index) { this.openTestIndex = (this.openTestIndex != index) ? index : null; },
      isPass: function (index) { return this.results[index] && this.results[index].pass; },
      isFail: function (index) { return this.results[index] && !this.results[index].pass; },
   },
});


function RunTest(ui, index) {
   let results = PerformTest(testData[index]);
   Vue.set(ui.results, index, results);
   ui.openTestIndex = index;
}

async function RunAllTests(ui) {
   let failFound = false;
   for (let index = 0; index < testData.length; index++) {
      let results = PerformTest(testData[index]);
      Vue.set(ui.results, index, results);

      if (!failFound && results.pass == false) {
         ui.openTestIndex = index;
         failFound = true;
      }

      await Utils.Delay(100); // unblock the browser for a moment
   }
}

function PerformTest(data) {
   // TODO: This is only temporary until integrated into the Server UI
   app.data.currentServerName = data.serverName;

   // Set the vueCreature properties to prepare for extraction
   app.data.vueCreature = new VueCreature;
   app.data.vueCreature.wild = (data.mode == "Wild");
   app.data.vueCreature.tamed = (data.mode == "Tamed");
   app.data.vueCreature.bred = (data.mode == "Bred");
   app.data.vueCreature.IB = data.imprint / 100;
   app.data.vueCreature.exactly = !!data.exactly;
   app.data.vueCreature.values = data.values.map(Ark.ConvertValue);
   app.data.vueCreature.serverName = data.serverName;
   app.data.vueCreature.level = data.level;
   app.data.vueCreature.species = data.species;

   let extractObject = new Extractor(app.data.vueCreature);
   extractObject.extract();

   let pass = JSON.stringify(data['results']) == JSON.stringify(app.data.vueCreature.stats);

   return { pass: pass, results: app.data.vueCreature.stats };
}

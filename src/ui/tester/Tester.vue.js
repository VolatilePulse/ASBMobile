"use strict";

import 'w3-css/w3.css';
import withRender from './Tester.html?style=./Tester.css';

import Vue from 'vue';

import * as app from "../../app";
import * as Ark from '../../ark';
import * as Utils from '../../utils';
import { Server } from '../../ark/multipliers';
import { Extractor } from '../../ark/extractor';

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
   var isWild = (data.mode == "Wild");
   var isTamed = (data.mode == "Tamed");
   var isBred = (data.mode == "Bred");
   var imprintBonus = data.imprint / 100;
   var exactly = !!data.exactly;
   var singlePlayer = !!data.singlePlayer;

   // Prepare the input values for use with the extractor
   let values = data.stats.map(Ark.ConvertValue);

   // TODO: This is only temporary until integrated into the Server UI
   app.data.currentServer = new Server([null, null, null, null, null, null, null, null], 1, singlePlayer);

   let multipliers = Ark.GetMultipliers(app.data.currentServer, data.species);

   let extractObject = new Extractor(multipliers, values, data.level, isWild, isTamed, isBred, imprintBonus, exactly);
   extractObject.extract();

   let pass = JSON.stringify(data['results']) == JSON.stringify(extractObject.results);

   return { pass: pass, results: extractObject.results };
}

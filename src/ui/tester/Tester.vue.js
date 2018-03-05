"use strict";

import withRender from './Tester.html?style=./Tester.css';

import Vue from 'vue';

import * as app from "../../app";
import * as Utils from '../../utils';
import { PerformTest } from '../../testing';
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

// @ts-ignore
import withRender from './Tester.html?style=./Tester.css';

import Vue from 'vue';

import * as app from "../../app";
import * as Utils from '../../utils';
import { PerformTest } from '../../testing';
import testData from '../../test_data';
import { FormatAllOptions } from '../../ark';


export default withRender({
   name: "Tester",

   data: () => ({
      openTestIndex: 0,
      testData: testData,
      results: [],
   }),

   computed: {
      speciesNames: () => app.data.speciesNames,
      statImages: () => app.data.statImages,
   },

   methods: {
      openResults(index) { this.openTestIndex = (this.openTestIndex != index) ? index : null; },
      isPass(index) { return this.results[index] && this.results[index].pass; },
      isFail(index) { return this.results[index] && !this.results[index].pass; },
      formatNumber(n, places = 0) { return Utils.FormatNumber(n, places); },
      formattedStats(stats) { return FormatAllOptions(stats); },

      runTest(index) {
         let results = PerformTest(testData[index]);
         Vue.set(this.results, index, results);
         this.openTestIndex = null;
      },

      async runAllTests() {
         let failFound = false;
         for (let index = 0; index < testData.length; index++) {
            Vue.set(this.results, index, undefined);
         }

         await Utils.Delay(100); // unblock the browser for a moment

         for (let index = 0; index < testData.length; index++) {
            let results = PerformTest(testData[index]);
            Vue.set(this.results, index, results);

            if (!failFound && results.pass == false) {
               this.openTestIndex = index;
               failFound = true;
            }

            await Utils.Delay(100); // unblock the browser for a moment
         }
      },
   },
});

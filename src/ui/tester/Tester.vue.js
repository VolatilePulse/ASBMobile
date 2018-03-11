// @ts-ignore
import withRender from './Tester.html?style=./Tester.css';

import Vue from 'vue';

import * as app from "../../app";
import * as Utils from '../../utils';
import { PerformTest } from '../../testing';
import testData from '../../test_data';
import { FormatAllOptions, FormatOptions } from '../../ark';


export default withRender({
   name: "Tester",

   data: () => ({
      openTestIndex: 0,
      testData: testData,
      results: [],
      passes: 0,
      fails: 0,
      running: false,
      accordionIndex: null,

      statIndices: Utils.Range(8),
   }),

   computed: {
      speciesNames: () => app.data.speciesNames,
      statImages: () => app.data.statImages,
   },

   methods: {
      openResults(index) { this.openTestIndex = (this.openTestIndex != index) ? index : null; },
      isPass(index) { return this.results[index] && this.results[index]['pass']; },
      isFail(index) { return this.results[index] && !this.results[index]['pass']; },
      formatNumber(n, places = 0) { return Utils.FormatNumber(n, places); },
      formattedOptions(options) { return options ? FormatOptions(options) : '-'; },
      formattedStats(stats) { return FormatAllOptions(stats); },
      dbgKeys(index) { return Object.keys(this.results[index].dbg).filter(key => key != "preFilterStats"); },

      /**
       * Run a selection of tests
       * @param {number[]} indices
       */
      async runTestSelection(indices) {
         this.running = true;
         this.openTestIndex = null;

         // Clear existing results for these cases
         indices.forEach(index => Vue.set(this.results, index, undefined));

         // Unblock the browser for a moment
         await Utils.Delay(100);
         let nextYield = Date.now() + 200; // schedule next unblock

         let failFound = false;
         for (let index of indices) {
            // Unblock the browser once every 200ms
            if (Date.now() > nextYield) {
               nextYield = Date.now() + 200;
               await Utils.Delay(100);
            }

            let result = PerformTest(testData[index]);
            if (index == 2) result.pass = false; // FIXME: Remove!
            Vue.set(this.results, index, result);

            // Open the first failed case only
            if (!failFound && !result['pass']) {
               this.openTestIndex = index;
               failFound = true;
            }
         }

         this.running = false;
         this.updateStatus();
      },

      /** Run just one test */
      async runTest(index) {
         await this.runTestSelection([index]);
         if (this.results[index] == undefined || !this.results[index]['pass'])
            this.openTestIndex = index;
         else
            this.openTestIndex = null;
      },

      /** Run all of the tests */
      async runAllTests() {
         await this.runTestSelection(Utils.Range(testData.length));
      },

      /** Re-run the passes */
      async runPasses() {
         await this.runTestSelection(Utils.Range(testData.length).filter(i => this.results[i] && this.results[i].pass));
      },

      /** Re-run the failures */
      async runFails() {
         await this.runTestSelection(Utils.Range(testData.length).filter(i => this.results[i] && !this.results[i].pass));
      },

      /** Count the number of passes and fails, excluding those that haven't run */
      updateStatus() {
         this.passes = this.results.reduce((total, result) => total + (result && result.pass == true && 1), 0);
         this.fails = this.results.reduce((total, result) => total + (result && result.pass == false && 1), 0);
      }
   },
});

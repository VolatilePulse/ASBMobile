import Vue from 'vue';
import Component from 'vue-class-component';

import WithRender from './Tester.html?style=./Tester.css';

import * as Utils from '@/utils';
import { FormatAllOptions, FormatOptions, FormatOption } from '@/ark';
import { PerformTest, PerformPerfTest } from '@/testing';

import testData from '@/ark/test_data';
import { statNames } from '@/consts';
import theStore from '@/ui/store';


const ASYNC_RUN_TIME_MS = 200;
const ASYNC_DELAY_TIME_MS = 100;


@WithRender
@Component({
   name: 'tester',
})
export default class TesterComponent extends Vue {
   store = theStore;

   openTestIndex = 0;
   testData = testData;
   results = [];
   passes = 0;
   fails = 0;
   running = false;
   accordionIndex = null;

   statIndices = Utils.Range(8);
   statNames = statNames;

   optionsTableFields = statNames.map((name, i) => ({ key: i, label: name, formatter: FormatOption }));


   openResults(index) { this.openTestIndex = (this.openTestIndex !== index) ? index : null; }
   isPass(index) { return this.results[index] && this.results[index]['pass']; }
   isFail(index) { return this.results[index] && !this.results[index]['pass']; }
   formatNumber(n, places = 0) { return Utils.FormatNumber(n, places); }
   formattedOptions(options) { return options ? FormatOptions(options) : '-'; }
   formattedStats(stats) { return FormatAllOptions(stats); }
   formattedStat(stat) { return FormatOption(stat); }
   dbgKeys(index) { return this.results[index]['dbg'] ? Object.keys(this.results[index].dbg).filter(key => key !== 'preFilterStats') : []; }
   scrollSync(event) { (event.target.nextElementSibling || event.target.previousElementSibling).scrollLeft = event.target.scrollLeft; }
   optionsForStat(testIndex, statIndex) { return this.results[testIndex].options.map(options => options[statIndex]); }

   /**
    * Run a selection of tests without blocking the browser
    * @param {number[]} indices
    */
   async runTestSelection(indices) {
      this.running = true;
      this.openTestIndex = null;

      // Clear existing results for these cases
      indices.forEach(index => Vue.set(this.results, index, undefined));

      // Unblock the browser for a moment
      await Utils.Delay(100);
      let nextYield = Date.now() + ASYNC_RUN_TIME_MS; // schedule next unblock

      let failFound = false;
      for (const index of indices) {
         // Unblock the browser once every 200ms
         if (Date.now() > nextYield) {
            nextYield = Date.now() + ASYNC_RUN_TIME_MS;
            await Utils.Delay(ASYNC_DELAY_TIME_MS);
         }

         const result = PerformTest(testData[index]);
         Vue.set(this.results, index, result);

         // Open the first failed case only
         if (!failFound && !result['pass']) {
            this.openTestIndex = index;
            failFound = true;
         }
      }

      this.running = false;
      this.updateStatus();
   }

   /** Run one test repeatedly to measure it's performance, blocking the browser */
   runPerfTest(index) {
      const { duration, runs, error } = PerformPerfTest(testData[index]);
      if (error) {
         this.results[index].duration = 'X';
      }
      else {
         if (this.results[index]) this.results[index].duration = duration;
         if (this.results[index] && this.results[index]['dbg']) {
            this.results[index].dbg.timePerRun = duration;
            this.results[index].dbg.runsCompleted = runs;
         }
      }
   }

   /** Run just one test */
   async runTest(index) {
      await this.runTestSelection([index]);
      if (this.results[index] === undefined || !this.results[index]['pass'])
         this.openTestIndex = index;
      else
         this.openTestIndex = null;
   }

   /** Run all of the tests */
   async runAllTests() {
      await this.runTestSelection(Utils.Range(testData.length));
   }

   /** Re-run the passes */
   async runPasses() {
      await this.runTestSelection(Utils.Range(testData.length).filter(i => this.results[i] && this.results[i].pass));
   }

   /** Re-run the failures */
   async runFails() {
      await this.runTestSelection(Utils.Range(testData.length).filter(i => this.results[i] && !this.results[i].pass));
   }

   /** Count the number of passes and fails, excluding those that haven't run */
   updateStatus() {
      this.passes = this.results.reduce((total, result) => total + (result && result.pass === true && 1), 0);
      this.fails = this.results.reduce((total, result) => total + (result && result.pass === false && 1), 0);
   }
}


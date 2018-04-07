import { Vue, Component } from 'vue-property-decorator';
import Common from '@/ui/behaviour/Common';

import * as Utils from '@/utils';
import testData from '@/ark/test_data';
import { statNames } from '@/consts';
import { TestResult, PerformTest, PerformPerfTest } from '@/testing';
import { FormatOption, FormatOptions, FormatAllOptions } from '@/ark';
import { TEProps } from '@/ark/extractor';
import { Stat } from '@/ark/creature';


const ASYNC_RUN_TIME_MS = 200;
const ASYNC_DELAY_TIME_MS = 100;


@Component
export default class extends Common {
   openTestIndex = 0;
   testData = testData;
   results: TestResult[] = [];
   passes = 0;
   fails = 0;
   running = false;
   accordionIndex?: number = null;

   statIndices = Utils.Range(8);

   optionsTableFields = statNames.map((name, i) => ({ key: i, label: name, formatter: FormatOption }));


   openResults(index: number) { this.openTestIndex = (this.openTestIndex !== index) ? index : null; }
   isPass(index: number) { return this.results[index] && this.results[index]['pass']; }
   isFail(index: number) { return this.results[index] && !this.results[index]['pass']; }
   formatNumber(n: number, places = 0) { return Utils.FormatNumber(n, places); }
   formattedOptions(options: Stat[]) { return options ? FormatOptions(options) : '-'; }
   formattedStats(stats: Stat[][]) { return FormatAllOptions(stats); }
   formattedStat(stat: Stat, noBrackets: boolean = false) { return FormatOption(stat, noBrackets); }
   dbgKeys(index: number) { return this.results[index]['dbg'] ? Object.keys(this.results[index].dbg).filter(key => key !== 'preFilterStats') : []; }
   scrollSync(event: any) { (event.target.nextElementSibling || event.target.previousElementSibling).scrollLeft = event.target.scrollLeft; }
   optionsForStat(testIndex: number, statIndex: number) { return this.results[testIndex].options.map(options => options[statIndex]); }

   displayResults(statOptions: Stat[][]) {
      const json = JSON.stringify(statOptions);
      const clean = json.replace(/"/g, '');
      console.log('Test result:');
      console.log(clean);
   }

   findTEStat(testIndex: number, optionIndex: number): TEProps {
      const results = this.results[testIndex];
      const optionSet = results.options[optionIndex];

      for (const statIndex in this.range(8)) {
         const stat: Stat = optionSet[statIndex];
         const TE = results.mapTE.get(stat);
         if (TE) return TE;
      }

      return undefined;
   }

   optionWildLevel(testIndex: number, optionIndex: number): string {
      const val = this.findTEStat(testIndex, optionIndex);
      if (!val) return '';
      return val.wildLevel.toFixed();
   }

   optionTE(testIndex: number, optionIndex: number): string {
      const val = this.findTEStat(testIndex, optionIndex);
      if (!val) return '';
      return (val.TE * 100).toFixed(1) + '%';
   }

   /**
    * Run a selection of tests without blocking the browser
    */
   async runTestSelection(indices: number[]) {
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
   runPerfTest(index: number) {
      const { duration, runs, exception } = PerformPerfTest(testData[index], undefined, true);
      if (exception) {
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
   async runTest(index: number) {
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
      this.passes = this.results.reduce((total: number, result: TestResult) => total + (result && result.pass === true && 1), 0);
      this.fails = this.results.reduce((total: number, result: TestResult) => total + (result && result.pass === false && 1), 0);
   }
}

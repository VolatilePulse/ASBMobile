import { FormatAllOptions, FormatOption, FormatOptions } from '@/ark';
import { TEProps } from '@/ark/extractor';
import testData from '@/ark/test_data';
import { Stat } from '@/ark/types';
import { statNames } from '@/consts';
import { Server } from '@/data/objects';
import { getServerById } from '@/servers';
import { PerformPerfTest, PerformTest, TestResult } from '@/testing';
import Common, { catchAsyncErrors } from '@/ui/behaviour/Common';
import * as Utils from '@/utils';
import { Component, Vue } from 'vue-property-decorator';


const ASYNC_RUN_TIME_MS = 200;
const ASYNC_DELAY_TIME_MS = 100;


@Component
export default class TesterTab extends Common {
   openTestIndex = 0;
   testData = testData;
   results: TestResult[] = [];
   testServers: Server[] = [];
   passes = 0;
   fails = 0;
   running = false;
   accordionIndex?: number = null;
   exportedTestInfo: string = null;

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

   created() {
      // Find server for each test
      this.testServers = this.testData.map(test => getServerById(test.serverId));
   }

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
      return (val.TE.lo * 100).toFixed(2) + '-' + (val.TE.hi * 100).toFixed(2) + '%';
   }

   /**
    * Run a selection of tests without blocking the browser
    */
   @catchAsyncErrors
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

         const result = PerformTest(testData[index], performance.now.bind(performance));
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
      const { duration, runs, exception } = PerformPerfTest(testData[index], performance.now.bind(performance), undefined, true);
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
   @catchAsyncErrors
   async runTest(index: number) {
      await this.runTestSelection([index]);
      if (this.results[index] === undefined || !this.results[index]['pass'])
         this.openTestIndex = index;
      else
         this.openTestIndex = null;
   }

   /** Run all of the tests */
   @catchAsyncErrors
   async runAllTests() {
      await this.runTestSelection(Utils.Range(testData.length));
   }

   /** Re-run the passes */
   @catchAsyncErrors
   async runPasses() {
      await this.runTestSelection(Utils.Range(testData.length).filter(i => this.results[i] && this.results[i].pass));
   }

   /** Re-run the failures */
   @catchAsyncErrors
   async runFails() {
      await this.runTestSelection(Utils.Range(testData.length).filter(i => this.results[i] && !this.results[i].pass));
   }

   /** Count the number of passes and fails, excluding those that haven't run */
   updateStatus() {
      this.passes = this.results.reduce((total: number, result: TestResult) => total + (result && result.pass === true && 1), 0);
      this.fails = this.results.reduce((total: number, result: TestResult) => total + (result && result.pass === false && 1), 0);
   }

   /** Handle changes to the file-drop target */
   @catchAsyncErrors
   async dropFilesChange(files: FileList) {
      this.exportedTestInfo = '';
      const filesArray = Array.from(files);

      // Get the Blobs out of the file list
      const blobs = filesArray.map(data => data.slice());

      // Start a FileReader for each Blob
      const loadPromises = blobs.map(Utils.ReadDroppedBlob);

      // Wait for all the FileReaders to complete
      const fileData = await Promise.all(loadPromises);

      // Convert to a test and output
      this.exportedTestInfo = fileData.map(ini => generateTestFromExport(ini, this.store.server._id)).join('\n');
   }
}


function generateTestFromExport(ini: string, serverId: string): string {
   const data = parseExportedCreature(ini);
   return `{
   tag: '',
   species: '${data.species}', level: ${data.level}, imprint: ${data.imprint || 0}, mode: '${data.mode}',
   values: [${data.values.join(', ')}],
   serverId: '${serverId}',
   results: [],
},`;
}

const iniStatIndexes = [0, 1, 3, 4, 7, 8, 9, 2];

function parseExportedCreature(iniText: string) {
   const ini = parseIni(iniText);
   const output = {
      species: speciesFromClass(ini[0][2]),
      level: ini[0][12],
      imprint: parseFloat(ini[0][13]) * 100,
      mode: parseFloat(ini[0][13]) > 0 ? 'Bred' : 'Tamed',
      values: iniStatIndexes.map(i => parseFloat(ini[2][i])),
   };
   output.values[5] = (output.values[5] + 1) * 100;
   output.values[6] = (output.values[6] + 1) * 100;
   return output;
}


const speciesRe = /\/(\w+)\/\w+_Character_BP(?:_(Aberrant))?/;

function speciesFromClass(cls: string): string {
   const result = speciesRe.exec(cls);
   if (!result) throw new Error('Creature species could not be calculated');
   if (result[2])
      return result[2] + ' ' + result[1];

   return result[1];
}

const blockRe = /^\[(.*)\][\r\n]+(?:[ \w]+(?:\[\d+\])?=.*[\r\n]+)+/mg;
const lineRe = /^([ \w]+(?:\[\d+\])?)=(.*)[\r\n]+/gm;

function parseIni(content: string) {
   const blocks = [];
   for (const [block, name] of Utils.GenerateRegexMatches(blockRe, content)) {
      if (!name) continue;

      const blockLines: string[] = [];
      (blockLines as any).label = name;

      for (const [_, _label, value] of Utils.GenerateRegexMatches(lineRe, block)) {
         blockLines.push(value);
      }
      blocks.push(blockLines);
   }
   return blocks;
}

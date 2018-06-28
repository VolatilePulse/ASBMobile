import { testingSystem } from '@/systems/testing';
import UICommon from '@/ui/common';
import TestSummary from '@/ui/components/test_summary.vue';
import theStore from '@/ui/store';
import { Delay } from '@/utils';
import Vue from 'vue';
import Component from 'vue-class-component';


const YIELD_TIME = 500; // milliseconds between each yield to free-up the UI thread

@Component({
   name: 'Tester',
   components: {
      'test-summary': TestSummary,
   }
})
export default class extends UICommon {
   get tests() { return theStore.testing.tests; }

   get passes() { return theStore.testing.numPass; }
   get partials() { return theStore.testing.numPartial; }
   get fails() { return theStore.testing.numFail; }

   running = false;
   progress = 0.5;
   showProgress = false;

   fetching = false;

   async mounted() {
      await testingSystem.fetchFromCache();
   }

   async runFails() {
      const toRun = Object.entries(theStore.testing.results)
         .filter(([_id, result]) => result.result === 'fail' || result.result === 'error')
         .map(([id, _result]) => id);
      await this.runTests(toRun);
   }

   async runPasses() {
      const toRun = Object.entries(theStore.testing.results)
         .filter(([_id, result]) => result.result === 'pass')
         .map(([id, _result]) => id);
      await this.runTests(toRun);
   }

   async runPartials() {
      const toRun = Object.entries(theStore.testing.results)
         .filter(([_id, result]) => result.result === 'partial')
         .map(([id, _result]) => id);
      await this.runTests(toRun);
   }

   async runAllTests() {
      theStore.testing.results = {};
      await this.runTests(Object.keys(theStore.testing.tests));
   }

   async runTests(tests: string[]) {
      // Clear results for these tests
      tests.forEach(id => Vue.delete(theStore.testing.results, id));

      let nextYield = +new Date() + YIELD_TIME;

      this.running = true;
      this.showProgress = true;
      this.progress = 0;

      try {
         let i = 0;
         for (const id of tests) {
            testingSystem.runTestById(id);
            this.progress = 100 * (++i) / Object.keys(tests).length;

            // Sleep every now and then to let the UI catch up
            if (+new Date() > nextYield) {
               await Delay(150);
               nextYield = +new Date() + YIELD_TIME;
            }
         }
      } finally {
         this.running = false;
         await Delay(500);
         this.showProgress = false;
      }
   }

   async fetchFromNetwork() {
      this.fetching = true;
      try {
         await testingSystem.fetchFromNetwork();
      }
      catch (err) {
         theStore.addDismissableMessage('danger', 'Failed: ' + err);
      }
      finally {
         this.fetching = false;
      }
   }
}

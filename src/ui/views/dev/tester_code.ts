import { testingSystem } from '@/systems/testing';
import UICommon from '@/ui/common';
import TestSummary from '@/ui/components/test_summary.vue';
import theStore from '@/ui/store';
import Component from 'vue-class-component';


@Component({
   name: 'Tester',
   components: {
      'test-summary': TestSummary,
   }
})
export default class extends UICommon {
   get tests() { return theStore.testing.tests; }

   passes = 1;
   fails = 1;
   partials = 1;
   running = false;

   fetching = false;

   async mounted() {
      await testingSystem.fetchFromCache();
   }

   runFails() {
      //
   }
   runPasses() {
      //
   }
   runPartials() {
      //
   }
   runAllTests() {
      //
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

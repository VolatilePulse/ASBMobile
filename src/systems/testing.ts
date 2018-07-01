import { Server } from '@/data/firestore/objects';
import { eventWaiter, SubSystem } from '@/systems/common';
import { PerformTest, TestDefinition, TestResult } from '@/testing';
import theStore, { EVENT_LOADED_FIRESTORE } from '@/ui/store';
import firebase from 'firebase/app';
import Vue from 'vue';


export interface TestingState {
   servers: { [id: string]: Server };
   tests: { [id: string]: TestDefinition };
   results: { [id: string]: TestResult };
   numPass: number;
   numPartial: number;
   numFail: number;
}

class TestingSystem implements SubSystem {
   ready = false;

   public async initialise() {
      console.log('TestingSystem: Waiting for Firestore to load');
      await this.ensureReady();
      console.log('TestingSystem: Done');
   }

   public clearAllResults() {
      theStore.testing.results = {};
      theStore.testing.numFail = 0;
      theStore.testing.numPartial = 0;
      theStore.testing.numPass = 0;
   }

   public runTestById(id: string) {
      const test = theStore.testing.tests[id];
      if (!test) throw new Error('Test not found');

      const server = theStore.testing.servers[test.creature.currentServer];
      if (!server) throw new Error('Server not found');

      console.log(`TestingSystem: Running test ${id} on server "${test.creature.currentServer}"`);

      const result = PerformTest(test, server, performance.now.bind(performance));
      Vue.set(theStore.testing.results, id, result);

      this.updateResultCounts();
   }

   public runPerfTestById(id: string) {
      const test = theStore.testing.tests[id];
      if (!test) throw new Error('Test not found');

      console.log('TestingSystem: Running perf test ' + id);

      // TODO: Do it...

      this.updateResultCounts();
   }

   public async fetchFromCache() {
      await this.fetchFrom('cache');
   }

   public async fetchFromNetwork() {
      await this.fetchFrom('server');
   }

   private updateResultCounts() {
      theStore.testing.numFail = 0;
      theStore.testing.numPartial = 0;
      theStore.testing.numPass = 0;
      Object.keys(theStore.testing.tests).forEach(id => {
         const result = theStore.testing.results[id];
         if (!result) return;

         if (result.result === 'pass') theStore.testing.numPass += 1;
         else if (result.result === 'partial') theStore.testing.numPartial += 1;
         else theStore.testing.numFail += 1;
      });
   }

   private async fetchFrom(location: 'cache' | 'server') {
      await this.ensureReady();

      try {
         const tests: { [id: string]: TestDefinition } = {};
         const collection = await firebase.firestore().collection('dev/testing/test').get({ source: location });
         console.log(`TestingSystem: Received ${collection.size} tests from ${location}`);
         collection.docs.forEach(doc => tests[doc.ref.id] = doc.data() as TestDefinition);
         theStore.testing.tests = tests;
      }
      catch (err) {
         theStore.addDismissableMessage('warning', `Failed to get test definitions from the ${location}`, err);
      }

      try {
         const servers: { [id: string]: Server } = {};
         const collection = await firebase.firestore().collection('dev/testing/server').get({ source: location });
         console.log(`TestingSystem: Received ${collection.size} servers from ${location}`);
         collection.docs.forEach(doc => servers[doc.ref.id] = doc.data() as Server);
         theStore.testing.servers = servers;
      }
      catch (err) {
         theStore.addDismissableMessage('warning', `Failed to get test servers from the ${location}`, err);
      }
   }

   private async ensureReady() {
      if (this.ready) return;
      if (!theStore.loaded.firestore)
         await eventWaiter(theStore.events, EVENT_LOADED_FIRESTORE);
      this.ready = true;
   }
}

export const testingSystem = new TestingSystem();

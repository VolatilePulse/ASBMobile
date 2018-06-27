import { Server } from '@/data/firestore/objects';
import { eventWaiter, SubSystem } from '@/systems/common';
import { PerformTest, TestDefinition } from '@/testing';
import theStore, { EVENT_LOADED_FIRESTORE } from '@/ui/store';
import firebase from 'firebase/app';
import Vue from 'vue';


class TestingSystem implements SubSystem {
   ready = false;

   public async initialise() {
      console.log('TestingSystem: Waiting for Firestore to load');
      await this.ensureReady();
      console.log('TestingSystem: Done');
   }

   public runTestById(id: string) {
      const test = theStore.testing.tests[id];
      if (!test) throw new Error('Test not found');

      const server = theStore.testing.servers[test.creature.currentServer];
      if (!server) throw new Error('Server not found');

      console.log(`TestingSystem: Running test ${id} on server "${test.creature.currentServer}"`);

      const result = PerformTest(test, server, performance.now.bind(performance));
      Vue.set(theStore.testing.results, id, result);
   }

   public runPerfTestById(id: string) {
      const test = theStore.testing.tests[id];
      if (!test) throw new Error('Test not found');

      console.log('TestingSystem: Running perf test ' + id);
      // TODO: Do it...
   }

   public async fetchFromCache() {
      await this.fetchFrom('cache');
   }

   public async fetchFromNetwork() {
      await this.fetchFrom('server');
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

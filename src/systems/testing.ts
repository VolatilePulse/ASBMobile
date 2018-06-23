import { eventWaiter, SubSystem } from '@/systems/common';
import { TestDefinition } from '@/testing';
import theStore, { EVENT_LOADED_FIRESTORE } from '@/ui/store';
import firebase from 'firebase/app';


class TestingSystem implements SubSystem {
   ready = false;

   public async initialise() {
      console.log('TestingSystem: Waiting for Firestore to load');
      await this.ensureReady();
      console.log('TestingSystem: Done');
   }

   public async runTestById(id: string) {
      const test = theStore.testing.tests[id];
      if (!test) throw new Error('Test not found');

      console.log('TestingSystem: Running ' + id);
      // TODO: Do it...
   }

   public async fetchFromCache() {
      await this.ensureReady();

      const docs: { [id: string]: TestDefinition } = {};
      try {
         const collection = await firebase.firestore().collection('dev/testing/test').get({ source: 'cache' });
         console.log(`TestingSystem: Received ${collection.size} tests from cache`);
         collection.docs.forEach(doc => docs[doc.ref.id] = doc.data() as TestDefinition);
      }
      catch (err) {
         // don't care about the error, just continue with no results
      }

      theStore.testing.tests = docs;
   }

   public async fetchFromNetwork() {
      await this.ensureReady();

      const docs: { [id: string]: TestDefinition } = {};
      try {
         const collection = await firebase.firestore().collection('dev/testing/test').get({ source: 'server' });
         console.log(`TestingSystem: Received ${collection.size} tests from server`);
         collection.docs.forEach(doc => docs[doc.ref.id] = doc.data() as TestDefinition);
      }
      catch (err) {
         throw new Error('Unable to fetch test definitions: ' + err);
      }

      theStore.testing.tests = docs;
   }

   private async ensureReady() {
      if (this.ready) return;
      if (!theStore.loaded.firestore)
         await eventWaiter(theStore.events, EVENT_LOADED_FIRESTORE);
      this.ready = true;
   }
}

export const testingSystem = new TestingSystem();

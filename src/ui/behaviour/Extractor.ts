import * as Ark from '@/ark';
import { Extractor } from '@/ark/extractor';
import testData from '@/ark/test_data';
import { Stat, TestData } from '@/ark/types';
import { PRE_IB } from '@/consts';
import { LibraryManager } from '@/data';
import { getServerById } from '@/servers';
import Common from '@/ui/behaviour/Common';
import theStore from '@/ui/store';
import { DeepCopy, Delay, FilledArray } from '@/utils';
import cuid from 'cuid';
import { Component } from 'vue-property-decorator';


@Component
export default class ExtractorTab extends Common {
   testData = testData;

   autoExtract = false;

   mode = 'Tamed';
   imprint = 0;
   values = FilledArray(8, () => undefined);
   disableExtract = false;
   success = false;
   selectedOption = 0;

   options: string[] = [];
   extractor: Extractor = null;

   extract() {
      if (this.disableExtract) return;
      this.disableExtract = true;

      const creature = this.store.tempCreature;

      // Convert properties that couldn't be bound directly to creature
      creature.wild = (this.mode === 'Wild');
      creature.tamed = (this.mode === 'Tamed');
      creature.bred = (this.mode === 'Bred');
      creature.IB = Ark.ConvertValue(this.imprint, PRE_IB);
      creature.values = DeepCopy(this.values.map(Ark.ConvertValue)); // convert values, then create a clean un-observed copy

      this.extractor = new Extractor(creature, theStore.server);
      this.extractor.extract();

      this.success = this.extractor.success;

      if (this.success)
         this.options = this.formatOptions(this.extractor.options);

      // Force the option picker to show if this.options.length > 1

      Delay(500).then(() => this.disableExtract = false);
   }

   insertTestData(test: TestData) {
      // Copy some fields from the test directly into the extractor
      this.store.tempCreature.species = test.species;
      this.store.tempCreature.level = test.level;

      // Copy some fields into the UI, because they're converted later
      this.imprint = test.imprint;
      this.mode = test.mode;

      // Take a copy of the stat values so they can be modified by the user
      this.values = Array.from(test.values);

      // Set the current server to the one specified by the test
      this.store.setCurrentServer(getServerById(test.serverId));
   }

   addCreature() {
      // 2) give the creature an ID
      // 2) gather the stat options from this.extractor.options[this.selectedOption]
      // 3) save the creature using LibraryManager.current.saveCreature

      const c = this.extractor.c;
      if (!c._id) c._id = generateInputId();
      LibraryManager.current.saveCreature(c);
   }

   // Nasty debug-only methods to show stats and their options
   debugShowOptions(options: Stat[]) {
      return (options && options['length']) ? options.map(stat => `(${stat.Lw}+${stat.Ld})`).join(', ') : '-none-';
   }

   debugStatValue(i: number) {
      const creature = this.store.tempCreature;
      if (!this.extractor || !this.extractor.m) return '-';
      return this.extractor.options[this.selectedOption][i].calculateValue(this.extractor.m[i], !creature.wild, 1, 0);
   }

   formatOptions(options: Stat[][]) {
      const optionStrings: string[] = [];

      for (const option of options) {
         let tempString = '';

         if (this.extractor.statTEmaps.length) {
            this.extractor.statTEmaps.find(index => index !== undefined).forEach((propTE, stat) => {
               if (option.includes(stat)) {
                  tempString += propTE.wildLevel + ' ';
                  tempString += (propTE.TE * 100).toFixed(2) + '% - ';
               }
            });
         }

         tempString += this.debugShowOptions(option);
         optionStrings.push(tempString);
      }

      return optionStrings;
   }
}


/** Generate a new unique ID for a user-input creature */
function generateInputId() {
   // Adds input tag, for differentiation
   return 'input:' + cuid();
}

import { Component } from 'vue-property-decorator';
import Common from '@/ui/behaviour/Common';

import * as Ark from '@/ark';
import testData from '@/ark/test_data';
import { FilledArray, DeepCopy, Delay } from '@/utils';
import { Extractor } from '@/ark/extractor';
import { PRE_IB } from '@/consts';
import { TestData } from '@/ark/types';
import { Stat } from '@/ark/creature';


@Component
export default class extends Common {
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

      this.extractor = new Extractor(creature);
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
      this.store.tempCreature.serverName = test.serverName;
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
      let optionStrings: string[] = [];

      for (let option of options) {
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

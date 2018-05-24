import * as Ark from '@/ark';
import { Extractor, ExtractorInput } from '@/ark/extractor';
import testData from '@/ark/test_data';
import { Stat, TestData } from '@/ark/types';
import { PRE_IB } from '@/consts';
import { LibraryManager } from '@/data';
import { Creature } from '@/data/objects';
import { intervalAverage } from '@/number_utils';
import { getServerById } from '@/servers';
import Common from '@/ui/behaviour/Common';
import theStore from '@/ui/store';
import { Delay, FilledArray } from '@/utils';
import cuid from 'cuid';
import { Component } from 'vue-property-decorator';

/** @fileOverview Tab containing the UI for the extractor */


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

      const inputs: ExtractorInput = {
         wild: (this.mode === 'Wild'),
         tamed: (this.mode === 'Tamed'),
         bred: (this.mode === 'Bred'),
         IB: Ark.ConvertValue(this.imprint, PRE_IB, 'ui'),
         level: theStore.tempCreature.level,
         values: this.values.map((v, i) => Ark.ConvertValue(v, i, 'ui')),
         server: theStore.server,
         species: theStore.tempCreature.species,
      };

      this.extractor = new Extractor(inputs);
      const output = this.extractor.extract();

      this.success = output.options && output.options.length > 0;

      // TODO: Don't forget to set IB in the creature before it's saved

      if (this.success)
         this.options = this.formatOptions(output.options);

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
      const c = new Creature();
      c.wild = (this.mode === 'Wild');
      c.tamed = (this.mode === 'Tamed');
      if (c.tamed) {
         this.extractor.options[this.selectedOption].forEach(stat => {
            const mapTE = this.extractor.statTEMap.get(stat);
            if (mapTE)
               c.TE = intervalAverage(mapTE.TE);
         });
      }
      c.bred = (this.mode === 'Bred');
      if (c.bred)
         c.IB = intervalAverage(this.extractor.rangeVars.IB);

      c.stats = this.extractor.options[this.selectedOption];

      // Get variables from theStore
      c.level = theStore.tempCreature.level;
      c.species = theStore.tempCreature.species;
      c.serverId = theStore.tempCreature.serverId;

      /*
      // Creature variables that still need set
      c.name?: string = null;
      c.tribe?: string = null;
      c.owner?: string = null;
      c.uuid?: string = null;
      */
      // 2) give the creature an ID
      // 2) gather the stat options from this.extractor.options[this.selectedOption]
      // 3) save the creature using LibraryManager.current.saveCreature

      if (!c._id) c._id = generateInputId();
      LibraryManager.current.saveCreature(c);

      // Resets the options forcing the user to extract again
      this.options = [];
      this.selectedOption = 0;
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

         if (this.extractor.statTEMap.size) {
            this.extractor.statTEMap.forEach((propTE, stat) => {
               if (option.includes(stat)) {
                  tempString += propTE.wildLevel + ' ';
                  tempString += (intervalAverage(propTE.TE) * 100).toFixed(2) + '% - ';
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
export function generateInputId() {
   // Adds input tag, for differentiation
   return 'input:' + cuid();
}
